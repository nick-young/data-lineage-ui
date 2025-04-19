import React, { useState, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { NodeData } from './App';

// Define TextAnnotationData or import from types.ts
export interface TextAnnotationData extends NodeData {
  text: string;
  // Add other relevant fields if needed
}

const TextAnnotationNode: React.FC<NodeProps<TextAnnotationData>> = ({ 
  data, 
  selected 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text || '');

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    // Here you would handle saving the text to the node data
    console.log("Annotation text saved:", text);
  }, [text]);

  return (
    <div 
      className={`text-annotation-node ${selected ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          className="w-full min-h-[60px] border-0 bg-transparent outline-none resize-none"
        />
      ) : (
        <div>{data.text || 'Text Annotation'}</div>
      )}
    </div>
  );
};

export default TextAnnotationNode; 