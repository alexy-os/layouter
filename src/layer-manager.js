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
    this.CONTAINER_WIDTH = 1024;
    this.CONTAINER_HEIGHT = this.calculateContainerHeight();

    // Add visual boundary for the working area
    const boundary = document.createElement('div');
    boundary.classList.add('absolute', 'inset-0', 'pointer-events-none', 'border-b-2', 'border-dashed', 'border-gray-300', 'dark:border-gray-700');
    boundary.style.height = '548px';
    this.canvas.appendChild(boundary);

    // Add recommended height label
    const heightLabel = document.createElement('div');
    heightLabel.classList.add('absolute', 'text-xs', 'text-gray-500', 'pointer-events-none');
    heightLabel.style.right = '8px';
    heightLabel.style.top = '556px';
    heightLabel.textContent = 'Recommended height';
    this.canvas.appendChild(heightLabel);

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

    // Add tracking of the active canvas
    this.activeCanvas = null;
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
    const rectangle = document.createElement('div');
    rectangle.classList.add('layer', 'bg-blue-500');
    rectangle.dataset.type = 'rectangle';
    rectangle.dataset.id = Date.now().toString();
    
    rectangle.style.position = 'absolute';
    rectangle.style.left = `${x}px`;
    rectangle.style.top = `${y}px`;
    rectangle.style.width = `${width}px`;
    rectangle.style.height = `${height}px`;
    
    if (borderRadius !== 'none') {
      rectangle.classList.add(`rounded-${borderRadius}`);
    }
    
    this.addResizeHandles(rectangle);
    return rectangle;
  }

  createTextLayer(x, y) {
    const text = document.createElement('div');
    text.classList.add('layer');
    text.dataset.type = 'text';
    text.dataset.id = Date.now().toString();
    
    text.style.position = 'absolute';
    text.style.left = `${x}px`;
    text.style.top = `${y}px`;
    text.style.minWidth = '100px';
    text.style.minHeight = '48px';
    
    // Add basic text classes
    text.classList.add('text-left', 'text-base');
    
    const content = document.createElement('div');
    content.contentEditable = true;
    content.className = 'outline-none';
    content.innerHTML = '<div>Enter text</div>';
    
    text.appendChild(content);
    this.addResizeHandles(text);
    return text;
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
    if (!this.activeCanvas) {
      console.error('No active canvas selected');
      return null;
    }

    // Add layer to the active canvas
    this.activeCanvas.appendChild(layer);
    
    const layerData = {
      element: layer,
      name: name || `Layer ${this.layers.length + 1}`
    };
    
    this.layers.push(layerData);
    
    if (this.layerList) {
      this.updateLayerList();
    }
    
    return layerData;
  }

  removeLayer(layerData) {
    const layer = this.layers.find(l => l.element.dataset.id === layerData.element.dataset.id);
    if (!layer) return;

    // Find the canvas containing this layer
    const canvas = layer.element.closest('[data-canvas]') || this.canvas;
    if (canvas && layer.element.parentNode === canvas) {
      canvas.removeChild(layer.element);
    }
    
    // Remove from layers array
    const index = this.layers.indexOf(layer);
    if (index > -1) {
      this.layers.splice(index, 1);
    }

    // Update layer list
    this.updateLayerList();
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

  clearLayers() {
    // Clear all layers from all canvases
    const canvasElements = this.canvas.querySelectorAll('[data-canvas]');
    canvasElements.forEach(canvasElement => {
      const layers = canvasElement.querySelectorAll('.layer');
      layers.forEach(layer => layer.remove());
    });
    
    // Clear the layer list
    while (this.layerList.firstChild) {
      this.layerList.firstChild.remove();
    }
    
    this.layers = [];
    this.nextId = 1;
  }

  calculateContainerHeight() {
    // Using 16:9 aspect ratio
    const aspectRatio = 3 / 2;
    return Math.round(this.CONTAINER_WIDTH / aspectRatio);
  }

  // Add new methods for working with canvases
  setActiveCanvas(canvasElement) {
    this.activeCanvas = canvasElement;
  }

  isWithinActiveCanvas(x, y) {
    if (!this.activeCanvas) return false;
    
    const rect = this.activeCanvas.getBoundingClientRect();
    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
  }

  // Add new method
  clearAllLayers() {
    // Clear all layers from all canvases
    const canvases = this.canvas.querySelectorAll('[data-canvas]');
    canvases.forEach(canvas => {
      const layers = canvas.querySelectorAll('.layer');
      layers.forEach(layer => {
        layer.remove();
      });
    });
    
    // Clear the layer list
    if (this.layerList) {
      this.layerList.innerHTML = '';
    }
    
    this.layers = [];
  }

  // Add method updateLayerList
  updateLayerList() {
    // Clear existing list
    this.layerList.innerHTML = '';
    
    // Add layers in reverse order (top to bottom)
    [...this.layers].reverse().forEach(layer => {
      const listItem = document.createElement('li');
      listItem.classList.add('layer-item');
      listItem.draggable = true;
      
      // Get layer name or type
      const layerName = layer.element.dataset.name || `${layer.element.dataset.type} ${layer.element.dataset.id}`;
      listItem.textContent = layerName;
      
      // Add active class if this is the current layer
      if (this.currentLayer && layer.element.dataset.id === this.currentLayer.element.dataset.id) {
        listItem.classList.add('active');
      }
      
      // Add click handler
      listItem.addEventListener('click', () => this.selectLayer(layer));
      
      // Store reference to list item
      layer.listItem = listItem;
      
      this.layerList.appendChild(listItem);
    });
  }

  // Add helper method for updating layer selection
  updateLayerSelection() {
    if (!this.layerList) return;

    // Remove active class from all items
    const items = this.layerList.querySelectorAll('.layer-item');
    items.forEach(item => item.classList.remove('active'));

    // If there is a selected layer, find the corresponding list item and add the active class
    if (this.selectedLayer) {
      const index = this.layers.findIndex(layer => layer.element === this.selectedLayer);
      if (index !== -1) {
        const item = this.layerList.querySelector(`[data-index="${index}"]`);
        if (item) {
          item.classList.add('active');
        }
      }
    }
  }

  // Update method selectLayer
  selectLayer(layer) {
    if (this.currentLayer) {
      this.currentLayer.element.classList.remove('selected');
      if (this.currentLayer.listItem) {
        this.currentLayer.listItem.classList.remove('active');
      }
    }

    this.currentLayer = layer;
    
    if (layer) {
      layer.element.classList.add('selected');
      if (layer.listItem) {
        layer.listItem.classList.add('active');
      }
      
      // Update properties if property manager exists
      if (this.propertyManager && typeof this.propertyManager.updateProperties === 'function') {
        this.propertyManager.updateProperties(layer.element);
      }
    }
  }
}