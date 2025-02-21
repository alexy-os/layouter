export interface Layer {
  id: string;
  name: string;
  type: 'rectangle' | 'text';
  element: HTMLElement;
  visible: boolean;
  opacity: number;
}

export interface Tool {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  settings: Record<string, any>;
}

export interface PatternData {
  id: string;
  name: string;
  type: string;
  template: string;
  parameters?: Record<string, any>;
}

export type PatternId = 'fullscreen' | 'fullscreenSplit' | 'single' | 'split' | 'columns' | 'grid' | 'headerAndFourColumns';

export interface PatternPreview {
  label: string;
  preview: string;
}

export interface ExportSettings {
  format: string;
  quality: number;
  scale: number;
  includeBackground: boolean;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  colors: Record<string, string>;
  fonts: Record<string, string>;
}

export interface ValidationRule {
  field: string;
  type: string;
  message: string;
  validator: (value: any) => boolean;
}

export interface Registry {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface PropertyManager {
  setCurrentLayer(layer: Layer | null): void;
}

export interface RegistryManager {
  saveState(type: string, data: Record<string, any>): void;
  loadState(type: string): Record<string, any> | null;
  clearState(type: string): void;
  getEntries(type?: string): Registry[];
  removeEntry(id: string): void;
}

export interface EventHandlerOptions {
  canvas: HTMLElement;
  layerManager: LayerManager;
  toolManager: ToolManager;
  propertyManager: PropertyManager;
}

export interface LayerManager {
  getLayers(): Layer[];
  addLayer(layer: Layer): void;
  removeLayer(layer: Layer): void;
  createRectangleLayer(x: number, y: number, width: number, height: number): Layer;
  createTextLayer(x: number, y: number): Layer;
  isWithinActiveCanvas(x: number, y: number): boolean;
  setActiveCanvas(canvas: HTMLElement): void;
  selectLayer(layer: Layer | null): void;
  getSelectedLayer(): Layer | null;
}

export interface ToolManager {
  getCurrentTool(): string;
  setGridSize(size: number): void;
  getGridSize(): number;
  snapToGrid(value: number): number;
  isDeleteTool(): boolean;
  isRectangleTool(): boolean;
  isTextTool(): boolean;
  propertyManager: PropertyManager | null;
}

export interface PropertyChangeEvent {
  layer: Layer;
  property: string;
  value: any;
}

export interface EventHandlers {
  handleCanvasMouseDown(e: MouseEvent): void;
  setTool(tool: 'rectangle' | 'text' | 'select' | 'delete'): void;
} 