// src/components/MermaidEditor.tsx
import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Image as ImageIcon, Eye, Code, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MermaidEditorProps {
  mode: 'visualize' | 'convert';
}

export const MermaidEditor: React.FC<MermaidEditorProps> = ({ mode }) => {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorWidth, setEditorWidth] = useState(40); // percentage
  const [isResizing, setIsResizing] = useState(false);

  // 初始化 mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
    });
  }, []);

  // 檔案名稱生成
  const generateFileName = (ext: string) => {
    const date = new Date();
    const timestamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
    return `mermaid_diagram_${timestamp}.${ext}`;
  };

  // 通用下載函數
  const downloadFile = (content: string, type: string, ext: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateFileName(ext);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${ext.toUpperCase()}`);
  };

  // 下載 SVG
  const downloadSvg = () => {
    if (!preview) return;
    downloadFile(preview, 'image/svg+xml', 'svg');
  };

  // 下載 Mermaid
  const downloadMermaid = () => {
    if (!input) return;
    downloadFile(input, 'text/plain', 'mmd');
  };

  // 下載 JSON
  const downloadJson = () => {
    if (!input) return;
    const jsonContent = {
      diagram: input,
      created: new Date().toISOString(),
      type: 'mermaid'
    };
    downloadFile(JSON.stringify(jsonContent, null, 2), 'application/json', 'json');
  };

  // 下載 PNG
  const downloadPng = async () => {
    if (!preview) return;
    try {
      // Create a safe SVG blob with base64 encoded content
      const svgContent = preview.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      // Create canvas and get context
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          // Set canvas size to match image with some padding
          const padding = 20;
          canvas.width = img.width + padding * 2;
          canvas.height = img.height + padding * 2;
          
          // Fill white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw image in the center
          ctx.drawImage(img, padding, padding);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = generateFileName('png');
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              toast.success('Downloaded as PNG');
              resolve();
            } else {
              reject(new Error('PNG conversion failed'));
            }
          }, 'image/png');
        };
        
        img.onerror = () => reject(new Error('Image loading failed'));
        img.crossOrigin = 'anonymous';
        img.src = svgUrl;
      });

      URL.revokeObjectURL(svgUrl);
    } catch (error) {
      console.error('PNG conversion failed:', error);
      toast.error('Failed to download as PNG');
    }
  };

  // 渲染 Mermaid
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

  // 預覽面板組件
  const PreviewPane = () => (
    <div className="h-full">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : preview ? (
        <div className="flex items-center justify-center h-full" 
             dangerouslySetInnerHTML={{ __html: preview }} />
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
                onClick={() => {/* conversion logic */}}
                disabled={isLoading || !input.trim()}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="code">
                  <Code className="mr-2 h-4 w-4" />
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
            <div className="p-3 border-b flex justify-between items-center">
              <h2 className="text-sm font-medium">Preview</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!input.trim()}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={downloadMermaid}>
                    <FileText className="mr-2 h-4 w-4" />
                    Mermaid (.mmd)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadJson}>
                    <FileText className="mr-2 h-4 w-4" />
                    JSON (.json)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadSvg} disabled={!preview}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    SVG Image
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadPng} disabled={!preview}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    PNG Image
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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