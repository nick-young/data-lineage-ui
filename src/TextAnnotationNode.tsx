import React, { useState, useCallback, useEffect } from 'react';
import { NodeProps, NodeResizer, useUpdateNodeInternals, useReactFlow } from 'reactflow';
import { NodeData } from './App';

// Define TextAnnotationData or import from types.ts
export interface TextAnnotationData extends NodeData {
  text: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  fontColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  textDecoration?: 'none' | 'underline';
  bgColor?: string;
  width?: number;
  height?: number;
  // Add other relevant fields if needed
}

const TextAnnotationNode: React.FC<NodeProps<TextAnnotationData>> = ({ 
  data, 
  selected,
  id,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text || '');
  const updateNodeInternals = useUpdateNodeInternals();
  const { setNodes } = useReactFlow();
  
  // Sync internal text state with node data
  useEffect(() => {
    setText(data.text || '');
  }, [data.text]);
  
  // Update node internals when dimensions change
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, data.width, data.height, updateNodeInternals]);

  // Custom function to update node data since setNodeData isn't available in props
  const updateNodeData = useCallback((nodeId: string, newData: Partial<TextAnnotationData>) => {
    setNodes(nodes => 
      nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData
            }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    // Save the text to the node data
    if (data.text !== text) {
      updateNodeData(id, { text });
    }
  }, [text, data.text, id, updateNodeData]);

  const handleResize = useCallback((_: any, params: { width: number; height: number }) => {
    const { width, height } = params;
    updateNodeData(id, { width, height });
  }, [id, updateNodeData]);

  // Vertical alignment styles
  let alignItems = 'flex-start'; // Default for top alignment
  if (data.verticalAlign === 'middle') alignItems = 'center';
  if (data.verticalAlign === 'bottom') alignItems = 'flex-end';

  // Create a style object based on TextAnnotationData properties
  const textStyle = {
    fontSize: `${data.fontSize || 14}px`,
    fontWeight: data.fontWeight || 'normal',
    fontStyle: data.fontStyle || 'normal',
    color: data.fontColor || '#000000',
    textAlign: data.textAlign || 'left',
    textDecoration: data.textDecoration || 'none',
    backgroundColor: data.bgColor || 'transparent',
    padding: '8px',
    minWidth: '100px',
    minHeight: '50px',
    width: '100%',
    height: '100%',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    boxSizing: 'border-box' as 'border-box',
    display: 'flex',
    alignItems,
    justifyContent: data.textAlign === 'center' ? 'center' : 
                   data.textAlign === 'right' ? 'flex-end' : 'flex-start',
    outline: 'none',
    overflow: 'visible',
  } as React.CSSProperties;

  return (
    <>
      {selected && (
        <NodeResizer 
          minWidth={50} 
          minHeight={30}
          onResize={handleResize}
          isVisible={selected}
          lineClassName="border-blue-400"
          handleClassName="h-3 w-3 border-2 border-blue-400 bg-white"
        />
      )}
      <div 
        className={`text-annotation-node ${selected ? 'selected' : ''}`}
        onDoubleClick={handleDoubleClick}
        style={{
          width: data.width ? `${data.width}px` : '150px',
          height: data.height ? `${data.height}px` : '80px',
          border: 'none',
          borderRadius: '0',
          background: data.bgColor || 'transparent',
          position: 'relative',
          outline: selected ? '1px dashed #1a192b' : 'none',
          boxShadow: 'none',
        }}
      >
        <div 
          style={{
            ...textStyle,
            boxShadow: 'none',
          }}
        >
          {isEditing ? (
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={handleBlur}
              className="w-full h-full min-h-[60px] border-0 bg-transparent outline-none resize-none shadow-none"
              style={{
                fontSize: textStyle.fontSize,
                fontWeight: textStyle.fontWeight,
                fontStyle: textStyle.fontStyle,
                color: textStyle.color,
                textAlign: textStyle.textAlign as any,
                textDecoration: textStyle.textDecoration,
              }}
            />
          ) : (
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {data.text || 'Text Annotation'}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TextAnnotationNode; 