export class ToolManager {
  constructor(
    cursorBtn, 
    grabBtn, 
    rectangleBtn, 
    textBtn, 
    deleteBtn, 
    canvas, 
    layerManager,
    propertyManager
  ) {
    this.cursorBtn = cursorBtn;
    this.grabBtn = grabBtn;
    this.rectangleBtn = rectangleBtn;
    this.textBtn = textBtn;
    this.deleteBtn = deleteBtn;
    this.canvas = canvas;
    this.layerManager = layerManager;
    this.propertyManager = propertyManager;

    this.currentTool = 'cursor';

    this.initToolButtons();
    this.initDeleteButton();
    this.initGridSystem();
  }

  initToolButtons() {
    const toolButtons = [
      {button: this.cursorBtn, tool: 'cursor'},
      {button: this.grabBtn, tool: 'grab'},
      {button: this.rectangleBtn, tool: 'rectangle'},
      {button: this.textBtn, tool: 'text'}
    ];

    toolButtons.forEach(({button, tool}) => {
      button.addEventListener('click', () => this.selectTool(tool));
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
    // Method to handle grid visibility based on selected tool
    const updateGrid = (tool) => {
      // Show grid for rectangle, grab, and cursor tools
      if (['rectangle', 'grab', 'cursor'].includes(tool)) {
        this.canvas.classList.add('show-grid');
      } else {
        this.canvas.classList.remove('show-grid');
      }
    };

    // Add grid update to tool selection
    const toolButtons = [
      {button: this.cursorBtn, tool: 'cursor'},
      {button: this.grabBtn, tool: 'grab'},
      {button: this.rectangleBtn, tool: 'rectangle'},
      {button: this.textBtn, tool: 'text'}
    ];

    toolButtons.forEach(({button, tool}) => {
      button.addEventListener('click', () => {
        this.selectTool(tool);
        updateGrid(tool);
      });
    });
  }

  snapToGrid(value) {
    // Get canvas width for column calculation
    const canvasWidth = this.canvas.clientWidth;
    const columnWidth = canvasWidth / 12;
    
    // Snap to nearest column
    return Math.round(value / columnWidth) * columnWidth;
  }

  shouldSnapToGrid() {
    // Return true if we should snap the current operation to grid
    return ['rectangle', 'grab', 'cursor'].includes(this.currentTool);
  }

  selectTool(tool) {
    // Deactivate all tool buttons
    [this.cursorBtn, this.grabBtn, this.rectangleBtn, this.textBtn].forEach(btn => {
      btn.classList.remove('active');
    });

    // Activate selected tool button
    this[`${tool}Btn`].classList.add('active');
    this.currentTool = tool;
    
    this.updateCursor(tool);
  }

  updateCursor(tool) {
    switch(tool) {
      case 'cursor':
        this.canvas.style.cursor = 'default';
        break;
      case 'grab':
        this.canvas.style.cursor = 'grab';
        break;
      case 'rectangle':
        this.canvas.style.cursor = 'crosshair';
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