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
    const content = this.generateTailwindHtml(layers);
    
    const blob = new Blob([content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'layout.html';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  generateTailwindHtml(layers) {
    const layersHtml = this.generateTailwindLayersHtml(layers);

    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Tailwind Layout</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div class="relative w-full min-h-screen bg-white">
    ${layersHtml}
  </div>
</body>
</html>`;
  }

  generateTailwindLayersHtml(layers) {
    return layers.map((layer) => {
      const element = layer.element;
      
      // Get stored Tailwind classes from dataset
      const twRadius = element.dataset.twRadius || 'none';
      const twWidth = parseInt(element.dataset.width || '0');
      const twHeight = parseInt(element.dataset.height || '0');
      const twColor = element.dataset.twColor || 'transparent';
      const zIndex = element.dataset.zIndex || '0';
      
      // Get position from dataset and round to nearest pixel
      const x = Math.round(parseFloat(element.style.left)) || 0;
      const y = Math.round(parseFloat(element.style.top)) || 0;
      
      // Build classes array
      const classes = [
        'absolute',
        twRadius !== 'none' ? `rounded-${twRadius}` : '',
        `w-[${twWidth}px]`,
        `h-[${twHeight}px]`,
        `left-[${x}px]`,
        `top-[${y}px]`,
        twColor.startsWith('#') ? `bg-${this.findTailwindColor(twColor)}` : `bg-${twColor}`,
        `z-[${zIndex}]`
      ].filter(Boolean).join(' ');
      
      if (layer.type === 'Text') {
        return `<div class="${classes}">${element.textContent}</div>`;
      } else {
        return `<div class="${classes}"></div>`;
      }
    }).join('\n    ');
  }

  rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return '#000000';
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb;
    
    const [, r, g, b] = match;
    return `#${((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1)}`;
  }
}