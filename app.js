import { LayerManager } from './src/layers.js';
import { EventHandlers } from './src/event-handlers.js';
import { ToolManager } from './src/tool-manager.js';
import { PropertyManager } from './src/property-manager.js';
import { ExportManager } from './src/export-manager.js';
import { ThemeManager } from './src/theme-manager.js';
import { ValidationController } from './src/validation-controller.js';
import { RegistryManager } from './src/registry-manager.js';

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
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // Instantiate managers in the correct order
  const layerManager = new LayerManager(canvas, layerList, registryManager);
  const toolManager = new ToolManager(
    rectangleBtn, 
    textBtn, 
    deleteBtn, 
    canvas, 
    layerManager,
    null
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

  // Add mouse event listeners
  canvas.addEventListener('mousedown', eventHandlers.handleCanvasMouseDown.bind(eventHandlers));

  // Add touch event listeners
  canvas.addEventListener('touchstart', eventHandlers.handleCanvasTouchStart.bind(eventHandlers));

  // Prevent default touch behavior to avoid scrolling
  canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

  exportBtn.addEventListener('click', () => {
    if (validationController.validateLayers()) {
      exportManager.exportToHtml();
    }
  });

  themeToggleBtn.addEventListener('click', () => {
    themeManager.toggleTheme();
  });
});