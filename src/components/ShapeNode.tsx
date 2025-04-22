import React, { memo, useCallback, useState, useRef, MouseEvent as ReactMouseEvent } from 'react';
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
  fontColor?: string;
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
  fontColor: '#000000', // Default black text
};

const ShapeNode: React.FC<NodeProps<ShapeNodeData>> = ({ 
  data, 
  selected,
  id
}) => {
  const { setNodes } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [startDimensions, setStartDimensions] = useState({ width: 0, height: 0 });
  
  // Log data changes for debugging
  React.useEffect(() => {
    console.log(`ShapeNode ${id} data changed:`, data);
  }, [data, id]);
  
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

  // Detect if mouse is over border (within a threshold)
  const getBorderArea = (clientX: number, clientY: number) => {
    if (!nodeRef.current) return null;
    
    const rect = nodeRef.current.getBoundingClientRect();
    const borderWidth = data.borderWidth + 6; // Add a few pixels for easier grabbing
    
    const isNearLeftBorder = Math.abs(clientX - rect.left) <= borderWidth;
    const isNearRightBorder = Math.abs(clientX - rect.right) <= borderWidth;
    const isNearTopBorder = Math.abs(clientY - rect.top) <= borderWidth;
    const isNearBottomBorder = Math.abs(clientY - rect.bottom) <= borderWidth;
    
    // Determine resize direction
    if (isNearLeftBorder && isNearTopBorder) return 'nw';
    if (isNearRightBorder && isNearTopBorder) return 'ne';
    if (isNearLeftBorder && isNearBottomBorder) return 'sw';
    if (isNearRightBorder && isNearBottomBorder) return 'se';
    if (isNearLeftBorder) return 'w';
    if (isNearRightBorder) return 'e';
    if (isNearTopBorder) return 'n';
    if (isNearBottomBorder) return 's';
    
    return null;
  };

  // Mouse events for custom resizing
  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!isResizing || !resizeDirection) return;
    
    const dx = e.clientX - startPoint.x;
    const dy = e.clientY - startPoint.y;
    let newWidth = startDimensions.width;
    let newHeight = startDimensions.height;
    
    // Apply delta based on resize direction
    if (resizeDirection.includes('e')) {
      newWidth = Math.max(50, startDimensions.width + dx);
    } else if (resizeDirection.includes('w')) {
      newWidth = Math.max(50, startDimensions.width - dx);
    }
    
    if (resizeDirection.includes('s')) {
      newHeight = Math.max(30, startDimensions.height + dy);
    } else if (resizeDirection.includes('n')) {
      newHeight = Math.max(30, startDimensions.height - dy);
    }
    
    // Update node dimensions in real-time
    setNodes((nds) => 
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              width: newWidth,
              height: newHeight
            }
          };
        }
        return n;
      })
    );
  }, [isResizing, resizeDirection, startPoint, startDimensions, setNodes, id]);

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      setResizeDirection(null);
      
      // Ensure handles are positioned correctly after resize
      updateNodeInternals(id);
      
      // Clean up event listeners
      window.removeEventListener('mousemove', handleMouseMove as unknown as EventListener);
      window.removeEventListener('mouseup', handleMouseUp as unknown as EventListener);
    }
  }, [isResizing, handleMouseMove, updateNodeInternals, id]);

  const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (!selected) return;
    
    // Only handle mouse down if we're on the border
    const direction = getBorderArea(e.clientX, e.clientY);
    if (direction) {
      e.stopPropagation(); // Prevent dragging
      e.preventDefault();
      
      setIsResizing(true);
      setResizeDirection(direction);
      setStartPoint({ x: e.clientX, y: e.clientY });
      setStartDimensions({ width: data.width, height: data.height });
      
      // Add event listeners for resize
      window.addEventListener('mousemove', handleMouseMove as unknown as EventListener);
      window.addEventListener('mouseup', handleMouseUp as unknown as EventListener);
    }
  }, [selected, data.width, data.height, handleMouseMove, handleMouseUp, getBorderArea]);

  // Cursor styles for resize
  const getCursorStyle = () => {
    if (!selected) return 'default';
    
    // Get current mouse position
    const mousePosition = { x: 0, y: 0 };
    if (typeof window !== 'undefined') {
      // Cast window.event to MouseEvent to access clientX/clientY properties
      const evt = window.event as MouseEvent;
      mousePosition.x = evt?.clientX || 0;
      mousePosition.y = evt?.clientY || 0;
    }
    
    const direction = getBorderArea(mousePosition.x, mousePosition.y);
    
    switch (direction) {
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'nw':
      case 'se':
        return 'nwse-resize';
      default:
        return 'default';
    }
  };

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
    fill: data.fontColor || '#000000',
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
        ref={nodeRef}
        style={{ 
          width: data.width, 
          height: data.height, 
          backgroundColor: data.bgColor,
          border: `${data.borderWidth}px ${data.borderStyle} ${data.borderColor}`,
          borderRadius: '4px',
          position: 'relative',
          cursor: selected ? getCursorStyle() : 'default',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={() => {/* Trigger cursor update */}}
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
        <svg width={data.width} height={data.height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
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