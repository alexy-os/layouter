export class LayerManager {
  constructor(canvas, layerList) {
    this.canvas = canvas;
    this.layerList = layerList;
    this.layers = [];
    this.currentLayer = null;
    this.initLayerSorting();

    // Remove custom width mapping, we'll use direct pixel values
    this.twSizes = {
      '0': '0px',
      'px': '1px',
      '0.5': '0.125rem',
      '1': '0.25rem',
      '2': '0.5rem',
      '4': '1rem',
      '6': '1.5rem',
      '8': '2rem'
    };
  }

  getClosestTailwindValue(value, mapping) {
    const numericValue = parseFloat(value);
    let closest = Object.entries(mapping).reduce((prev, curr) => {
      const prevDiff = Math.abs(parseFloat(prev[1]) - numericValue);
      const currDiff = Math.abs(parseFloat(curr[1]) - numericValue);
      return currDiff < prevDiff ? curr : prev;
    });
    return closest[0];
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
    // Update z-index for all layers in reverse order
    this.layers.forEach((layer, index) => {
      const zIndex = this.layers.length - index;
      layer.element.style.zIndex = zIndex;
      // Store z-index for export
      layer.element.dataset.zIndex = zIndex;
    });
  }

  createRectangleLayer(x, y, width, height, zIndex = null) {
    const layer = document.createElement('div');
    layer.classList.add('layer');
    layer.style.left = `${x}px`;
    layer.style.top = `${y}px`;
    layer.style.width = `${width}px`;
    layer.style.height = `${height}px`;
    layer.style.backgroundColor = '#3b82f6'; // Tailwind blue-500
    layer.dataset.twColor = 'blue-500'; // Store initial Tailwind color
    
    // Add resize handles for all 4 corners
    ['nw', 'ne', 'sw', 'se'].forEach(pos => {
      const handle = document.createElement('div');
      handle.classList.add('resize-handle', pos);
      handle.dataset.handle = pos;
      layer.appendChild(handle);
    });

    // Store initial values for export
    layer.dataset.twRadius = 'none';
    layer.dataset.width = width;
    layer.dataset.height = height;

    const highestZIndex = this.getHighestZIndex();
    layer.style.zIndex = zIndex !== null ? zIndex : (highestZIndex + 1);
    layer.dataset.zIndex = layer.style.zIndex;

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

    // Add resize handles for all 4 corners
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

    // Insert at the beginning of the list
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
    
    // Insert at beginning of layers array and update z-indices
    this.layers.unshift(layerData);
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