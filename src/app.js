import { LayerManager } from './layer-manager.js';
import { ToolManager } from './tool-manager.js';
import { PropertyManager } from './property-manager.js';
import { RegistryManager } from './registry-manager.js';
import { PatternManager } from './pattern-manager.js';

const registryManager = new RegistryManager();
const layerManager = new LayerManager(registryManager);
const propertyManager = new PropertyManager();
const toolManager = new ToolManager(layerManager);
const patternManager = new PatternManager(layerManager, registryManager);

toolManager.propertyManager = propertyManager;
layerManager.propertyManager = propertyManager;

// Export menu functionality
const exportBtn = document.getElementById('exportBtn');
const exportMenu = document.getElementById('exportMenu');

exportBtn.addEventListener('click', () => {
  exportMenu.classList.toggle('hidden');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!exportBtn.contains(e.target) && !exportMenu.contains(e.target)) {
    exportMenu.classList.add('hidden');
  }
});

// Import project
document.getElementById('importProjectBtn').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = event => {
      const success = patternManager.importProject(event.target.result);
      if (success) {
        exportMenu.classList.add('hidden');
      } else {
        alert('Failed to import project. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
});

// Export project
document.getElementById('exportProjectBtn').addEventListener('click', () => {
  const json = patternManager.exportProject();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'project.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  exportMenu.classList.add('hidden');
});

// Export HTML
document.getElementById('exportHtmlBtn').addEventListener('click', () => {
  const canvas = document.getElementById('canvas');
  const html = canvas.innerHTML;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'layout.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  exportMenu.classList.add('hidden');
}); 