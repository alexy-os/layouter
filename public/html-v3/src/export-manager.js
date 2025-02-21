export class ExportManager {
  static utilityClasses = {
    layer: [
      'layer',
      'draggable',
      'selected',
      'active',
      'border-2',
      'border-dashed',
      'border-slate-200',
      'dark:border-slate-700',
      'bg-transparent',
      'rounded-lg',
      'cursor-move',
      'cursor-pointer',
      'cursor-default',
      'cursor-text',
      'pointer-events-none'
    ],
    canvas: [
      'border-2',
      'border-dashed', 
      'border-slate-200',
      'dark:border-slate-700',
      'bg-transparent',
      'rounded-lg',
      'active',
      'cursor-pointer',
      'cursor-default'
    ]
  };

  constructor(layerManager, registryManager) {
    this.layerManager = layerManager;
    this.registryManager = registryManager;

    this.exportHtmlBtn = document.getElementById('exportHtmlBtn');
    this.initializeExport();
  }

  initializeExport() {
    this.exportHtmlBtn.addEventListener('click', () => {
      if (this.validateBeforeExport()) {
        this.exportToHtml();
      } else {
        this.showNotification('Select <Layer Type> for all layers before export', true);
      }
    });
  }

  validateBeforeExport() {
    const allCanvases = document.querySelectorAll('[data-canvas]');
    let allLayersValid = true;

    allCanvases.forEach(canvas => {
      const layerElements = canvas.querySelectorAll('.layer');
      layerElements.forEach(layer => {
        const layerId = layer.dataset.id;
        const layerType = this.registryManager.getLayerType(layerId);
        if (!layerType) {
          allLayersValid = false;
        }
      });
    });

    return allLayersValid;
  }

  exportToHtml() {
    const pattern = this.getCurrentPattern();
    if (!pattern) {
      this.showNotification('No pattern template found', true);
      return;
    }

    const container = document.createElement('div');
    container.innerHTML = pattern;

    container.querySelectorAll('[data-canvas]').forEach(canvas => {
      const canvasId = canvas.dataset.canvas;
      const originalCanvas = document.querySelector(`[data-canvas="${canvasId}"]`);
      
      if (originalCanvas) {
        const layers = Array.from(originalCanvas.querySelectorAll('.layer'))
          .map(layer => this.createCleanLayer(layer, originalCanvas))
          .filter(Boolean);

        canvas.innerHTML = '';
        layers.forEach(layer => canvas.appendChild(layer));
        canvas.removeAttribute('data-canvas');
        
        canvas.classList.remove('cursor-pointer', 'cursor-default', 'cursor-text');
      }
    });

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
  ${container.innerHTML}
</body>
</html>`;

    const formattedHtml = this.prettyHtml(fullHtml);
    this.downloadHtml(formattedHtml);
    this.showNotification('Layout successfully exported');
  }

  createCleanLayer(layer, canvas) {
    const layerType = this.registryManager.getLayerType(layer.dataset.id);
    if (!layerType) return null;

    const div = document.createElement('div');
    div.setAttribute('layer', layerType);
    
    div.classList.add('absolute');

    if (layer.dataset.type === 'text') {
      const textClasses = Array.from(layer.classList)
        .filter(cls => {
          return (cls.startsWith('text-') || cls.startsWith('font-')) && 
                 !ExportManager.utilityClasses.layer.includes(cls) &&
                 !cls.startsWith('cursor-') &&
                 cls.trim();
        });
      
      if (textClasses.length > 0) {
        div.classList.add(...textClasses);
      }
      
      const contentDiv = layer.querySelector('[contenteditable] div');
      if (contentDiv) {
        div.innerHTML = contentDiv.outerHTML;
      }
    } else {
      const bgClass = Array.from(layer.classList)
        .find(cls => cls.startsWith('bg-') && 
              !ExportManager.utilityClasses.layer.includes(cls)) || 'bg-blue-500';
      
      const roundedClass = Array.from(layer.classList)
        .find(cls => cls.startsWith('rounded-') && 
              !ExportManager.utilityClasses.layer.includes(cls));
      
      div.classList.add(bgClass);
      if (roundedClass) {
        div.classList.add(roundedClass);
      }
    }

    const rect = layer.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    const left = Math.round((rect.left - canvasRect.left) / canvasRect.width * 100);
    const top = Math.round((rect.top - canvasRect.top) / canvasRect.height * 100);
    const width = Math.round(rect.width / canvasRect.width * 100);
    const height = Math.round(rect.height / canvasRect.height * 100);

    div.classList.add(
      `left-[${left}%]`,
      `top-[${top}%]`,
      `w-[${width}%]`,
      `h-[${height}%]`
    );

    return div;
  }

  getCurrentPattern() {
    const canvas = document.getElementById('canvas');
    if (!canvas?.firstElementChild) return null;

    const pattern = canvas.firstElementChild.cloneNode(true);
    
    pattern.querySelectorAll('[data-canvas]').forEach(canvas => {
      ExportManager.utilityClasses.canvas.forEach(cls => {
        canvas.classList.remove(cls);
      });
    });

    return pattern.outerHTML;
  }

  downloadHtml(html) {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'layout.html';
    a.click();
    URL.revokeObjectURL(url);
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

  prettyHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html.trim();
    
    this.formatNode(div, 0);
    
    return div.innerHTML
      .replace(/^/, '<!DOCTYPE html>\n')
      .replace(/^\s*[\r\n]/gm, '')
      .replace(/^/g, '\n')
      .replace(/\n\s*\n/g, '\n');
  }

  formatNode(node, level) {
    const indentBefore = new Array(level++ + 1).join('  ');
    const indentAfter = new Array(level - 1).join('  ');
    let textNode;

    for (let i = 0; i < node.children.length; i++) {
      textNode = document.createTextNode('\n' + indentBefore);
      node.insertBefore(textNode, node.children[i]);

      this.formatNode(node.children[i], level);

      if (node.lastElementChild === node.children[i]) {
        textNode = document.createTextNode('\n' + indentAfter);
        node.appendChild(textNode);
      }
    }

    return node;
  }
}