export class ExportManager {
  constructor(layerManager, registryManager, patternManager) {
    this.layerManager = layerManager;
    this.registryManager = registryManager;
    this.patternManager = patternManager;
    
    // Define Tailwind color mappings for common colors
    this.tailwindColors = {
      slate: {
        50: '#f8fafc',
        100: '#f1f5f9', 
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a'
      },
      blue: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a'
      }
    };

    // Добавляем обработчик кнопки экспорта
    const exportHtmlBtn = document.getElementById('exportHtmlBtn');
    if (exportHtmlBtn) {
      exportHtmlBtn.addEventListener('click', () => {
        console.log('Export button clicked');
        this.exportToHtml();
      });
    }
  }

  findTailwindColor(hexColor) {
    // Try to match the color with Tailwind colors
    for (const [colorName, shades] of Object.entries(this.tailwindColors)) {
      for (const [shade, value] of Object.entries(shades)) {
        if (value.toLowerCase() === hexColor.toLowerCase()) {
          return `${colorName}-${shade}`;
        }
      }
    }
    // If no match found, return as bg-[color]
    return `[${hexColor}]`;
  }

  exportToHtml() {
    // Получаем текущий паттерн
    const currentPattern = this.patternManager.currentPattern;
    if (!currentPattern) {
      this.showNotification('Выберите паттерн для экспорта', true);
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
        const layers = this.layerManager.getLayers().filter(layer => 
          layer.element.closest('[data-canvas]').getAttribute('data-canvas') === canvasId
        );

        // Сортируем слои по z-index
        const sortedLayers = [...layers].sort((a, b) => 
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
</head>
<body class="bg-white dark:bg-gray-900">
  ${container.innerHTML}
</body>
</html>`;

    // Копируем в буфер обмена
    navigator.clipboard.writeText(fullHtml).then(() => {
      this.showNotification('HTML скопирован в буфер обмена');
    }).catch(err => {
      console.error('Failed to copy:', err);
      this.showNotification('Ошибка при копировании', true);
    });
  }

  exportLayer(element, canvas) {
    const rect = element.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    // Рассчитываем позиции в утилитах Tailwind
    const left = Math.round(rect.left - canvasRect.left);
    const top = Math.round(rect.top - canvasRect.top);
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    if (element.dataset.type === 'text') {
      const content = element.querySelector('[contenteditable]')?.innerHTML || '';
      const classes = Array.from(element.classList)
        .filter(cls => !['layer', 'selected'].includes(cls))
        .join(' ');

      return `<div class="absolute ${classes} left-[${left}px] top-[${top}px] w-[${width}px]">${content}</div>`;
    } else {
      // Для прямоугольников
      const bgClass = Array.from(element.classList)
        .find(cls => cls.startsWith('bg-')) || 'bg-blue-500';
      
      const roundedClass = Array.from(element.classList)
        .find(cls => cls.startsWith('rounded-')) || '';

      const layerType = this.registryManager.getLayerType(element.dataset.id) || 'rectangle';

      return `<div class="absolute ${bgClass} ${roundedClass} left-[${left}px] top-[${top}px] w-[${width}px] h-[${height}px]" layer="${layerType}"></div>`;
    }
  }

  rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return '#000000';
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb;
    
    const [, r, g, b] = match;
    return `#${((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1)}`;
  }

  // Добавляем метод для показа уведомлений
  showNotification(message, isError = false) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
      isError ? 'bg-red-500' : 'bg-green-500'
    } text-white text-sm z-50`;
    notification.textContent = message;

    // Добавляем на страницу
    document.body.appendChild(notification);

    // Удаляем через 3 секунды
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}