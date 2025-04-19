import React, { useState, useEffect } from 'react';
import { useReactFlow, NodeProps } from 'reactflow';
import { EdgeLabelData } from './types';

// Basic styling for the node
const nodeStyle: React.CSSProperties = {
  background: 'transparent',
  padding: '2px 5px',
  fontSize: '10px',
  border: '1px solid transparent', // Invisible border initially
  borderRadius: '3px',
  minWidth: '30px', // Ensure it's clickable even when empty
  textAlign: 'center',
};

const selectedStyle: React.CSSProperties = {
  border: '1px solid transparent', // Keep it transparent when selected
};

const inputStyle: React.CSSProperties = {
  ...nodeStyle,
  width: '100%',
  boxSizing: 'border-box', // Include padding/border in width
  border: '1px solid #777',
  outline: 'none',
};

function EdgeLabelNode({ id, data, selected }: NodeProps<EdgeLabelData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(data.text || ''); // Use data.text
  const { setNodes } = useReactFlow();

  // Log state changes
  // console.log(`[EdgeLabelNode ${id}] Render - isEditing: ${isEditing}, selected: ${selected}`);

  // Update internal state if node data changes externally
  useEffect(() => {
    setCurrentText(data.text || '');
  }, [data.text]);

  // Effect to handle startEditing flag on mount
  useEffect(() => {
    if (data.startEditing) {
      setIsEditing(true);
      // Remove the flag from the node data once editing is initiated
      setNodes(nds =>
        nds.map(node => {
          if (node.id === id) {
            const newData = { ...node.data };
            delete newData.startEditing; // Remove the flag
            return { ...node, data: newData };
          }
          return node;
        })
      );
    }
  }, [id, data.startEditing, setNodes]); // Run once on mount if flag is present

  const handleDoubleClick = () => {
    // console.log(`[EdgeLabelNode ${id}] handleDoubleClick called`); // Log double-click
    setIsEditing(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentText(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Update the actual node data in the flow
    setNodes(nds =>
      nds.map(node => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, text: currentText } };
        }
        return node;
      })
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleBlur(); // Save on Enter
    }
    if (event.key === 'Escape') {
      setIsEditing(false);
      setCurrentText(data.text || ''); // Revert on Escape
    }
  };

  const combinedStyle = selected ? { ...nodeStyle, ...selectedStyle } : nodeStyle;

  return (
    // No handles needed for this node type
    <div
      style={combinedStyle}
      onDoubleClick={handleDoubleClick}
      className="nowheel nopan"
    >
      {isEditing ? (
        <input
          type="text"
          value={currentText}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={inputStyle}
          autoFocus
        />
      ) : (
        <div>{currentText || '...'}</div> // Display placeholder if empty
      )}
    </div>
  );
}

export default React.memo(EdgeLabelNode); 