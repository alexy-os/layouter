export class EventHandlers {
  constructor(canvas, layerManager, toolManager, propertyManager) {
    this.canvas = canvas;
    this.layerManager = layerManager;
    this.toolManager = toolManager;
    this.propertyManager = propertyManager;

    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.tempRectangle = null;
    this.isDragging = false;
    this.isResizing = false;
    this.selectedResizeHandle = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragLayerStartX = 0;
    this.dragLayerStartY = 0;
    this.initDragEvents();
  }

  initDragEvents() {
    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.handleLayerDrag(e);
      } else if (this.isResizing) {
        this.handleLayerResize(e);
      }
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.isResizing = false;
      this.selectedResizeHandle = null;
      if (this.currentLayer) {
        this.currentLayer.element.classList.remove('dragging');
      }
    });
  }

  handleCanvasMouseDown(e) {
    const target = e.target;
    const currentTool = this.toolManager.getCurrentTool();

    if (target.classList.contains('resize-handle')) {
      this.startLayerResize(e, target);
    } else if (target.classList.contains('layer')) {
      // Handle dragging and selection for both rectangle and text
      this.startLayerDrag(e, target);
      this.propertyManager.selectLayer(target);
      
      // If it's a text layer, allow editing
      if (target.dataset.type === 'text') {
        target.focus();
      }
    } else {
      this.propertyManager.deselectAllLayers();
    }
  }

  handleCanvasMouseMove(e) {
    // Only handle drag and resize operations
    if (this.isDragging) {
      this.handleLayerDrag(e);
    } else if (this.isResizing) {
      this.handleLayerResize(e);
    }
  }

  handleCanvasMouseUp(e) {
    this.isDragging = false;
    this.isResizing = false;
  }

  handleCursorSelection(e) {
    const target = e.target;
    if (target.classList.contains('layer')) {
      this.propertyManager.selectLayer(target);
    }
  }

  startRectangleDrawing() {
    this.isDrawing = true;
    
    // Create temporary rectangle for preview
    this.tempRectangle = document.createElement('div');
    this.tempRectangle.classList.add('temp-rectangle');
    this.tempRectangle.style.position = 'absolute';
    this.tempRectangle.style.left = `${this.startX}px`;
    this.tempRectangle.style.top = `${this.startY}px`;
    
    // Add styles to make temp rectangle visible during drawing
    this.tempRectangle.style.backgroundColor = '#3b82f6'; // Tailwind blue-500
    this.tempRectangle.style.opacity = '0.5';
    this.tempRectangle.style.border = '2px dashed #2563eb'; // Tailwind blue-600
    this.tempRectangle.style.pointerEvents = 'none'; // Prevent interfering with mouse events
    
    // Set z-index higher than any existing layer
    const highestZIndex = this.layerManager.getHighestZIndex();
    this.tempRectangle.style.zIndex = highestZIndex + 1;
    
    this.canvas.appendChild(this.tempRectangle);
  }

  updateTempRectangle(e) {
    if (!this.isDrawing || !this.tempRectangle) return;

    const rect = this.canvas.getBoundingClientRect();
    let currentX = e.clientX - rect.left;
    let currentY = e.clientY - rect.top;
    
    // Snap to grid if rectangle tool is active
    if (this.toolManager.getCurrentTool() === 'rectangle') {
      currentX = this.toolManager.snapToGrid(currentX);
      this.startX = this.toolManager.snapToGrid(this.startX);
    }
    
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);
    const left = Math.min(this.startX, currentX);
    const top = Math.min(this.startY, currentY);
    
    // Update temp rectangle dimensions
    this.tempRectangle.style.width = `${width}px`;
    this.tempRectangle.style.height = `${height}px`;
    this.tempRectangle.style.left = `${left}px`;
    this.tempRectangle.style.top = `${top}px`;
  }

  finishRectangleDrawing(e) {
    const rect = this.canvas.getBoundingClientRect();
    let currentX = e.clientX - rect.left;
    let currentY = e.clientY - rect.top;
    
    // Snap to grid if rectangle tool is active
    if (this.toolManager.getCurrentTool() === 'rectangle') {
      currentX = this.toolManager.snapToGrid(currentX);
      this.startX = this.toolManager.snapToGrid(this.startX);
    }
    
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);
    const left = Math.min(this.startX, currentX);
    const top = Math.min(this.startY, currentY);
    
    if (width > 10 && height > 10) {  // Only create if size is meaningful
      const layer = this.layerManager.createRectangleLayer(left, top, width, height);
      const layerData = this.layerManager.addLayer(layer, 'Rectangle');
      this.propertyManager.selectLayer(layer);
    }
    
    if (this.tempRectangle) {
      this.canvas.removeChild(this.tempRectangle);
      this.tempRectangle = null;
    }
    
    this.isDrawing = false;
  }

  addTextLayer() {
    const layer = this.layerManager.createTextLayer(this.startX, this.startY);
    const layerData = this.layerManager.addLayer(layer, 'Text');
    this.propertyManager.selectLayer(layer);
  }

  startLayerDrag(e, layer) {
    // Don't start drag if we're editing text
    if (layer.dataset.type === 'text' && document.activeElement === layer) {
      return;
    }

    this.isDragging = true;
    this.currentLayer = this.layerManager.getLayers().find(l => l.element === layer);
    
    const rect = layer.getBoundingClientRect();
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragLayerStartX = rect.left - this.canvas.getBoundingClientRect().left;
    this.dragLayerStartY = rect.top - this.canvas.getBoundingClientRect().top;
    
    layer.classList.add('dragging');
  }

  handleLayerDrag(e) {
    if (!this.isDragging || !this.currentLayer) return;

    const deltaX = e.clientX - this.dragStartX;
    const deltaY = e.clientY - this.dragStartY;
    
    let newX = this.dragLayerStartX + deltaX;
    let newY = this.dragLayerStartY + deltaY;
    
    // Always snap to grid
    newX = this.toolManager.snapToGrid(newX);
    
    this.currentLayer.element.style.left = `${newX}px`;
    this.currentLayer.element.style.top = `${newY}px`;
    
    this.propertyManager.updatePropertyInputs();
  }

  startLayerResize(e, handle) {
    e.stopPropagation();
    this.isResizing = true;
    this.selectedResizeHandle = handle.dataset.handle;
    const layer = handle.parentElement;
    this.currentLayer = this.layerManager.getLayers().find(l => l.element === layer);
    
    const rect = layer.getBoundingClientRect();
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragLayerStartX = rect.width;
    this.dragLayerStartY = rect.height;
    
    layer.classList.add('resizing');
  }

  handleLayerResize(e) {
    if (!this.isResizing || !this.currentLayer) return;

    const deltaX = e.clientX - this.dragStartX;
    const deltaY = e.clientY - this.dragStartY;
    
    const rect = this.currentLayer.element.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();
    
    let newWidth = this.dragLayerStartX;
    let newHeight = this.dragLayerStartY;
    let currentLeft = rect.left - canvasRect.left;
    let currentTop = rect.top - canvasRect.top;
    
    switch(this.selectedResizeHandle) {
      case 'se':
        newWidth = this.dragLayerStartX + deltaX;
        newHeight = this.dragLayerStartY + deltaY;
        break;
      case 'sw':
        newWidth = this.dragLayerStartX - deltaX;
        currentLeft = this.dragStartX - canvasRect.left + deltaX;
        newHeight = this.dragLayerStartY + deltaY;
        break;
      case 'ne':
        newWidth = this.dragLayerStartX + deltaX;
        newHeight = this.dragLayerStartY - deltaY;
        currentTop = this.dragStartY - canvasRect.top + deltaY;
        break;
      case 'nw':
        newWidth = this.dragLayerStartX - deltaX;
        newHeight = this.dragLayerStartY - deltaY;
        currentLeft = this.dragStartX - canvasRect.left + deltaX;
        currentTop = this.dragStartY - canvasRect.top + deltaY;
        break;
    }
    
    // Ensure minimum size based on layer type
    const minWidth = this.currentLayer.element.dataset.type === 'text' ? 100 : 20;
    const minHeight = this.currentLayer.element.dataset.type === 'text' ? 48 : 20;
    newWidth = Math.max(minWidth, newWidth);
    newHeight = Math.max(minHeight, newHeight);
    
    // Snap width to grid
    newWidth = this.toolManager.snapToGrid(newWidth);
    
    this.currentLayer.element.style.width = `${newWidth}px`;
    this.currentLayer.element.style.height = `${newHeight}px`;
    this.currentLayer.element.style.left = `${currentLeft}px`;
    this.currentLayer.element.style.top = `${currentTop}px`;
    
    this.propertyManager.updatePropertyInputs();
  }
}