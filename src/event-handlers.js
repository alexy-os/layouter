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
    this.dragLayerStartLeft = 0;
    this.dragLayerStartTop = 0;
    this.resizeStartX = 0;
    this.resizeStartY = 0;
    this.resizeLayerStartWidth = 0;
    this.resizeLayerStartHeight = 0;
    this.resizeLayerStartLeft = 0;
    this.resizeLayerStartTop = 0;
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
      const touch = e.touches[0];
      touch.originalEvent = e; // Pass the original event
      this.handleStart(touch);
    }
  }

  handleStart(e) {
    const target = e.target;
    const currentTool = this.toolManager.getCurrentTool();

    if (target.classList.contains('resize-handle')) {
      this.startLayerResize(e, target, e.originalEvent);
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
    if (layer.dataset.type === 'text' && document.activeElement === layer) return;
    if (layer.dataset.locked === 'true') return;

    this.isDragging = true;
    this.currentLayer = this.layerManager.getLayers().find(l => l.element === layer);
    
    // Получаем активный canvas для текущего слоя
    const activeCanvas = layer.closest('[data-canvas]');
    const canvasRect = activeCanvas.getBoundingClientRect();
    
    // Используем координаты относительно активного canvas
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragLayerStartX = layer.offsetLeft;
    this.dragLayerStartY = layer.offsetTop;
    
    layer.classList.add('dragging');
  }

  handleLayerDrag(e) {
    if (!this.isDragging || !this.currentLayer) return;

    const deltaX = e.clientX - this.dragStartX;
    const deltaY = e.clientY - this.dragStartY;
    
    // Получаем активный canvas для текущего слоя
    const activeCanvas = this.currentLayer.element.closest('[data-canvas]');
    const canvasRect = activeCanvas.getBoundingClientRect();
    
    let newX = this.dragLayerStartX + deltaX;
    let newY = this.dragLayerStartY + deltaY;
    
    // Ограничиваем перемещение границами canvas
    newX = Math.max(0, Math.min(newX, canvasRect.width - this.currentLayer.element.offsetWidth));
    newY = Math.max(0, Math.min(newY, canvasRect.height - this.currentLayer.element.offsetHeight));
    
    // Снапим к сетке только по X
    newX = this.toolManager.snapToGrid(newX);
    
    this.currentLayer.element.style.left = `${newX}px`;
    this.currentLayer.element.style.top = `${newY}px`;
    
    this.propertyManager.updatePropertyInputs();
  }

  startLayerResize(e, handle, originalEvent) {
    const layer = handle.parentElement;
    
    // Don't start resize if layer is locked
    if (layer.dataset.locked === 'true') {
      return;
    }
    
    // Handle event propagation
    if (originalEvent && originalEvent.preventDefault) {
      originalEvent.preventDefault();
      originalEvent.stopPropagation();
    } else if (e.stopPropagation) {
      e.stopPropagation();
    }

    this.isResizing = true;
    this.selectedResizeHandle = handle.dataset.handle;
    this.currentLayer = this.layerManager.getLayers().find(l => l.element === layer);
    
    // Получаем активный canvas для текущего слоя
    const activeCanvas = layer.closest('[data-canvas]');
    const canvasRect = activeCanvas.getBoundingClientRect();
    
    this.resizeStartX = e.clientX;
    this.resizeStartY = e.clientY;
    
    // Сохраняем начальные размеры и позицию относительно активного canvas
    this.resizeLayerStartWidth = layer.offsetWidth;
    this.resizeLayerStartHeight = layer.offsetHeight;
    this.resizeLayerStartLeft = layer.offsetLeft;
    this.resizeLayerStartTop = layer.offsetTop;
    
    layer.classList.add('resizing');
  }

  handleLayerResize(e) {
    if (!this.isResizing || !this.currentLayer) return;

    const layer = this.currentLayer.element;
    const activeCanvas = layer.closest('[data-canvas]');
    const canvasRect = activeCanvas.getBoundingClientRect();
    
    const deltaX = e.clientX - this.resizeStartX;
    const deltaY = e.clientY - this.resizeStartY;
    
    let newWidth = this.resizeLayerStartWidth;
    let newHeight = this.resizeLayerStartHeight;
    let newLeft = this.resizeLayerStartLeft;
    let newTop = this.resizeLayerStartTop;

    // Обработка изменения размера в зависимости от выбранной точки
    switch (this.selectedResizeHandle) {
      case 'se':
        newWidth = Math.max(20, this.resizeLayerStartWidth + deltaX);
        newHeight = Math.max(20, this.resizeLayerStartHeight + deltaY);
        break;
      case 'sw':
        newWidth = Math.max(20, this.resizeLayerStartWidth - deltaX);
        newHeight = Math.max(20, this.resizeLayerStartHeight + deltaY);
        newLeft = this.resizeLayerStartLeft + deltaX;
        break;
      case 'ne':
        newWidth = Math.max(20, this.resizeLayerStartWidth + deltaX);
        newHeight = Math.max(20, this.resizeLayerStartHeight - deltaY);
        newTop = this.resizeLayerStartTop + deltaY;
        break;
      case 'nw':
        newWidth = Math.max(20, this.resizeLayerStartWidth - deltaX);
        newHeight = Math.max(20, this.resizeLayerStartHeight - deltaY);
        newLeft = this.resizeLayerStartLeft + deltaX;
        newTop = this.resizeLayerStartTop + deltaY;
        break;
    }

    // Ограничиваем размеры и позицию границами canvas
    newLeft = Math.max(0, Math.min(newLeft, canvasRect.width - newWidth));
    newTop = Math.max(0, Math.min(newTop, canvasRect.height - newHeight));
    newWidth = Math.min(newWidth, canvasRect.width - newLeft);
    newHeight = Math.min(newHeight, canvasRect.height - newTop);

    // Снапим к сетке только по X
    newLeft = this.toolManager.snapToGrid(newLeft);
    newWidth = this.toolManager.snapToGrid(newWidth);

    // Применяем новые размеры и позицию
    layer.style.width = `${newWidth}px`;
    layer.style.height = `${newHeight}px`;
    layer.style.left = `${newLeft}px`;
    layer.style.top = `${newTop}px`;

    // Обновляем значения в панели свойств
    this.propertyManager.updatePropertyInputs();
  }
}