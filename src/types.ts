import { Node } from 'reactflow';

// Base interface for all node data
export interface NodeData {
  label: string;
  entity?: string;
  type?: string;
  subType?: string;
  domain?: string;
  owner?: string;
  description?: string;
  transformations?: string;
  filters?: string;
  bgColor?: string; // CSS color for background
  borderColor?: string; // CSS color for border
  palette?: string; // Optional: Name of a predefined palette
}

// Interface for column information
export interface ColumnInfo {
  name: string;
  dataType: string;
  description?: string;
}

// Define a generic type for custom nodes
export type CustomNode<T extends NodeData = NodeData> = Node<T>;

// Edge label node data type
export interface EdgeLabelData extends NodeData {
  text: string;
  edgeId: string;
  offset?: {
    dx: number;
    dy: number;
  };
  startEditing?: boolean;
}

export interface TableNodeData extends NodeData {
  columns: ColumnInfo[];
}

export interface TextAnnotationData extends NodeData {
  text: string;
} 