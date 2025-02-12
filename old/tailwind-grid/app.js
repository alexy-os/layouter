import { LayerManager } from './src/layers.js';
import { EventHandlers } from './src/event-handlers.js';
import { ToolManager } from './src/tool-manager.js';
import { PropertyManager } from './src/property-manager.js';
import { ExportManager } from './src/export-manager.js';
import { ThemeManager } from './src/theme-manager.js';
import { LayoutManager } from './src/layout-manager.js';

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

  const cursorBtn = document.getElementById('cursorBtn');
  const grabBtn = document.getElementById('grabBtn');
  const rectangleBtn = document.getElementById('rectangleBtn');
  const textBtn = document.getElementById('textBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const exportBtn = document.getElementById('exportBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const addSectionBtn = document.getElementById('addSectionBtn');

  // Instantiate managers in the correct order
  const layerManager = new LayerManager(canvas, layerList);
  const layoutManager = new LayoutManager(canvas, layerManager);
  const toolManager = new ToolManager(
    cursorBtn, 
    grabBtn, 
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

  const exportManager = new ExportManager(layerManager, layoutManager);
  
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

  addSectionBtn.addEventListener('click', () => {
    const templateSelect = document.createElement('div');
    templateSelect.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    templateSelect.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-96 dark:bg-gray-800">
        <h3 class="text-lg font-semibold mb-4">Choose Section Template</h3>
        <div class="space-y-4">
          <button class="w-full p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700" data-template="blank">
            <div class="w-full h-12 bg-blue-100 dark:bg-blue-900 rounded"></div>
            <span class="text-sm mt-2 block">Blank Section</span>
            <span class="text-xs text-gray-500">Single column layout</span>
          </button>
          
          <button class="w-full p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700" data-template="hero">
            <div class="flex gap-2 h-12">
              <div class="flex-1 bg-blue-100 dark:bg-blue-900 rounded"></div>
              <div class="flex-1 bg-blue-100 dark:bg-blue-900 rounded"></div>
            </div>
            <span class="text-sm mt-2 block">Hero Section</span>
            <span class="text-xs text-gray-500">Two column layout for hero content</span>
          </button>
          
          <button class="w-full p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700" data-template="features">
            <div class="flex gap-2 h-12">
              <div class="flex-1 bg-blue-100 dark:bg-blue-900 rounded"></div>
              <div class="flex-1 bg-blue-100 dark:bg-blue-900 rounded"></div>
              <div class="flex-1 bg-blue-100 dark:bg-blue-900 rounded"></div>
            </div>
            <span class="text-sm mt-2 block">Features Grid</span>
            <span class="text-xs text-gray-500">Three column layout for features</span>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(templateSelect);
    
    templateSelect.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (button) {
        const template = button.dataset.template;
        const section = layoutManager.createSection(template);
        if (section) {
          layerManager.addLayer(section, 'section');
        }
        document.body.removeChild(templateSelect);
      }
    });
  });
});