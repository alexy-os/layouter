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
    this.initEvents();
  }

  initEvents() {
    // Mouse events
    document.addEventListener('mousemove', (e) => this.handleMove(e));
    document.addEventListener('mouseup', (e) => this.handleEnd(e));

    // Touch events
    document.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this.handleEnd(e));
    document.addEventListener('touchcancel', (e) => this.handleEnd(e));
  }

  handleCanvasMouseDown(e) {
    this.handleStart(e);
  }

  handleCanvasTouchStart(e) {
    if (e.touches.length === 1) {
      e.preventDefault(); // Prevent scrolling
      this.handleStart(e.touches[0]);
    }
  }

  handleStart(e) {
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

  handleMove(e) {
    // Convert touch event to mouse-like event
    const event = e.touches ? e.touches[0] : e;
    if (e.touches) e.preventDefault(); // Prevent scrolling on touch

    if (this.isDragging) {
      this.handleLayerDrag(event);
    } else if (this.isResizing) {
      this.handleLayerResize(event);
    }
  }

  handleEnd(e) {
    this.isDragging = false;
    this.isResizing = false;
    this.selectedResizeHandle = null;
    if (this.currentLayer) {
      this.currentLayer.element.classList.remove('dragging');
      this.currentLayer.element.classList.remove('resizing');
    }
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
    // Use clientX/Y for mouse events and touches[0] for touch events
    this.dragStartX = e.touches ? e.touches[0].clientX : e.clientX;
    this.dragStartY = e.touches ? e.touches[0].clientY : e.clientY;
    this.dragLayerStartX = rect.width;
    this.dragLayerStartY = rect.height;
    
    layer.classList.add('resizing');
  }

  handleLayerResize(e) {
    if (!this.isResizing || !this.currentLayer) return;

    // Get current coordinates from either mouse or touch event
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const currentY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = currentX - this.dragStartX;
    const deltaY = currentY - this.dragStartY;
    
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