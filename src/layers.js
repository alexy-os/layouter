export class LayerManager {
  constructor(canvas, layerList, registryManager) {
    this.canvas = canvas;
    this.layerList = layerList;
    this.layers = [];
    this.currentLayer = null;
    this.registryManager = registryManager;
    this.propertyManager = null; // Will be set after initialization
    this.initLayerSorting();
    this.nextId = 1;

    // Add container dimensions
    this.CONTAINER_WIDTH = 896;
    this.CONTAINER_HEIGHT = 548;

    // Add visual boundary for the working area
    const boundary = document.createElement('div');
    boundary.classList.add('absolute', 'inset-0', 'pointer-events-none', 'border-b-2', 'border-dashed', 'border-gray-300', 'dark:border-gray-700');
    boundary.style.height = '548px';
    this.canvas.appendChild(boundary);

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
    // Mouse drag events
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

    // Touch events for sorting
    let touchStartY = 0;
    let touchedItem = null;
    let touchStartIndex = -1;
    let placeholder = null;

    this.layerList.addEventListener('touchstart', (e) => {
      const item = e.target.closest('.layer-item');
      if (!item) return;

      touchStartY = e.touches[0].clientY;
      touchedItem = item;
      touchStartIndex = Array.from(this.layerList.children).indexOf(item);
      
      // Create placeholder
      placeholder = item.cloneNode(true);
      placeholder.classList.add('placeholder');
      placeholder.style.opacity = '0.5';
      
      // Style touched item
      item.classList.add('dragging');
      item.style.position = 'fixed';
      item.style.zIndex = '1000';
      item.style.width = `${item.offsetWidth}px`;
      item.style.left = `${item.offsetLeft}px`;
      item.style.top = `${e.touches[0].clientY - item.offsetHeight / 2}px`;
    });

    this.layerList.addEventListener('touchmove', (e) => {
      if (!touchedItem) return;
      e.preventDefault();

      const currentY = e.touches[0].clientY;
      touchedItem.style.top = `${currentY - touchedItem.offsetHeight / 2}px`;

      // Find the item we're hovering over
      const hoverItem = Array.from(this.layerList.children)
        .find(child => {
          if (child === touchedItem || child === placeholder) return false;
          const rect = child.getBoundingClientRect();
          return currentY >= rect.top && currentY <= rect.bottom;
        });

      if (hoverItem) {
        const hoverIndex = Array.from(this.layerList.children).indexOf(hoverItem);
        if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
        
        if (hoverIndex > touchStartIndex) {
          hoverItem.after(placeholder);
        } else {
          hoverItem.before(placeholder);
        }
      }
    });

    this.layerList.addEventListener('touchend', () => {
      if (!touchedItem || !placeholder) return;

      // Get final position
      const finalIndex = Array.from(this.layerList.children).indexOf(placeholder);
      
      // Update layers array
      if (finalIndex !== -1 && finalIndex !== touchStartIndex) {
        const [movedLayer] = this.layers.splice(touchStartIndex, 1);
        this.layers.splice(finalIndex, 0, movedLayer);
      }

      // Reset touched item style
      touchedItem.style.position = '';
      touchedItem.style.zIndex = '';
      touchedItem.style.width = '';
      touchedItem.style.left = '';
      touchedItem.style.top = '';
      touchedItem.classList.remove('dragging');

      // Replace placeholder with touched item
      if (placeholder.parentNode) {
        placeholder.parentNode.replaceChild(touchedItem, placeholder);
      }

      // Update z-indices
      this.updateLayerOrder();

      // Reset variables
      touchStartY = 0;
      touchedItem = null;
      touchStartIndex = -1;
      placeholder = null;
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

  createRectangleLayer(x, y, width, height, borderRadius = 'none') {
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
    layer.classList.add('bg-blue-600');
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
      //'text-gray-800',
      'text-base',
      'focus:outline-none',
      //'dark:text-gray-200'
    );
    
    layer.textContent = 'The Title';
    
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
    
    // Create container for layer controls
    const controlsContainer = document.createElement('div');
    controlsContainer.classList.add('flex', 'items-center', 'gap-2', 'w-full');
    
    // Add drag handle
    const dragHandle = document.createElement('div');
    dragHandle.classList.add('drag-handle', 'text-ui-gray');
    dragHandle.innerHTML = `
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 8h16M4 16h16"></path>
      </svg>
    `;
    
    // Add layer name
    const layerName = document.createElement('span');
    layerName.classList.add('flex-grow');
    layerName.textContent = `${name} ${layer.dataset.id}`;
    
    // Add lock button
    const lockButton = document.createElement('button');
    lockButton.classList.add('lock-button', 'text-ui-gray', 'hover:text-gray-600', 'dark:hover:text-gray-300');
    lockButton.innerHTML = `
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    // Add click handler for lock button
    lockButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isLocked = layer.dataset.locked === 'true';
      layer.dataset.locked = (!isLocked).toString();
      
      // Update button appearance
      if (!isLocked) {
        lockButton.classList.add('text-blue-500');
        lockButton.classList.remove('text-ui-gray');
      } else {
        lockButton.classList.remove('text-blue-500');
        lockButton.classList.add('text-ui-gray');
      }
    });

    // Add click handler for list item
    listItem.addEventListener('click', () => {
      // Deselect all layers in sidebar
      this.layers.forEach(l => {
        l.listItem.classList.remove('active');
        l.element.classList.remove('selected');
      });
      
      // Select clicked layer
      listItem.classList.add('active');
      layer.classList.add('selected');
      
      // Update property manager
      if (this.propertyManager) {
        this.propertyManager.selectLayer(layer);
      }
    });

    // Add click handler for canvas element
    layer.addEventListener('click', (e) => {
      if (e.target === layer || e.target.parentElement === layer) {
        // Deselect all layers
        this.layers.forEach(l => {
          l.listItem.classList.remove('active');
          l.element.classList.remove('selected');
        });
        
        // Select clicked layer
        listItem.classList.add('active');
        layer.classList.add('selected');
        
        // Update property manager
        if (this.propertyManager) {
          this.propertyManager.selectLayer(layer);
        }
      }
    });
    
    // Assemble controls
    controlsContainer.appendChild(dragHandle);
    controlsContainer.appendChild(layerName);
    controlsContainer.appendChild(lockButton);
    listItem.appendChild(controlsContainer);
    
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

    // Register layer with empty type
    if (this.registryManager) {
      this.registryManager.setLayerType(layer.dataset.id, '');
    }
    
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

  constrainPosition(x, y, width, height) {
    // Constrain to container bounds with 16:9 ratio
    const maxX = this.CONTAINER_WIDTH - width;
    const maxY = this.CONTAINER_HEIGHT - height;
    
    return {
      x: Math.max(0, Math.min(Math.round(x), maxX)),
      y: Math.max(0, Math.min(Math.round(y), maxY))
    };
  }
}