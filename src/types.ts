import type { Node } from 'reactflow';

// Base interface for all node data
export interface NodeData {
  label: string;
}

// Placeholder for column info
export interface ColumnInfo {
  name: string;
  type: string;
}

export interface TableNodeData extends NodeData {
  columns: ColumnInfo[];
}

export interface TextAnnotationData extends NodeData {
  text: string;
}

// New interface for Edge Label Node data
export interface EdgeLabelData extends NodeData {
  text: string;
  edgeId: string; // ID of the edge this label belongs to
  offset?: { dx: number; dy: number }; // Optional offset from the edge center
  startEditing?: boolean; // Flag to trigger edit mode on creation
}

// Generic Node type using our data interfaces
export type CustomNode = Node<TableNodeData | TextAnnotationData | EdgeLabelData>; 