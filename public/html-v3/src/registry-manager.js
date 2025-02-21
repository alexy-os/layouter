export class RegistryManager {
  constructor() {
    this.storageKey = 'layouter_registry';
    this.registry = this.loadRegistry();
  }

  loadRegistry() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : {};
  }

  saveRegistry() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.registry));
  }

  // Register element type
  setLayerType(layerId, type) {
    this.registry[layerId] = {
      type,
      updatedAt: new Date().toISOString()
    };
    this.saveRegistry();
  }

  // Get element type
  getLayerType(layerId) {
    return this.registry[layerId]?.type || '';
  }

  // Remove element from registry
  removeLayer(layerId) {
    delete this.registry[layerId];
    this.saveRegistry();
  }

  // Check for unregistered elements
  validateLayers(layers) {
    const unregistered = [];
    
    layers.forEach(layer => {
      const element = layer.element;
      const layerId = element.dataset.id;
      const type = this.getLayerType(layerId);
      
      if (!type) {
        const elementType = element.dataset.type;
        const name = elementType === 'text' ? 'Text' : 'Rectangle';
        unregistered.push({
          id: layerId,
          name: `${name} ${layerId}`
        });
      }
    });
    
    return unregistered;
  }

  // Clear registry (e.g., when resetting)
  clearRegistry() {
    this.registry = {};
    localStorage.removeItem(this.storageKey);
  }
} 