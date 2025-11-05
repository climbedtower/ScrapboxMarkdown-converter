export const markdownToScrapbox = (markdown: string): string => {
  if (!markdown) return '';
  let scrapbox = markdown;

  // Code blocks ```lang\ncode``` -> code:lang\n code
  scrapbox = scrapbox.replace(/```(\w*)\n([\s\S]+?)\n```/g, (_match, lang, code) => {
    const indentedCode = code.split('\n').map(line => ` ${line}`).join('\n');
    return `code:${lang || 'text'}\n${indentedCode}`;
  });

  // Links [text](url) -> [url text]
  scrapbox = scrapbox.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$2 $1]');

  // Bold **text** -> [text]
  scrapbox = scrapbox.replace(/\*\*(?!\s)(.*?)(?<!\s)\*\*/g, '[$1]');

  const lines = scrapbox.split('\n');
  const newLines = lines.map(line => {
    // Headings ### H3 -> ⬛️ H3
    if (line.startsWith('### ')) {
      return `⬛️ ${line.substring(4)}`;
    }
    // Headings ## H2 -> ## H2 (no change as per request)
    if (line.startsWith('## ')) {
      return line;
    }
    // Nested lists (handle space indentation first)
    if (/^(\s{2,})- /.test(line)) {
        const indent = line.match(/^(\s*)- /)?.[1] || '';
        const indentLevel = Math.floor(indent.length / 2) + 1;
        return ' '.repeat(indentLevel) + line.replace(/^(\s*)- /, '');
    }
    // Nested lists -- list ->   list
    if (line.startsWith('-- ')) {
      return `  ${line.substring(3)}`;
    }
    // Lists - list ->  list
    if (line.startsWith('- ')) {
      return ` ${line.substring(2)}`;
    }
    return line;
  });

  return newLines.join('\n');
};

export const scrapboxToMarkdown = (scrapbox: string): string => {
  if (!scrapbox) return '';
  
  let markdown = '';
  const lines = scrapbox.split('\n');
  let inCodeBlock = false;
  let codeLang = 'text';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (inCodeBlock) {
      if (line.startsWith(' ') || line === '') {
        markdown += `${line.substring(1)}\n`;
      } else {
        // Trim last newline from code block before closing
        markdown = markdown.trimEnd() + '\n```\n';
        inCodeBlock = false;
        i--; // re-process current line
      }
    } else if (line.startsWith('code:')) {
      inCodeBlock = true;
      codeLang = line.substring(5).trim() || 'text';
      markdown += `\`\`\`${codeLang}\n`;
    } else {
        let processedLine = line;
        
        // Links [url text] -> [text](url)
        processedLine = processedLine.replace(/\[(https?:\/\/\S+)\s([^\]]+?)\]/g, '[$2]($1)');

        // Bold [text] -> **text** (will not match [text] if it's part of a markdown link like [text](url))
        processedLine = processedLine.replace(/\[([^\]]+?)\](?!\()/g, '**$1**');
        
        // Headings ⬛️ H3 -> ### H3
        if (processedLine.startsWith('⬛️ ')) {
            processedLine = `### ${processedLine.substring(2)}`;
        } 
        // Headings ## H2 -> ## H2 (no change)
        else if (processedLine.startsWith('## ')) {
            // no change
        }
        // Lists (order is important)
        else if (processedLine.startsWith('  ') && !processedLine.startsWith('   ')) {
            processedLine = `-- ${processedLine.substring(2)}`;
        } else if (processedLine.startsWith(' ')) {
            processedLine = `- ${processedLine.substring(1)}`;
        }
        markdown += `${processedLine}\n`;
    }
  }

  if (inCodeBlock) {
      markdown = markdown.trimEnd() + '\n```\n';
  }

  return markdown.trimEnd();
};