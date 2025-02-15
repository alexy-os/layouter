export class PatternManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.currentPattern = null;
    this.patterns = {
      single: {
        template: `
          <section class="w-full py-16 lg:py-32">
            <div class="container mx-auto px-4 md:px-6 lg:px-8">
              <div class="flex flex-col text-center gap-8 items-center" data-canvas="main"></div>
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
                <div data-canvas="left"></div>
                <div data-canvas="right"></div>
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
                <div data-canvas="col1"></div>
                <div data-canvas="col2"></div>
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
    this.currentPattern = this.patterns[patternType];
    // Очищаем текущий канвас
    this.canvas.innerHTML = this.currentPattern.template;
  }

  getCurrentCanvas() {
    return this.currentPattern ? this.currentPattern.canvases : null;
  }
} 