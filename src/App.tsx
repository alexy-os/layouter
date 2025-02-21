import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PatternConstructor } from './scripts/constructors/PatternConstructor';
import { Sidebar } from "@/components/Sidebar"

export default function App() {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('theme') as 'light' | 'dark' || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setActiveCanvas = (canvasElement: HTMLElement) => {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    
    const canvases = container.querySelectorAll('[data-canvas]');
    canvases.forEach(c => {
      c.classList.remove('active', 'cursor-default');
      c.classList.add('cursor-pointer');
    });

    canvasElement.classList.add('active', 'cursor-default');
    canvasElement.classList.remove('cursor-pointer');
    console.log(`Canvas activated: ${canvasElement.dataset.canvas}`);
  };

  const handlePatternSelect = (patternId: string) => {
    setSelectedPattern(patternId);
    const pattern = PatternConstructor.getPatterns()[patternId];
    const container = document.getElementById('canvas-container');
    
    if (container && pattern) {
      console.log(`Pattern selected: ${pattern.name} (${pattern.id})`);
      container.innerHTML = pattern.template;

      // Initialize all canvases in the new pattern
      const canvases = container.querySelectorAll('[data-canvas]');
      canvases.forEach(canvas => {
        canvas.classList.add('cursor-pointer');
        canvas.addEventListener('click', (e) => {
          if (e.target === canvas) {
            setActiveCanvas(canvas as HTMLElement);
          }
        });
      });

      // Activate the first canvas by default
      if (canvases.length > 0) {
        setActiveCanvas(canvases[0] as HTMLElement);
      }
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        theme={theme}
        selectedPattern={selectedPattern}
        onPatternSelect={handlePatternSelect}
        onThemeToggle={toggleTheme}
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground/30 hover:scrollbar-thumb-muted-foreground/50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                size="sm"
                asChild
                className="gap-2"
              >
                <a href="/html-v3/index.html" target="_blank" rel="noopener" title="Stable Version 3 (HTML)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                    <path d="m21 3-9 9" />
                    <path d="M15 3h6v6" />
                  </svg>
                  v.0.0.3
                </a>
              </Button>
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="animate-pulse-dot"></span>
                v.0.0.4 (React) is currently under development
              </span>
            </div>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleTheme}
              className={theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                  <path d="m4.93 4.93 1.41 1.41"></path>
                  <path d="m17.66 17.66 1.41 1.41"></path>
                  <path d="M2 12h2"></path>
                  <path d="M20 12h2"></path>
                  <path d="m6.34 17.66-1.41 1.41"></path>
                  <path d="m19.07 4.93-1.41 1.41"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                </svg>
              )}
            </Button>
          </div>

          <div id="canvas-container" className="relative bg-background/80 backdrop-blur-sm rounded-lg shadow-sm min-h-[548px] border border-border">
            <section className="w-full py-16 lg:py-32">
              <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="flex flex-col text-center gap-4 md:gap-6 lg:gap-8 items-center">
                  <div data-canvas="main" className="w-full aspect-[2/1] relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
