import React, { useState, useCallback, useEffect } from 'react'; // Import useEffect
import ReactFlow, { Node, Edge, NodeMouseHandler, EdgeMouseHandler, useNodesState, useEdgesState, addEdge, Connection, Background, ReactFlowInstance, MarkerType, Position } from 'reactflow'; // Import NodeMouseHandler, useNodesState, useEdgesState, addEdge, Connection, Background, ReactFlowInstance, MarkerType, Position
import 'reactflow/dist/style.css';
import dagre from 'dagre'; // Import dagre

import CustomNode from './CustomNode'; // Import the custom node
import Sidebar from './Sidebar'; // Import the Sidebar component
import NodeForm from './NodeForm'; // Import NodeForm
import './App.css';

const LOCAL_STORAGE_KEY_NODES = 'reactFlowNodes';
const LOCAL_STORAGE_KEY_EDGES = 'reactFlowEdges';

// Node data type - Reflect new hierarchy
interface NodeData {
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
interface EdgeData {
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

// Default options for new edges - Changed type to bezier
const defaultEdgeOptions = {
  style: { strokeWidth: 1.5, stroke: EDGE_COLOR },
  type: 'bezier', // Use Bezier curves
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

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
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

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesData);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData>(initialEdgesData);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge<EdgeData> | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingNode, setEditingNode] = useState<Node<NodeData> | null>(null); // State for node being edited

  // --- Save nodes and edges to Local Storage on change ---
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_NODES, JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_EDGES, JSON.stringify(edges));
  }, [edges]);

  // --- Keep selectedEdge state synchronized with the edges array ---
  useEffect(() => {
    if (selectedEdge) {
      // Find the edge in the current edges array that matches the selectedEdge's ID
      const currentEdgeInState = edges.find((edge) => edge.id === selectedEdge.id);
      // If it exists and is different from the currently selected edge state,
      // update the selectedEdge state to the new object reference.
      if (currentEdgeInState && currentEdgeInState !== selectedEdge) {
        setSelectedEdge(currentEdgeInState);
      }
      // If the edge was deleted from the main state, deselect it
      else if (!currentEdgeInState) {
        setSelectedEdge(null);
      }
    }
    // Run this effect whenever the edges array changes or the selected edge ID changes.
  }, [edges, selectedEdge?.id]); // Dependency includes selectedEdge ID
  // ------------------------------------------------------------------

  // Handler for node click events
  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    // Toggle selection: if clicking the same node, deselect; otherwise select the new node.
    setSelectedNode((currentNode) => (currentNode?.id === node.id ? null : node));
    setSelectedEdge(null); // Deselect edge when node is clicked
  }, []);

  // Handler for edge click
  const onEdgeClick: EdgeMouseHandler = useCallback((event, edge) => {
    setSelectedEdge((currentEdge) => (currentEdge?.id === edge.id ? null : edge));
    setSelectedNode(null); // Deselect node when edge is clicked
  }, []);

  // Handler for pane click (to deselect nodes and edges)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null); // Deselect edge on pane click
  }, []);

  // --- Form Handling ---
  // Function to open the form for adding (no arg) or editing (with node)
  const openNodeForm = useCallback((nodeToEdit?: Node<NodeData>) => {
    setEditingNode(nodeToEdit || null);
    setIsFormVisible(true);
  }, []);

  const handleCancelForm = useCallback(() => {
    setIsFormVisible(false);
    setEditingNode(null); // Clear editing state on cancel
  }, []);

  // Handle ADDING a new node
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
    handleCancelForm(); // Close form and clear editing state
  }, [setNodes, handleCancelForm]);

  // Handle UPDATING an existing node
  const handleUpdateNode = useCallback((formData: NodeFormData) => {
    if (!editingNode) return; // Should not happen if form logic is correct

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === editingNode.id) {
          // Return a new node object with updated data
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
    handleCancelForm(); // Close form and clear editing state
  }, [editingNode, setNodes, handleCancelForm]);

  // Handler for connecting nodes
  const onConnect = useCallback(
    (params: Edge | Connection) => 
      // Use default edge options for styling new edges
      setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions, data: { details: '' } }, eds)),
    [setEdges],
  );

  // --- Layout Handler - Updated to accept direction ---
  const handleLayout = useCallback((direction: string) => {
    const layoutedNodes = getLayoutedElements(nodes, edges, direction);
    setNodes([...layoutedNodes]); 
  }, [nodes, edges, setNodes]); 

  // --- Styles ---
  const reactFlowWrapperStyle: React.CSSProperties = {
    flexGrow: 1,
    position: 'relative',
    background: BACKGROUND_COLOR, 
    backgroundImage: `radial-gradient(${DOT_PATTERN_COLOR} 1px, transparent 1px)`,
    backgroundSize: '15px 15px',
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={reactFlowWrapperStyle}> 
        <ReactFlow
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange} 
          onConnect={onConnect}       
          nodeTypes={nodeTypes} 
          onNodeClick={onNodeClick} 
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick} 
          fitView 
          defaultEdgeOptions={defaultEdgeOptions}
        >
          {/* Conditionally render the NodeForm, passing edit info */}
          {isFormVisible && (
            <NodeForm 
              // Key prop helps React reset form state when switching between add/edit
              key={editingNode ? `edit-${editingNode.id}` : 'add'} 
              initialData={editingNode?.data || null} // Pass initial data if editing
              isEditing={!!editingNode} // Pass editing flag
              // Decide which submit handler to use based on editing state
              onSubmit={editingNode ? handleUpdateNode : handleAddNode} 
              onCancel={handleCancelForm} 
            />
          )}
        </ReactFlow>
      </div>
      <Sidebar 
        selectedNode={selectedNode} 
        selectedEdge={selectedEdge}
        nodes={nodes} 
        edges={edges} 
        setEdges={setEdges}
        onAddNodeClick={() => openNodeForm()} // Call without arg for adding
        onEditNodeClick={(node) => openNodeForm(node)} // Call with node for editing
        onLayoutClick={handleLayout}      
      />
    </div>
  );
}

export default App;
