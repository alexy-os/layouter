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
    layer.style.position = 'absolute'; // Ensure absolute positioning
    layer.style.left = `${x}px`;
    layer.style.top = `${y}px`;
    layer.style.width = `${width}px`;
    layer.style.height = `${height}px`;
    layer.style.backgroundColor = '#3b82f6'; // Tailwind blue-500
    layer.dataset.twColor = 'blue-500'; // Store initial Tailwind color
    
    // Add resize handles
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

    // Only set z-index if passed
    if (zIndex !== null) {
      layer.style.zIndex = zIndex;
      layer.dataset.zIndex = zIndex;
    }

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

  createSectionLayer(templateName = 'blank') {
    const template = this.templates[templateName];
    if (!template) return null;

    // Create section
    const section = document.createElement('section');
    section.classList.add(
      'layer', 
      'section-layer', 
      'w-full',
      'section-highlight'
    );
    section.classList.add(...template.className.split(' '));
    section.dataset.type = 'section';
    
    // Create container
    const container = document.createElement('div');
    container.classList.add(
      'container-highlight',
      ...template.structure.container.className.split(' ')
    );
    container.dataset.type = 'container';
    
    // Create grid with minimum height
    const grid = document.createElement('div');
    grid.classList.add(
      'layout-highlight',
      'min-h-[50vh]', // Add minimum height
      ...template.structure.container.content.grid.className.split(' ')
    );
    grid.dataset.type = 'grid';
    
    // Add columns if specified
    if (template.structure.container.content.grid.columns) {
      template.structure.container.content.grid.columns.forEach(column => {
        const div = document.createElement('div');
        div.classList.add(
          'min-h-[50vh]', // Add minimum height to columns as well
          ...column.className.split(' ')
        );
        div.dataset.type = 'column';
        grid.appendChild(div);
      });
    }
    
    container.appendChild(grid);
    section.appendChild(container);
    
    return section;
  }

  updateSectionLayout(section, layout) {
    const grid = section.querySelector('.grid');
    
    // Remove existing column classes
    grid.classList.remove('grid-cols-1', 'grid-cols-2', 'grid-cols-3');
    
    // Apply new layout
    switch(layout) {
      case 'double':
        grid.classList.add('grid-cols-2');
        break;
      case 'triple':
        grid.classList.add('grid-cols-3');
        break;
      default:
        grid.classList.add('grid-cols-1');
    }
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

  createNestedLayerItem(type) {
    const item = document.createElement('li');
    item.classList.add('layer-item', 'nested-layer');
    
    // Use flex container for proper spacing and alignment
    const container = document.createElement('div');
    container.classList.add(
      'flex', 'items-center', 'justify-between',
      'w-full', 'gap-2', 'px-4', 'py-2',
      'group', // Add group for hover effects
      type === 'container' ? 'ml-4' : type === 'grid' ? 'ml-8' : '' // Indentation based on type
    );
    
    const leftSide = document.createElement('div');
    leftSide.classList.add('flex', 'items-center', 'gap-2');
    
    const icon = this.getLayerIcon(type);
    leftSide.appendChild(icon);
    
    const text = document.createElement('span');
    text.textContent = this.getLayerLabel(type);
    leftSide.appendChild(text);
    
    container.appendChild(leftSide);

    // Add edit button
    const editButton = document.createElement('button');
    editButton.classList.add(
      'edit-btn', 
      'p-1', 
      'rounded-md', 
      'hover:bg-gray-100', 
      'dark:hover:bg-gray-700'
    );
    editButton.innerHTML = `
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 012 2h14a2 2 0 012-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    `;
    
    // Add edit button click handler with stopPropagation
    editButton.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Find parent section element
      const sectionElement = item.closest('.section-content')?.parentElement;
      if (!sectionElement) return;
      
      // Find corresponding DOM element based on type
      let targetElement;
      if (type === 'container') {
        targetElement = this.layers.find(l => l.listItem === sectionElement)
          ?.element.querySelector('.container');
      } else if (type === 'grid') {
        targetElement = this.layers.find(l => l.listItem === sectionElement)
          ?.element.querySelector('.grid');
      }

      if (targetElement) {
        // Dispatch event with correct element and type
        const event = new CustomEvent('editLayer', {
          detail: { element: targetElement, type }
        });
        document.dispatchEvent(event);
      }
    });
    
    container.appendChild(editButton);
    item.appendChild(container);
    
    return item;
  }

  // Helper methods to find container and grid elements
  getContainerElement(listItem) {
    const sectionItem = listItem.closest('.layer-item');
    if (sectionItem) {
      const section = this.layers.find(l => l.listItem === sectionItem)?.element;
      return section?.querySelector('.container');
    }
    return null;
  }

  getGridElement(listItem) {
    const sectionItem = listItem.closest('.layer-item');
    if (sectionItem) {
      const section = this.layers.find(l => l.listItem === sectionItem)?.element;
      return section?.querySelector('.grid');
    }
    return null;
  }

  addLayer(element, type = 'unknown', parentColumn = null) {
    const layerItem = document.createElement('li');
    layerItem.classList.add('layer-item', 'draggable');
    layerItem.draggable = true;

    // Create the layer container with proper indentation and styling
    const layerContainer = document.createElement('div');
    layerContainer.classList.add(
      'flex', 'items-center', 'justify-between',
      'gap-2', 'px-4', 'py-2', 'group'
    );
    
    // Add proper indentation based on layer type and parent
    if (type === 'container') {
      layerContainer.classList.add('ml-4');
    } else if (type === 'grid') {
      layerContainer.classList.add('ml-8');
    } else if (parentColumn) {
      layerContainer.classList.add('ml-16');
    } else if (type !== 'section') {
      layerContainer.classList.add('ml-12');
    }

    // Create left side with icon and label
    const leftSide = document.createElement('div');
    leftSide.classList.add('flex', 'items-center', 'gap-2');
    
    const icon = this.getLayerIcon(type);
    leftSide.appendChild(icon);
    
    const label = document.createElement('span');
    label.textContent = this.getLayerLabel(type);
    leftSide.appendChild(label);
    
    layerContainer.appendChild(leftSide);

    // Add edit button
    const editButton = document.createElement('button');
    editButton.classList.add(
      'edit-btn',
      'opacity-0',
      'group-hover:opacity-100',
      'p-1',
      'rounded-md',
      'hover:bg-gray-100',
      'dark:hover:bg-gray-700'
    );
    editButton.innerHTML = `
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 012 2h14a2 2 0 012-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    `;
    
    editButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const event = new CustomEvent('editLayer', { 
        detail: { element, type }
      });
      document.dispatchEvent(event);
    });
    
    layerContainer.appendChild(editButton);
    layerItem.appendChild(layerContainer);

    // Add element to DOM - специальная обработка для секций
    if (type === 'section') {
      this.canvas.appendChild(element);
    } else if (parentColumn) {
      parentColumn.appendChild(element);
    } else {
      this.canvas.appendChild(element);
    }
    
    // Add to parent column's list if specified, but not for sections
    if (parentColumn && type !== 'section') {
      const columnListItem = this.layers.find(l => l.element === parentColumn)?.listItem;
      if (columnListItem) {
        let columnContent = columnListItem.querySelector('.column-content');
        if (!columnContent) {
          columnContent = document.createElement('ul');
          columnContent.classList.add('column-content', 'pl-4');
          columnListItem.appendChild(columnContent);
        }
        columnContent.appendChild(layerItem);
      }
    } else {
      // Add to main layer list
      if (this.layerList.firstChild) {
        this.layerList.insertBefore(layerItem, this.layerList.firstChild);
      } else {
        this.layerList.appendChild(layerItem);
      }
    }

    const layerData = {
      element,
      listItem: layerItem,
      type,
      parentColumn: type === 'section' ? null : parentColumn // секции не должны иметь родительскую колонку
    };
    
    this.layers.unshift(layerData);
    this.updateLayerOrder();
    
    return layerData;
  }

  getLayerIcon(type) {
    const icon = document.createElement('svg');
    icon.classList.add('w-4', 'h-4', 'text-gray-400');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '2');

    switch(type) {
      case 'section':
        icon.innerHTML = '<path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"/>';
        break;
      case 'container':
        icon.innerHTML = '<path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"/>';
        break;
      case 'layout':
        icon.innerHTML = '<path d="M4 5a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>';
        break;
      default:
        icon.innerHTML = '<rect x="3" y="3" width="18" height="18" rx="2"/>';
    }
    
    return icon;
  }

  getLayerLabel(type) {
    switch(type) {
      case 'section':
        return `Section ${this.getSectionCount() + 1}`;
      case 'container':
        return 'Container';
      case 'layout':
        return 'Layout';
      default:
        return `${type} ${this.layers.length + 1}`;
    }
  }

  getSectionCount() {
    return this.layers.filter(layer => layer.type === 'section').length;
  }

  getActiveSection() {
    return this.layers.find(l => 
      l.type === 'section' && 
      l.element.classList.contains('active')
    )?.element;
  }

  getActiveColumn(section) {
    const grid = section.querySelector('.grid');
    return Array.from(grid.children).find(col => 
      col.classList.contains('active')
    ) || grid.children[0];
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