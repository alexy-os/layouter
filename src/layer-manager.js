export class LayerManager {
  constructor(canvas, layerList, registryManager) {
    this.canvas = canvas;
    this.layerList = layerList;
    this.registryManager = registryManager;
    this.layers = new Map();
    this.selectedLayer = null;
    this.nextId = 1;
    
    // Добавляем отслеживание активного холста
    this.activeCanvas = null;
  }

  // Метод для установки активного холста
  setActiveCanvas(canvasElement) {
    this.activeCanvas = canvasElement;
  }

  // Проверка, находится ли точка в пределах активного холста
  isWithinActiveCanvas(x, y) {
    if (!this.activeCanvas) return false;
    
    const rect = this.activeCanvas.getBoundingClientRect();
    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
  }

  // Обновляем метод создания прямоугольника с проверкой границ
  createRectangleLayer(x, y, width, height, borderRadius = 'none') {
    if (!this.activeCanvas || !this.isWithinActiveCanvas(x, y)) {
      return null;
    }

    const layer = document.createElement('div');
    layer.classList.add('layer');
    layer.dataset.type = 'rectangle';
    layer.dataset.id = this.nextId++;

    // Пересчитываем координаты относительно активного холста
    const canvasRect = this.activeCanvas.getBoundingClientRect();
    const relativeX = x - canvasRect.left;
    const relativeY = y - canvasRect.top;

    layer.style.left = `${relativeX}px`;
    layer.style.top = `${relativeY}px`;
    layer.style.width = `${width}px`;
    layer.style.height = `${height}px`;

    // Добавляем слой в активный холст вместо общего canvas
    this.activeCanvas.appendChild(layer);
    this.layers.set(layer.dataset.id, layer);
    this.addLayerToList(layer);

    return layer;
  }

  // ... остальные методы ...
} 