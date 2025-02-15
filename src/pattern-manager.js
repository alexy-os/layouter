export class PatternManager {
  constructor(canvas, layerManager) {
    this.canvas = canvas;
    this.layerManager = layerManager;
    this.currentPattern = null;
    this.patterns = {
      single: {
        template: `
          <section class="w-full py-16 lg:py-32">
            <div class="container mx-auto px-4 md:px-6 lg:px-8">
              <div class="flex flex-col text-center gap-8 items-center">
                <div data-canvas="main" class="w-full aspect-[2/1] relative border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg">
                  <div class="absolute inset-0 grid grid-cols-12 gap-4 pointer-events-none">
                    ${Array(12).fill('<div class="h-full bg-slate-100/50 dark:bg-slate-800/50"></div>').join('')}
                  </div>
                </div>
              </div>
            </div>
          </section>
        `,
        canvases: ['main']
      },
      split: {
        template: `
          <section class="w-full py-16 lg:py-32">
            <div class="container mx-auto px-4 md:px-6 lg:px-8">
              <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
                <div data-canvas="left" class="aspect-square relative border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg">
                  <div class="absolute inset-0 grid grid-cols-6 gap-4 pointer-events-none">
                    ${Array(6).fill('<div class="h-full bg-slate-100/50 dark:bg-slate-800/50"></div>').join('')}
                  </div>
                </div>
                <div data-canvas="right" class="aspect-square relative border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg">
                  <div class="absolute inset-0 grid grid-cols-6 gap-4 pointer-events-none">
                    ${Array(6).fill('<div class="h-full bg-slate-100/50 dark:bg-slate-800/50"></div>').join('')}
                  </div>
                </div>
              </div>
            </div>
          </section>
        `,
        canvases: ['left', 'right']
      },
      columns: {
        template: `
          <section class="w-full py-16 lg:py-32">
            <div class="container mx-auto px-4 md:px-6 lg:px-8">
              <div class="grid grid-cols-1 gap-8 items-center lg:grid-cols-2">
                <div data-canvas="col1" class="aspect-[2/1] relative border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg">
                  <div class="absolute inset-0 grid grid-cols-6 gap-4 pointer-events-none">
                    ${Array(6).fill('<div class="h-full bg-slate-100/50 dark:bg-slate-800/50"></div>').join('')}
                  </div>
                </div>
                <div data-canvas="col2" class="aspect-[2/1] relative border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg">
                  <div class="absolute inset-0 grid grid-cols-6 gap-4 pointer-events-none">
                    ${Array(6).fill('<div class="h-full bg-slate-100/50 dark:bg-slate-800/50"></div>').join('')}
                  </div>
                </div>
              </div>
            </div>
          </section>
        `,
        canvases: ['col1', 'col2']
      }
    };

    this.initializePatternSelection();
  }

  initializePatternSelection() {
    const patternItems = document.querySelectorAll('.pattern-item');
    patternItems.forEach(item => {
      item.addEventListener('click', () => {
        const patternType = item.dataset.pattern;
        this.setPattern(patternType);
      });
    });
  }

  setPattern(patternType) {
    // Очищаем все слои перед сменой паттерна
    this.layerManager.clearAllLayers();
    
    this.currentPattern = this.patterns[patternType];
    this.canvas.innerHTML = this.currentPattern.template;

    // Находим все холсты в новом паттерне
    const canvasElements = this.canvas.querySelectorAll('[data-canvas]');
    
    // Устанавливаем первый холст как активный по умолчанию
    if (canvasElements.length > 0) {
      this.layerManager.setActiveCanvas(canvasElements[0]);
    }

    // Добавляем обработчики кликов для переключения между холстами
    canvasElements.forEach(canvasElement => {
      canvasElement.addEventListener('click', () => {
        this.layerManager.setActiveCanvas(canvasElement);
      });
    });
  }

  getCurrentCanvas() {
    return this.currentPattern ? this.currentPattern.canvases : null;
  }
} 