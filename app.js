import { LayerManager } from './src/layer-manager.js';
import { EventHandlers } from './src/event-handlers.js';
import { ToolManager } from './src/tool-manager.js';
import { PropertyManager } from './src/property-manager.js';
import { ExportManager } from './src/export-manager.js';
import { ThemeManager } from './src/theme-manager.js';
import { ValidationController } from './src/validation-controller.js';
import { RegistryManager } from './src/registry-manager.js';
import { PatternManager } from './src/pattern-manager.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize managers
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

  // Initialize tab management
  const tabButtons = document.querySelectorAll('[data-tab]');
  const tabContents = {
    patterns: document.getElementById('patternsTab'),
    layers: document.getElementById('layersTab'),
    properties: document.getElementById('propertiesTab')
  };

  function switchTab(tabName) {
    // Update tab buttons
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab contents
    Object.entries(tabContents).forEach(([name, element]) => {
      element.classList.toggle('hidden', name !== tabName);
    });
  }

  // Add click handlers for tabs
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Switch to properties tab when using tools
  [rectangleBtn, textBtn].forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab('properties');
    });
  });

  // Instantiate managers in the correct order
  const layerManager = new LayerManager(canvas, layerList, registryManager);
  const patternManager = new PatternManager(canvas, layerManager);
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

  const exportManager = new ExportManager(layerManager, registryManager, patternManager);
  const validationController = new ValidationController(layerManager, registryManager);
  
  // Add mouse event listeners
  canvas.addEventListener('mousedown', eventHandlers.handleCanvasMouseDown.bind(eventHandlers));

  // Add touch event listeners
  canvas.addEventListener('touchstart', eventHandlers.handleCanvasTouchStart.bind(eventHandlers));

  // Prevent default touch behavior to avoid scrolling
  canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

  // Export menu functionality
  let isExportMenuOpen = false;

  exportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isExportMenuOpen = !isExportMenuOpen;
    exportMenu.classList.toggle('hidden', !isExportMenuOpen);
    
    if (isExportMenuOpen) {
      // Add click outside listener
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

  // Export HTML
  document.getElementById('exportHtmlBtn').addEventListener('click', () => {
    exportMenu.classList.add('hidden');
  });

  themeToggleBtn.addEventListener('click', () => {
    themeManager.toggleTheme();
  });

  // Add handles toggle functionality
  const handlesToggleBtn = document.getElementById('handlesToggleBtn');
  let areHandlesVisible = true;
  
  handlesToggleBtn.addEventListener('click', () => {
    areHandlesVisible = !areHandlesVisible;
    document.body.classList.toggle('hide-handles', !areHandlesVisible);
    handlesToggleBtn.classList.toggle('active', areHandlesVisible);
  });
  
  // Set initial state
  handlesToggleBtn.classList.add('active');

  // After creating patternManager
  patternManager.setPattern('single'); // Set initial pattern
});