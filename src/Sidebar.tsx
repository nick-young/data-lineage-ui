import React, { useMemo, useCallback, useState } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData, EdgeData } from './App';
import { RectangleData } from './components/CanvasRectangle';
import { TextAnnotationData } from './TextAnnotationNode';
import { ToolType } from './components/ToolType';
import { version } from '../package.json'; // Corrected import path
// Import palette helpers and preview component
import { NodePalette, getPaletteByName, nodePalettes } from './config/nodePalettes';
import PalettePreviewNode from './config/PalettePreviewNode';
import DownloadButton from './DownloadButton';

// Define the expected data structure for the selected node
/* 
interface NodeData { ... } 
interface EdgeData { ... }
*/

export interface SidebarProps {
  isSidebarVisible?: boolean;
  selectedNodes?: Node<NodeData>[];
  selectedEdge?: Edge<EdgeData> | null;
  nodes?: Node<NodeData>[];
  edges?: Edge<EdgeData>[];
  setEdges?: React.Dispatch<React.SetStateAction<Edge<EdgeData>[]>>;
  onAddNodeClick?: () => void;
  onSaveFlow?: () => void;
  onLoadFlowTrigger?: () => void;
  onLayoutNodesClick?: (direction: string) => void;
  onReturnToLanding?: () => void;
  selectedRectangle?: RectangleData | null;
  selectedTextAnnotation?: TextAnnotationData | null;
  activeTool?: ToolType;
  onToolChange?: (tool: ToolType) => void;
  setNodes?: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>;
  handleTextUpdate?: (property: string, value: any) => void;
}

// --- Constants ---
export const SIDEBAR_WIDTH = 280;
export const COLLAPSED_WIDTH = 0; // Sidebar truly collapses

// Component for clickable section header
const ClickableHeader: React.FC<{ title: string; isExpanded: boolean; onClick: () => void }> = 
  ({ title, isExpanded, onClick }) => (
  <div onClick={onClick} className="mb-4 flex cursor-pointer items-center justify-between border-b border-gray-200 pb-2 select-none">
    <h3 className="text-base font-semibold text-gray-800">{title}</h3>
    <span className={`ml-2 text-xs transition-transform duration-200 ease-in-out ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>▶</span>
  </div>
);

// Icon Button component for tool buttons
interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, label, onClick, isActive = false }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded transition-colors duration-150 ease-in-out ${
      isActive ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-50 text-gray-700'
    }`}
  >
    <div className="mb-1">{icon}</div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

// Define SVG icons for buttons
const Icons = {
  Navigate: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
      <path d="M402-40q-30 0-56-13.5T303-92L48-465l24-23q19-19 45-22t47 12l116 81v-383q0-17 11.5-28.5T320-840q17 0 28.5 11.5T360-800v537L212-367l157 229q5 8 14 13t19 5h278q33 0 56.5-23.5T760-200v-560q0-17 11.5-28.5T800-800q17 0 28.5 11.5T840-760v560q0 66-47 113T680-40H402Zm38-440v-400q0-17 11.5-28.5T480-920q17 0 28.5 11.5T520-880v400h-80Zm160 0v-360q0-17 11.5-28.5T640-880q17 0 28.5 11.5T680-840v360h-80ZM486-300Z" />
    </svg>
  ),
  AddNode: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h360v80H200v560h560v-360h80v360q0 33-23.5 56.5T760-120H200Zm120-160v-80h320v80H320Zm0-120v-80h320v80H320Zm0-120v-80h320v80H320Zm360-80v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z" />
    </svg>
  ),
  Rectangle: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M5 4a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H5zm0 2h10v8H5V6z" clipRule="evenodd" />
    </svg>
  ),
  Text: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
      <path d="M280-160v-520H80v-120h520v120H400v520H280Zm360 0v-320H520v-120h360v120H760v320H640Z" />
    </svg>
  ),
  Layout: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
      <path d="M720-140 560-300l160-160 56 56-63 64h167v80H713l63 64-56 56Zm-560-20q-33 0-56.5-23.5T80-240v-120q0-33 23.5-56.5T160-440h240q33 0 56.5 23.5T480-360v120q0 33-23.5 56.5T400-160H160Zm0-80h240v-120H160v120Zm80-260-56-56 63-64H80v-80h167l-63-64 56-56 160 160-160 160Zm320-20q-33 0-56.5-23.5T480-600v-120q0-33 23.5-56.5T560-800h240q33 0 56.5 23.5T880-720v120q0-33-23.5 56.5T800-520H560Zm0-80h240v-120H560v120ZM400-240v-120 120Zm160-360v-120 120Z" />
    </svg>
  ),
  Home: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  ),
  PNG: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
    </svg>
  ),
  Save: (
    <svg className="w-5 h-5" stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  ),
  Load: (
    <svg className="w-5 h-5" stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
};

// Main Sidebar Component
const Sidebar: React.FC<SidebarProps> = (props) => {
  // Destructure props with safe defaults
  const { 
    isSidebarVisible = true,
    selectedNodes = [],
    selectedEdge,
    nodes = [],
    edges = [],
    setEdges,
    onSaveFlow,
    onLoadFlowTrigger,
    onReturnToLanding,
    selectedRectangle = null,
    selectedTextAnnotation,
    activeTool = 'navigate',
    onToolChange,
    setNodes,
    handleTextUpdate,
  } = props;
  
  // State for expanding/collapsing sections
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    description: true,
    transformations: true,
    filters: true,
    inputs: true,
    outputs: true,
    connections: true,
    tools: true,
  });

  // Toggle section visibility
  const toggleSection = useCallback((sectionName: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  }, []);
  
  // Function to update rectangle properties
  const handleRectangleUpdate = useCallback((property: string, value: any) => {
    if (!selectedRectangle || !selectedRectangle.id) return;
    
    console.log(`Updating rectangle property: ${property} to value: ${value} for node: ${selectedRectangle.id}`);
    
    // Find the node in nodes array
    if (setNodes && typeof setNodes === 'function') {
      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === selectedRectangle.id && node.type === 'shape') {
            // Log the node before update
            console.log('Node before update:', node);
            
            // Update the specific property in node data
            const updatedNode = {
              ...node,
              data: {
                ...node.data,
                [property]: value
              }
            };
            
            // Log the node after update
            console.log('Node after update:', updatedNode);
            
            return updatedNode;
          }
          return node;
        })
      );
    }
  }, [selectedRectangle, setNodes]);

  // Memoized calculation of input/output nodes
  const { inputs, outputs } = useMemo(() => {
    // Default to empty arrays
    let inputs: Node<NodeData>[] = [];
    let outputs: Node<NodeData>[] = [];
    
    // Ensure we have a single selected node and valid nodes/edges arrays
    if (selectedNodes.length === 1 && nodes && edges) {
      const selectedId = selectedNodes[0].id;
      
      // Collect input nodes
      inputs = edges
        .filter(edge => edge.target === selectedId)
        .map(edge => {
          const sourceNode = nodes.find(node => node.id === edge.source);
          return sourceNode ? sourceNode : null;
        })
        .filter((node): node is Node<NodeData> => node !== null);
      
      // Collect output nodes  
      outputs = edges
        .filter(edge => edge.source === selectedId)
        .map(edge => {
          const targetNode = nodes.find(node => node.id === edge.target);
          return targetNode ? targetNode : null;
        })
        .filter((node): node is Node<NodeData> => node !== null);
    }
    
    return { inputs, outputs };
  }, [selectedNodes, nodes, edges]);

  // Callback to update edge details
  const handleEdgeDetailsChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedEdge || !setEdges) return;
    const newDetails = event.target.value;
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === selectedEdge.id) {
          // Ensure edge.data exists and treat it as any to avoid TypeScript errors
          return { ...edge, data: { ...(edge.data || {}), details: newDetails } };
        }
        return edge;
      })
    );
  }, [selectedEdge, setEdges]);

  // Calculate dynamic width class
  const widthClass = isSidebarVisible ? `w-[${SIDEBAR_WIDTH}px]` : 'w-0'; // Use w-0 when collapsed

  // Calculate palette for the selected node preview
  const nodePreviewPalette: NodePalette | undefined = useMemo(() => {
    if (selectedNodes.length === 1 && nodes && edges) {
      const selectedNode = selectedNodes[0].data;

      if (selectedNode.palette) {
        return getPaletteByName(selectedNode.palette);
      } else if (selectedNode.bgColor || selectedNode.borderColor) {
      // Create a temporary custom palette for preview
      // Basic contrast check for default text color (can be improved)
      const isDarkBg = (bgColor: string): boolean => {
        try {
          const color = bgColor.startsWith('#') ? bgColor.substring(1) : bgColor;
          const r = parseInt(color.substring(0, 2), 16);
          const g = parseInt(color.substring(2, 4), 16);
          const b = parseInt(color.substring(4, 6), 16);
          // Formula for perceived brightness (YIQ)
          const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
          return yiq < 128; // Threshold for darkness
        } catch (e) {
          return false; // Default to light if parsing fails
        }
      };
      const defaultBg = nodePalettes[0].bgColor;
      const defaultBorder = nodePalettes[0].borderColor;
      const defaultText = nodePalettes[0].textColor;
        const bgColor = selectedNode.bgColor || defaultBg;
      
      return {
        name: "Custom",
        bgColor: bgColor,
          borderColor: selectedNode.borderColor || defaultBorder,
        textColor: isDarkBg(bgColor) ? '#FFFFFF' : defaultText,
      };
    } else {
      // Fallback to the default palette if no style info
      return nodePalettes[0];
    }
    }
    return undefined;
  }, [selectedNodes, nodes, edges]);

  return (
    <div className={`flex h-full flex-shrink-0 flex-col bg-white text-sm text-gray-700 shadow-md transition-width duration-300 ease-in-out ${widthClass} ${isSidebarVisible ? 'border-r border-gray-200' : ''}`}>
      {/* Only render content if sidebar is visible */}
      {isSidebarVisible && (
        <>
          {/* Tools Section */}
          {onToolChange && (
          <div className="border-b border-gray-200 p-4">
            <ClickableHeader 
                title="Tools"
                isExpanded={expandedSections.tools} 
                onClick={() => toggleSection('tools')}
              />
              {expandedSections.tools && (
                <div className="grid grid-cols-2 gap-3">
                  <IconButton 
                    icon={Icons.Navigate}
                    label="Navigate"
                    onClick={() => onToolChange('navigate')}
                    isActive={activeTool === 'navigate'}
                  />
                  <IconButton 
                    icon={Icons.AddNode}
                    label="Add Node"
                    onClick={() => onToolChange('node')}
                    isActive={activeTool === 'node'}
                  />
                  <IconButton 
                    icon={Icons.Rectangle}
                    label="Add Rectangle"
                    onClick={() => onToolChange('rectangle')}
                    isActive={activeTool === 'rectangle'}
                  />
                  <IconButton 
                    icon={Icons.Text}
                    label="Add Text"
                    onClick={() => onToolChange('text')}
                    isActive={activeTool === 'text'}
                  />
                  <IconButton 
                    icon={Icons.Layout}
                    label="Layout Nodes"
                    onClick={() => onToolChange('layout')}
                    isActive={activeTool === 'layout'}
                  />
              </div>
            )}
          </div>
          )}

          {/* Scrollable Content Area */}
          <div className="flex-grow overflow-y-auto p-4">
            {selectedRectangle ? (
              // Rectangle Properties - Show this when a rectangle is selected
              <div className="mb-6">
                <h3 className="mb-2 text-base font-semibold text-gray-800">Rectangle Properties</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Label</label>
                    <input
                      type="text"
                      value={selectedRectangle.label || ''}
                      onChange={(e) => handleRectangleUpdate('label', e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  </div>
                  
                  {/* Text Formatting Controls */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Text Format</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleRectangleUpdate('fontWeight', selectedRectangle.fontWeight === 'bold' ? 'normal' : 'bold')}
                        className={`flex-1 p-1 border rounded ${selectedRectangle.fontWeight === 'bold' ? 'bg-blue-100 border-blue-400' : ''}`}
                        title="Bold"
                      >
                        <span className="font-bold">B</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRectangleUpdate('fontStyle', selectedRectangle.fontStyle === 'italic' ? 'normal' : 'italic')}
                        className={`flex-1 p-1 border rounded ${selectedRectangle.fontStyle === 'italic' ? 'bg-blue-100 border-blue-400' : ''}`}
                        title="Italic"
                      >
                        <span className="italic">I</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRectangleUpdate('textDecoration', selectedRectangle.textDecoration === 'underline' ? 'none' : 'underline')}
                        className={`flex-1 p-1 border rounded ${selectedRectangle.textDecoration === 'underline' ? 'bg-blue-100 border-blue-400' : ''}`}
                        title="Underline"
                      >
                        <span className="underline">U</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Font Size and Font Color Controls */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Font Size</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={selectedRectangle.fontSize || 14}
                          onChange={(e) => handleRectangleUpdate('fontSize', parseFloat(e.target.value))}
                          className="w-full p-1 pr-8 border rounded"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                          px
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Font Color</label>
                      <input
                        type="color"
                        value={selectedRectangle.fontColor || '#000000'}
                        onChange={(e) => handleRectangleUpdate('fontColor', e.target.value)}
                        className="w-full p-1 border rounded"
                      />
                    </div>
                  </div>
                  
                  {/* Text Position Controls */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Text Alignment</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">Horizontal</label>
                        <select
                          value={selectedRectangle.textAlign || 'center'}
                          onChange={(e) => handleRectangleUpdate('textAlign', e.target.value)}
                          className="w-full p-1 border rounded"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">Vertical</label>
                        <select
                          value={selectedRectangle.verticalAlign || 'middle'}
                          onChange={(e) => handleRectangleUpdate('verticalAlign', e.target.value)}
                          className="w-full p-1 border rounded"
                        >
                          <option value="top">Top</option>
                          <option value="middle">Middle</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Color Palette Selector */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Color Palette</label>
                    <div className="flex flex-wrap gap-2"> 
                      {nodePalettes.map(p => {
                        const isSelected = 
                          selectedRectangle.bgColor === p.bgColor && 
                          selectedRectangle.borderColor === p.borderColor;
                        return (
                          <div 
                            key={p.name} 
                            onClick={() => {
                              handleRectangleUpdate('bgColor', p.bgColor);
                              handleRectangleUpdate('borderColor', p.borderColor);
                            }}
                            className={`cursor-pointer p-0.5 rounded-md ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                            title={p.name}
                          >
                            <PalettePreviewNode palette={p} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Color Controls */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Custom Colors</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">Background</label>
                        <input
                          type="color"
                          value={selectedRectangle.bgColor || '#ffffff'}
                          onChange={(e) => handleRectangleUpdate('bgColor', e.target.value)}
                          className="w-full p-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">Border</label>
                        <input
                          type="color"
                          value={selectedRectangle.borderColor || '#000000'}
                          onChange={(e) => handleRectangleUpdate('borderColor', e.target.value)}
                          className="w-full p-1 border rounded"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Border Width</label>
                      <input
                        type="number"
                        value={selectedRectangle.borderWidth || 1}
                        onChange={(e) => handleRectangleUpdate('borderWidth', parseFloat(e.target.value))}
                        className="w-full p-1 border rounded"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Border Style</label>
                      <select
                        value={selectedRectangle.borderStyle || 'solid'}
                        onChange={(e) => handleRectangleUpdate('borderStyle', e.target.value)}
                        className="w-full p-1 border rounded"
                      >
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Width and Height Controls moved to bottom */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Width</label>
                      <input
                        type="number"
                        value={selectedRectangle.width || 0}
                        onChange={(e) => handleRectangleUpdate('width', parseFloat(e.target.value))}
                        className="w-full p-1 border rounded"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Height</label>
                      <input
                        type="number"
                        value={selectedRectangle.height || 0}
                        onChange={(e) => handleRectangleUpdate('height', parseFloat(e.target.value))}
                        className="w-full p-1 border rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedTextAnnotation ? (
              // Text Annotation Properties - Show when a text annotation is selected
              <div className="mb-6">
                <h3 className="mb-2 text-base font-semibold text-gray-800">Text Properties</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Content</label>
                    <textarea
                      value={selectedTextAnnotation.text || ''}
                      onChange={(e) => {
                        if (handleTextUpdate) {
                          handleTextUpdate('text', e.target.value);
                        }
                      }}
                      className="w-full p-2 border rounded min-h-[100px] resize-none"
                      placeholder="Enter text..."
                    />
                  </div>
                  
                  {/* Text Formatting Controls */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Text Format</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (handleTextUpdate) {
                            handleTextUpdate('fontWeight', selectedTextAnnotation.fontWeight === 'bold' ? 'normal' : 'bold');
                          }
                        }}
                        className={`flex-1 p-1 border rounded ${selectedTextAnnotation.fontWeight === 'bold' ? 'bg-blue-100 border-blue-400' : ''}`}
                        title="Bold"
                      >
                        <span className="font-bold">B</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (handleTextUpdate) {
                            handleTextUpdate('fontStyle', selectedTextAnnotation.fontStyle === 'italic' ? 'normal' : 'italic');
                          }
                        }}
                        className={`flex-1 p-1 border rounded ${selectedTextAnnotation.fontStyle === 'italic' ? 'bg-blue-100 border-blue-400' : ''}`}
                        title="Italic"
                      >
                        <span className="italic">I</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (handleTextUpdate) {
                            handleTextUpdate('textDecoration', selectedTextAnnotation.textDecoration === 'underline' ? 'none' : 'underline');
                          }
                        }}
                        className={`flex-1 p-1 border rounded ${selectedTextAnnotation.textDecoration === 'underline' ? 'bg-blue-100 border-blue-400' : ''}`}
                        title="Underline"
                      >
                        <span className="underline">U</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Font Size and Font Color Controls */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Font Size</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={selectedTextAnnotation.fontSize || 14}
                          onChange={(e) => {
                            if (handleTextUpdate) {
                              handleTextUpdate('fontSize', parseFloat(e.target.value));
                            }
                          }}
                          className="w-full p-1 pr-8 border rounded"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                          px
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Font Color</label>
                      <input
                        type="color"
                        value={selectedTextAnnotation.fontColor || '#000000'}
                        onChange={(e) => {
                          if (handleTextUpdate) {
                            handleTextUpdate('fontColor', e.target.value);
                          }
                        }}
                        className="w-full p-1 border rounded"
                      />
                    </div>
                  </div>
                  
                  {/* Text Alignment */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Text Alignment</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">Horizontal</label>
                        <select
                          value={selectedTextAnnotation.textAlign || 'left'}
                          onChange={(e) => {
                            if (handleTextUpdate) {
                              handleTextUpdate('textAlign', e.target.value);
                            }
                          }}
                          className="w-full p-1 border rounded"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">Vertical</label>
                        <select
                          value={selectedTextAnnotation.verticalAlign || 'top'}
                          onChange={(e) => {
                            if (handleTextUpdate) {
                              handleTextUpdate('verticalAlign', e.target.value);
                            }
                          }}
                          className="w-full p-1 border rounded"
                        >
                          <option value="top">Top</option>
                          <option value="middle">Middle</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Background Color Control */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedTextAnnotation.bgColor === 'transparent' ? '#ffffff' : selectedTextAnnotation.bgColor || '#ffffff'}
                        onChange={(e) => {
                          if (handleTextUpdate) {
                            handleTextUpdate('bgColor', e.target.value);
                          }
                        }}
                        className="flex-1 p-1 border rounded"
                      />
                      <button
                        onClick={() => {
                          if (handleTextUpdate) {
                            handleTextUpdate('bgColor', 'transparent');
                          }
                        }}
                        className={`px-2 py-1 border rounded text-xs ${selectedTextAnnotation.bgColor === 'transparent' ? 'bg-blue-100 border-blue-400' : ''}`}
                      >
                        Transparent
                      </button>
                    </div>
                  </div>
                  
                  {/* Width and Height Controls */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Width</label>
                      <input
                        type="number"
                        value={selectedTextAnnotation.width || 150}
                        onChange={(e) => {
                          if (handleTextUpdate) {
                            handleTextUpdate('width', parseFloat(e.target.value));
                          }
                        }}
                        className="w-full p-1 border rounded"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Height</label>
                      <input
                        type="number"
                        value={selectedTextAnnotation.height || 80}
                        onChange={(e) => {
                          if (handleTextUpdate) {
                            handleTextUpdate('height', parseFloat(e.target.value));
                          }
                        }}
                        className="w-full p-1 border rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Show node/edge details only when no rectangle or text annotation is selected
              (selectedNodes.length > 0 || selectedEdge) ? (
              <>
                {/* Selected Node Details */}
                {selectedNodes.length === 1 && (
                  <div className="mb-6">
                    <ClickableHeader 
                      title="Node Details"
                      isExpanded={expandedSections.details} 
                      onClick={() => toggleSection('details')}
                    />
                    {expandedSections.details && (
                      <div>
                        <div className="mb-1 flex justify-between"><span className="font-medium text-gray-500">Label:</span> <span className="text-right break-words">{selectedNodes[0].data.label}</span></div>
                        <div className="mb-1 flex justify-between"><span className="font-medium text-gray-500">Entity:</span> <span className="text-right break-words">{selectedNodes[0].data.entity}</span></div>
                        <div className="mb-1 flex justify-between"><span className="font-medium text-gray-500">Type:</span> <span className="text-right break-words">{selectedNodes[0].data.type}</span></div>
                        {selectedNodes[0].data.subType && <div className="mb-1 flex justify-between"><span className="font-medium text-gray-500">SubType:</span> <span className="text-right break-words">{selectedNodes[0].data.subType}</span></div>}
                        {selectedNodes[0].data.domain && <div className="mb-1 flex justify-between"><span className="font-medium text-gray-500">Domain:</span> <span className="text-right break-words">{selectedNodes[0].data.domain}</span></div>}
                        {selectedNodes[0].data.owner && <div className="mb-1 flex justify-between"><span className="font-medium text-gray-500">Owner:</span> <span className="text-right break-words">{selectedNodes[0].data.owner}</span></div>}
                        
                        {/* Display node style preview */}
                        {nodePreviewPalette && (
                          <div className="mb-1 mt-2 flex items-center justify-between">
                             <span className="font-medium text-gray-500">Style:</span>
                             <PalettePreviewNode palette={nodePreviewPalette} />
                           </div>
                        )}
                      </div>
                    )}
                    
                    {/* Node Description Section */}
                    {selectedNodes[0].data.description && (
                        <>
                        <hr className="my-3 border-gray-200" />
                        <ClickableHeader 
                            title="Description" 
                            isExpanded={expandedSections.description}
                            onClick={() => toggleSection('description')} 
                        />
                        {expandedSections.description && (
                            <p className="whitespace-pre-wrap text-xs text-gray-600">{selectedNodes[0].data.description}</p>
                        )}
                        </>
                    )}
                    
                    {/* Node Transformations Section */}
                    {selectedNodes[0].data.transformations && (
                        <>
                        <hr className="my-3 border-gray-200" />
                        <ClickableHeader 
                            title="Transformations" 
                            isExpanded={expandedSections.transformations}
                            onClick={() => toggleSection('transformations')} 
                        />
                        {expandedSections.transformations && (
                            <p className="whitespace-pre-wrap text-xs text-gray-600">{selectedNodes[0].data.transformations}</p>
                        )}
                        </>
                    )}
                    
                    {/* Node Filters Section */}
                    {selectedNodes[0].data.filters && (
                        <>
                        <hr className="my-3 border-gray-200" />
                        <ClickableHeader 
                            title="Filters" 
                            isExpanded={expandedSections.filters}
                            onClick={() => toggleSection('filters')} 
                        />
                        {expandedSections.filters && (
                            <p className="whitespace-pre-wrap text-xs text-gray-600">{selectedNodes[0].data.filters}</p>
                        )}
                        </>
                    )}
                    
                    {/* Input/Output Sections */}
                    <hr className="my-3 border-gray-200" />
                    <ClickableHeader title="Inputs" isExpanded={expandedSections.inputs} onClick={() => toggleSection('inputs')} />
                    {expandedSections.inputs && (
                      <ul className="ml-0 list-none p-0 text-xs">
                          {inputs.length > 0 ? inputs.map(node => <li key={node.id} className="mb-1 break-words">{node.data?.label || node.id} ({node.type || 'unknown'})</li>) : <li className="italic text-gray-500">None</li>}
                      </ul>
                    )}
                    <hr className="my-3 border-gray-200" />
                    <ClickableHeader title="Outputs" isExpanded={expandedSections.outputs} onClick={() => toggleSection('outputs')} />
                      {expandedSections.outputs && outputs.length > 0 && (
                        <ul>
                          {outputs.map(output => (
                            <li key={output.id} className="mb-1 text-xs">
                              {output.data?.label || output.id}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Selected Edge Details */}
                {selectedEdge && (
                  <div className="mb-6">
                      <h3 className="mb-2 text-base font-semibold text-gray-800">Edge Details</h3>
                            <textarea 
                        value={(selectedEdge.data as any)?.details || ''}
                              onChange={handleEdgeDetailsChange} 
                        className="h-24 w-full resize-none rounded border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter edge details..."
                            />
                  </div>
                )}
              </>
            ) : (
                <div className="text-center text-sm text-gray-500">
                  Select a node or edge to view its details.
                </div>
              )
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto border-t border-gray-200 p-3 text-xs text-gray-500">
            <div className="mb-2 flex justify-center gap-3">
              {/* Explicit Home button */}
              {onReturnToLanding && (
              <button 
                onClick={onReturnToLanding} 
                  className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-50 text-gray-700"
                  title="Return to Home"
                >
                  <div className="mb-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium">Home</span>
              </button>
              )}
              <button 
                className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-50 text-gray-700"
                title="Save as PNG"
              >
                <div className="relative flex items-center justify-center mb-1 w-5 h-5">
                  {Icons.PNG}
                  <div className="absolute inset-0">
                    <DownloadButton />
                  </div>
                </div>
                <span className="text-xs font-medium">PNG</span>
              </button>
              {onSaveFlow && (
                <IconButton
                  icon={Icons.Save}
                  label="Save"
                  onClick={onSaveFlow}
                />
              )}
              {onLoadFlowTrigger && (
                <IconButton
                  icon={Icons.Load}
                  label="Load"
                  onClick={onLoadFlowTrigger}
                />
              )}
            </div>
            <div className="text-center">
              {onReturnToLanding ? (
              <button 
                  onClick={onReturnToLanding}
                  className="text-blue-500 hover:text-blue-700 hover:underline focus:outline-none"
                  title="Return to Landing Page"
                >
                  Data Lineage UI v{version}
              </button>
              ) : (
                <span>Data Lineage UI v{version}</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar; 