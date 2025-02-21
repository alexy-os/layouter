export class ValidationController {
  constructor(layerManager, registryManager) {
    this.layerManager = layerManager;
    this.registryManager = registryManager;
  }

  validateLayers() {
    const layers = this.layerManager.getLayers();
    const unregistered = this.registryManager.validateLayers(layers);

    if (unregistered.length > 0) {
      this.showValidationModal(unregistered);
      return false;
    }

    return true;
  }

  showValidationModal(unregistered) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    // Create modal content
    const content = document.createElement('div');
    content.className = 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full';
    
    // Create modal header
    const header = document.createElement('h3');
    header.className = 'text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4';
    header.textContent = 'Unnamed Layers Detected';
    
    // Create message
    const message = document.createElement('div');
    message.className = 'text-gray-600 dark:text-gray-300 mb-4';
    message.innerHTML = `
      <p class="mb-2">The following layers need to be assigned a type:</p>
      <ul class="list-disc pl-5 space-y-1">
        ${unregistered.map(layer => `<li>${layer.name}</li>`).join('')}
      </ul>
    `;
    
    // Create close button
    const button = document.createElement('button');
    button.className = 'w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors';
    button.textContent = 'Close';
    button.onclick = () => document.body.removeChild(modal);
    
    // Assemble modal
    content.appendChild(header);
    content.appendChild(message);
    content.appendChild(button);
    modal.appendChild(content);
    
    // Add modal to body
    document.body.appendChild(modal);
  }
} 