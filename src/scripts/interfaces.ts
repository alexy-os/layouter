export interface Layer {
  id: string;
  name: string;
  type: 'rectangle' | 'text';
  element: HTMLElement;
  visible: boolean;
  opacity: number;
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

export interface LayerManager {
  isWithinActiveCanvas(x: number, y: number): boolean;
  getLayers(): Layer[];
  getSelectedLayer(): Layer | null;
  createRectangleLayer(x: number, y: number, width: number, height: number): Layer;
  createTextLayer(x: number, y: number): Layer;
  addLayer(layer: Layer): void;
  removeLayer(layer: Layer): void;
  selectLayer(layer: Layer | null): void;
  setActiveCanvas(canvas: HTMLElement): void;
  clearLayers(): void;
  getLayerCount(): number;
}

export interface Registry {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface RegistryManager {
  saveState(type: string, data: Record<string, any>): void;
  loadState(type: string): Record<string, any> | null;
  clearState(type: string): void;
  getEntries(type?: string): Registry[];
  removeEntry(id: string): void;
}

export interface PropertyChangeEvent {
  layer: Layer;
  property: string;
  value: any;
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

export interface ExportSettings {
  format: string;
  quality: number;
  scale: number;
  includeBackground: boolean;
}

export interface PropertyManager {
  setCurrentLayer(layer: Layer | null): void;
} 