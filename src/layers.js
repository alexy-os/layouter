export class LayerManager {
  constructor(canvas, layerList) {
    this.canvas = canvas;
    this.layerList = layerList;
    this.layers = [];
    this.currentLayer = null;
    this.initLayerSorting();
    this.nextId = 1;

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
      layer.element.dataset.zIndex = zIndex;
    });
  }

  createRectangleLayer(x, y, width, height, borderRadius = 'xl') {
    const layer = document.createElement('div');
    layer.classList.add('layer');
    layer.dataset.type = 'rectangle';
    layer.dataset.id = this.nextId++;
    
    // Set initial position and size
    layer.style.left = `${x}px`;
    layer.style.top = `${y}px`;
    layer.style.width = `${width}px`;
    layer.style.height = `${height}px`;
    
    // Add default styling
    layer.classList.add('bg-blue-500');
    layer.classList.add(`rounded-${borderRadius}`);
    
    // Add resize handles by default
    this.addResizeHandles(layer);
    
    return layer;
  }

  createTextLayer(x, y) {
    const layer = document.createElement('div');
    layer.classList.add('layer');
    layer.dataset.type = 'text';
    layer.dataset.id = this.nextId++;
    
    layer.style.left = `${x}px`;
    layer.style.top = `${y}px`;
    layer.style.minWidth = '200px';
    layer.style.minHeight = '48px';
    layer.style.width = `${this.canvas.clientWidth / 12 * 3}px`;
    
    layer.contentEditable = true;
    layer.classList.add(
      'text-gray-800',
      'text-base',
      'focus:outline-none',
      'dark:text-gray-200'
    );
    
    layer.textContent = 'Введите текст';
    
    // Add resize handles
    this.addResizeHandles(layer);
    
    return layer;
  }

  addResizeHandles(layer) {
    const handles = ['nw', 'ne', 'sw', 'se'];
    handles.forEach(position => {
      const handle = document.createElement('div');
      handle.classList.add('resize-handle', position);
      handle.dataset.handle = position;
      layer.appendChild(handle);
    });
  }

  addLayer(layer, name) {
    // Add layer to canvas
    this.canvas.appendChild(layer);
    
    // Create layer list item
    const listItem = document.createElement('li');
    listItem.classList.add('layer-item');
    listItem.dataset.id = layer.dataset.id;
    listItem.setAttribute('draggable', 'true');
    
    const layerName = document.createElement('span');
    layerName.textContent = `${name} ${layer.dataset.id}`;
    
    // Add drag handle
    const dragHandle = document.createElement('div');
    dragHandle.classList.add('drag-handle', 'mr-2', 'text-ui-gray');
    dragHandle.innerHTML = `
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 8h16M4 16h16"></path>
      </svg>
    `;
    
    listItem.appendChild(dragHandle);
    listItem.appendChild(layerName);
    
    // Insert at the beginning for proper z-index ordering
    if (this.layerList.firstChild) {
      this.layerList.insertBefore(listItem, this.layerList.firstChild);
    } else {
      this.layerList.appendChild(listItem);
    }
    
    // Store layer data
    const layerData = {
      element: layer,
      listItem: listItem
    };
    
    // Insert at beginning of layers array and update z-indices
    this.layers.unshift(layerData);
    this.updateLayerOrder();
    
    return layerData;
  }

  removeLayer(layerData) {
    // Remove from DOM
    this.canvas.removeChild(layerData.element);
    this.layerList.removeChild(layerData.listItem);
    
    // Remove from layers array
    const index = this.layers.indexOf(layerData);
    if (index > -1) {
      this.layers.splice(index, 1);
    }
  }

  getLayers() {
    return this.layers;
  }

  getHighestZIndex() {
    let maxZ = 0;
    this.layers.forEach(layer => {
      const z = parseInt(layer.element.style.zIndex || 0);
      maxZ = Math.max(maxZ, z);
    });
    return maxZ;
  }
}