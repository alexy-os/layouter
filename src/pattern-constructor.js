export class PatternConstructor {
  // Basic section wrappers
  static wrappers = {
    // Without a container
    fullscreen: {
      before: `<section class="w-full">`,
      after: `</section>`,
      gridCols: 12
    },
    // With a container
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

  // Grid types
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

  // Canvas types
  static canvases = {
    full: (name) => `
      <div data-canvas="${name}" class="w-full aspect-[2/1] relative border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg">
        <div class="absolute inset-0 grid grid-cols-12 gap-4 md:gap-6 lg:gap-8 pointer-events-none">
          ${Array(12).fill('<div class="grid-guides h-full bg-slate-100 dark:bg-slate-900/20"></div>').join('')}
        </div>
      </div>`,
    square: (name) => `
      <div data-canvas="${name}" class="aspect-square relative border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg">
        <div class="absolute inset-0 grid grid-cols-6 gap-4 md:gap-6 lg:gap-8 pointer-events-none">
          ${Array(4).fill('<div class="grid-guides h-full bg-slate-100 dark:bg-slate-900/20"></div>').join('')}
        </div>
      </div>`,
    header: (name) => `
      <div data-canvas="${name}" class="w-full min-h-[12rem] relative border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg">
        <div class="absolute inset-0 grid grid-cols-12 gap-4 md:gap-6 lg:gap-8 pointer-events-none">
          ${Array(12).fill('<div class="grid-guides h-full bg-slate-100 dark:bg-slate-900/20"></div>').join('')}
        </div>
      </div>`
  };

  // Preview configuration for the sidebar
  static previews = {
    single: {
      label: 'Single Container',
      preview: `
        <div class="aspect-[2/1] bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
          <div class="w-2/3 h-1/2 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded"></div>
        </div>`
    },
    split: {
      label: 'Split Layout',
      preview: `
        <div class="aspect-[2/1] bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center gap-2">
          <div class="w-1/2 aspect-square bg-blue-500/20 border-2 border-dashed border-blue-500 rounded"></div>
          <div class="w-1/2 aspect-square bg-blue-500/20 border-2 border-dashed border-blue-500 rounded"></div>
        </div>`
    },
    columns: {
      label: 'Features Layout',
      preview: `
        <div class="aspect-[2/1] bg-slate-100 dark:bg-slate-700 rounded flex flex-col gap-2 p-2">
          <div class="w-full h-1/2 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded"></div>
          <div class="flex gap-2 h-1/2">
            <div class="w-1/3 h-full bg-blue-500/20 border-2 border-dashed border-blue-500 rounded"></div>
            <div class="w-1/3 h-full bg-blue-500/20 border-2 border-dashed border-blue-500 rounded"></div>
            <div class="w-1/3 h-full bg-blue-500/20 border-2 border-dashed border-blue-500 rounded"></div>
          </div>
        </div>`
    },
    grid: {
      label: 'Grid Layout',
      preview: `
        <div class="aspect-[2/1] bg-slate-100 dark:bg-slate-700 rounded grid grid-cols-2 gap-2 p-2">
          <div class="bg-blue-500/20 border-2 border-dashed border-blue-500 rounded"></div>
          <div class="bg-blue-500/20 border-2 border-dashed border-blue-500 rounded"></div>
          <div class="bg-blue-500/20 border-2 border-dashed border-blue-500 rounded"></div>
          <div class="bg-blue-500/20 border-2 border-dashed border-blue-500 rounded"></div>
        </div>`
    },
    headerAndFourColumns: {
      label: 'Header & Columns',
      preview: `
        <div class="aspect-[2/1] bg-slate-100 dark:bg-slate-700 rounded flex flex-col gap-2 p-2">
          <div class="w-full h-1/3 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded"></div>
          <div class="flex gap-2 h-2/3">
            <div class="w-1/4 h-full bg-blue-500/20 border-2 border-dashed border-blue-500 rounded"></div>
            <div class="w-1/4 h-full bg-blue-500/20 border-2 border-dashed border-blue-500 rounded"></div>
            <div class="w-1/4 h-full bg-blue-500/20 border-2 border-dashed border-blue-500 rounded"></div>
            <div class="w-1/4 h-full bg-blue-500/20 border-2 border-dashed border-blue-500 rounded"></div>
          </div>
        </div>`
    }
  };

  // Method for creating a pattern
  static createPattern(config) {
    const { wrapper, layout, canvasTypes, canvasNames } = config;
    
    let canvasHTML = '';
    
    // Special handling for patterns with a header
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
    
    return {
      template: this.wrappers[wrapper].before + canvasHTML + this.wrappers[wrapper].after,
      canvases: canvasNames
    };
  }

  // Examples of creating patterns
  static getPatterns() {
    return {
      fullscreen: this.createPattern({
        wrapper: 'fullscreen',
        layout: 'single',
        canvasTypes: ['full'],
        canvasNames: ['main']
      }),

      fullscreenSplit: this.createPattern({
        wrapper: 'fullscreen',
        layout: 'split',
        canvasTypes: ['square', 'square'],
        canvasNames: ['left', 'right']
      }),

      single: this.createPattern({
        wrapper: 'container',
        layout: 'single',
        canvasTypes: ['full'],
        canvasNames: ['main']
      }),

      split: this.createPattern({
        wrapper: 'container',
        layout: 'split',
        canvasTypes: ['square', 'square'],
        canvasNames: ['left', 'right']
      }),

      columns: this.createPattern({
        wrapper: 'container',
        layout: 'headerAndThreeColumns',
        canvasTypes: ['header', 'square', 'square', 'square'],
        canvasNames: ['main', 'col1', 'col2', 'col3']
      }),

      grid: this.createPattern({
        wrapper: 'container',
        layout: 'twoByTwo',
        canvasTypes: ['square', 'square', 'square', 'square'],
        canvasNames: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
      }),

      headerAndFourColumns: this.createPattern({
        wrapper: 'container',
        layout: 'headerAndFourColumns',
        canvasTypes: ['header', 'square', 'square', 'square', 'square'],
        canvasNames: ['main', 'col1', 'col2', 'col3', 'col4']
      })
    };
  }

  static initializeGridToggle() {
    const gridToggleBtn = document.getElementById('gridToggleBtn');
    if (!gridToggleBtn) return;

    this.isGridVisible = true; // Начальное состояние сетки

    gridToggleBtn.addEventListener('click', () => {
      const allCanvases = document.querySelectorAll('[data-canvas]');
      
      this.isGridVisible = !this.isGridVisible;
      
      allCanvases.forEach(canvas => {
        const gridGuides = canvas.querySelectorAll('.grid-guides');
        gridGuides.forEach(guide => {
          guide.classList.toggle('hidden', !this.isGridVisible);
        });
      });
      
      gridToggleBtn.classList.toggle('active', this.isGridVisible);
    });
  }

  // Method for rendering patterns preview in the sidebar
  static renderPatternsPreview(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Section header
    container.innerHTML = `
      <h3 class="text-xs font-semibold text-slate-600 dark:text-slate-400">Layout Patterns</h3>
      <div class="space-y-2"></div>
    `;

    const patternsContainer = container.querySelector('div');

    // Render each pattern
    Object.entries(this.previews).forEach(([patternId, { label, preview }]) => {
      const patternElement = document.createElement('div');
      patternElement.className = 'pattern-item bg-white p-3 rounded border border-slate-200 dark:bg-slate-800 dark:border-slate-700';
      patternElement.dataset.pattern = patternId;
      
      patternElement.innerHTML = `
        ${preview}
        <div class="mt-2 text-xs text-slate-600 dark:text-slate-400">${label}</div>
      `;

      patternsContainer.appendChild(patternElement);
    });

    // Add the initialization call to the end of the method
    this.initializeGridToggle();

    // Add event handlers
    this.initializePatternSelection(container);
  }

  // Initialization of event handlers
  static initializePatternSelection(container) {
    const patternItems = container.querySelectorAll('.pattern-item');
    patternItems.forEach(item => {
      item.addEventListener('click', () => {
        // Remove the active class from all patterns
        patternItems.forEach(p => p.classList.remove('ring-2', 'ring-blue-500'));
        // Add the active class to the selected pattern
        item.classList.add('ring-2', 'ring-blue-500');
        
        // Create a pattern selection event
        const event = new CustomEvent('patternSelected', {
          detail: {
            patternId: item.dataset.pattern,
            pattern: this.getPatterns()[item.dataset.pattern]
          }
        });
        document.dispatchEvent(event);
      });
    });
  }
} 