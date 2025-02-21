//import { Pattern } from '../interfaces';
import type { PatternData } from '../interfaces';

interface PatternConfig {
  wrapper: keyof typeof PatternConstructor.wrappers;
  layout: keyof typeof PatternConstructor.grids;
  canvasTypes: Array<keyof typeof PatternConstructor.canvases>;
  canvasNames: string[];
}

interface Pattern {
  id: string;
  name: string;
  type: string;
  template: string;
}

interface PatternPreview {
  label: string;
  preview: string;
}

export class PatternConstructor {
  static wrappers = {
    fullscreen: {
      before: `<section class="w-full">`,
      after: `</section>`,
      gridCols: 12
    },
    container: {
      before: `
<section class="w-full py-16 lg:py-32">
  <div class="container mx-auto px-4 md:px-6 lg:px-8">`,
      after: `
  </div>
</section>`,
      gridCols: 12
    }
  };

  static grids = {
    single: {
      template: `
    <div class="flex flex-col text-center gap-4 md:gap-6 lg:gap-8 items-center">
      {{canvas}}
    </div>`
    },
    split: {
      template: `
    <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-4 md:gap-6 lg:gap-8">
      {{canvas}}
    </div>`
    },
    threeColumns: {
      template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
      {{canvas}}
    </div>`
    },
    fourColumns: {
      template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
      {{canvas}}
    </div>`
    },
    twoByTwo: {
      template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
      {{canvas}}
    </div>`
    },
    headerAndThreeColumns: {
      template: `
    <div class="flex flex-col gap-4 md:gap-6 lg:gap-8">
      {{header}}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {{columns}}
      </div>
    </div>`
    },
    headerAndFourColumns: {
      template: `
    <div class="flex flex-col gap-4 sm:gap-6 lg:gap-8">
      {{header}}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {{columns}}
      </div>
    </div>`
    }
  };

  static utilityClasses = {
    canvas: {
      border: 'border-2 border-dashed border-border',
      visual: 'bg-background/50 rounded-lg shadow-sm',
      state: 'active ring-2 ring-ring'
    },
    preview: {
      wrapper: 'bg-muted rounded-lg shadow-sm border border-border',
      placeholder: 'bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg'
    }
  };

  static canvases = {
    full: (name: string) => `
      <div data-canvas="${name}" class="w-full aspect-[2/1] relative ${this.utilityClasses.canvas.border} ${this.utilityClasses.canvas.visual}"></div>`,
    square: (name: string) => `
      <div data-canvas="${name}" class="aspect-square relative ${this.utilityClasses.canvas.border} ${this.utilityClasses.canvas.visual}"></div>`,
    header: (name: string) => `
      <div data-canvas="${name}" class="w-full min-h-[12rem] relative ${this.utilityClasses.canvas.border} ${this.utilityClasses.canvas.visual}"></div>`
  };

  static previews: Record<string, PatternPreview> = {
    single: {
      label: 'Single Container',
      preview: `
        <div class="bg-muted rounded-lg shadow-sm border border-border aspect-[2/1] p-4 flex items-center justify-center">
          <div class="w-2/3 h-1/2 bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg"></div>
        </div>`
    },
    split: {
      label: 'Split Layout',
      preview: `
        <div class="bg-muted rounded-lg shadow-sm border border-border aspect-[2/1] p-4 flex items-center justify-center gap-2">
          <div class="w-1/2 aspect-square bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg"></div>
          <div class="w-1/2 aspect-square bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg"></div>
        </div>`
    },
    columns: {
      label: 'Features Layout',
      preview: `
        <div class="bg-muted rounded-lg shadow-sm border border-border aspect-[2/1] p-4 flex flex-col gap-2">
          <div class="w-full h-1/3 bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg"></div>
          <div class="flex gap-2 h-2/3">
            <div class="w-1/3 h-full bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg"></div>
            <div class="w-1/3 h-full bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg"></div>
            <div class="w-1/3 h-full bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg"></div>
          </div>
        </div>`
    },
    grid: {
      label: 'Grid Layout',
      preview: `
        <div class="bg-muted rounded-lg shadow-sm border border-border aspect-[2/1] p-4 grid grid-cols-2 gap-2">
          <div class="aspect-square bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg"></div>
          <div class="aspect-square bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg"></div>
          <div class="aspect-square bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg"></div>
          <div class="aspect-square bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg"></div>
        </div>`
    },
    headerAndFourColumns: {
      label: 'Header & Columns',
      preview: `
        <div class="bg-muted rounded-lg shadow-sm border border-border aspect-[2/1] p-4 flex flex-col gap-2">
          <div class="w-full h-1/3 bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg"></div>
          <div class="flex gap-2 h-2/3">
            <div class="w-1/4 h-full bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg"></div>
            <div class="w-1/4 h-full bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg"></div>
            <div class="w-1/4 h-full bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg"></div>
            <div class="w-1/4 h-full bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/20 rounded-lg"></div>
          </div>
        </div>`
    }
  };

  static createPattern(config: PatternConfig): PatternData {
    const { wrapper, layout, canvasTypes, canvasNames } = config;
    
    let canvasHTML = '';
    
    if (layout === 'headerAndThreeColumns' || layout === 'headerAndFourColumns') {
      const [headerType, ...columnTypes] = canvasTypes;
      const [headerName, ...columnNames] = canvasNames;
      
      const headerHTML = this.canvases[headerType](headerName);
      const columnsHTML = columnNames.map((name, index) => 
        this.canvases[columnTypes[index]](name)
      ).join('');
      
      canvasHTML = this.grids[layout].template
        .replace('{{header}}', headerHTML)
        .replace('{{columns}}', columnsHTML);
    } else {
      canvasNames.forEach((name, index) => {
        canvasHTML += this.canvases[canvasTypes[index]](name);
      });
      canvasHTML = this.grids[layout].template.replace('{{canvas}}', canvasHTML);
    }
    
    const template = this.wrappers[wrapper].before + canvasHTML + this.wrappers[wrapper].after;
    
    return {
      id: layout,
      name: layout.charAt(0).toUpperCase() + layout.slice(1).replace(/[A-Z]/g, letter => ` ${letter}`),
      type: wrapper,
      template,
      parameters: {
        canvasTypes,
        canvasNames
      }
    };
  }

  static getPatterns(): Record<string, Pattern> {
    return {
      fullscreen: {
        id: 'fullscreen',
        name: 'Fullscreen',
        type: 'fullscreen',
        template: `
          <section class="w-full">
            <div data-canvas="main" class="w-full aspect-[2/1] relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
          </section>`
      },
      fullscreenSplit: {
        id: 'fullscreenSplit',
        name: 'Fullscreen Split',
        type: 'fullscreen',
        template: `
          <section class="w-full">
            <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-4 md:gap-6 lg:gap-8">
              <div data-canvas="left" class="aspect-square relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
              <div data-canvas="right" class="aspect-square relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
            </div>
          </section>`
      },
      single: {
        id: 'single',
        name: 'Single Container',
        type: 'container',
        template: `
          <section class="w-full py-16 lg:py-32">
            <div class="container mx-auto px-4 md:px-6 lg:px-8">
              <div class="flex flex-col text-center gap-4 md:gap-6 lg:gap-8 items-center">
                <div data-canvas="main" class="w-full aspect-[2/1] relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
              </div>
            </div>
          </section>`
      },
      split: {
        id: 'split',
        name: 'Split Layout',
        type: 'container',
        template: `
          <section class="w-full py-16 lg:py-32">
            <div class="container mx-auto px-4 md:px-6 lg:px-8">
              <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-4 md:gap-6 lg:gap-8">
                <div data-canvas="left" class="aspect-square relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
                <div data-canvas="right" class="aspect-square relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
              </div>
            </div>
          </section>`
      },
      columns: {
        id: 'columns',
        name: 'Features Layout',
        type: 'container',
        template: `
          <section class="w-full py-16 lg:py-32">
            <div class="container mx-auto px-4 md:px-6 lg:px-8">
              <div class="flex flex-col gap-4 md:gap-6 lg:gap-8">
                <div data-canvas="main" class="w-full min-h-[12rem] relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                  <div data-canvas="col1" class="aspect-square relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
                  <div data-canvas="col2" class="aspect-square relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
                  <div data-canvas="col3" class="aspect-square relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
                </div>
              </div>
            </div>
          </section>`
      },
      grid: {
        id: 'grid',
        name: 'Grid Layout',
        type: 'container',
        template: `
          <section class="w-full py-16 lg:py-32">
            <div class="container mx-auto px-4 md:px-6 lg:px-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                <div data-canvas="topLeft" class="aspect-square relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
                <div data-canvas="topRight" class="aspect-square relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
                <div data-canvas="bottomLeft" class="aspect-square relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
                <div data-canvas="bottomRight" class="aspect-square relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
              </div>
            </div>
          </section>`
      },
      headerAndFourColumns: {
        id: 'headerAndFourColumns',
        name: 'Header & Columns',
        type: 'container',
        template: `
          <section class="w-full py-16 lg:py-32">
            <div class="container mx-auto px-4 md:px-6 lg:px-8">
              <div class="flex flex-col gap-4 sm:gap-6 lg:gap-8">
                <div data-canvas="main" class="w-full min-h-[12rem] relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  <div data-canvas="col1" class="aspect-square relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
                  <div data-canvas="col2" class="aspect-square relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
                  <div data-canvas="col3" class="aspect-square relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
                  <div data-canvas="col4" class="aspect-square relative border-2 border-dashed border-border bg-background/50 backdrop-blur-sm rounded-lg shadow-sm"></div>
                </div>
              </div>
            </div>
          </section>`
      }
    };
  }

  static initializeGridToggle() {
    const gridToggleBtn = document.getElementById('gridToggleBtn');
    const canvas = document.getElementById('canvas');
    if (!gridToggleBtn || !canvas) return;

    let isGridVisible = true;
    
    const existingGrid = canvas.querySelector('.grid');
    if (existingGrid instanceof HTMLElement) {
      existingGrid.className = 'grid absolute inset-0 grid-cols-12 gap-4 pointer-events-none z-50';
      existingGrid.innerHTML = Array(12)
        .fill('<div class="h-full bg-muted-foreground/10"></div>')
        .join('');
      
      gridToggleBtn.addEventListener('click', () => {
        isGridVisible = !isGridVisible;
        existingGrid.classList.toggle('opacity-0', !isGridVisible);
        gridToggleBtn.classList.toggle('active', isGridVisible);
      });
      
      return;
    }

    const gridOverlay = document.createElement('div');
    gridOverlay.className = 'grid absolute inset-0 grid-cols-12 gap-4 pointer-events-none z-50';
    gridOverlay.innerHTML = Array(12)
      .fill('<div class="h-full bg-muted-foreground/10"></div>')
      .join('');

    canvas.insertBefore(gridOverlay, canvas.firstChild);

    gridToggleBtn.addEventListener('click', () => {
      isGridVisible = !isGridVisible;
      gridOverlay.classList.toggle('opacity-0', !isGridVisible);
      gridToggleBtn.classList.toggle('active', isGridVisible);
    });

    gridOverlay.classList.remove('opacity-0');
    gridToggleBtn.classList.add('active');
  }

  static renderPatternsPreview(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <h3 class="text-xs font-semibold text-muted-foreground mb-3">Layout Patterns</h3>
      <div class="space-y-2"></div>
    `;

    const patternsContainer = container.querySelector('div');
    if (!patternsContainer) return;

    Object.entries(this.previews).forEach(([patternId, { label, preview }]) => {
      const patternElement = document.createElement('div');
      patternElement.className = 'pattern-item bg-card p-3 rounded-lg border border-border';
      patternElement.dataset.pattern = patternId;
      
      patternElement.innerHTML = `
        ${preview}
        <div class="mt-2 text-xs text-muted-foreground">${label}</div>
      `;

      patternsContainer.appendChild(patternElement);
    });

    this.initializePatternSelection(container);
    this.initializeGridToggle();
  }

  static initializePatternSelection(container: HTMLElement) {
    const patternItems = container.querySelectorAll('.pattern-item');
    patternItems.forEach(item => {
      item.addEventListener('click', () => {
        patternItems.forEach(p => p.classList.remove('ring-2', 'ring-ring'));
        item.classList.add('ring-2', 'ring-ring');
        
        const event = new CustomEvent('patternSelected', {
          detail: {
            patternId: (item as HTMLElement).dataset.pattern,
            pattern: this.getPatterns()[(item as HTMLElement).dataset.pattern as keyof ReturnType<typeof this.getPatterns>]
          }
        });
        document.dispatchEvent(event);
      });
    });
  }
} 