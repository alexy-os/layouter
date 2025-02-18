export class ToolManager {
  constructor(
    rectangleBtn, 
    textBtn, 
    deleteBtn, 
    canvas, 
    layerManager,
    propertyManager,
    registryManager
  ) {
    this.rectangleBtn = rectangleBtn;
    this.textBtn = textBtn;
    this.deleteBtn = deleteBtn;
    this.canvas = canvas;
    this.layerManager = layerManager;
    this.propertyManager = propertyManager;
    this.registryManager = registryManager;

    this.currentTool = 'rectangle';
    this.gridSize = 8; // 0.5rem (8px) grid size

    this.initToolButtons();
    this.initDeleteButton();
  }

  initToolButtons() {
    const toolButtons = [
      {button: this.rectangleBtn, tool: 'rectangle'},
      {button: this.textBtn, tool: 'text'}
    ];

    toolButtons.forEach(({button, tool}) => {
      button.addEventListener('click', () => {
        if (tool === 'rectangle') {
          const layer = this.layerManager.createRectangleLayer(
            32, // First column
            32, // Fixed Y position
            144, // Width: 36 units (tailwind w-36)
            64, // Height: 24 units (tailwind h-24)
            'xl' // Border radius
          );
          const layerData = this.layerManager.addLayer(layer, 'Rectangle');
          this.propertyManager.selectLayer(layer);
        } else if (tool === 'text') {
          const activeCanvas = document.querySelector('[data-canvas].active');
          if (activeCanvas) {
            // Get coordinates relative to the active canvas
            const canvasRect = activeCanvas.getBoundingClientRect();
            const layer = this.layerManager.createTextLayer(
              0, // Initial X position 
              0  // Initial Y position
            );
            activeCanvas.appendChild(layer); // Add to the active canvas
            const layerData = this.layerManager.addLayer(layer, 'Text');
            this.propertyManager.selectLayer(layer);
            layer.focus();
          }
        }
        this.selectTool(tool);
      });
    });
  }

  initDeleteButton() {
    this.deleteBtn.addEventListener('click', () => {
      const layers = this.layerManager.getLayers();
      const currentLayer = layers.find(l => l.element.classList.contains('selected'));
      
      if (currentLayer) {
        this.layerManager.removeLayer(currentLayer);
        this.propertyManager.deselectAllLayers();
      }
    });
  }

  snapToGrid(value) {
    // Snap to nearest 1rem (16px) increment
    return Math.round(value / this.gridSize) * this.gridSize;
  }

  shouldSnapToGrid() {
    // Always snap to grid
    return true;
  }

  selectTool(tool) {
    // Deactivate all tool buttons
    [this.rectangleBtn, this.textBtn].forEach(btn => {
      btn.classList.remove('active');
    });

    // Activate selected tool button
    this[`${tool}Btn`].classList.add('active');
    this.currentTool = tool;
    
    this.updateCursor(tool);
  }

  updateCursor(tool) {
    switch(tool) {
      case 'rectangle':
        this.canvas.style.cursor = 'default';
        break;
      case 'text':
        this.canvas.style.cursor = 'text';
        break;
    }
  }

  getCurrentTool() {
    return this.currentTool;
  }

  createRectangle(x, y, width, height) {
    const rectangle = document.createElement('div');
    rectangle.classList.add('layer');
    rectangle.dataset.id = Date.now().toString();
    rectangle.dataset.type = 'rectangle';
    
    // Register rectangle type
    this.registryManager.setLayerType(rectangle.dataset.id, 'rectangle');
    
    return rectangle;
  }
}