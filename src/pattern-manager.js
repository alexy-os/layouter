export class PatternManager {
  constructor(layerManager, registryManager) {
    this.layerManager = layerManager;
    this.registryManager = registryManager;
    this.patterns = [];
    this.currentPatternIndex = -1;
    this.patternsContainer = document.querySelector('#patternsTab .space-y-2');
    this.initPatternsList();
  }

  initPatternsList() {
    // Clear placeholder patterns
    if (this.patternsContainer) {
      this.patternsContainer.innerHTML = '';
    }
  }

  createPatternPreview(pattern, index) {
    const preview = document.createElement('div');
    preview.className = 'relative bg-white rounded shadow-sm dark:bg-gray-800 cursor-pointer hover:shadow-md transition-shadow';
    preview.style.paddingTop = '56.25%'; // 16:9 aspect ratio
    
    // Create preview canvas
    const previewCanvas = document.createElement('div');
    previewCanvas.className = 'absolute inset-0 m-2';
    
    // Add pattern elements with scaled dimensions
    pattern.forEach(element => {
      const el = document.createElement('div');
      const scale = 0.2; // Scale factor for preview
      
      el.className = element.classes.join(' ');
      el.style.position = 'absolute';
      el.style.left = `${element.style.left * scale}px`;
      el.style.top = `${element.style.top * scale}px`;
      el.style.width = `${element.style.width * scale}px`;
      el.style.height = `${element.style.height * scale}px`;
      
      if (element.type === 'text') {
        el.textContent = element.content;
      }
      
      previewCanvas.appendChild(el);
    });
    
    // Add pattern name
    const name = document.createElement('div');
    name.className = 'absolute bottom-0 left-0 right-0 p-2 text-xs bg-black bg-opacity-50 text-white rounded-b';
    name.textContent = `Pattern ${index + 1}`;
    
    preview.appendChild(previewCanvas);
    preview.appendChild(name);
    
    // Add click handler
    preview.addEventListener('click', () => {
      this.applyPattern(pattern);
      this.currentPatternIndex = index;
      this.updateActivePattern();
    });
    
    return preview;
  }

  updateActivePattern() {
    // Remove active state from all patterns
    const previews = this.patternsContainer.children;
    Array.from(previews).forEach((preview, index) => {
      preview.classList.remove('ring-2');
      preview.classList.remove('ring-ui-blue');
      if (index === this.currentPatternIndex) {
        preview.classList.add('ring-2');
        preview.classList.add('ring-ui-blue');
      }
    });
  }

  addPattern(pattern) {
    this.patterns.push(pattern);
    const preview = this.createPatternPreview(pattern, this.patterns.length - 1);
    this.patternsContainer.appendChild(preview);
  }

  // Преобразование HTML-паттерна в объект
  parsePattern(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements = doc.querySelectorAll('[layer]');
    
    return Array.from(elements).map(el => ({
      type: el.dataset.type || 'rectangle',
      layer: el.getAttribute('layer'),
      style: {
        left: parseInt(el.style.left) || 0,
        top: parseInt(el.style.top) || 0,
        width: parseInt(el.style.width) || 100,
        height: parseInt(el.style.height) || 100
      },
      classes: Array.from(el.classList),
      content: el.dataset.type === 'text' ? el.textContent.trim() : null,
      textProperties: el.dataset.type === 'text' ? {
        size: Array.from(el.classList).find(cls => /^text-(xs|sm|base|lg|xl|2xl|3xl)$/.test(cls)),
        align: Array.from(el.classList).find(cls => /^text-(left|center|right|justify)$/.test(cls)),
        isBold: el.classList.contains('font-bold'),
        isItalic: el.classList.contains('italic')
      } : null
    }));
  }

  // Применение паттерна на холст
  applyPattern(pattern) {
    // Очистить текущие слои
    this.layerManager.clearLayers();
    
    pattern.forEach(element => {
      let layer;
      
      if (element.type === 'text') {
        layer = this.layerManager.createTextLayer(
          element.style.left,
          element.style.top
        );
        layer.textContent = element.content;
        
        // Применить текстовые свойства
        if (element.textProperties) {
          if (element.textProperties.size) layer.classList.add(element.textProperties.size);
          if (element.textProperties.align) layer.classList.add(element.textProperties.align);
          if (element.textProperties.isBold) layer.classList.add('font-bold');
          if (element.textProperties.isItalic) layer.classList.add('italic');
        }
      } else {
        layer = this.layerManager.createRectangleLayer(
          element.style.left,
          element.style.top,
          element.style.width,
          element.style.height
        );
      }
      
      // Применить общие классы
      element.classes.forEach(cls => {
        if (!cls.includes('layer') && !cls.includes('selected')) {
          layer.classList.add(cls);
        }
      });
      
      // Добавить слой и зарегистрировать его тип
      const layerData = this.layerManager.addLayer(layer, element.type);
      this.registryManager.setLayerType(layer.dataset.id, element.layer);
    });
  }

  // Экспорт текущего проекта в JSON
  exportProject() {
    const currentPattern = this.layerManager.getLayers().map(({ element }) => ({
      type: element.dataset.type,
      layer: this.registryManager.getLayerType(element.dataset.id),
      style: {
        left: parseInt(element.style.left),
        top: parseInt(element.style.top),
        width: parseInt(element.style.width),
        height: parseInt(element.style.height)
      },
      classes: Array.from(element.classList),
      content: element.dataset.type === 'text' ? element.textContent.trim() : null,
      textProperties: element.dataset.type === 'text' ? {
        size: Array.from(element.classList).find(cls => /^text-(xs|sm|base|lg|xl|2xl|3xl)$/.test(cls)),
        align: Array.from(element.classList).find(cls => /^text-(left|center|right|justify)$/.test(cls)),
        isBold: element.classList.contains('font-bold'),
        isItalic: element.classList.contains('italic')
      } : null
    }));

    // Add current pattern to patterns array if it's not empty
    if (currentPattern.length > 0) {
      this.addPattern(currentPattern);
    }

    return JSON.stringify({
      version: '1.0',
      patterns: this.patterns
    }, null, 2);
  }

  // Импорт проекта из JSON
  importProject(json) {
    try {
      const project = JSON.parse(json);
      
      // Clear existing patterns and canvas
      this.patterns = [];
      this.currentPatternIndex = -1;
      this.initPatternsList();
      this.layerManager.clearLayers();
      
      // Import patterns
      if (project.patterns && Array.isArray(project.patterns)) {
        project.patterns.forEach(pattern => {
          this.addPattern(pattern);
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import project:', error);
      return false;
    }
  }
} 