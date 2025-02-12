export class LayerManager {
  constructor(canvas, layerList) {
    this.canvas = canvas;
    this.layerList = layerList;
    this.layers = [];
    this.currentLayer = null;
    this.initLayerSorting();
  }

  initLayerSorting() {
    this.layerList.addEventListener('dragstart', (e) => {
      if (!e.target.classList.contains('layer-item')) return;
      e.target.classList.add('dragging');
      
      // Store the index of dragged item
      const draggedIndex = Array.from(this.layerList.children).indexOf(e.target);
      e.dataTransfer.setData('text/plain', draggedIndex);
    });

    this.layerList.addEventListener('dragend', (e) => {
      if (!e.target.classList.contains('layer-item')) return;
      e.target.classList.remove('dragging');
      
      // Remove drag-over styling from all items
      Array.from(this.layerList.children).forEach(item => {
        item.classList.remove('drag-over');
      });
    });

    this.layerList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const draggingItem = this.layerList.querySelector('.dragging');
      if (!draggingItem) return;

      const targetItem = e.target.closest('.layer-item');
      if (!targetItem || targetItem === draggingItem) return;

      // Remove drag-over styling from all items
      Array.from(this.layerList.children).forEach(item => {
        item.classList.remove('drag-over');
      });
      
      targetItem.classList.add('drag-over');
    });

    this.layerList.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggingItem = this.layerList.querySelector('.dragging');
      if (!draggingItem) return;

      const targetItem = e.target.closest('.layer-item');
      if (!targetItem || targetItem === draggingItem) return;

      // Get source and target indices
      const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
      const targetIndex = Array.from(this.layerList.children).indexOf(targetItem);

      // Update layers array
      const [movedLayer] = this.layers.splice(sourceIndex, 1);
      this.layers.splice(targetIndex, 0, movedLayer);

      // Update DOM
      targetItem.classList.remove('drag-over');
      if (targetIndex > sourceIndex) {
        targetItem.after(draggingItem);
      } else {
        targetItem.before(draggingItem);
      }

      // Update z-indices to match new order
      this.updateLayerOrder();
    });
  }

  updateLayerOrder() {
    // Update z-index for all layers
    // Layers array is in reverse order (first item is top-most)
    this.layers.forEach((layer, index) => {
      const zIndex = this.layers.length - index;
      layer.element.style.zIndex = zIndex;
    });
  }

  createRectangleLayer(x, y, width, height, zIndex = null) {
    const layer = document.createElement('div');
    layer.classList.add('layer');
    layer.style.left = `${x}px`;
    layer.style.top = `${y}px`;
    layer.style.width = `${width}px`;
    layer.style.height = `${height}px`;
    layer.style.backgroundColor = '#3498db';
    
    // Add resize handles
    ['nw', 'ne', 'sw', 'se'].forEach(pos => {
      const handle = document.createElement('div');
      handle.classList.add('resize-handle', pos);
      handle.dataset.handle = pos;
      layer.appendChild(handle);
    });

    // Update z-index calculation to ensure new layers appear on top
    const highestZIndex = this.getHighestZIndex();
    layer.style.zIndex = zIndex !== null ? zIndex : (highestZIndex + 1);

    return layer;
  }

  createTextLayer(x, y, zIndex = null) {
    const layer = document.createElement('div');
    layer.classList.add('layer', 'text-layer');
    layer.contentEditable = true;
    layer.style.left = `${x}px`;
    layer.style.top = `${y}px`;
    layer.textContent = 'Double click to edit';
    layer.style.padding = '10px';
    layer.style.backgroundColor = 'transparent';

    // Add resize handles
    ['nw', 'ne', 'sw', 'se'].forEach(pos => {
      const handle = document.createElement('div');
      handle.classList.add('resize-handle', pos);
      handle.dataset.handle = pos;
      layer.appendChild(handle);
    });

    // Update z-index calculation to ensure new layers appear on top
    const highestZIndex = this.getHighestZIndex();
    layer.style.zIndex = zIndex !== null ? zIndex : (highestZIndex + 1);

    // Add text editing events
    layer.addEventListener('dblclick', () => {
      if (layer.textContent === 'Double click to edit') {
        layer.textContent = '';
      }
      layer.focus();
    });

    return layer;
  }

  getHighestZIndex() {
    // Get all existing layers in the canvas
    const existingLayers = Array.from(this.canvas.getElementsByClassName('layer'));
    
    // Calculate highest z-index
    const zIndices = existingLayers.map(layer => {
      const zIndex = window.getComputedStyle(layer).zIndex;
      return isNaN(zIndex) ? 0 : parseInt(zIndex);
    });
    
    return Math.max(0, ...zIndices);
  }

  addLayer(element, type = 'unknown') {
    const layerItem = document.createElement('li');
    layerItem.classList.add('layer-item');
    layerItem.setAttribute('draggable', 'true');
    layerItem.textContent = `${type} ${this.layers.length + 1}`;

    // Insert at the beginning of the list to match visual stacking order
    if (this.layerList.firstChild) {
      this.layerList.insertBefore(layerItem, this.layerList.firstChild);
    } else {
      this.layerList.appendChild(layerItem);
    }
    
    this.canvas.appendChild(element);

    const layerData = {
      element,
      listItem: layerItem,
      type
    };
    
    // Insert at the beginning of the layers array
    this.layers.unshift(layerData);
    
    // Update z-indices
    this.updateLayerOrder();

    return layerData;
  }

  removeLayer(layer) {
    const index = this.layers.indexOf(layer);
    if (index !== -1) {
      this.canvas.removeChild(layer.element);
      this.layerList.removeChild(layer.listItem);
      this.layers.splice(index, 1);
    }
  }

  getLayers() {
    return this.layers;
  }
}