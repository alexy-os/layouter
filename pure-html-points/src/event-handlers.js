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
    this.activeLayoutContainer = null;
    this.initDragEvents();
  }

  initDragEvents() {
    document.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.toolManager.getCurrentTool() === 'grab') {
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
    const rect = this.canvas.getBoundingClientRect();
    this.startX = e.clientX - rect.left;
    this.startY = e.clientY - rect.top;
    
    const currentTool = this.toolManager.getCurrentTool();

    if (currentTool === 'grab') {
      const target = e.target;
      if (target.classList.contains('layer')) {
        this.startLayerDrag(e, target);
      }
    } else if (currentTool === 'cursor') {
      const target = e.target;
      if (target.classList.contains('resize-handle')) {
        this.startLayerResize(e, target);
      } else if (target.classList.contains('layer')) {
        this.handleCursorSelection(e);
      } else {
        this.propertyManager.deselectAllLayers();
      }
    } else if (currentTool === 'rectangle') {
      const layout = this.findActiveLayoutContainer(e.target);
      if (layout) {
        this.startRectangleDrawing(layout);
      }
    } else if (currentTool === 'text') {
      this.addTextLayer();
    }
  }

  handleCanvasMouseMove(e) {
    const currentTool = this.toolManager.getCurrentTool();
    
    if (currentTool === 'rectangle' && this.isDrawing) {
      this.updateTempRectangle(e);
    }
  }

  handleCanvasMouseUp(e) {
    const currentTool = this.toolManager.getCurrentTool();
    
    if (currentTool === 'rectangle' && this.isDrawing) {
      this.finishRectangleDrawing(e);
    }
  }

  handleCursorSelection(e) {
    const target = e.target;
    if (target.classList.contains('layer')) {
      this.propertyManager.selectLayer(target);
    }
  }

  startRectangleDrawing(layoutContainer) {
    this.isDrawing = true;
    this.activeLayoutContainer = layoutContainer;
    
    const layoutRect = layoutContainer.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();
    
    this.startX = Math.max(this.startX, layoutRect.left - canvasRect.left);
    this.startX = Math.min(this.startX, layoutRect.right - canvasRect.left);
    this.startY = Math.max(this.startY, layoutRect.top - canvasRect.top);
    this.startY = Math.min(this.startY, layoutRect.bottom - canvasRect.top);
    
    this.tempRectangle = document.createElement('div');
    this.tempRectangle.classList.add('temp-rectangle');
    this.tempRectangle.style.position = 'absolute';
    this.tempRectangle.style.left = `${this.startX}px`;
    this.tempRectangle.style.top = `${this.startY}px`;
    this.tempRectangle.style.backgroundColor = '#3b82f6';
    this.tempRectangle.style.opacity = '0.5';
    this.tempRectangle.style.border = '2px dashed #2563eb';
    this.tempRectangle.style.pointerEvents = 'none';
    const highestZIndex = this.layerManager.getHighestZIndex();
    this.tempRectangle.style.zIndex = highestZIndex + 1;
    this.canvas.appendChild(this.tempRectangle);
  }

  updateTempRectangle(e) {
    if (!this.isDrawing || !this.tempRectangle || !this.activeLayoutContainer) return;

    const rect = this.canvas.getBoundingClientRect();
    const layoutRect = this.activeLayoutContainer.getBoundingClientRect();
    
    let currentX = e.clientX - rect.left;
    let currentY = e.clientY - rect.top;
    
    currentX = Math.max(currentX, layoutRect.left - rect.left);
    currentX = Math.min(currentX, layoutRect.right - rect.left);
    currentY = Math.max(currentY, layoutRect.top - rect.top);
    currentY = Math.min(currentY, layoutRect.bottom - rect.top);
    
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);
    const left = Math.min(this.startX, currentX);
    const top = Math.min(this.startY, currentY);
    
    this.tempRectangle.style.width = `${width}px`;
    this.tempRectangle.style.height = `${height}px`;
    this.tempRectangle.style.left = `${left}px`;
    this.tempRectangle.style.top = `${top}px`;
  }

  finishRectangleDrawing(e) {
    const rect = this.canvas.getBoundingClientRect();
    let currentX = e.clientX - rect.left;
    let currentY = e.clientY - rect.top;
    
    const layoutRect = this.activeLayoutContainer.getBoundingClientRect();
    
    currentX = Math.max(currentX, layoutRect.left - rect.left);
    currentX = Math.min(currentX, layoutRect.right - rect.left);
    currentY = Math.max(currentY, layoutRect.top - rect.top);
    currentY = Math.min(currentY, layoutRect.bottom - rect.top);
    
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);
    const left = Math.min(this.startX, currentX);
    const top = Math.min(this.startY, currentY);
    
    if (width > 10 && height > 10) {  
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

  findActiveLayoutContainer(target) {
    let current = target;
    while (current && !current.classList.contains('grid')) {
      current = current.parentElement;
    }
    return current;
  }

  startLayerDrag(e, layer) {
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
    
    if (this.toolManager.shouldSnapToGrid()) {
      newX = this.toolManager.snapToGrid(newX);
    }
    
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

    const minSize = 20;
    newWidth = Math.max(minSize, newWidth);
    newHeight = Math.max(minSize, newHeight);

    if (this.toolManager.shouldSnapToGrid()) {
      newWidth = this.toolManager.snapToGrid(newWidth);
      if (['sw', 'nw'].includes(this.selectedResizeHandle)) {
        currentLeft = this.toolManager.snapToGrid(currentLeft);
      }
    }

    this.currentLayer.element.style.width = `${newWidth}px`;
    this.currentLayer.element.style.height = `${newHeight}px`;
    this.currentLayer.element.style.left = `${currentLeft}px`;
    this.currentLayer.element.style.top = `${currentTop}px`;

    this.propertyManager.updatePropertyInputs();
  }
}