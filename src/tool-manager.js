export class ToolManager {
  constructor(
    rectangleBtn, 
    textBtn, 
    deleteBtn, 
    canvas, 
    layerManager,
    propertyManager
  ) {
    this.rectangleBtn = rectangleBtn;
    this.textBtn = textBtn;
    this.deleteBtn = deleteBtn;
    this.canvas = canvas;
    this.layerManager = layerManager;
    this.propertyManager = propertyManager;

    this.currentTool = 'rectangle';
    this.gridSize = 8; // 0.5rem (8px) grid size

    this.initToolButtons();
    this.initDeleteButton();
    this.initGridSystem();
  }

  initToolButtons() {
    const toolButtons = [
      {button: this.rectangleBtn, tool: 'rectangle'},
      {button: this.textBtn, tool: 'text'}
    ];

    toolButtons.forEach(({button, tool}) => {
      button.addEventListener('click', () => {
        if (tool === 'rectangle') {
          // Create rectangle at fixed position
          const columnWidth = this.canvas.clientWidth / 12;
          const layer = this.layerManager.createRectangleLayer(
            columnWidth, // First column
            100, // Fixed Y position
            columnWidth * 3, // Width: 3 columns
            96, // Height: 24 units (tailwind h-24)
            'xl' // Border radius
          );
          const layerData = this.layerManager.addLayer(layer, 'Rectangle');
          this.propertyManager.selectLayer(layer);
        } else if (tool === 'text') {
          this.gridSize = 4;
          // Create text at fixed position
          const columnWidth = this.canvas.clientWidth / 12;
          const layer = this.layerManager.createTextLayer(
            columnWidth, // First column
            100 // Fixed Y position
          );
          const layerData = this.layerManager.addLayer(layer, 'Text');
          this.propertyManager.selectLayer(layer);
          // Focus the text element for immediate editing
          layer.focus();
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

  initGridSystem() {
    // Always show grid
    this.canvas.classList.add('show-grid');
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
}