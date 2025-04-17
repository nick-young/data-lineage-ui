import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// Define expected data structure for the node
interface NodeData {
  label: string;
  type: string; // e.g., 'Database Table', 'API', etc.
  // Add other properties from PRD as needed later
}

// Basic styling (can be expanded)
const nodeStyle: React.CSSProperties = {
  border: '1px solid #777',
  padding: 10,
  borderRadius: 5,
  background: 'white',
  minWidth: 150,
  textAlign: 'center',
  color: '#333',
};

const CustomNode: React.FC<NodeProps<NodeData>> = ({ data }) => {
  // Placeholder for icon logic - displays type name for now
  const typeRepresentation = data.type; 

  return (
    <div style={nodeStyle}>
      {/* Input handle */}
      <Handle type="target" position={Position.Left} />
      
      {/* Node Content */}
      <div>
        <div style={{ marginBottom: 5, fontWeight: 'bold' }}>{typeRepresentation}</div>
        <div>{data.label}</div>
      </div>

      {/* Output handle */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

// Use memo for performance optimization
export default memo(CustomNode); 