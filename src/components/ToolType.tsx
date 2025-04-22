export type ToolType = 'navigate' | 'node' | 'rectangle' | 'text' | 'layout' | 'connect';

export const toolLabels: Record<ToolType, string> = {
  navigate: 'Navigate',
  node: 'Add Node',
  rectangle: 'Rectangle',
  text: 'Text',
  layout: 'Auto Layout',
  connect: 'Connect',
}; 