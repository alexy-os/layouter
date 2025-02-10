export class ExportManager {
  constructor(layerManager, layoutManager) {
    this.layerManager = layerManager;
    this.layoutManager = layoutManager;

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
    const sections = this.layerManager.getLayers()
      .filter(layer => layer.type === 'section')
      .map(layer => layer.element);
      
    const content = this.generateTailwindHtml(sections);
    
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

  generateTailwindHtml(sections) {
    const sectionsHtml = sections.map(section => {
      return this.processSectionHtml(section);
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Layout</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  ${sectionsHtml}
</body>
</html>`;
  }

  processSectionHtml(section) {
    // Get section classes excluding utility classes
    const sectionClasses = Array.from(section.classList)
      .filter(cls => !cls.includes('layer') && !cls.includes('active'))
      .join(' ');

    // Process container
    const container = section.querySelector('.container');
    const containerContent = this.processContainer(container);

    return `
  <section class="${sectionClasses}">
    ${containerContent}
  </section>`;
  }

  processContainer(container) {
    const containerClasses = Array.from(container.classList).join(' ');
    const gridElement = container.querySelector('.grid');
    const gridContent = this.processGrid(gridElement);

    return `
    <div class="${containerClasses}">
      ${gridContent}
    </div>`;
  }

  processGrid(grid) {
    const gridClasses = Array.from(grid.classList).join(' ');
    const columns = Array.from(grid.children).map(column => {
      return this.processColumn(column);
    }).join('\n');

    return `
      <div class="${gridClasses}">
        ${columns}
      </div>`;
  }

  processColumn(column) {
    const columnClasses = Array.from(column.classList)
      .filter(cls => !cls.includes('active'))
      .join(' ');
    
    const elements = Array.from(column.children)
      .map(element => this.processElement(element))
      .join('\n');

    return `
        <div class="${columnClasses}">
          ${elements}
        </div>`;
  }

  processElement(element) {
    // Convert inline styles to Tailwind classes where possible
    const tailwindClasses = this.convertStylesToTailwind(element);
    const content = element.classList.contains('text-layer') ? element.textContent : '';

    return `          <div class="${tailwindClasses}">${content}</div>`;
  }

  convertStylesToTailwind(element) {
    const classes = [];
    const style = element.style;
    
    // Position
    if (style.position) classes.push('absolute');
    if (style.left) classes.push(`left-[${Math.round(parseFloat(style.left))}px]`);
    if (style.top) classes.push(`top-[${Math.round(parseFloat(style.top))}px]`);
    
    // Dimensions
    if (style.width) classes.push(`w-[${Math.round(parseFloat(style.width))}px]`);
    if (style.height) classes.push(`h-[${Math.round(parseFloat(style.height))}px]`);
    
    // Background
    if (style.backgroundColor) {
      const twColor = element.dataset.twColor;
      classes.push(twColor ? `bg-${twColor}` : `bg-[${style.backgroundColor}]`);
    }
    
    // Border radius
    const radiusClass = Array.from(element.classList)
      .find(cls => cls.startsWith('rounded-'));
    if (radiusClass) classes.push(radiusClass);
    
    // Z-index
    if (element.dataset.zIndex) {
      classes.push(`z-[${element.dataset.zIndex}]`);
    }
    
    return classes.join(' ');
  }

  rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return '#000000';
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb;
    
    const [, r, g, b] = match;
    return `#${((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1)}`;
  }
}