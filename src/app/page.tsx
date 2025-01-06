'use client';

import { useState } from 'react';
import { MermaidEditor } from '@/components/MermaidEditor';
import { AiOutlineCode, AiOutlineEdit } from 'react-icons/ai';

export default function Home() {
  const [mode, setMode] = useState<'visualize' | 'convert'>('visualize');

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Mermaid Visualizer
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 p-1 rounded-lg">
                <button
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'visualize'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  onClick={() => setMode('visualize')}
                >
                  <AiOutlineCode className="mr-2" />
                  Visualize
                </button>
                <button
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'convert'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  onClick={() => setMode('convert')}
                >
                  <AiOutlineEdit className="mr-2" />
                  Convert
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full py-6">
          <MermaidEditor mode={mode} />
        </div>
      </main>
    </div>
  );
}