import { LayerManager } from './src/layers.js';
import { EventHandlers } from './src/event-handlers.js';
import { ToolManager } from './src/tool-manager.js';
import { PropertyManager } from './src/property-manager.js';
import { ExportManager } from './src/export-manager.js';
import { ThemeManager } from './src/theme-manager.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme manager first
  const themeManager = new ThemeManager();
  
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
  const layerManager = new LayerManager(canvas, layerList);
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
    toolManager
  );
  
  toolManager.propertyManager = propertyManager;

  const eventHandlers = new EventHandlers(
    canvas, 
    layerManager, 
    toolManager, 
    propertyManager
  );

  const exportManager = new ExportManager(layerManager);
  
  // Add event listeners
  canvas.addEventListener('mousedown', eventHandlers.handleCanvasMouseDown.bind(eventHandlers));
  canvas.addEventListener('mousemove', eventHandlers.handleCanvasMouseMove.bind(eventHandlers));
  canvas.addEventListener('mouseup', eventHandlers.handleCanvasMouseUp.bind(eventHandlers));

  exportBtn.addEventListener('click', () => {
    exportManager.exportToHtml();
  });

  themeToggleBtn.addEventListener('click', () => {
    themeManager.toggleTheme();
  });
});