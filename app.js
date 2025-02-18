import { LayerManager } from './src/layer-manager.js';
import { EventHandlers } from './src/event-handlers.js';
import { ToolManager } from './src/tool-manager.js';
import { PropertyManager } from './src/property-manager.js';
import { ExportManager } from './src/export-manager.js';
import { ThemeManager } from './src/theme-manager.js';
import { ValidationController } from './src/validation-controller.js';
import { RegistryManager } from './src/registry-manager.js';
import { PatternConstructor } from './src/pattern-constructor.js';

document.addEventListener('DOMContentLoaded', () => {
  const themeManager = new ThemeManager();
  const registryManager = new RegistryManager();
  
  const canvas = document.getElementById('canvas');
  const layerList = document.getElementById('layerList');

  const colorPicker = document.getElementById('colorPicker');
  const borderRadius = document.getElementById('borderRadius');
  const posX = document.getElementById('posX');
  const posY = document.getElementById('posY');
  const width = document.getElementById('width');
  const height = document.getElementById('height');

  const rectangleBtn = document.getElementById('rectangleBtn');
  const textBtn = document.getElementById('textBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const exportBtn = document.getElementById('exportBtn');
  const exportMenu = document.getElementById('exportMenu');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  const tabButtons = document.querySelectorAll('[data-tab]');
  const tabContents = {
    patterns: document.getElementById('patternsTab'),
    layers: document.getElementById('layersTab'),
    properties: document.getElementById('propertiesTab')
  };

  function switchTab(tabName) {
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    Object.entries(tabContents).forEach(([name, element]) => {
      element.classList.toggle('hidden', name !== tabName);
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  [rectangleBtn, textBtn].forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab('properties');
    });
  });

  const layerManager = new LayerManager(canvas, layerList, registryManager);
  
  // Replace the creation of PatternManager with pattern rendering through the constructor
  PatternConstructor.renderPatternsPreview('patternsTab');

  // Add a listener for pattern selection
  document.addEventListener('patternSelected', (e) => {
    const { pattern } = e.detail;
    layerManager.clearAllLayers();
    canvas.innerHTML = pattern.template;
    
    // Initialize canvases
    const canvasElements = canvas.querySelectorAll('[data-canvas]');
    canvasElements.forEach(canvasElement => {
      canvasElement.style.cursor = 'pointer';
      canvasElement.addEventListener('click', (e) => {
        if (e.target === canvasElement) {
          setActiveCanvas(canvasElement);
        }
      });
    });

    if (canvasElements.length > 0) {
      setActiveCanvas(canvasElements[0]);
    }
  });

  function setActiveCanvas(canvasElement) {
    const activeCanvas = canvas.querySelector('[data-canvas].active');
    if (activeCanvas) {
      activeCanvas.classList.remove('active');
      activeCanvas.style.cursor = 'pointer';
    }
    
    canvasElement.classList.add('active');
    canvasElement.style.cursor = 'default';
    layerManager.setActiveCanvas(canvasElement);
  }

  const toolManager = new ToolManager(
    rectangleBtn, 
    textBtn, 
    deleteBtn, 
    canvas, 
    layerManager,
    null,
    registryManager
  );
  const propertyManager = new PropertyManager(
    canvas, 
    colorPicker, 
    borderRadius, 
    posX, 
    posY, 
    width, 
    height, 
    layerManager,
    toolManager,
    registryManager
  );
  
  toolManager.propertyManager = propertyManager;
  layerManager.propertyManager = propertyManager;

  const eventHandlers = new EventHandlers(
    canvas, 
    layerManager, 
    toolManager, 
    propertyManager
  );

  const exportManager = new ExportManager(layerManager, registryManager);
  const validationController = new ValidationController(layerManager, registryManager);
  
  canvas.addEventListener('mousedown', eventHandlers.handleCanvasMouseDown.bind(eventHandlers));
  canvas.addEventListener('touchstart', eventHandlers.handleCanvasTouchStart.bind(eventHandlers));
  canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

  let isExportMenuOpen = false;

  exportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isExportMenuOpen = !isExportMenuOpen;
    exportMenu.classList.toggle('hidden', !isExportMenuOpen);
    
    if (isExportMenuOpen) {
      setTimeout(() => {
        document.addEventListener('click', closeExportMenu);
      }, 0);
    }
  });

  function closeExportMenu(e) {
    if (!exportMenu.contains(e.target) && e.target !== exportBtn) {
      isExportMenuOpen = false;
      exportMenu.classList.add('hidden');
      document.removeEventListener('click', closeExportMenu);
    }
  }

  document.getElementById('exportHtmlBtn').addEventListener('click', () => {
    exportMenu.classList.add('hidden');
  });

  themeToggleBtn.addEventListener('click', () => {
    themeManager.toggleTheme();
  });

  const handlesToggleBtn = document.getElementById('handlesToggleBtn');
  let areHandlesVisible = true;
  
  // Hide the button initially
  handlesToggleBtn.classList.add('hidden');
  
  // Update the button visibility when layers change
  layerManager.onLayersChange = () => {
    const hasLayers = layerManager.layers.length > 0;
    handlesToggleBtn.classList.toggle('hidden', !hasLayers);
  };
  
  handlesToggleBtn.addEventListener('click', () => {
    areHandlesVisible = !areHandlesVisible;
    document.body.classList.toggle('hide-handles', !areHandlesVisible);
    handlesToggleBtn.classList.toggle('active', areHandlesVisible);
  });
  
  handlesToggleBtn.classList.add('active');

  // Initialize the first pattern
  const firstPattern = PatternConstructor.getPatterns().single;
  canvas.innerHTML = firstPattern.template;
  const firstCanvas = canvas.querySelector('[data-canvas]');
  if (firstCanvas) {
    setActiveCanvas(firstCanvas);
  }
});