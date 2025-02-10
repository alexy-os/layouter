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
    this.currentActiveColumn = null;
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

    if (currentTool === 'cursor') {
      const target = e.target;
      
      // Handle clicking on column
      if (target.dataset.type === 'column') {
        this.handleColumnSelection(target);
      } else if (target.classList.contains('resize-handle')) {
        this.startLayerResize(e, target);
      } else if (target.classList.contains('layer')) {
        this.handleCursorSelection(e);
      } else {
        this.propertyManager.deselectAllLayers();
        // Also deactivate column when clicking outside
        this.deactivateColumns();
      }
    } else if (currentTool === 'rectangle') {
      // Only allow drawing if there's an active column
      const activeColumn = this.canvas.querySelector('[data-type="column"].active');
      if (activeColumn) {
        this.startRectangleDrawing(activeColumn);
      }
    } else if (currentTool === 'grab') {
      const target = e.target;
      if (target.classList.contains('layer')) {
        this.startLayerDrag(e, target);
      }
    } else if (currentTool === 'text') {
      // Only allow adding text if there's an active column
      const activeColumn = this.canvas.querySelector('[data-type="column"].active');
      if (activeColumn) {
        this.addTextLayer(activeColumn);
      }
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

  handleColumnSelection(column) {
    // Deactivate all columns first
    this.deactivateColumns();
    
    // Activate the clicked column
    column.classList.add('active');
    this.currentActiveColumn = column;
    
    // Add visual feedback class
    column.classList.add('column-active');
  }

  deactivateColumns() {
    // Remove active state from all columns
    const columns = this.canvas.querySelectorAll('[data-type="column"]');
    columns.forEach(col => {
      col.classList.remove('active', 'column-active');
    });
    this.currentActiveColumn = null;
  }

  startRectangleDrawing(column) {
    if (!column.classList.contains('active')) return;
    
    this.isDrawing = true;
    
    const columnRect = column.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();
    
    // Constrain starting point to column boundaries
    this.startX = Math.max(this.startX, columnRect.left - canvasRect.left);
    this.startX = Math.min(this.startX, columnRect.right - canvasRect.left);
    this.startY = Math.max(this.startY, columnRect.top - canvasRect.top);
    this.startY = Math.min(this.startY, columnRect.bottom - canvasRect.top);
    
    this.tempRectangle = document.createElement('div');
    this.tempRectangle.classList.add('temp-rectangle');
    this.tempRectangle.style.position = 'absolute';
    this.tempRectangle.style.left = `${this.startX}px`;
    this.tempRectangle.style.top = `${this.startY}px`;
    
    const highestZIndex = this.layerManager.getHighestZIndex();
    this.tempRectangle.style.zIndex = highestZIndex + 1;
    
    column.appendChild(this.tempRectangle);
  }

  updateTempRectangle(e) {
    if (!this.isDrawing || !this.tempRectangle) return;
    
    const column = this.canvas.querySelector('[data-type="column"].active');
    if (!column) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const columnRect = column.getBoundingClientRect();
    
    let currentX = e.clientX - rect.left;
    let currentY = e.clientY - rect.top;
    
    // Constrain to column boundaries
    currentX = Math.max(currentX, columnRect.left - rect.left);
    currentX = Math.min(currentX, columnRect.right - rect.left);
    currentY = Math.max(currentY, columnRect.top - rect.top);
    currentY = Math.min(currentY, columnRect.bottom - rect.top);
    
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
    const column = this.canvas.querySelector('[data-type="column"].active');
    if (!column) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const columnRect = column.getBoundingClientRect();
    
    let currentX = e.clientX - rect.left;
    let currentY = e.clientY - rect.top;
    
    currentX = Math.max(currentX, columnRect.left - rect.left);
    currentX = Math.min(currentX, columnRect.right - rect.left);
    currentY = Math.max(currentY, columnRect.top - rect.top);
    currentY = Math.min(currentY, columnRect.bottom - rect.top);
    
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);
    const left = Math.min(this.startX, currentX);
    const top = Math.min(this.startY, currentY);
    
    if (width > 10 && height > 10) {
      const layer = this.layerManager.createRectangleLayer(left, top, width, height);
      column.appendChild(layer);
      const layerData = this.layerManager.addLayer(layer, 'Rectangle');
      this.propertyManager.selectLayer(layer);
    }
    
    if (this.tempRectangle) {
      this.tempRectangle.parentElement.removeChild(this.tempRectangle);
      this.tempRectangle = null;
    }
    
    this.isDrawing = false;
  }

  addTextLayer(column) {
    const layer = this.layerManager.createTextLayer(this.startX, this.startY);
    column.appendChild(layer);
    const layerData = this.layerManager.addLayer(layer, 'Text');
    this.propertyManager.selectLayer(layer);
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