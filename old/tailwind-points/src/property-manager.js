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
    toolManager
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
    this.currentLayer = null;

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

    this.initEventListeners();
    this.updateColorPicker();
  }

  updateColorPicker() {
    // Create color options from Tailwind palette
    const colorOptions = [];
    for (const [colorName, shades] of Object.entries(this.twColors)) {
      for (const [shade, value] of Object.entries(shades)) {
        colorOptions.push({
          name: `${colorName}-${shade}`,
          value: value
        });
      }
    }

    // Update color picker with Tailwind colors
    this.colorPicker.innerHTML = colorOptions.map(color => 
      `<option value="${color.value}">${color.name}</option>`
    ).join('');
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

  initEventListeners() {
    this.colorPicker.addEventListener('input', () => this.updateSelectedLayerProperties());
    this.borderRadius.addEventListener('input', () => this.updateSelectedLayerProperties());
    this.posX.addEventListener('input', () => this.updateSelectedLayerProperties());
    this.posY.addEventListener('input', () => this.updateSelectedLayerProperties());
    this.width.addEventListener('input', () => this.updateSelectedLayerProperties());
    this.height.addEventListener('input', () => this.updateSelectedLayerProperties());
  }

  selectLayer(layer) {
    this.deselectAllLayers();
    
    const layers = this.layerManager.getLayers();
    const selectedLayer = layers.find(l => l.element === layer);
    
    if (selectedLayer) {
      selectedLayer.listItem.classList.add('active');
      selectedLayer.element.classList.add('selected');
      this.currentLayer = selectedLayer;
      
      this.updatePropertyInputs();
    }
  }

  deselectAllLayers() {
    const layers = this.layerManager.getLayers();
    layers.forEach(l => {
      l.listItem.classList.remove('active');
      l.element.classList.remove('selected');
    });
    this.currentLayer = null;
  }

  updatePropertyInputs() {
    if (!this.currentLayer) return;
    
    const layer = this.currentLayer.element;
    
    // Update position inputs - parse stored dataset values first
    const storedX = parseInt(layer.dataset.x);
    const storedY = parseInt(layer.dataset.y);
    
    // Fallback to style values if dataset is empty
    const currentX = !isNaN(storedX) ? storedX : parseInt(layer.style.left);
    const currentY = !isNaN(storedY) ? storedY : parseInt(layer.style.top);
    
    this.posX.value = currentX;
    this.posY.value = currentY;
    
    // Update size inputs - parse stored dataset values first
    const storedWidth = parseInt(layer.dataset.width);
    const storedHeight = parseInt(layer.dataset.height);
    
    // Fallback to computed values if dataset is empty
    const rect = layer.getBoundingClientRect();
    const currentWidth = !isNaN(storedWidth) ? storedWidth : Math.round(rect.width);
    const currentHeight = !isNaN(storedHeight) ? storedHeight : Math.round(rect.height);
    
    this.width.value = currentWidth;
    this.height.value = currentHeight;
    
    // Update color picker
    const bgColor = layer.style.backgroundColor;
    if (bgColor) {
      this.colorPicker.value = this.rgbToHex(bgColor);
    }
    
    // Update border radius - check for Tailwind class
    const radiusClass = Array.from(layer.classList)
      .find(cls => cls.startsWith('rounded-'));
    
    if (radiusClass) {
      const radiusValue = radiusClass.replace('rounded-', '');
      this.borderRadius.value = radiusValue;
    } else {
      this.borderRadius.value = 'none';
    }
  }

  updateSelectedLayerProperties() {
    if (!this.currentLayer) return;
    
    const layer = this.currentLayer.element;
    
    // Update color
    const selectedColor = this.colorPicker.value;
    if (selectedColor) {
      layer.style.backgroundColor = selectedColor;
      layer.dataset.twColor = this.findTailwindColor(selectedColor);
    }
    
    // Update border radius using Tailwind classes
    const radiusValue = this.borderRadius.value;
    
    // Remove existing radius classes
    layer.classList.remove(
      'rounded-none', 'rounded-sm', 'rounded-md', 
      'rounded-lg', 'rounded-xl', 'rounded-2xl', 
      'rounded-3xl', 'rounded-full'
    );
    
    // Add new radius class
    if (radiusValue !== 'none') {
      layer.classList.add(`rounded-${radiusValue}`);
    }
    
    // Store selected radius for export
    layer.dataset.twRadius = radiusValue;
    
    // Update position - get current position if input is empty
    let newX = this.posX.value !== '' ? parseInt(this.posX.value) : parseInt(layer.style.left);
    let newY = this.posY.value !== '' ? parseInt(this.posY.value) : parseInt(layer.style.top);
    
    // Ensure we have valid numbers, falling back to stored dataset values
    if (isNaN(newX)) newX = parseInt(layer.dataset.x) || 0;
    if (isNaN(newY)) newY = parseInt(layer.dataset.y) || 0;
    
    let finalX = newX;
    let finalY = newY;
    
    if (this.toolManager.shouldSnapToGrid()) {
      finalX = this.toolManager.snapToGrid(newX);
      finalY = this.toolManager.snapToGrid(newY);
      this.posX.value = finalX;
      this.posY.value = finalY;
    }
    
    layer.style.left = `${finalX}px`;
    layer.style.top = `${finalY}px`;
    layer.dataset.x = finalX;
    layer.dataset.y = finalY;
    
    // Update size - get current dimensions if input is empty
    let newWidth = this.width.value !== '' ? parseInt(this.width.value) : parseInt(layer.style.width);
    let newHeight = this.height.value !== '' ? parseInt(this.height.value) : parseInt(layer.style.height);
    
    // Ensure we have valid numbers, falling back to stored dataset values
    if (isNaN(newWidth)) newWidth = parseInt(layer.dataset.width) || 100;
    if (isNaN(newHeight)) newHeight = parseInt(layer.dataset.height) || 100;
    
    let finalWidth = newWidth;
    let finalHeight = newHeight;
    
    if (this.toolManager.shouldSnapToGrid()) {
      finalWidth = this.toolManager.snapToGrid(newWidth);
      finalHeight = this.toolManager.snapToGrid(newHeight);
      this.width.value = finalWidth;
      this.height.value = finalHeight;
    }
    
    // Store actual values
    layer.dataset.width = finalWidth;
    layer.dataset.height = finalHeight;
    
    layer.style.width = `${finalWidth}px`;
    layer.style.height = `${finalHeight}px`;
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