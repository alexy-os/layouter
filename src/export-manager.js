export class ExportManager {
  constructor(layerManager, registryManager) {
    this.layerManager = layerManager;
    this.registryManager = registryManager;
    
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
    const layers = this.layerManager.getLayers();
    let htmlContent = '';
    
    // Sort layers by z-index for proper export order and filter out boundary
    const sortedLayers = [...layers]
      .filter(layer => !layer.element.classList.contains('pointer-events-none'))
      .sort((a, b) => parseInt(a.element.dataset.zIndex) - parseInt(b.element.dataset.zIndex));

    sortedLayers.forEach(layer => {
      const element = layer.element;
      const type = element.dataset.type;
      
      if (type === 'rectangle') {
        htmlContent += this.exportRectangle(element);
      } else if (type === 'text') {
        htmlContent += this.exportText(element);
      }
    });

    // Create the full HTML document
    const fullHtml = `<!DOCTYPE html>
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
  <div class="container mx-auto h-[calc(100vh)] max-w-4xl">
    ${htmlContent}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'layout.html';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportRectangle(element) {
    const canvasRect = this.layerManager.canvas.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    // Calculate position relative to canvas
    const left = Math.round(elementRect.left - canvasRect.left);
    const top = Math.round(elementRect.top - canvasRect.top);
    const width = Math.round(elementRect.width);
    const height = Math.round(elementRect.height);

    // Get essential classes
    const bgClass = Array.from(element.classList)
      .find(cls => cls.startsWith('bg-')) || 'bg-blue-500';
    const roundedClass = Array.from(element.classList)
      .find(cls => cls.startsWith('rounded-')) || '';
    
    // Get layer type from registry
    const layerType = this.registryManager.getLayerType(element.dataset.id);
    
    return `
    <div class="absolute ${bgClass} ${roundedClass}" 
         style="left: ${left}px; top: ${top}px; width: ${width}px; height: ${height}px;"
         ${layerType ? `data-component="${layerType}"` : ''}></div>`;
  }

  exportText(element) {
    const canvasRect = this.layerManager.canvas.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    // Calculate position relative to canvas
    const left = Math.round(elementRect.left - canvasRect.left);
    const top = Math.round(elementRect.top - canvasRect.top);
    const width = Math.round(elementRect.width);
    
    // Get essential classes
    const classes = Array.from(element.classList)
      .filter(cls => !['layer', 'selected', 'focus:outline-none'].includes(cls))
      .join(' ');
    
    // Get content and layer type
    const content = element.textContent;
    const layerType = this.registryManager.getLayerType(element.dataset.id);
    
    return `
    <div class="absolute ${classes}" 
         style="left: ${left}px; top: ${top}px; width: ${width}px;"
         ${layerType ? `data-component="${layerType}"` : ''}>
      ${content}
    </div>`;
  }

  rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return '#000000';
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb;
    
    const [, r, g, b] = match;
    return `#${((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1)}`;
  }
}