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

  // Utility classes for constructor visualization
  static utilityClasses = {
    canvas: {
      border: 'border-2 border-dashed border-slate-200 dark:border-slate-700',
      visual: 'bg-transparent rounded-lg',
      state: 'active'
    },
    preview: {
      wrapper: 'bg-slate-100 dark:bg-slate-700 rounded',
      placeholder: 'bg-blue-500/20 border-2 border-dashed border-blue-500 rounded'
    }
  };

  // Canvas types with separated structure and utility classes
  static canvases = {
    full: (name) => `
      <div data-canvas="${name}" class="w-full aspect-[2/1] relative ${this.utilityClasses.canvas.border} ${this.utilityClasses.canvas.visual}"></div>`,
    square: (name) => `
      <div data-canvas="${name}" class="aspect-square relative ${this.utilityClasses.canvas.border} ${this.utilityClasses.canvas.visual}"></div>`,
    header: (name) => `
      <div data-canvas="${name}" class="w-full min-h-[12rem] relative ${this.utilityClasses.canvas.border} ${this.utilityClasses.canvas.visual}"></div>`
  };

  // Preview configuration with separated utility classes
  static previews = {
    single: {
      label: 'Single Container',
      preview: `
        <div class="${this.utilityClasses.preview.wrapper} aspect-[2/1] flex items-center justify-center">
          <div class="w-2/3 h-1/2 ${this.utilityClasses.preview.placeholder}"></div>
        </div>`
    },
    split: {
      label: 'Split Layout',
      preview: `
        <div class="${this.utilityClasses.preview.wrapper} aspect-[2/1] flex items-center justify-center gap-2">
          <div class="w-1/2 aspect-square ${this.utilityClasses.preview.placeholder}"></div>
          <div class="w-1/2 aspect-square ${this.utilityClasses.preview.placeholder}"></div>
        </div>`
    },
    columns: {
      label: 'Features Layout',
      preview: `
        <div class="${this.utilityClasses.preview.wrapper} aspect-[2/1] flex flex-col gap-2 p-2">
          <div class="w-full h-1/3 ${this.utilityClasses.preview.placeholder}"></div>
          <div class="flex gap-2 h-2/3">
            <div class="w-1/3 h-full ${this.utilityClasses.preview.placeholder}"></div>
            <div class="w-1/3 h-full ${this.utilityClasses.preview.placeholder}"></div>
            <div class="w-1/3 h-full ${this.utilityClasses.preview.placeholder}"></div>
          </div>
        </div>`
    },
    grid: {
      label: 'Grid Layout',
      preview: `
        <div class="${this.utilityClasses.preview.wrapper} aspect-[2/1] grid grid-cols-2 gap-2 p-2">
          <div class="aspect-square ${this.utilityClasses.preview.placeholder}"></div>
          <div class="aspect-square ${this.utilityClasses.preview.placeholder}"></div>
          <div class="aspect-square ${this.utilityClasses.preview.placeholder}"></div>
          <div class="aspect-square ${this.utilityClasses.preview.placeholder}"></div>
        </div>`
    },
    headerAndFourColumns: {
      label: 'Header & Columns',
      preview: `
        <div class="${this.utilityClasses.preview.wrapper} aspect-[2/1] flex flex-col gap-2 p-2">
          <div class="w-full h-1/3 ${this.utilityClasses.preview.placeholder}"></div>
          <div class="flex gap-2 h-2/3">
            <div class="w-1/4 h-full ${this.utilityClasses.preview.placeholder}"></div>
            <div class="w-1/4 h-full ${this.utilityClasses.preview.placeholder}"></div>
            <div class="w-1/4 h-full ${this.utilityClasses.preview.placeholder}"></div>
            <div class="w-1/4 h-full ${this.utilityClasses.preview.placeholder}"></div>
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
    const canvas = document.getElementById('canvas');
    if (!gridToggleBtn || !canvas) return;

    this.isGridVisible = true;
    
    // Находим существующую сетку
    const existingGrid = canvas.querySelector('.grid');
    if (existingGrid) {
      // Устанавливаем высокий z-index и обновляем стили
      existingGrid.className = 'grid absolute inset-0 grid-cols-12 gap-4 pointer-events-none z-50';
      existingGrid.innerHTML = Array(12)
        .fill('<div class="h-full bg-slate-100/30 dark:bg-slate-700/30"></div>')
        .join('');
      
      gridToggleBtn.addEventListener('click', () => {
        this.isGridVisible = !this.isGridVisible;
        existingGrid.classList.toggle('opacity-0', !this.isGridVisible);
        gridToggleBtn.classList.toggle('active', this.isGridVisible);
      });
      
      return;
    }

    // Если сетки нет, создаем новую
    const gridOverlay = document.createElement('div');
    gridOverlay.className = 'grid absolute inset-0 grid-cols-12 gap-4 pointer-events-none z-50';
    gridOverlay.innerHTML = Array(12)
      .fill('<div class="h-full bg-slate-100/30 dark:bg-slate-700/30"></div>')
      .join('');

    // Добавляем сетку в начало canvas, чтобы она была под всеми элементами
    canvas.insertBefore(gridOverlay, canvas.firstChild);

    gridToggleBtn.addEventListener('click', () => {
      this.isGridVisible = !this.isGridVisible;
      gridOverlay.classList.toggle('opacity-0', !this.isGridVisible);
      gridToggleBtn.classList.toggle('active', this.isGridVisible);
    });

    // Сразу показываем сетку
    gridOverlay.classList.remove('opacity-0');
    gridToggleBtn.classList.add('active');
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

    // Add event handlers
    this.initializePatternSelection(container);
    
    // Initialize grid toggle after patterns are rendered
    console.log('Calling initializeGridToggle');
    this.initializeGridToggle();
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