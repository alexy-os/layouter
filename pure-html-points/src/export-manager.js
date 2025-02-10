export class ExportManager {
  constructor(layerManager) {
    this.layerManager = layerManager;
  }

  exportToHtml() {
    const layers = this.layerManager.getLayers();
    
    // Generate HTML content with proper styling
    const content = this.generateHtmlContent(layers);
    
    // Create download link
    const blob = new Blob([content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'layout.html';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  generateHtmlContent(layers) {
    const styles = this.generateStyles();
    const layersHtml = this.generateLayersHtml(layers);

    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Exported Layout</title>
  <style>
    ${styles}
  </style>
</head>
<body>
  <div class="canvas">
    ${layersHtml}
  </div>
</body>
</html>`;
  }

  generateStyles() {
    return `
      body, html {
        margin: 0;
        padding: 0;
        height: 100%;
      }
      
      .canvas {
        position: relative;
        width: 100%;
        height: 100vh;
        background-color: #ffffff;
      }
      
      .layer {
        position: absolute;
        box-sizing: border-box;
      }
      
      .text-layer {
        white-space: pre-wrap;
        overflow-wrap: break-word;
      }
    `;
  }

  generateLayersHtml(layers) {
    return layers.map(layer => {
      const element = layer.element;
      const styles = window.getComputedStyle(element);
      
      // Extract essential styles
      const essentialStyles = {
        left: styles.left,
        top: styles.top,
        width: styles.width,
        height: styles.height,
        backgroundColor: styles.backgroundColor,
        borderRadius: styles.borderRadius,
        padding: styles.padding,
        zIndex: styles.zIndex
      };
      
      // Build inline style string
      const styleString = Object.entries(essentialStyles)
        .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
        .join('; ');
      
      // Generate HTML based on layer type
      if (layer.type === 'Text') {
        return `<div class="layer text-layer" style="${styleString}">${element.textContent}</div>`;
      } else {
        return `<div class="layer" style="${styleString}"></div>`;
      }
    }).join('\n    ');
  }

  camelToKebab(string) {
    return string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }
}