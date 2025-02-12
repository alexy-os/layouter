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

    this.initEventListeners();
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
    const rect = layer.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();
    
    // Use offsetLeft/offsetTop for more stable positioning values
    this.posX.value = Math.round(layer.offsetLeft);
    this.posY.value = Math.round(layer.offsetTop);
    this.width.value = Math.round(rect.width);
    this.height.value = Math.round(rect.height);
    this.colorPicker.value = this.rgbToHex(layer.style.backgroundColor || '#3498db');
    this.borderRadius.value = parseInt(layer.style.borderRadius) || 0;
  }

  updateSelectedLayerProperties() {
    if (!this.currentLayer) return;
    
    const layer = this.currentLayer.element;
    layer.style.backgroundColor = this.colorPicker.value;
    layer.style.borderRadius = `${this.borderRadius.value}px`;
    
    // Snap position values to grid
    let newX = parseInt(this.posX.value);
    let newY = parseInt(this.posY.value);
    
    if (this.toolManager.shouldSnapToGrid()) {
      newX = this.toolManager.snapToGrid(newX);
      // Update input to show snapped value
      this.posX.value = newX;
    }
    
    layer.style.left = `${newX}px`;
    layer.style.top = `${newY}px`;
    
    // Snap width to grid
    let newWidth = parseInt(this.width.value);
    if (this.toolManager.shouldSnapToGrid()) {
      newWidth = this.toolManager.snapToGrid(newWidth);
      // Update input to show snapped value
      this.width.value = newWidth;
    }
    
    layer.style.width = `${newWidth}px`;
    layer.style.height = `${this.height.value}px`;
  }

  rgbToHex(rgb) {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb;
    
    const [, r, g, b] = match;
    return `#${((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1)}`;
  }
}