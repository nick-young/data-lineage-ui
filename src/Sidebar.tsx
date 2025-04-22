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
    onAddNodeClick,
    onSaveFlow,
    onLoadFlowTrigger,
    onLayoutNodesClick,
    onReturnToLanding,
    selectedRectangle = null,
    activeTool = 'navigate',
    onToolChange,
    setNodes,
  } = props;
  
  // State for expanding/collapsing sections
  const [expandedSections, setExpandedSections] = useState({
    controls: true,
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
          {/* Top Controls Section */}
          <div className="border-b border-gray-200 p-4">
            <ClickableHeader 
              title="Controls"
              isExpanded={expandedSections.controls} 
              onClick={() => toggleSection('controls')}
            />
            {expandedSections.controls && (
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={onAddNodeClick} 
                  className="rounded border border-transparent bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                >
                  Add Node
                </button>
                <button 
                  onClick={() => onLayoutNodesClick?.('LR')}
                  className="rounded border border-gray-400 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-100 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition duration-150 ease-in-out"
                >
                  Layout Nodes
                </button>
              </div>
            )}
          </div>

          {/* Tools Section */}
          {onToolChange && (
            <div className="border-b border-gray-200 p-4">
              <ClickableHeader 
                title="Tools"
                isExpanded={expandedSections.tools || true} 
                onClick={() => toggleSection('tools')}
              />
              {(expandedSections.tools || true) && (
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => onToolChange('navigate')} 
                    className={`rounded border px-2 py-1.5 text-xs font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${activeTool === 'navigate' ? 'bg-blue-100 border-blue-300 text-blue-800' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Navigate
                  </button>
                  <button 
                    onClick={() => onToolChange('node')} 
                    className={`rounded border px-2 py-1.5 text-xs font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${activeTool === 'node' ? 'bg-blue-100 border-blue-300 text-blue-800' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Add Node
                  </button>
                  <button 
                    onClick={() => onToolChange('rectangle')} 
                    className={`rounded border px-2 py-1.5 text-xs font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${activeTool === 'rectangle' ? 'bg-blue-100 border-blue-300 text-blue-800' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Rectangle
                  </button>
                  <button 
                    onClick={() => onToolChange('layout')} 
                    className={`rounded border px-2 py-1.5 text-xs font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${activeTool === 'layout' ? 'bg-blue-100 border-blue-300 text-blue-800' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Layout
                  </button>
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
            <div className="mb-2 flex justify-center gap-2">
              <button 
                onClick={onReturnToLanding} 
                className="rounded border border-gray-400 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-100 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition duration-150 ease-in-out"
                title="Return to Landing Page"
              >
                Home
              </button>
              <DownloadButton />
              <button 
                onClick={onSaveFlow} 
                className="rounded border border-gray-400 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-100 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition duration-150 ease-in-out"
                title="Save Flow (JSON)"
              >
                Save File
              </button>
              <button 
                onClick={onLoadFlowTrigger} 
                className="rounded border border-gray-400 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-100 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition duration-150 ease-in-out"
                title="Load Flow (JSON)"
               >
                 Load File
              </button>
            </div>
            <div className="text-center">Data Lineage UI v{version}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar; 