/*
// В основном файле приложения
document.addEventListener('DOMContentLoaded', () => {
  // Рендерим превью паттернов
  PatternConstructor.renderPatternsPreview('patternsTab');

  // Слушаем выбор паттерна
  document.addEventListener('patternSelected', (e) => {
    const { patternId, pattern } = e.detail;
    // Здесь логика применения паттерна к конструктору
    console.log(`Selected pattern: ${patternId}`, pattern);
  });
});
*/

export class PatternConstructor {
  // Базовые обертки секций
  static wrappers = {
    // Без контейнера
    fullscreen: {
      before: `<section class="w-full">`,
      after: `</section>`,
      gridCols: 12
    },
    // С контейнером
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

  // Типы сеток
  static grids = {
    single: {
      template: `
    <div class="flex flex-col text-center gap-8 items-center">
      {{canvas}}
    </div>`
    },
    split: {
      template: `
    <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
      {{canvas}}
    </div>`
    },
    threeColumns: {
      template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {{canvas}}
    </div>`
    },
    fourColumns: {
      template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {{canvas}}
    </div>`
    },
    twoByTwo: {
      template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      {{canvas}}
    </div>`
    },
    headerAndThreeColumns: {
      template: `
    <div class="flex flex-col gap-10">
      {{header}}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {{columns}}
      </div>
    </div>`
    },
    headerAndFourColumns: {
      template: `
    <div class="flex flex-col gap-10">
      {{header}}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {{columns}}
      </div>
    </div>`
    }
  };

  // Типы холстов
  static canvases = {
    full: (name) => `
      <div data-canvas="${name}" class="w-full aspect-[2/1] relative border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg">
        <div class="absolute inset-0 grid grid-cols-12 gap-4 pointer-events-none">
          ${Array(12).fill('<div class="grid-guides h-full bg-slate-100 dark:bg-slate-900/20"></div>').join('')}
        </div>
      </div>`,
    square: (name) => `
      <div data-canvas="${name}" class="aspect-square relative border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg">
        <div class="absolute inset-0 grid grid-cols-6 gap-4 pointer-events-none">
          ${Array(6).fill('<div class="grid-guides h-full bg-slate-100 dark:bg-slate-900/20"></div>').join('')}
        </div>
      </div>`,
    header: (name) => `
      <div data-canvas="${name}" class="w-full min-h-[12rem] relative border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg">
        <div class="absolute inset-0 grid grid-cols-12 gap-4 pointer-events-none">
          ${Array(12).fill('<div class="grid-guides h-full bg-slate-100 dark:bg-slate-900/20"></div>').join('')}
        </div>
      </div>`
  };

  // Конфигурация превью для сайдбара
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

  // Метод для создания паттерна
  static createPattern(config) {
    const { wrapper, layout, canvasTypes, canvasNames } = config;
    
    let canvasHTML = '';
    
    // Специальная обработка для паттернов с хедером
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

  // Примеры создания паттернов
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

  // Метод для рендеринга превью паттернов в сайдбаре
  static renderPatternsPreview(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Заголовок секции
    container.innerHTML = `
      <h3 class="text-xs font-semibold text-slate-600 dark:text-slate-400">Layout Patterns</h3>
      <div class="space-y-2"></div>
    `;

    const patternsContainer = container.querySelector('div');

    // Рендерим каждый паттерн
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

    // Добавляем обработчики событий
    this.initializePatternSelection(container);
  }

  // Инициализация обработчиков событий
  static initializePatternSelection(container) {
    const patternItems = container.querySelectorAll('.pattern-item');
    patternItems.forEach(item => {
      item.addEventListener('click', () => {
        // Убираем активный класс у всех паттернов
        patternItems.forEach(p => p.classList.remove('ring-2', 'ring-blue-500'));
        // Добавляем активный класс выбранному паттерну
        item.classList.add('ring-2', 'ring-blue-500');
        
        // Создаем событие выбора паттерна
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