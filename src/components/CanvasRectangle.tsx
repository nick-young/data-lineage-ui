// This file will be deprecated in favor of using ReactFlow nodes for rectangles.
// The RectangleData interface is exported for backward compatibility.

export interface RectangleData {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
  label?: string;
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: string;
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  fontColor?: string;
}

// Note: The main implementation of rectangle functionality is now in src/components/ShapeNode.tsx
// This file is kept for the RectangleData interface which may be used elsewhere in the codebase. 