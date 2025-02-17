export class ExportManager {
  constructor(layerManager, registryManager, patternManager) {
    this.layerManager = layerManager;
    this.registryManager = registryManager;
    this.patternManager = patternManager;

    // Добавляем обработчик кнопки экспорта
    const exportHtmlBtn = document.getElementById('exportHtmlBtn');
    if (exportHtmlBtn) {
      exportHtmlBtn.addEventListener('click', () => {
        console.log('Export button clicked');
        this.exportToHtml();
      });
    }
  }

  exportToHtml() {
    // Проверяем наличие паттерна
    const currentPattern = this.patternManager.currentPattern;
    if (!currentPattern) {
      this.showNotification('Выберите паттерн для экспорта', true);
      return;
    }

    // Проверяем валидность слоев
    const layers = this.layerManager.getLayers();
    const invalidLayers = layers.filter(layer => {
      const layerType = this.registryManager.getLayerType(layer.element.dataset.id);
      return !layerType; // Слой невалиден если нет типа
    });

    if (invalidLayers.length > 0) {
      this.showNotification('Выберите тип для всех слоев перед экспортом', true);
      return;
    }

    // Создаем структуру HTML на основе паттерна
    const patternHtml = currentPattern.template;
    const container = document.createElement('div');
    container.innerHTML = patternHtml;

    // Обрабатываем каждый canvas в паттерне
    currentPattern.canvases.forEach(canvasId => {
      const canvasElement = this.layerManager.canvas.querySelector(`[data-canvas="${canvasId}"]`);
      const targetCanvas = container.querySelector(`[data-canvas="${canvasId}"]`);
      
      if (canvasElement && targetCanvas) {
        // Получаем слои для данного canvas
        const canvasLayers = layers.filter(layer => 
          layer.element.closest('[data-canvas]').getAttribute('data-canvas') === canvasId
        );

        // Сортируем слои по z-index
        const sortedLayers = [...canvasLayers].sort((a, b) => 
          parseInt(a.element.dataset.zIndex) - parseInt(b.element.dataset.zIndex)
        );

        // Экспортируем слои
        const layersHtml = sortedLayers.map(layer => 
          this.exportLayer(layer.element, canvasElement)
        ).join('\n');

        // Очищаем технические классы canvas
        targetCanvas.className = targetCanvas.className
          .split(' ')
          .filter(cls => !['border-2', 'border-dashed', 'border-slate-200', 'dark:border-slate-700', 'bg-white', 'dark:bg-slate-800', 'rounded-lg'].includes(cls))
          .join(' ');

        // Удаляем grid overlay и добавляем слои
        targetCanvas.innerHTML = layersHtml;
        targetCanvas.removeAttribute('data-canvas');
      }
    });

    // Создаем полный HTML документ
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Layout</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {}
    }
  </script>
</head>
<body class="bg-white dark:bg-gray-900">
  ${container.innerHTML}
</body>
</html>`;

    // Создаем и скачиваем файл
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported-layout.html';
    a.click();
    window.URL.revokeObjectURL(url);

    this.showNotification('Макет успешно экспортирован');
  }

  exportLayer(element, canvas) {
    const rect = element.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    // Получаем размеры колонки (canvas)
    const columnWidth = canvasRect.width;
    const columnHeight = canvasRect.height;
    
    // Рассчитываем позиции относительно колонки
    const left = Math.round((rect.left - canvasRect.left) / columnWidth * 100);
    const top = Math.round((rect.top - canvasRect.top) / columnHeight * 100);
    const width = Math.round(rect.width / columnWidth * 100);
    const height = Math.round(rect.height / columnHeight * 100);

    // Получаем тип слоя из registry
    const layerType = this.registryManager.getLayerType(element.dataset.id);
    
    if (element.dataset.type === 'text') {
      const content = element.querySelector('[contenteditable]')?.innerHTML || '';
      const classes = Array.from(element.classList)
        .filter(cls => !['layer', 'selected'].includes(cls))
        .join(' ');

      return `<div class="absolute ${classes} left-[${left}%] top-[${top}%] w-[${width}%]" layer="${layerType}">${content}</div>`;
    } else {
      const bgClass = Array.from(element.classList)
        .find(cls => cls.startsWith('bg-')) || 'bg-blue-500';
      
      const roundedClass = Array.from(element.classList)
        .find(cls => cls.startsWith('rounded-')) || '';

      return `<div class="absolute ${bgClass} ${roundedClass} left-[${left}%] top-[${top}%] w-[${width}%] h-[${height}%]" layer="${layerType}"></div>`;
    }
  }

  rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return '#000000';
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb;
    
    const [, r, g, b] = match;
    return `#${((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1)}`;
  }

  showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
      isError ? 'bg-red-500' : 'bg-green-500'
    } text-white text-sm z-50`;
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
}