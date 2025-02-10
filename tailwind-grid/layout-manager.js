export class LayoutManager {
  constructor(canvas, layerManager) {
    this.canvas = canvas;
    this.layerManager = layerManager;
    
    // Layout templates
    this.templates = {
      blank: {
        name: 'Blank Section',
        className: 'w-full py-12',
        structure: {
          container: {
            className: 'container mx-auto px-4',
            content: {
              grid: {
                className: 'grid grid-cols-1 gap-8',
                columns: [
                  { className: 'flex flex-col' }
                ]
              }
            }
          }
        }
      },
      hero: {
        name: 'Hero Section',
        className: 'w-full py-12',
        structure: {
          container: {
            className: 'container mx-auto px-4',
            content: {
              grid: {
                className: 'grid grid-cols-2 gap-8',
                columns: [
                  {
                    className: 'flex flex-col justify-center'
                  },
                  {
                    className: 'flex items-center justify-center'
                  }
                ]
              }
            }
          }
        }
      },
      features: {
        name: 'Features Grid',
        className: 'w-full py-12',
        structure: {
          container: {
            className: 'container mx-auto px-4',
            content: {
              grid: {
                className: 'grid grid-cols-3 gap-8',
                columns: [
                  { className: 'flex flex-col' },
                  { className: 'flex flex-col' },
                  { className: 'flex flex-col' }
                ]
              }
            }
          }
        }
      }
    };
  }

  createSection(templateName = 'blank') {
    const template = this.templates[templateName];
    if (!template) return null;

    // Create section
    const section = document.createElement('section');
    section.classList.add('layer', 'section-layer');
    section.classList.add(...template.className.split(' '));
    section.dataset.type = 'section';
    
    // Create container
    const container = document.createElement('div');
    container.classList.add(...template.structure.container.className.split(' '));
    container.dataset.type = 'container';
    
    // Create grid
    const grid = document.createElement('div');
    grid.classList.add(...template.structure.container.content.grid.className.split(' '));
    grid.dataset.type = 'grid';
    
    // Add columns if specified
    if (template.structure.container.content.grid.columns) {
      template.structure.container.content.grid.columns.forEach(column => {
        const div = document.createElement('div');
        div.classList.add(...column.className.split(' '));
        div.classList.add('min-h-[50vh]'); // Add minimum height to columns
        div.dataset.type = 'column';
        grid.appendChild(div);
      });
    }
    
    container.appendChild(grid);
    section.appendChild(container);
    
    return section;
  }
}