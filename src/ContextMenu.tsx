import React, { useCallback, useEffect, useRef } from 'react';
import { Edge } from 'reactflow';

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'node' | 'edge' | 'pane';
  id?: string;
  onClose: () => void;
  onAddNode: () => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onAddLabel: (event: React.MouseEvent, edge: Edge) => void;
  selectedEdge: Edge | null;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  type,
  id,
  onClose,
  onAddNode,
  onDeleteNode,
  onDeleteEdge,
  onAddLabel,
  selectedEdge,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Element)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle keyboard escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Style for positioning the menu
  const style: React.CSSProperties = {
    position: 'absolute',
    top: y,
    left: x,
    zIndex: 1000,
  };

  const handleAddLabel = useCallback(() => {
    if (selectedEdge && type === 'edge') {
      onAddLabel({} as React.MouseEvent, selectedEdge);
      onClose();
    }
  }, [selectedEdge, type, onAddLabel, onClose]);

  const handleDeleteNode = useCallback(() => {
    if (id && type === 'node') {
      onDeleteNode(id);
      onClose();
    }
  }, [id, type, onDeleteNode, onClose]);

  const handleDeleteEdge = useCallback(() => {
    if (id && type === 'edge') {
      onDeleteEdge(id);
      onClose();
    }
  }, [id, type, onDeleteEdge, onClose]);

  const renderOptions = () => {
    switch (type) {
      case 'node':
        return (
          <>
            <div 
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={handleDeleteNode}
            >
              Delete node
            </div>
          </>
        );
      case 'edge':
        return (
          <>
            <div 
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={handleAddLabel}
            >
              Add label
            </div>
            <div 
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={handleDeleteEdge}
            >
              Delete edge
            </div>
          </>
        );
      case 'pane':
      default:
        return (
          <div 
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              onAddNode();
              onClose();
            }}
          >
            Add node
          </div>
        );
    }
  };

  return (
    <div
      ref={menuRef}
      className="bg-white shadow-md rounded min-w-[150px] border border-gray-200 overflow-hidden"
      style={style}
    >
      {renderOptions()}
    </div>
  );
};

export default ContextMenu; 