import React, { useMemo, useCallback, useState } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData, EdgeData } from './App';
import { RectangleData } from './components/CanvasRectangle';
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
  activeTool?: ToolType;
  onToolChange?: (tool: ToolType) => void;
  setNodes?: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>;
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
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  ),
  AddNode: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  ),
  Rectangle: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M5 4a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H5zm0 2h10v8H5V6z" clipRule="evenodd" />
    </svg>
  ),
  Layout: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 0h1v4h-1V5zm-8 6h6v4H7v-4zm8 0h1v4h-1v-4z" clipRule="evenodd" />
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
    activeTool = 'navigate',
    onToolChange,
    setNodes,
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
    
    // Find the node in nodes array
    if (setNodes && typeof setNodes === 'function') {
      setNodes(nodes.map(node => {
        if (node.id === selectedRectangle.id && node.type === 'shape') {
          // Update the specific property in node data
          return {
            ...node,
            data: {
              ...node.data,
              [property]: value
            }
          };
        }
        return node;
      }));
    }
  }, [selectedRectangle, setNodes, nodes]);

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
            {(selectedNodes.length > 0 || selectedEdge) ? (
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
                        
                        {/* Display other fields if needed */}
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

                {/* Rectangle Properties */}
                {selectedRectangle && (
                  <div className="mb-6">
                    <h3 className="mb-2 text-base font-semibold text-gray-800">Rectangle Properties</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">Label</label>
                        <input
                          type="text"
                          value={selectedRectangle.label || ''}
                          onChange={(e) => handleRectangleUpdate('label', e.target.value)}
                          className="w-full p-1 border rounded"
                        />
                      </div>
                      
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
                      
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">Background Color</label>
                        <input
                          type="color"
                          value={selectedRectangle.bgColor || '#ffffff'}
                          onChange={(e) => handleRectangleUpdate('bgColor', e.target.value)}
                          className="w-full p-1 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">Border Color</label>
                        <input
                          type="color"
                          value={selectedRectangle.borderColor || '#000000'}
                          onChange={(e) => handleRectangleUpdate('borderColor', e.target.value)}
                          className="w-full p-1 border rounded"
                        />
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
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-sm text-gray-500">
                Select a node or edge to view its details.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto border-t border-gray-200 p-3 text-xs text-gray-500">
            <div className="mb-2 flex justify-center gap-3">
              {onReturnToLanding && (
                <IconButton
                  icon={Icons.Home}
                  label="Home"
                  onClick={onReturnToLanding}
                />
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
            <div className="text-center">Data Lineage UI v{version}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar; 