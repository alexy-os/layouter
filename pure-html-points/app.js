import { LayerManager } from './src/layers.js';
import { EventHandlers } from './src/event-handlers.js';
import { ToolManager } from './src/tool-manager.js';
import { PropertyManager } from './src/property-manager.js';
import { ExportManager } from './src/export-manager.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas');
  const layerList = document.getElementById('layerList');

  const colorPicker = document.getElementById('colorPicker');
  const borderRadius = document.getElementById('borderRadius');
  const posX = document.getElementById('posX');
  const posY = document.getElementById('posY');
  const width = document.getElementById('width');
  const height = document.getElementById('height');

  const cursorBtn = document.getElementById('cursorBtn');
  const grabBtn = document.getElementById('grabBtn');
  const rectangleBtn = document.getElementById('rectangleBtn');
  const textBtn = document.getElementById('textBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const exportBtn = document.getElementById('exportBtn');

  // Instantiate managers in the correct order
  const layerManager = new LayerManager(canvas, layerList);
  const toolManager = new ToolManager(
    cursorBtn, 
    grabBtn, 
    rectangleBtn, 
    textBtn, 
    deleteBtn, 
    canvas, 
    layerManager,
    null // Will set propertyManager after creation
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
    toolManager // Pass toolManager to PropertyManager
  );
  
  // Set propertyManager reference in toolManager
  toolManager.propertyManager = propertyManager;

  const eventHandlers = new EventHandlers(
    canvas, 
    layerManager, 
    toolManager, 
    propertyManager
  );

  // Initialize export manager
  const exportManager = new ExportManager(layerManager);
  
  // Add event listeners to the canvas
  canvas.addEventListener('mousedown', eventHandlers.handleCanvasMouseDown.bind(eventHandlers));
  canvas.addEventListener('mousemove', eventHandlers.handleCanvasMouseMove.bind(eventHandlers));
  canvas.addEventListener('mouseup', eventHandlers.handleCanvasMouseUp.bind(eventHandlers));

  // Add export button click handler
  exportBtn.addEventListener('click', () => {
    exportManager.exportToHtml();
  });
});