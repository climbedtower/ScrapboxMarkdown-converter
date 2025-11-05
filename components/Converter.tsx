import React, { useState, useMemo, useCallback } from 'react';
import type { ConversionMode } from '../types';
import { markdownToScrapbox, scrapboxToMarkdown } from '../services/conversionService';
import { SwapIcon } from './icons/SwapIcon';
import { CopyIcon } from './icons/CopyIcon';
import { ClearIcon } from './icons/ClearIcon';

const initialMarkdown = `## Markdown to Scrapbox
A simple converter to switch between syntaxes.

### Features
- **Bold Text** is supported.
- [Links like this](https://react.dev) are converted.
- Lists are easy
  - Indented lists too!
-- Or this style for nesting.

\`\`\`javascript
// This is a code block
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\``;

interface TextAreaPanelProps {
  id: string;
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isReadOnly: boolean;
  onCopy: () => void;
  copyText: string;
  onClear: () => void;
}

const TextAreaPanel: React.FC<TextAreaPanelProps> = ({ id, label, value, onChange, isReadOnly, onCopy, copyText, onClear }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col flex-1 w-full relative group">
            <div className="flex justify-between items-center mb-2">
                <label htmlFor={id} className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                    {label}
                </label>
                <div className="flex items-center space-x-2">
                    {!isReadOnly && value && (
                        <button
                            onClick={onClear}
                            className="p-1.5 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                            aria-label="Clear text"
                            title="Clear"
                        >
                            <ClearIcon />
                        </button>
                    )}
                    {value && (
                         <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                            aria-label="Copy to clipboard"
                            title={copyText}
                        >
                            <CopyIcon copied={copied} />
                        </button>
                    )}
                </div>
            </div>
            <textarea
                id={id}
                value={value}
                onChange={onChange}
                readOnly={isReadOnly}
                className="w-full h-96 p-4 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ tabSize: 4, MozTabSize: 4 }}
                spellCheck="false"
                aria-label={label}
            />
        </div>
    );
};


const Converter: React.FC = () => {
  const [mode, setMode] = useState<ConversionMode>('md2sb');
  const [inputText, setInputText] = useState<string>(initialMarkdown);

  const convertedText = useMemo(() => {
    if (mode === 'md2sb') {
      return markdownToScrapbox(inputText);
    }
    return scrapboxToMarkdown(inputText);
  }, [inputText, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleSwap = useCallback(() => {
    setInputText(convertedText);
    setMode(prevMode => (prevMode === 'md2sb' ? 'sb2md' : 'md2sb'));
  }, [convertedText]);

  const handleClear = useCallback(() => {
    setInputText('');
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    if (text) {
        navigator.clipboard.writeText(text);
    }
  }, []);

  const inputLabel = mode === 'md2sb' ? 'Markdown' : 'Scrapbox';
  const outputLabel = mode === 'md2sb' ? 'Scrapbox' : 'Markdown';

  return (
    <div className="flex flex-col md:flex-row items-start justify-center gap-6">
      <TextAreaPanel
        id="input"
        label={inputLabel}
        value={inputText}
        onChange={handleInputChange}
        isReadOnly={false}
        onCopy={() => copyToClipboard(inputText)}
        copyText="Copy Input"
        onClear={handleClear}
      />
      
      <div className="flex items-center justify-center my-4 md:my-0 md:self-center">
        <button
          onClick={handleSwap}
          className="p-3 rounded-full bg-gray-700 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-200 ease-in-out transform hover:scale-110"
          aria-label="Swap conversion direction"
        >
          <SwapIcon />
        </button>
      </div>

      <TextAreaPanel
        id="output"
        label={outputLabel}
        value={convertedText}
        isReadOnly={true}
        onCopy={() => copyToClipboard(convertedText)}
        copyText="Copy Output"
        onClear={() => {}} // No-op for readonly panel
      />
    </div>
  );
};

export default Converter;
