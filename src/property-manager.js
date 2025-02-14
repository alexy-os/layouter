export class PropertyManager {
  constructor(
    canvas, 
    colorPicker, 
    borderRadius, 
    posX, 
    posY, 
    width, 
    height, 
    layerManager,
    toolManager,
    registryManager
  ) {
    this.canvas = canvas;
    this.colorPicker = colorPicker;
    this.borderRadius = borderRadius;
    this.posX = posX;
    this.posY = posY;
    this.width = width;
    this.height = height;
    this.layerManager = layerManager;
    this.toolManager = toolManager;
    this.registryManager = registryManager;
    this.selectedLayer = null;

    // Define Tailwind border radius values
    this.twBorderRadius = {
      'none': '0px',
      'sm': '0.125rem',
      'md': '0.375rem', 
      'lg': '0.5rem',
      'xl': '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      'full': '9999px'
    };

    // Define Tailwind colors (slate and blue)
    this.twColors = {
      slate: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a'
      },
      blue: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a'
      }
    };

    // Define Tailwind width/height values
    this.twSizes = {
      '0': '0px',
      'px': '1px',
      '0.5': '0.125rem',
      '1': '0.25rem',
      '2': '0.5rem',
      '4': '1rem',
      '6': '1.5rem',
      '8': '2rem',
      '12': '3rem',
      '16': '4rem',
      '20': '5rem',
      '24': '6rem',
      '32': '8rem',
      '40': '10rem',
      '48': '12rem',
      '56': '14rem',
      '64': '16rem',
      '80': '20rem',
      '96': '24rem'
    };

    // Add default values
    this.defaultStyles = {
      borderRadius: '0px',
      backgroundColor: '#3b82f6', // Tailwind blue-500
      width: '100px',
      height: '100px'
    };

    // Initialize in the correct order
    this.initializeComponents();
  }

  initializeComponents() {
    // Wait for DOM to be ready
    requestAnimationFrame(() => {
      if (this.colorPicker) this.initColorPicker();
      if (this.borderRadius) this.initBorderRadius();
      if (this.posX && this.posY && this.width && this.height) {
        this.initPositionInputs();
        this.initTextProperties();
      }
    });
  }

  initColorPicker() {
    // Add color options for both background and text
    const colors = [
      { name: 'Blue', value: 'blue-500' },
      { name: 'Red', value: 'red-500' },
      { name: 'Green', value: 'green-500' },
      { name: 'Yellow', value: 'yellow-500' },
      { name: 'Purple', value: 'purple-500' },
      { name: 'Pink', value: 'pink-500' },
      { name: 'Indigo', value: 'indigo-500' },
      { name: 'Gray', value: 'gray-500' }
    ];

    colors.forEach(color => {
      const option = document.createElement('option');
      option.value = color.value;
      option.textContent = color.name;
      this.colorPicker.appendChild(option);
    });

    this.colorPicker.addEventListener('change', () => {
      if (!this.selectedLayer) return;
      
      if (this.selectedLayer.dataset.type === 'rectangle') {
        // Handle background color for rectangles
        const oldBgClass = Array.from(this.selectedLayer.classList)
          .find(cls => cls.startsWith('bg-'));
        if (oldBgClass) {
          this.selectedLayer.classList.remove(oldBgClass);
        }
        this.selectedLayer.classList.add(`bg-${this.colorPicker.value}`);
      } else if (this.selectedLayer.dataset.type === 'text') {
        // Handle text color for text elements
        const oldTextClass = Array.from(this.selectedLayer.classList)
          .find(cls => cls.startsWith('text-') && !cls.startsWith('text-'));
        if (oldTextClass) {
          this.selectedLayer.classList.remove(oldTextClass);
        }
        this.selectedLayer.classList.add(`text-${this.colorPicker.value}`);
      }
    });
  }

  initBorderRadius() {
    this.borderRadius.addEventListener('change', () => {
      if (!this.selectedLayer) return;
      
      // Remove old border radius class
      const oldRadiusClass = Array.from(this.selectedLayer.classList)
        .find(cls => cls.startsWith('rounded-'));
      if (oldRadiusClass) {
        this.selectedLayer.classList.remove(oldRadiusClass);
      }
      
      // Add new border radius class if not 'none'
      if (this.borderRadius.value !== 'none') {
        this.selectedLayer.classList.add(`rounded-${this.borderRadius.value}`);
      }
    });
  }

  initPositionInputs() {
    const propertiesPanel = this.posX.closest('.space-y-3');
    if (!propertiesPanel) return;

    // Add layer type selector for rectangles
    const layerTypeContainer = document.createElement('div');
    layerTypeContainer.classList.add('flex', 'items-center', 'gap-2', 'mb-4');
    layerTypeContainer.innerHTML = `
      <label class="text-xs text-ui-gray dark:text-gray-400">Layer Type</label>
      <select id="layerType" class="w-full px-2 py-1 border border-ui-border rounded text-xs dark:bg-gray-800 dark:border-ui-border-dark">
        <option value="">Select type...</option>
        <option value="image">Image</option>
        <option value="form">Form</option>
        <option value="button">Button</option>
        <option value="widget">Widget</option>
        <option value="video">Video</option>
        <option value="navbar">Navbar</option>
        <option value="footer">Footer</option>
        <option value="sidebar">Sidebar</option>
      </select>
    `;

    // Insert at beginning of properties panel
    propertiesPanel.insertBefore(layerTypeContainer, propertiesPanel.firstChild);

    // Add event listeners after elements are created
    const layerType = document.getElementById('layerType');
    if (layerType) {
      layerType.addEventListener('change', () => {
        if (!this.selectedLayer) return;
        this.registryManager.setLayerType(this.selectedLayer.dataset.id, layerType.value);
      });
    }

    // Position input listeners
    [this.posX, this.posY, this.width, this.height].forEach(input => {
      if (input) {
        input.addEventListener('change', () => {
          if (!this.selectedLayer) return;
          
          const rect = this.selectedLayer.getBoundingClientRect();
          const canvasRect = this.canvas.getBoundingClientRect();
          
          this.posX.value = Math.round(rect.left - canvasRect.left);
          this.posY.value = Math.round(rect.top - canvasRect.top);
          this.width.value = Math.round(rect.width);
          this.height.value = Math.round(rect.height);
          
          this.selectedLayer.style.left = `${this.posX.value}px`;
          this.selectedLayer.style.top = `${this.posY.value}px`;
          this.selectedLayer.style.width = `${this.width.value}px`;
          this.selectedLayer.style.height = `${this.height.value}px`;
        });
      }
    });
  }

  initTextProperties() {
    // Create text properties container
    const container = document.createElement('div');
    container.id = 'textProperties';
    container.classList.add('hidden', 'space-y-3', 'mt-3');

    // Text type selector
    const typeContainer = document.createElement('div');
    typeContainer.innerHTML = `
      <label class="text-xs text-ui-gray dark:text-gray-400">Text Type</label>
      <select id="textType" class="w-full px-2 py-1 border border-ui-border rounded text-xs dark:bg-gray-800 dark:border-ui-border-dark">
        <option value="">Select type...</option>
        <option value="h1">Heading H1</option>
        <option value="h2">Heading H2</option>
        <option value="h3">Heading H3</option>
        <option value="text">Text</option>
        <option value="paragraph">Paragraph</option>
        <option value="blockquote">Blockquote</option>
      </select>
    `;

    // Text size selector
    const sizeContainer = document.createElement('div');
    sizeContainer.innerHTML = `
      <label class="text-xs text-ui-gray dark:text-gray-400">Text Size</label>
      <select id="textSize" class="w-full px-2 py-1 border border-ui-border rounded text-xs dark:bg-gray-800 dark:border-ui-border-dark">
        <option value="text-xs">Extra Small</option>
        <option value="text-sm">Small</option>
        <option value="text-base" selected>Base</option>
        <option value="text-lg">Large</option>
        <option value="text-xl">Extra Large</option>
        <option value="text-2xl">2XL</option>
        <option value="text-3xl">3XL</option>
      </select>
    `;

    // Text alignment
    const alignContainer = document.createElement('div');
    alignContainer.innerHTML = `
      <label class="text-xs text-ui-gray dark:text-gray-400">Alignment</label>
      <select id="textAlign" class="w-full px-2 py-1 border border-ui-border rounded text-xs dark:bg-gray-800 dark:border-ui-border-dark">
        <option value="text-left" selected>Left</option>
        <option value="text-center">Center</option>
        <option value="text-right">Right</option>
        <option value="text-justify">Justify</option>
      </select>
    `;

    // Text formatting
    const formatContainer = document.createElement('div');
    formatContainer.innerHTML = `
      <label class="text-xs text-ui-gray dark:text-gray-400">Format</label>
      <div class="flex gap-2 mt-1">
        <label class="flex items-center">
          <input type="checkbox" id="textBold" class="mr-1"> Bold
        </label>
        <label class="flex items-center">
          <input type="checkbox" id="textItalic" class="mr-1"> Italic
        </label>
      </div>
    `;

    container.appendChild(typeContainer);
    container.appendChild(sizeContainer);
    container.appendChild(alignContainer);
    container.appendChild(formatContainer);

    // Find properties panel and append container
    const propertiesPanel = this.posX?.closest('.space-y-3');
    if (propertiesPanel) {
      propertiesPanel.appendChild(container);

      // Add event listeners after elements are created
      this.initTextEventListeners();
    }
  }

  initTextEventListeners() {
    const textType = document.getElementById('textType');
    const textSize = document.getElementById('textSize');
    const textAlign = document.getElementById('textAlign');
    const textBold = document.getElementById('textBold');
    const textItalic = document.getElementById('textItalic');

    if (textType) {
      textType.addEventListener('change', () => {
        if (!this.selectedLayer || this.selectedLayer.dataset.type !== 'text') return;
        this.registryManager.setLayerType(this.selectedLayer.dataset.id, textType.value);
      });
    }

    if (textSize) {
      textSize.addEventListener('change', () => {
        if (!this.selectedLayer || this.selectedLayer.dataset.type !== 'text') return;
        
        // Remove old size class
        const oldSizeClass = Array.from(this.selectedLayer.classList)
          .find(cls => /^text-(xs|sm|base|lg|xl|2xl|3xl)$/.test(cls));
        if (oldSizeClass) {
          this.selectedLayer.classList.remove(oldSizeClass);
        }
        
        this.selectedLayer.classList.add(textSize.value);
      });
    }

    if (textAlign) {
      textAlign.addEventListener('change', () => {
        if (!this.selectedLayer || this.selectedLayer.dataset.type !== 'text') return;
        
        // Remove old alignment class
        const oldAlignClass = Array.from(this.selectedLayer.classList)
          .find(cls => /^text-(left|center|right|justify)$/.test(cls));
        if (oldAlignClass) {
          this.selectedLayer.classList.remove(oldAlignClass);
        }
        
        this.selectedLayer.classList.add(textAlign.value);
      });
    }

    if (textBold) {
      textBold.addEventListener('change', () => {
        if (!this.selectedLayer || this.selectedLayer.dataset.type !== 'text') return;
        if (textBold.checked) {
          this.selectedLayer.classList.add('font-bold');
        } else {
          this.selectedLayer.classList.remove('font-bold');
        }
      });
    }

    if (textItalic) {
      textItalic.addEventListener('change', () => {
        if (!this.selectedLayer || this.selectedLayer.dataset.type !== 'text') return;
        if (textItalic.checked) {
          this.selectedLayer.classList.add('italic');
        } else {
          this.selectedLayer.classList.remove('italic');
        }
      });
    }
  }

  selectLayer(layer) {
    if (!layer) return;

    // Deselect previous layer
    if (this.selectedLayer) {
      this.selectedLayer.classList.remove('selected');
    }
    
    // Select new layer
    this.selectedLayer = layer;
    layer.classList.add('selected');
    
    // Update inputs with current values
    this.updatePropertyInputs();
    
    // Show/hide text properties
    const textProperties = document.getElementById('textProperties');
    const layerType = document.getElementById('layerType');
    const textType = document.getElementById('textType');

    if (!textProperties || !layerType) return;

    // Reset type selectors to empty state
    layerType.value = '';
    if (textType) textType.value = '';

    if (layer.dataset.type === 'text') {
      textProperties.classList.remove('hidden');
      this.updateTextProperties(layer);
      // Get saved text type if exists
      if (textType) {
        textType.value = this.registryManager.getLayerType(layer.dataset.id) || '';
      }
    } else {
      textProperties.classList.add('hidden');
      // Get saved layer type if exists
      layerType.value = this.registryManager.getLayerType(layer.dataset.id) || '';
    }
  }

  deselectAllLayers() {
    if (this.selectedLayer) {
      this.selectedLayer.classList.remove('selected');
      this.selectedLayer = null;
    }
    
    // Hide text properties
    const textProperties = document.getElementById('textProperties');
    if (textProperties) {
      textProperties.classList.add('hidden');
    }
  }

  updatePropertyInputs() {
    if (!this.selectedLayer) return;
    
    const rect = this.selectedLayer.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();
    
    this.posX.value = Math.round(rect.left - canvasRect.left);
    this.posY.value = Math.round(rect.top - canvasRect.top);
    this.width.value = Math.round(rect.width);
    this.height.value = Math.round(rect.height);
    
    // Update color picker
    const bgClass = Array.from(this.selectedLayer.classList)
      .find(cls => cls.startsWith('bg-'));
    if (bgClass) {
      this.colorPicker.value = bgClass.replace('bg-', '');
    }
    
    // Update border radius
    const radiusClass = Array.from(this.selectedLayer.classList)
      .find(cls => cls.startsWith('rounded-'));
    if (radiusClass) {
      this.borderRadius.value = radiusClass.replace('rounded-', '');
    } else {
      this.borderRadius.value = 'none';
    }
  }

  updateTextProperties(layer) {
    const textSize = document.getElementById('textSize');
    const textAlign = document.getElementById('textAlign');
    const textBold = document.getElementById('textBold');
    const textItalic = document.getElementById('textItalic');

    // Update size
    const sizeClass = Array.from(layer.classList)
      .find(cls => /^text-(xs|sm|base|lg|xl|2xl|3xl)$/.test(cls));
    if (sizeClass) {
      textSize.value = sizeClass;
    }

    // Update alignment
    const alignClass = Array.from(layer.classList)
      .find(cls => /^text-(left|center|right|justify)$/.test(cls));
    if (alignClass) {
      textAlign.value = alignClass;
    }

    // Update formatting
    textBold.checked = layer.classList.contains('font-bold');
    textItalic.checked = layer.classList.contains('italic');
  }

  getClosestTailwindValue(value, mapping) {
    const numericValue = parseFloat(value);
    let closest = Object.entries(mapping).reduce((prev, curr) => {
      const prevDiff = Math.abs(parseFloat(prev[1]) - numericValue);
      const currDiff = Math.abs(parseFloat(curr[1]) - numericValue);
      return currDiff < prevDiff ? curr : prev;
    });
    return closest[0];
  }

  findTailwindColor(hexColor) {
    for (const [colorName, shades] of Object.entries(this.twColors)) {
      for (const [shade, value] of Object.entries(shades)) {
        if (value.toLowerCase() === hexColor.toLowerCase()) {
          return `${colorName}-${shade}`;
        }
      }
    }
    return hexColor;
  }

  rgbToHex(rgb) {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb;
    
    const [, r, g, b] = match;
    return `#${((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1)}`;
  }
}