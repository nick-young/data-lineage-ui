import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'; // Import useEffect, useRef, useMemo
import ReactFlow, { Node, Edge, NodeMouseHandler, EdgeMouseHandler, useNodesState, useEdgesState, addEdge, Connection, Background, ReactFlowInstance, MarkerType, ReactFlowProvider, useReactFlow, MiniMap, Controls } from 'reactflow'; // Removed unused imports
import 'reactflow/dist/style.css';
import dagre from 'dagre'; // Import dagre
import * as htmlToImage from 'html-to-image'; // Added

import CustomNode from './CustomNode'; // Import the custom node
import Sidebar, { SIDEBAR_WIDTH, COLLAPSED_WIDTH } from './Sidebar'; // Import Sidebar and constants
import NodeForm from './NodeForm'; // Import NodeForm

const LOCAL_STORAGE_KEY_NODES = 'reactFlowNodes';
const LOCAL_STORAGE_KEY_EDGES = 'reactFlowEdges';

// Node data type - Reflect new hierarchy
export interface NodeData {
  label: string;      // User-defined name
  entity: string;     // Broad category (e.g., Database)
  type: string;       // Specific tech (e.g., MySQL)
  subType?: string;    // Specific object type (e.g., Table)
  domain?: string;
  owner?: string;
  description?: string;
  transformations?: string;
  filters?: string;
  // context?: string; // Context might be derived from entity/type now
}

// Edge data type
export interface EdgeData {
  details?: string;
}

// Type for form data submission - Reflect new hierarchy
interface NodeFormData {
  label: string;
  entity: string; // Added
  type: string;   // Added
  subType?: string; // Added
  domain: string;
  owner: string;
  description: string;
  transformations: string;
  filters: string;
}

// --- Load initial state from Local Storage or use defaults ---
const initialNodesData: Node<NodeData>[] = (() => {
  const savedNodes = localStorage.getItem(LOCAL_STORAGE_KEY_NODES);
  if (savedNodes) {
    try {
      return JSON.parse(savedNodes);
    } catch (error) {
      console.error("Error parsing saved nodes:", error);
      return []; // Fallback to empty if parsing fails
    }
  }
  // Default initial nodes if nothing is saved
  return [
    {
      id: '1',
      type: 'custom', 
      data: { 
        label: 'Orders Table', 
        entity: 'Database',       // New field
        type: 'Redshift',         // New field (example)
        subType: 'Table', 
        // context: 'ecommerce_db / public' // Removed, can derive if needed
        domain: 'ecommerce_db',
      },
      position: { x: 100, y: 100 },
    },
    {
      id: '2',
      type: 'custom',
      data: { 
        label: 'Orders ETL', 
        entity: 'Pipeline',       // New field
        type: 'Airflow',          // New field
        // subType: 'Pipeline',  // Example if pipelines had subTypes
        domain: 'airflow_prod',
      }, 
      position: { x: 400, y: 100 },
    },
    {
      id: '3',
      type: 'custom',
      data: { 
        label: 'User Data Topic', 
        entity: 'Stream',         // New field
        type: 'Kafka',            // New field
        subType: 'Topic', 
        domain: 'kafka_cluster_1',
      },
      position: { x: 100, y: 300 },
    },
    {
      id: '4',
      type: 'custom',
      data: { 
        label: 'Reporting API', 
        entity: 'API',            // New field
        type: 'Generic API',      // New field
        domain: 'reporting_service',
      }, 
      position: { x: 400, y: 300 },
    },
  ];
})();

const initialEdgesData: Edge<EdgeData>[] = (() => {
  const savedEdges = localStorage.getItem(LOCAL_STORAGE_KEY_EDGES);
    if (savedEdges) {
    try {
      // Ensure loaded edges have a data object
      const parsedEdges = JSON.parse(savedEdges);
      return parsedEdges.map((edge: Edge) => ({ ...edge, data: edge.data || { details: '' } }));
    } catch (error) {
      console.error("Error parsing saved edges:", error);
      return []; // Fallback to empty if parsing fails
    }
  }
  return []; // Default to empty edges
})();
// --------------------------------------------------------------

// Moved nodeTypes outside the component to fix warning 002
const nodeTypes = {
  custom: CustomNode,
};

// Adjust ID counter based on loaded nodes
let idCounter = initialNodesData.reduce((maxId, node) => {
  const numericId = parseInt(node.id.replace(/[^0-9]/g, ''), 10); // More robust parsing
  return Math.max(maxId, isNaN(numericId) ? 0 : numericId);
}, 0) + 1; // Start from max existing ID + 1
const getNextNodeId = () => `node_${idCounter++}`;

// --- Constants and Setup ---
const EDGE_COLOR = '#adb5bd'; // Light grey for edges
const BACKGROUND_COLOR = '#f8f9fa'; // Very light grey background
const DOT_PATTERN_COLOR = '#e0e0e0'; // Color for the dots

// Default options for new edges - Use 'default' for Bezier
const defaultEdgeOptions = {
  style: { strokeWidth: 1.5, stroke: EDGE_COLOR },
  type: 'default', // Use 'default' for Bezier curves
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: EDGE_COLOR,
    width: 15,
    height: 15,
  },
};

// --- Dagre Layout Setup ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const NODE_WIDTH = 200; // Approx width based on CustomNode style
const NODE_HEIGHT = 70;  // Approx height based on CustomNode style

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // We need to center the node relative to the dagre layout coordinates
    const newPosition = {
      x: nodeWithPosition.x - NODE_WIDTH / 2,
      y: nodeWithPosition.y - NODE_HEIGHT / 2,
    };

    return { ...node, position: newPosition };
  });

  return layoutedNodes; // Only need to return nodes, edges don't change
};
// --------------------------

// --- Toggle Button Style (Defined in App.tsx) ---
const getToggleButtonStyleApp = (isVisible: boolean): React.CSSProperties => ({
  position: 'absolute', // Position relative to the main flex container
  top: '15px',        // Same vertical position as before
  // Calculate left position based on sidebar state and width constants
  left: `${isVisible ? SIDEBAR_WIDTH - 13 : COLLAPSED_WIDTH - 13}px`, // Center button on the edge
  zIndex: 10,          // Ensure it's above React Flow controls/nodes potentially
  background: '#e9ecef',
  border: '1px solid #ced4da',
  borderRadius: '50%',
  width: '26px',
  height: '26px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: '14px',
  lineHeight: '1',
  color: '#495057',
  padding: 0,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  transition: 'left 0.3s ease-in-out', // Animate the left position change
});

function App() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null); 
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input
  const [nodes, setNodes, onNodesChangeOriginal] = useNodesState(initialNodesData);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData>(initialEdgesData);
  const [selectedEdge, setSelectedEdge] = useState<Edge<EdgeData> | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingNode, setEditingNode] = useState<Node<NodeData> | null>(null); 
  const [copiedNodes, setCopiedNodes] = useState<Node<NodeData>[]>([]); 
  const reactFlowInstance = useReactFlow<NodeData, EdgeData>(); 
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); // State for sidebar visibility

  // --- Derive selected nodes state ---
  const selectedNodes = useMemo(() => nodes.filter(n => n.selected), [nodes]);

  // --- useEffects for saving, selection sync ---
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_NODES, JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_EDGES, JSON.stringify(edges));
  }, [edges]);

  useEffect(() => {
    if (selectedEdge) {
      const currentEdgeInState = edges.find((edge) => edge.id === selectedEdge.id);
      if (currentEdgeInState && currentEdgeInState !== selectedEdge) {
        setSelectedEdge(currentEdgeInState);
      }
      else if (!currentEdgeInState) {
        setSelectedEdge(null);
      }
    }
  }, [edges, selectedEdge?.id]);

  // --- Custom onNodesChange hook ---
  const onNodesChange: typeof onNodesChangeOriginal = useCallback((changes) => {
    const isSelectionChange = changes.some(change => change.type === 'select');
    if (isSelectionChange) {
      setSelectedEdge(null); 
    }
    onNodesChangeOriginal(changes); 
  }, [onNodesChangeOriginal]);

  // --- Event Handlers & Callbacks ---
  const onEdgeClick: EdgeMouseHandler = useCallback((_event, edge) => {
    setSelectedEdge((currentEdge) => (currentEdge?.id === edge.id ? null : edge));
    setNodes((nds) => nds.map(n => ({ ...n, selected: false })));
    setEditingNode(null); 
    setIsFormVisible(false);
  }, [setNodes]);

  // --- Form Handling ---
  const openNodeForm = useCallback((nodeToEdit?: Node<NodeData>) => {
    setEditingNode(nodeToEdit || null);
    setIsFormVisible(true);
    setSelectedEdge(null);
  }, []);

  const handleCancelForm = useCallback(() => {
    setIsFormVisible(false);
    setEditingNode(null);
  }, []);

  const handleAddNode = useCallback((formData: NodeFormData) => {
    const newNodeId = getNextNodeId();
    const newNode: Node<NodeData> = {
      id: newNodeId,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 }, 
      data: { 
        label: formData.label, 
        entity: formData.entity, 
        type: formData.type,     
        subType: formData.subType,
        domain: formData.domain,
        owner: formData.owner,
        description: formData.description,
        transformations: formData.transformations,
        filters: formData.filters,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    handleCancelForm();
  }, [setNodes, handleCancelForm]);

  const handleUpdateNode = useCallback((formData: NodeFormData) => {
    if (!editingNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === editingNode.id) {
          return { 
            ...node, 
            data: { 
              label: formData.label, 
              entity: formData.entity, 
              type: formData.type,     
              subType: formData.subType,
              domain: formData.domain,
              owner: formData.owner,
              description: formData.description,
              transformations: formData.transformations,
              filters: formData.filters,
             } 
          };
        }
        return node;
      })
    );
    handleCancelForm();
  }, [editingNode, setNodes, handleCancelForm]);

  // --- Delete Handler ---
  const handleDeleteSelectedNodes = useCallback(() => {
    const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
    if (selectedNodeIds.size === 0) return; 
    setNodes((nds) => nds.filter((node) => !selectedNodeIds.has(node.id)));
    setEdges((eds) =>
      eds.filter((edge) => !selectedNodeIds.has(edge.source) && !selectedNodeIds.has(edge.target))
    );
    setSelectedEdge(null);
    setEditingNode(null);
    setIsFormVisible(false);
  }, [selectedNodes, setNodes, setEdges]);

  // --- Copy Handler ---
  const handleCopy = useCallback(() => {
    if (selectedNodes.length > 0) {
        const clonedNodes = selectedNodes.map(node => ({...node, data: {...node.data}}));
        setCopiedNodes(clonedNodes);
        console.log('Nodes copied:', clonedNodes);
    } else {
        setCopiedNodes([]); 
    }
  }, [selectedNodes]);

  // --- Paste Handler ---
  const handlePaste = useCallback(() => {
    if (copiedNodes.length === 0) return;
    const pane = reactFlowWrapper.current?.querySelector('.react-flow__viewport');
    let pastePosition = { x: 100, y: 100 }; 
    if (pane) {
      pastePosition = reactFlowInstance.screenToFlowPosition({
        x: pane.clientWidth / 2,
        y: pane.clientHeight / 2,
      });
    }
    let minX = Infinity;
    let minY = Infinity;
    if (copiedNodes.length > 0) { // Check length > 0 for safety
        copiedNodes.forEach(node => {
            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
        });
    } else {
        minX = 0; // Default if no nodes somehow
        minY = 0;
    }

    const newNodes = copiedNodes.map((node, index) => {
      const newNodeId = getNextNodeId(); 
      const nodePosition = {
            x: pastePosition.x + (node.position.x - minX) + index * 10, 
            y: pastePosition.y + (node.position.y - minY) + index * 10, 
        };
      return { ...node, id: newNodeId, position: nodePosition, selected: false, data: { ...node.data } };
    });

    setNodes((nds) => [...nds, ...newNodes]);
    console.log('Nodes pasted:', newNodes); // Log moved inside

  }, [copiedNodes, setNodes, reactFlowInstance]);

  // --- Double Click Handler ---
  const onNodeDoubleClick: NodeMouseHandler = useCallback((_event, node) => {
     openNodeForm(node);
  }, [openNodeForm]);

  // --- Layout Handler ---
  const handleLayoutNodes = useCallback((direction: string = 'LR') => {
    const layoutedNodes = getLayoutedElements(nodes, edges, direction);
    setNodes([...layoutedNodes]); 
  }, [nodes, edges, setNodes]); 

  // --- Re-add onConnect Handler ---
  const onConnect = useCallback(
    (params: Edge | Connection) => 
      setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions, data: { details: '' } }, eds)),
    [setEdges],
  );

  // --- Keyboard Event Listener for Copy/Paste --- 
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || 
                             target.tagName === 'TEXTAREA' || 
                             target.tagName === 'SELECT' || 
                             target.isContentEditable || 
                             target.closest('form');
      if (isInputFocused) {
          return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        handleCopy();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        handlePaste();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCopy, handlePaste, handleDeleteSelectedNodes, selectedNodes]);

  // --- Save PNG Handler (Simplified) ---
  const handleSavePNG = useCallback(() => {
    // Target the viewport for reliable capture of visible area
    const flowPane = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!flowPane) {
      console.error('React Flow viewport not found!');
      return;
    }

    htmlToImage.toPng(flowPane, {
        pixelRatio: 1.5, 
        backgroundColor: '#ffffff', // Explicit white background
        filter: (domNode) => {
           // Filter out controls, minimap, attribution
           if (domNode?.classList?.contains('react-flow__controls') ||
               domNode?.classList?.contains('react-flow__minimap') ||
               domNode?.classList?.contains('react-flow__attribution')
            ) {
             return false;
           }
           return true;
         }
      })
      .then((dataUrl) => {
        downloadFile(dataUrl, 'data-lineage-flow.png');
      })
      .catch((error) => {
        console.error('Failed to save PNG:', error);
        alert('Error saving PNG.');
      });
  }, []); // Removed dependencies as we only use document query

  // --- Save Flow Handler (JSON) ---
  const handleSaveFlow = useCallback(() => {
    const currentViewport = reactFlowInstance.getViewport();
    const flowData = {
      nodes: nodes,
      edges: edges,
      viewport: currentViewport,
    };
    const dataStr = JSON.stringify(flowData, null, 2); // Pretty print JSON
    const dataUrl = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    downloadFile(dataUrl, 'data-lineage-flow.json');
  }, [nodes, edges, reactFlowInstance]);

  // --- Load Flow Trigger (clicks hidden input) ---
  const handleLoadFlowTrigger = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // --- Load Flow Handler (reads file) ---
  const handleLoadFlow = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const flowData = JSON.parse(e.target?.result as string);
        if (flowData && Array.isArray(flowData.nodes) && Array.isArray(flowData.edges) && flowData.viewport) {
          // Basic validation passed
          setNodes(flowData.nodes);
          setEdges(flowData.edges);
          reactFlowInstance.setViewport(flowData.viewport, { duration: 300 }); 
          console.log('Flow loaded successfully!');
        } else {
          console.error('Invalid flow file format.');
          alert('Error: Invalid flow file format.');
        }
      } catch (error) {
        console.error('Failed to parse flow file:', error);
        alert('Error: Could not read or parse the flow file.');
      }
    };
    reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error: Could not read the file.');
    }
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  }, [setNodes, setEdges, reactFlowInstance]);

  // --- Sidebar Toggle Handler ---
  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible(prev => !prev);
    // Optional: Trigger layout recalculation slightly after animation starts/ends
    // Using requestAnimationFrame ensures it happens after the next repaint
    requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
    });
  }, []);

  // --- Styles ---
  const reactFlowWrapperStyle: React.CSSProperties = {
    flexGrow: 1,
    height: '100%',
    position: 'relative', 
    background: BACKGROUND_COLOR, 
    backgroundImage: `radial-gradient(${DOT_PATTERN_COLOR} 1px, transparent 1px)`,
    backgroundSize: '15px 15px',
  };

  return (
    // Main flex container - needs position: relative for absolute positioning of button
    <div style={{ display: 'flex', height: '100vh', width: '100vw', position: 'relative' }}> 
      <Sidebar
        selectedNodes={selectedNodes}
        selectedEdge={selectedEdge}
        nodes={nodes} 
        edges={edges} 
        setEdges={setEdges}
        onAddNodeClick={() => openNodeForm()}
        onSavePNG={handleSavePNG}
        onSaveFlow={handleSaveFlow}
        onLoadFlowTrigger={handleLoadFlowTrigger}
        onLayoutNodesClick={() => handleLayoutNodes('LR')}
        isSidebarVisible={isSidebarVisible} // Pass only for width styling
      />
      
      {/* --- Toggle Button (Placed outside Sidebar) --- */}
      <button 
        style={getToggleButtonStyleApp(isSidebarVisible)} 
        onClick={toggleSidebar} 
        title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
      >
        {isSidebarVisible ? '<' : '>'}
      </button>

      <div style={reactFlowWrapperStyle}> 
        <ReactFlow
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange} 
          onConnect={onConnect}       
          nodeTypes={nodeTypes} 
          onEdgeClick={onEdgeClick}
          onNodeDoubleClick={onNodeDoubleClick} 
          fitView 
          defaultEdgeOptions={defaultEdgeOptions}
          panOnDrag={[2]} // Enable panning only with Right mouse button
          selectionOnDrag={true} // Enable drag selection box
          multiSelectionKeyCode="Shift" // Explicitly set (though it's default)
          proOptions={{ hideAttribution: true }}
        >
          {isFormVisible && (
            <NodeForm 
              key={editingNode ? `edit-${editingNode.id}` : 'add'} 
              initialData={editingNode?.data || null}
              isEditing={!!editingNode}
              onSubmit={editingNode ? handleUpdateNode : handleAddNode} 
              onCancel={handleCancelForm} 
            />
          )}
        </ReactFlow>
      </div>
      <input 
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }} 
        accept=".json"
        onChange={handleLoadFlow}
      />
    </div>
  );
}

// Wrap App with ReactFlowProvider 
function AppWrapper() {
  return (
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  )
}

// --- Helper function to trigger file download ---
function downloadFile(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
  link.remove();
}

export default AppWrapper;
