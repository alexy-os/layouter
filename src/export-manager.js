export class ExportManager {
  constructor(layerManager) {
    this.layerManager = layerManager;
    
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
    
    // Sort layers by z-index for proper export order
    const sortedLayers = [...layers].sort((a, b) => 
      parseInt(a.element.dataset.zIndex) - parseInt(b.element.dataset.zIndex)
    );

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
<body class="relative min-h-screen bg-white dark:bg-gray-900">
  <div class="container mx-auto relative h-[calc(100vh-4rem)] max-w-4xl">
    ${htmlContent}
  </div>
</body>
</html>`;

    // Create and trigger download
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported-layout.html';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportRectangle(element) {
    const rect = element.getBoundingClientRect();
    const canvas = this.layerManager.canvas.getBoundingClientRect();
    
    // Calculate percentage positions
    const left = ((rect.left - canvas.left) / canvas.width * 100).toFixed(2);
    const top = ((rect.top - canvas.top) / canvas.height * 100).toFixed(2);
    const width = (rect.width / canvas.width * 100).toFixed(2);
    const height = (rect.height / canvas.height * 100).toFixed(2);
    
    // Get background color class
    const bgClass = Array.from(element.classList)
      .find(cls => cls.startsWith('bg-')) || 'bg-blue-500';
    
    // Get border radius class
    const roundedClass = Array.from(element.classList)
      .find(cls => cls.startsWith('rounded-')) || '';
    
    return `
    <div class="absolute ${bgClass} ${roundedClass}"
         style="left: ${left}%; top: ${top}%; width: ${width}%; height: ${height}%;"></div>`;
  }

  exportText(element) {
    const rect = element.getBoundingClientRect();
    const canvas = this.layerManager.canvas.getBoundingClientRect();
    
    // Calculate percentage positions
    const left = ((rect.left - canvas.left) / canvas.width * 100).toFixed(2);
    const top = ((rect.top - canvas.top) / canvas.height * 100).toFixed(2);
    const width = (rect.width / canvas.width * 100).toFixed(2);
    const height = (rect.height / canvas.height * 100).toFixed(2);
    
    // Get text content
    const content = element.textContent;
    
    // Get styling classes
    const classes = Array.from(element.classList)
      .filter(cls => !['layer', 'selected'].includes(cls))
      .join(' ');
    
    return `
    <div class="absolute ${classes}"
         style="left: ${left}%; top: ${top}%; width: ${width}%; height: ${height}%;">
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