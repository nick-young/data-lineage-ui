import React from 'react';
import { NodeProps } from 'reactflow';

// Define TextAnnotationData or import from types.ts
export interface TextAnnotationData {
  text: string;
  // Add other relevant fields if needed
}

// Placeholder TextAnnotationNode
const TextAnnotationNode: React.FC<NodeProps<TextAnnotationData>> = ({ data }) => {
  console.log("TextAnnotationNode rendered (placeholder)", { data });
  return (
    <div style={{ padding: '5px', border: '1px dashed grey', fontSize: '10px', background: '#f0f0f0' }}>
      {/* Placeholder rendering */} 
      <p>Text Annotation (Placeholder)</p>
      <p>{data?.text || 'No text'}</p>
    </div>
  );
};

export default TextAnnotationNode; 