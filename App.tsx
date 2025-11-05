
import React from 'react';
import Converter from './components/Converter';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Markdown <span className="text-blue-400">&lt;&gt;</span> Scrapbox
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Instantly convert your notes between syntaxes.
          </p>
        </header>
        <Converter />
        <footer className="text-center mt-12 text-gray-500">
          <p>Inspired by md2sb-online. Built with React, TypeScript, and Tailwind CSS.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
