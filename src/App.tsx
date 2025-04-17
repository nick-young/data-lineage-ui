import React, { useState, useCallback, useEffect } from 'react'; // Import useEffect
import ReactFlow, { Node, Edge, NodeMouseHandler, EdgeMouseHandler, useNodesState, useEdgesState, addEdge, Connection, Background, ReactFlowInstance } from 'reactflow'; // Import NodeMouseHandler, useNodesState, useEdgesState, addEdge, Connection, Background, ReactFlowInstance
import 'reactflow/dist/style.css';

import CustomNode from './CustomNode'; // Import the custom node
import Sidebar from './Sidebar'; // Import the Sidebar component
import NodeForm from './NodeForm'; // Import NodeForm
import './App.css';

const LOCAL_STORAGE_KEY_NODES = 'reactFlowNodes';
const LOCAL_STORAGE_KEY_EDGES = 'reactFlowEdges';

// Node data type (ensure consistency or create a shared type later)
interface NodeData {
  label: string;
  type: string;
  domain?: string;
  owner?: string;
  description?: string;
  transformations?: string;
  filters?: string;
}

// Edge data type
interface EdgeData {
  details?: string;
}

// Type for form data submission
interface NodeFormData {
  label: string;
  type: string;
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
      type: 'custom', // Use the custom node type
      data: { label: 'Orders Table', type: 'Database Table' },
      position: { x: 100, y: 100 },
    },
    {
      id: '2',
      type: 'custom',
      data: { label: 'Orders ETL', type: 'Airflow Pipeline' },
      position: { x: 400, y: 100 },
    },
    {
      id: '3',
      type: 'custom',
      data: { label: 'User Data Topic', type: 'Kafka Topic' },
      position: { x: 100, y: 300 },
    },
    {
      id: '4',
      type: 'custom',
      data: { label: 'Reporting API', type: 'API' },
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

function App() {
  // State management for nodes and edges using React Flow hooks
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesData);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData>(initialEdgesData); // Specify EdgeData type

  // State for the selected node and edge
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge<EdgeData> | null>(null); // State for selected edge
  const [isFormVisible, setIsFormVisible] = useState(false); // State for form visibility

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

  // Function to open the form
  const showAddNodeForm = useCallback(() => {
    setIsFormVisible(true);
  }, []);

  // Function to handle form submission
  const handleAddNode = useCallback((formData: NodeFormData) => {
    const newNodeId = getNextNodeId();
    const newNode: Node<NodeData> = {
      id: newNodeId,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 }, // Adjust positioning later
      data: { 
        label: formData.label, 
        type: formData.type,
        domain: formData.domain,
        owner: formData.owner,
        description: formData.description,
        transformations: formData.transformations,
        filters: formData.filters,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setIsFormVisible(false); // Hide form after submission
  }, [setNodes]);

  // Function to handle form cancellation
  const handleCancelForm = useCallback(() => {
    setIsFormVisible(false);
  }, []);

  // Handler for connecting nodes (needed for useEdgesState)
  const onConnect = useCallback(
    (params: Edge | Connection) => 
      setEdges((eds) => addEdge({ ...params, data: { details: '' } }, eds)),
    [setEdges],
  );

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Rely solely on flexGrow for sizing */}
      <div style={{ flexGrow: 1, position: 'relative' }}> 
        <ReactFlow
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange} 
          onConnect={onConnect}       
          nodeTypes={nodeTypes} 
          onNodeClick={onNodeClick} 
          onEdgeClick={onEdgeClick} // Add edge click handler
          onPaneClick={onPaneClick} 
          fitView 
        >
          {/* Add React Flow Background */}
          <Background /> 
          
          {/* Add Button top-left */}
          <button 
            onClick={showAddNodeForm} 
            style={{ position: 'absolute', top: 10, left: 10, zIndex: 4 }}
          >
            Add Node
          </button>
          {/* Conditionally render the NodeForm */}
          {isFormVisible && (
            <NodeForm onSubmit={handleAddNode} onCancel={handleCancelForm} />
          )}
        </ReactFlow>
      </div>
      {/* Render the sidebar */} 
      <Sidebar 
        selectedNode={selectedNode} 
        selectedEdge={selectedEdge} // Pass selected edge
        nodes={nodes} 
        edges={edges} 
        setEdges={setEdges}      // Pass setEdges
      />
    </div>
  );
}

export default App;
