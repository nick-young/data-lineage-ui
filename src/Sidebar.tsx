import React, { useMemo, useCallback, useState } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData, EdgeData } from './App';
import { version } from '../package.json'; // Corrected import path

// Define the expected data structure for the selected node
/* 
interface NodeData { ... } 
interface EdgeData { ... }
*/

interface SidebarProps {
  selectedNodes: Node<NodeData>[];
  selectedEdge: Edge<EdgeData> | null;
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  setEdges: React.Dispatch<React.SetStateAction<Edge<EdgeData>[]>>;
  onAddNodeClick: () => void;
  onSavePNG: () => void;
  onSaveFlow: () => void;
  onLoadFlowTrigger: () => void;
  onLayoutNodesClick?: (direction: 'LR' | 'RL') => void;
  isSidebarVisible: boolean;
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
const Sidebar: React.FC<SidebarProps> = ({ 
  selectedNodes,
  selectedEdge,
  nodes,
  edges,
  setEdges,
  onAddNodeClick,
  onSavePNG,
  onSaveFlow,
  onLoadFlowTrigger,
  onLayoutNodesClick,
  isSidebarVisible,
}) => {
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
  });

  // Toggle section visibility
  const toggleSection = (sectionName: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  // Memoized calculation of input/output nodes
  const { inputs, outputs } = useMemo(() => {
    if (!selectedNodes || selectedNodes.length !== 1) {
      return { inputs: [], outputs: [] };
    }
    const selectedId = selectedNodes[0].id;
    const inputs = edges.filter(edge => edge.target === selectedId).map(edge => nodes.find(node => node.id === edge.source)).filter(Boolean) as Node<NodeData>[];
    const outputs = edges.filter(edge => edge.source === selectedId).map(edge => nodes.find(node => node.id === edge.target)).filter(Boolean) as Node<NodeData>[];
    return { inputs, outputs };
  }, [selectedNodes, nodes, edges]);

  // Callback to update edge details
  const handleEdgeDetailsChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedEdge) return;
    const newDetails = event.target.value;
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === selectedEdge.id) {
          return { ...edge, data: { ...edge.data, details: newDetails } };
        }
        return edge;
      })
    );
  }, [selectedEdge, setEdges]);

  // Calculate dynamic width class
  const widthClass = isSidebarVisible ? `w-[${SIDEBAR_WIDTH}px]` : 'w-0'; // Use w-0 when collapsed

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

          {/* Scrollable Content Area */}
          <div className="flex-grow overflow-y-auto p-4">
            {(selectedNodes.length === 1 || selectedEdge) ? (
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
                        {inputs.length > 0 ? inputs.map(node => <li key={node.id} className="mb-1 break-words">{node.data.label} ({node.data.type})</li>) : <li className="italic text-gray-500">None</li>}
                      </ul>
                    )}
                    <hr className="my-3 border-gray-200" />
                    <ClickableHeader title="Outputs" isExpanded={expandedSections.outputs} onClick={() => toggleSection('outputs')} />
                    {expandedSections.outputs && (
                      <ul className="ml-0 list-none p-0 text-xs">
                        {outputs.length > 0 ? outputs.map(node => <li key={node.id} className="mb-1 break-words">{node.data.label} ({node.data.type})</li>) : <li className="italic text-gray-500">None</li>}
                      </ul>
                    )}
                  </div>
                )}

                {/* Selected Edge Details */}
                {selectedEdge && (
                  <div className="mb-6">
                    <ClickableHeader 
                      title="Connection Details"
                      isExpanded={expandedSections.connections} 
                      onClick={() => toggleSection('connections')}
                    />
                    {expandedSections.connections && (
                        <div>
                            <div className="mb-1 flex justify-between"><span className="font-medium text-gray-500">Source:</span> <span className="text-right break-words">{nodes.find(n => n.id === selectedEdge.source)?.data.label || 'N/A'}</span></div>
                            <div className="mb-1 flex justify-between"><span className="font-medium text-gray-500">Target:</span> <span className="text-right break-words">{nodes.find(n => n.id === selectedEdge.target)?.data.label || 'N/A'}</span></div>
                            <hr className="my-3 border-gray-200" />
                            <label className="mb-1 block text-xs font-medium text-gray-500">Details:</label>
                            <textarea 
                              value={selectedEdge.data?.details || ''} 
                              onChange={handleEdgeDetailsChange} 
                              className="w-full rounded border border-gray-300 p-2 text-xs"
                              rows={4}
                            />
                        </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="italic text-gray-500">{selectedNodes.length > 1 ? 'Multiple nodes selected' : 'Select a node or edge to view details'}</div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto border-t border-gray-200 p-3 text-xs text-gray-500">
            <div className="mb-2 flex justify-center gap-2">
               <button 
                 onClick={onSavePNG} 
                 className="rounded border border-gray-400 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-100 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition duration-150 ease-in-out"
                 title="Save as PNG"
               >
                 Download as PNG
               </button>
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
            <div className="flex items-center justify-between">
              <span>Data Lineage v{version}</span>
              <a href="/" className="flex items-center text-gray-500 hover:text-primary" title="Home">
                <img src="./assets/logo.png" alt="Home" className="h-4 w-auto" />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar; 