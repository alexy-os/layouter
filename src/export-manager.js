export class ExportManager {
  constructor(layerManager, registryManager, patternManager) {
    this.layerManager = layerManager;
    this.registryManager = registryManager;
    this.patternManager = patternManager;

    // Add export button handler
    const exportHtmlBtn = document.getElementById('exportHtmlBtn');
    if (exportHtmlBtn) {
      exportHtmlBtn.addEventListener('click', () => {
        console.log('Export button clicked');
        this.exportToHtml();
      });
    }
  }

  exportToHtml() {
    // Check if a pattern is selected
    const currentPattern = this.patternManager.currentPattern;
    if (!currentPattern) {
      this.showNotification('Select a pattern for export', true);
      return;
    }

    // Check layer validity
    const layers = this.layerManager.getLayers();
    const invalidLayers = layers.filter(layer => {
      const layerType = this.registryManager.getLayerType(layer.element.dataset.id);
      return !layerType; // Layer is invalid if it has no type
    });

    if (invalidLayers.length > 0) {
      this.showNotification('Select <Layer Type> for all layers before export', true);
      return;
    }

    // Create HTML structure based on the pattern
    const patternHtml = currentPattern.template;
    const container = document.createElement('div');
    container.innerHTML = patternHtml;

    // Process each canvas in the pattern
    currentPattern.canvases.forEach(canvasId => {
      const canvasElement = this.layerManager.canvas.querySelector(`[data-canvas="${canvasId}"]`);
      const targetCanvas = container.querySelector(`[data-canvas="${canvasId}"]`);
      
      if (canvasElement && targetCanvas) {
        // Get layers for this canvas
        const canvasLayers = layers.filter(layer => 
          layer.element.closest('[data-canvas]').getAttribute('data-canvas') === canvasId
        );

        // Sort layers by z-index
        const sortedLayers = [...canvasLayers].sort((a, b) => 
          parseInt(a.element.dataset.zIndex) - parseInt(b.element.dataset.zIndex)
        );

        // Export layers
        const layersHtml = sortedLayers.map(layer => 
          this.exportLayer(layer.element, canvasElement)
        ).join('\n');

        // Clean technical canvas classes
        targetCanvas.className = targetCanvas.className
          .split(' ')
          .filter(cls => !['border-2', 'border-dashed', 'border-slate-200', 'dark:border-slate-700', 'bg-white', 'dark:bg-slate-800', 'rounded-lg'].includes(cls))
          .join(' ');

        // Remove grid overlay and add layers
        targetCanvas.innerHTML = layersHtml;
        targetCanvas.removeAttribute('data-canvas');
      }
    });

    // Create full HTML document
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

    // Create and download file
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported-layout.html';
    a.click();
    window.URL.revokeObjectURL(url);

    this.showNotification('Layout successfully exported');
  }

  exportLayer(element, canvas) {
    const rect = element.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    // Get column sizes (canvas)
    const columnWidth = canvasRect.width;
    const columnHeight = canvasRect.height;
    
    // Calculate positions relative to the column
    const left = Math.round((rect.left - canvasRect.left) / columnWidth * 100);
    const top = Math.round((rect.top - canvasRect.top) / columnHeight * 100);
    const width = Math.round(rect.width / columnWidth * 100);
    const height = Math.round(rect.height / columnHeight * 100);

    // Get layer type from registry
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