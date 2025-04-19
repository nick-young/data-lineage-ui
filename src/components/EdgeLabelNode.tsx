import { FC, useCallback } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { EdgeLabelData } from '../types';

const EdgeLabelNode: FC<NodeProps<EdgeLabelData>> = ({ 
  data, 
  selected,
  id 
}) => {
  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    // Placeholder for future edit mode functionality
    console.log('Double clicked edge label:', id);
  }, [id]);

  return (
    <div 
      className={`edge-label-node ${selected ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      {data.text || 'Edge Label'}
    </div>
  );
};

export default EdgeLabelNode; 