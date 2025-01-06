// src/components/MermaidEditor.tsx
import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';
import { AiOutlineLoading3Quarters, AiOutlineEye, AiOutlineCode } from 'react-icons/ai';

interface MermaidEditorProps {
  mode: 'visualize' | 'convert';
}

export const MermaidEditor: React.FC<MermaidEditorProps> = ({ mode }) => {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
    });
  }, []);

  const renderMermaid = async (content: string) => {
    if (!content.trim()) {
      setPreview('');
      setError(null);
      return;
    }

    try {
      const { svg } = await mermaid.render('preview', content);
      setPreview(svg);
      setError(null);
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      setError('Invalid Mermaid syntax. Please check your input.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    if (mode === 'visualize') {
      renderMermaid(newValue);
    }
  };

  const handleConvert = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      
      if (!response.ok) {
        throw new Error('Conversion failed. Please try again.');
      }
      
      const data = await response.json();
      setInput(data.mermaid);
      renderMermaid(data.mermaid);
    } catch (error) {
      console.error('Conversion error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="w-1/2 flex flex-col border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-medium text-gray-700">
            {mode === 'visualize' ? 'Mermaid Syntax' : 'Text Input'}
          </h2>
        </div>
        <div className="flex-1 p-4">
          <textarea
            className="w-full h-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={input}
            onChange={handleInputChange}
            placeholder={
              mode === 'visualize'
                ? 'Enter Mermaid syntax here...'
                : 'Enter text to convert to Mermaid syntax...'
            }
          />
        </div>
        {mode === 'convert' && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleConvert}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Converting...
                </>
              ) : (
                'Convert to Mermaid'
              )}
            </button>
          </div>
        )}
      </div>
      <div className="w-1/2 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          {mode === 'convert' ? (
            <div className="flex space-x-4">
              <button
                className={`flex items-center px-3 py-1 text-sm font-medium rounded-md ${
                  activeTab === 'preview'
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('preview')}
              >
                <AiOutlineEye className="mr-1" />
                Preview
              </button>
              <button
                className={`flex items-center px-3 py-1 text-sm font-medium rounded-md ${
                  activeTab === 'code'
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('code')}
              >
                <AiOutlineCode className="mr-1" />
                Code
              </button>
            </div>
          ) : (
            <h2 className="text-sm font-medium text-gray-700">Preview</h2>
          )}
        </div>
        <div className="flex-1 p-4 overflow-auto">
          {error ? (
            <div className="p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : activeTab === 'preview' ? (
            preview ? (
              <div dangerouslySetInnerHTML={{ __html: preview }} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p>Preview will appear here</p>
              </div>
            )
          ) : (
            <pre className="p-4 bg-gray-50 rounded-lg overflow-auto">
              <code className="text-sm">{input}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};