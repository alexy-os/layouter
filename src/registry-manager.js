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

  // Регистрация типа элемента
  setLayerType(layerId, type) {
    this.registry[layerId] = {
      type,
      updatedAt: new Date().toISOString()
    };
    this.saveRegistry();
  }

  // Получение типа элемента
  getLayerType(layerId) {
    return this.registry[layerId]?.type || '';
  }

  // Удаление элемента из реестра
  removeLayer(layerId) {
    delete this.registry[layerId];
    this.saveRegistry();
  }

  // Проверка наличия незарегистрированных элементов
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

  // Очистка реестра (например, при сбросе)
  clearRegistry() {
    this.registry = {};
    localStorage.removeItem(this.storageKey);
  }
} 