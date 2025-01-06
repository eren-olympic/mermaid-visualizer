'use client';

import { useState } from 'react';
import { MermaidEditor } from '@/components/MermaidEditor';
import { Button } from "@/components/ui/button";
import { CodeIcon, FileTextIcon } from "lucide-react";

export default function Home() {
  const [mode, setMode] = useState<'visualize' | 'convert'>('visualize');

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="font-semibold">Mermaid Visualizer</h1>
          <div className="flex gap-2">
            <Button
              variant={mode === 'visualize' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('visualize')}
            >
              <CodeIcon className="mr-2 h-4 w-4" />
              Visualize
            </Button>
            <Button
              variant={mode === 'convert' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('convert')}
            >
              <FileTextIcon className="mr-2 h-4 w-4" />
              Convert
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden container py-4">
        <MermaidEditor mode={mode} />
      </main>
    </div>
  );
}