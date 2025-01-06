// src/components/MermaidEditor.tsx
import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2Icon, EyeIcon, CodeIcon, GripVerticalIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MermaidEditorProps {
  mode: 'visualize' | 'convert';
}

export const MermaidEditor: React.FC<MermaidEditorProps> = ({ mode }) => {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [editorWidth, setEditorWidth] = useState(40); // percentage

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
    });
  }, []);

  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);

    const onMouseMove = (mouseMoveEvent: MouseEvent) => {
      const containerWidth = window.innerWidth;
      const newWidth = (mouseMoveEvent.clientX / containerWidth) * 100;
      const clampedWidth = Math.min(Math.max(newWidth, 20), 80);
      setEditorWidth(clampedWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

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

  const PreviewPane = () => (
    <div className="h-full">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : preview ? (
        <div className="flex items-center justify-center h-full" dangerouslySetInnerHTML={{ __html: preview }} />
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <p>Preview will appear here</p>
        </div>
      )}
    </div>
  );

  return (
    <div 
      className="flex h-[calc(100vh-4rem)]"
      style={{ cursor: isResizing ? 'col-resize' : 'auto', userSelect: isResizing ? 'none' : 'auto' }}
    >
      <div 
        style={{ width: `${editorWidth}%` }}
        className="flex flex-col"
      >
        <Card className="flex-1 flex flex-col">
          <div className="p-3 border-b">
            <h2 className="text-sm font-medium">
              {mode === 'visualize' ? 'Mermaid Syntax' : 'Text Input'}
            </h2>
          </div>
          <div className="flex-1 p-3">
            <Textarea
              className="h-full resize-none"
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
            <div className="p-3 border-t">
              <Button
                className="w-full"
                onClick={handleConvert}
                disabled={isLoading || !input.trim()}
              >
                {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Converting...' : 'Convert to Mermaid'}
              </Button>
            </div>
          )}
        </Card>
      </div>

      <div 
        className="relative group"
        onMouseDown={startResizing}
        style={{ 
          width: '1px',
          backgroundColor: 'hsl(var(--border))',
          cursor: 'col-resize',
          touchAction: 'none'
        }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-border/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ cursor: 'col-resize' }}
        />
      </div>

      <Card className="flex-1 min-w-[20%] flex flex-col ml-[1px]">
        {mode === 'convert' ? (
          <Tabs
            defaultValue="preview"
            className="flex-1"
            onValueChange={(value) => setActiveTab(value as 'preview' | 'code')}
          >
            <div className="border-b p-3">
              <TabsList>
                <TabsTrigger value="preview">
                  <EyeIcon className="mr-2 h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="code">
                  <CodeIcon className="mr-2 h-4 w-4" />
                  Code
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="preview" className="flex-1 p-3 mt-0">
              <PreviewPane />
            </TabsContent>
            <TabsContent value="code" className="flex-1 p-3 mt-0">
              <pre className="p-4 rounded-lg bg-muted h-full overflow-auto">
                <code className="text-sm">{input}</code>
              </pre>
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <div className="p-3 border-b">
              <h2 className="text-sm font-medium">Preview</h2>
            </div>
            <div className="flex-1 p-3">
              <PreviewPane />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};