import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer, useUpdateNodeInternals, useReactFlow } from 'reactflow';
import '@reactflow/node-resizer/dist/style.css';

export interface ShapeNodeData {
  width: number;
  height: number;
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
}

// Default values for properties when creating a new shape node
export const defaultShapeNodeData: ShapeNodeData = {
  width: 200,
  height: 150,
  label: '',
  bgColor: '#f0f9ff', // Light blue background
  borderColor: '#3b82f6', // Blue border
  borderWidth: 1,
  borderStyle: 'solid',
  textAlign: 'center',
  verticalAlign: 'middle',
  fontSize: 14,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
};

const ShapeNode: React.FC<NodeProps<ShapeNodeData>> = ({ 
  data, 
  selected,
  id
}) => {
  const { setNodes } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  
  // Create a dummy onResize function that satisfies the type requirements
  const onResize = useCallback((_event: any, _params: { width: number; height: number }) => {
    // Note: This function only updates the visual size during resize
    // The actual data update happens in the parent component via onResizeEnd
  }, []);
  
  // Add onResizeEnd handler to update the node data when resizing is complete
  const onResizeEnd = useCallback((_event: any, params: { width: number; height: number }) => {
    // Update the node data with new dimensions
    setNodes((nds) => 
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              width: params.width,
              height: params.height
            }
          };
        }
        return n;
      })
    );
    // Update node internals to ensure handles position correctly
    updateNodeInternals(id);
  }, [setNodes, id, updateNodeInternals]);

  // Calculate text positioning based on alignment
  const getTextAnchor = () => {
    switch (data.textAlign) {
      case 'left': return 'start';
      case 'right': return 'end';
      default: return 'middle';
    }
  };

  const getTextX = () => {
    switch (data.textAlign) {
      case 'left': return 10;
      case 'right': return data.width - 10;
      default: return data.width / 2;
    }
  };

  const getTextY = () => {
    switch (data.verticalAlign) {
      case 'top': return 20;
      case 'bottom': return data.height - 20;
      default: return data.height / 2;
    }
  };

  const getDominantBaseline = () => {
    switch (data.verticalAlign) {
      case 'top': return 'text-before-edge';
      case 'bottom': return 'text-after-edge';
      default: return 'middle';
    }
  };

  // Text style based on data properties
  const textStyle = {
    fontFamily: data.fontFamily,
    fontSize: `${data.fontSize}px`,
    fontWeight: data.fontWeight,
    fontStyle: data.fontStyle,
    textDecoration: data.textDecoration,
    fill: '#000000', // Text color
  };

  return (
    <>
      <NodeResizer 
        minWidth={50} 
        minHeight={30} 
        isVisible={selected} 
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        lineClassName="border-blue-400"
        handleClassName="h-3 w-3 border-2 border-blue-400 bg-white"
      />
      <div 
        style={{ 
          width: data.width, 
          height: data.height, 
          backgroundColor: data.bgColor,
          border: `${data.borderWidth}px ${data.borderStyle} ${data.borderColor}`,
          borderRadius: '4px',
          position: 'relative',
        }}
      >
        {/* Top handle */}
        <Handle
          type="source"
          position={Position.Top}
          style={{ background: data.borderColor }}
          id="top"
          isConnectable={true}
        />
        {/* Bottom handle */}
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: data.borderColor }}
          id="bottom"
          isConnectable={true}
        />
        {/* Left handle */}
        <Handle
          type="source"
          position={Position.Left}
          style={{ background: data.borderColor }}
          id="left"
          isConnectable={true}
        />
        {/* Right handle */}
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: data.borderColor }}
          id="right"
          isConnectable={true}
        />
        
        {/* Using SVG for text to support all alignments easily */}
        <svg width={data.width} height={data.height} style={{ position: 'absolute', top: 0, left: 0 }}>
          <text
            x={getTextX()}
            y={getTextY()}
            textAnchor={getTextAnchor()}
            dominantBaseline={getDominantBaseline()}
            style={textStyle}
          >
            {data.label}
          </text>
        </svg>
      </div>
    </>
  );
};

export default memo(ShapeNode); 