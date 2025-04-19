import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'; // Import useEffect, useRef, useMemo
import ReactFlow, { Node, Edge, NodeMouseHandler, EdgeMouseHandler, useNodesState, useEdgesState, addEdge, Connection, MarkerType, ReactFlowProvider, useReactFlow, Background, Controls, MiniMap, XYPosition, NodeHandleBounds } from 'reactflow'; // Re-add Background and Controls
import 'reactflow/dist/style.css';
// If the import above doesn't resolve, comment it out and add a note:
// NOTE: Make sure 'reactflow' package is installed. Run 'npm install reactflow'
import dagre from 'dagre'; // Import dagre
import * as htmlToImage from 'html-to-image'; // Added

import CustomNode from './CustomNode'; // Import the custom node
import Sidebar, { SIDEBAR_WIDTH, COLLAPSED_WIDTH } from './Sidebar'; // Import Sidebar and constants
import NodeForm from './NodeForm'; // Import NodeForm
import LandingPage from './LandingPage'; // Import the LandingPage component
import FloatingToolbar, { DrawingTool } from './FloatingToolbar';
import TextAnnotationNode, { TextAnnotationData } from './TextAnnotationNode';
import EdgeLabelNode from './EdgeLabelNode'; // Import the component itself
import type { EdgeLabelData } from './types'; // Import the type from types.ts

const LOCAL_STORAGE_KEY_NODES = 'reactFlowNodes';
const LOCAL_STORAGE_KEY_EDGES = 'reactFlowEdges';

// Node data type - Needs to be exported
export interface NodeData {
  label: string;
  entity: string;
  type: string;
  subType?: string;
  domain?: string;
  owner?: string;
  description?: string;
  transformations?: string;
  filters?: string;
  bgColor?: string; // CSS color for background
  borderColor?: string; // CSS color for border
  palette?: string; // Optional: Name of a predefined palette
}

// Edge data type - Export if used elsewhere, otherwise keep local
export interface EdgeData {
  details?: string;
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

// Original nodeTypes (No GroupNode)
const nodeTypes = {
  custom: CustomNode,
  textAnnotation: TextAnnotationNode,
  edgeLabel: EdgeLabelNode, // Add the edgeLabel type
  // group: GroupNode, // <-- Remove GroupNode registration
};

// Adjust ID counter based on loaded nodes
let idCounter = initialNodesData.reduce((maxId, node) => {
  const match = node.id.match(/_(\d+)$/);
  const numericId = match ? parseInt(match[1], 10) : 0;
  return Math.max(maxId, isNaN(numericId) ? 0 : numericId);
}, 0) + 1;
const getNextId = (prefix: string = 'node') => `${prefix}_${idCounter++}`;

// --- Constants and Setup ---
// Removed constants like EDGE_COLOR, BACKGROUND_COLOR, DOT_PATTERN_COLOR as Tailwind will handle colors/bg

// Default options for new edges - Use Tailwind color if available, otherwise keep grey
const defaultEdgeOptions = {
  style: { strokeWidth: 1.5, stroke: '#adb5bd' }, // Kept grey for now, can use theme color later
  type: 'default',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#adb5bd', // Kept grey for now
    width: 15,
    height: 15,
  },
  // labelStyle: { fontSize: 10, fill: '#555' }, // REMOVED
  // labelBgStyle: { fill: '#f8f9fa', fillOpacity: 0.8 }, // REMOVED
  // labelBgPadding: [4, 6] as [number, number], // REMOVED
  // labelBgBorderRadius: 3, // REMOVED
};

// --- Dagre Layout Setup ---
const DEFAULT_NODE_WIDTH = 200; 
const DEFAULT_NODE_HEIGHT = 80; 

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  // Create a new graph instance for each layout calculation
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Set graph options
  dagreGraph.setGraph({ rankdir: direction, nodesep: 70, ranksep: 100 });

  nodes.forEach((node) => {
    const nodeWidth = node.width || DEFAULT_NODE_WIDTH;
    const nodeHeight = node.height || DEFAULT_NODE_HEIGHT;
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Perform layout inside a try...catch
  try {
    dagre.layout(dagreGraph);
  } catch (layoutError) {
    console.error("[Layout] Error during dagre.layout():", layoutError);
    // Re-throw or return empty to prevent proceeding with bad data
    throw layoutError; // Or return [];
  }

  // Map results (same as before)
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    if (!nodeWithPosition) { // Add check in case layout failed for a node
        console.warn(`[Layout] No position found for node ${node.id} after layout.`);
        return { id: node.id, position: node.position }; // Return original position
    }
    const nodeWidth = node.width || DEFAULT_NODE_WIDTH;
    const nodeHeight = node.height || DEFAULT_NODE_HEIGHT;
    const newPosition = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return { id: node.id, position: newPosition }; 
  });

  return layoutedNodes; 
};
// --------------------------

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
  const [showLandingPage, setShowLandingPage] = useState(() => !localStorage.getItem(LOCAL_STORAGE_KEY_NODES));
  const [activeTool, setActiveTool] = useState<DrawingTool>('select');
  const [selectedEdgeLabelText, setSelectedEdgeLabelText] = useState<string | null>(null); // State for edge label text

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
    const isDeselecting = selectedEdge?.id === edge.id;
    setSelectedEdge(isDeselecting ? null : edge);
    setNodes((nds) => nds.map(n => ({ ...n, selected: false }))); // Deselect nodes
    setEditingNode(null); 
    setIsFormVisible(false);
    setActiveTool('select');

    // Find and set edge label text
    if (!isDeselecting) {
      const labelNode = nodes.find(n => 
        n.type === 'edgeLabel' && 
        // Assert via unknown
        (n.data as unknown as EdgeLabelData)?.edgeId === edge.id
      );
      // Assert via unknown here too
      setSelectedEdgeLabelText(labelNode ? (labelNode.data as unknown as EdgeLabelData).text : null);
    } else {
      setSelectedEdgeLabelText(null); // Clear label text on deselect
    }
  }, [setNodes, setActiveTool, selectedEdge, nodes]); // Add selectedEdge and nodes to dependencies

  // --- Form Handling ---
  const openNodeForm = useCallback((nodeToEdit?: Node<NodeData>) => {
    setEditingNode(nodeToEdit || null);
    setIsFormVisible(true);
    setSelectedEdge(null);
    setActiveTool('select');
  }, [setActiveTool]);

  const handleCancelForm = useCallback(() => {
    setIsFormVisible(false);
    setEditingNode(null);
  }, []);

  // Combined handler for adding/updating nodes from the form
  const handleFormSubmit = useCallback((formData: NodeData, isEditing: boolean, nodeId?: string) => {
    if (isEditing && nodeId) {
      // Update existing node
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            // Update node data, keeping existing position
            return { ...node, data: formData };
          }
          return node;
        })
      );
      setEditingNode(null); // Clear editing state
    } else {
      // Add new node
      const newNodeId = getNextId();
      const newNode: Node<NodeData> = {
        id: newNodeId,
        position: { x: Math.random() * 400, y: Math.random() * 400 }, // Initial random position
        data: formData, 
        type: 'custom', // Use the custom node type
      };
      setNodes((nds) => nds.concat(newNode));
    }
    setIsFormVisible(false); // Close form
  }, [setNodes]);

  // Simplified handler for the Add Node button (just opens the form)
  const handleAddNode = useCallback(() => {
    openNodeForm(); // Open form without pre-filled data
  }, [openNodeForm]);

  // --- Copy Handler ---
  const handleCopy = useCallback(() => {
    const selected = nodes.filter((node): node is Node<NodeData> => 
      node.selected === true && node.type === 'custom'
    );
    if (selected.length > 0) {
      setCopiedNodes(selected);
      console.log('Copied nodes:', selected.map(n => n.id));
    }
  }, [nodes]);

  // --- Paste Handler ---
  const handlePaste = useCallback(() => {
    if (copiedNodes.length === 0) return;
    const newNodes = copiedNodes.map((node) => {
      const newNodeId = getNextId();
      return {
        ...node,
        id: newNodeId,
        selected: false, 
        position: { 
          x: node.position.x + 20,
          y: node.position.y + 20,
        },
      };
    });
    setNodes((nds) => nds.concat(newNodes));
    console.log('Pasted nodes:', newNodes.map(n => n.id));
  }, [copiedNodes, setNodes]);

  // --- Double Click Handler ---
  const onNodeDoubleClick: NodeMouseHandler = useCallback((_event, node) => {
     if (node.type === 'custom') {
       setEditingNode(node as Node<NodeData>); 
       openNodeForm(node as Node<NodeData>);
     } else if (node.type === 'textAnnotation') {
       // Could trigger inline editing here later
     }
     setActiveTool('select');
  }, [openNodeForm, setActiveTool]);

  // --- Layout Handler ---
  const handleLayoutNodes = useCallback((direction: string = 'LR') => {
    if (nodes.length === 0) {
        return;
    }
    
    try {
      const layoutedNodePositions = getLayoutedElements(nodes, edges, direction);
      
      const positionMap = new Map(layoutedNodePositions.map(item => [item.id, item.position]));
  
      setNodes(currentNodes => {
        const newNodes = currentNodes.map(node => {
          const newPosition = positionMap.get(node.id);
          if (newPosition && (node.position.x !== newPosition.x || node.position.y !== newPosition.y)) {
            return { ...node, position: newPosition };
          }
          return node;
        });
        return newNodes;
      });
    } catch (error) {
        console.error("[Layout] Error during layout calculation:", error);
    }

  }, [nodes, edges, setNodes]);

  // --- Re-add onConnect Handler ---
  const onConnect = useCallback(
    (params: Edge | Connection) => 
      setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions, data: {} }, eds)),
    [setEdges],
  );

  // --- Keyboard Event Listener (Modified for edge label deletion) ---
   const handleKeyDown = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return; 
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);
      const selectedEdgeIds = edges.filter(e => e.selected).map(e => e.id);
      
      // Find edge label nodes associated with selected edges
      const labelNodesToDelete = nodes.filter(n => 
          n.type === 'edgeLabel' && 
          // Cast n.data safely
          selectedEdgeIds.includes((n.data as unknown as EdgeLabelData)?.edgeId) 
        ).map(n => n.id);
        
      const allNodeIdsToDelete = [...new Set([...selectedNodeIds, ...labelNodesToDelete])];

      if (allNodeIdsToDelete.length > 0) {
          setNodes((nds) => nds.filter(n => !allNodeIdsToDelete.includes(n.id)));
      }
      if (selectedEdgeIds.length > 0) {
          setEdges((eds) => eds.filter(e => !selectedEdgeIds.includes(e.id)));
          setSelectedEdge(null); // Ensure edge selection is cleared
      }
    }
    if ((event.metaKey || event.ctrlKey) && event.key === 'c') {
      handleCopy();
    }
    if ((event.metaKey || event.ctrlKey) && event.key === 'v') {
      handlePaste();
    }
  };
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // --- Effect to update EdgeLabel positions ---
  useEffect(() => {
    const edgeLabelNodes = nodes.filter(n => n.type === 'edgeLabel');
    if (edgeLabelNodes.length === 0) {
      return; // No labels to update
    }

    let needsUpdate = false;
    const updates: { id: string; position: XYPosition }[] = [];

    edgeLabelNodes.forEach(labelNode => {
      // Assert the type via unknown
      const data = labelNode.data as unknown as EdgeLabelData;
      const edge = reactFlowInstance.getEdge(data.edgeId);
      if (!edge) return;

      const sourceNode = reactFlowInstance.getNode(edge.source);
      const targetNode = reactFlowInstance.getNode(edge.target);
      if (!sourceNode || !targetNode) return;

      // Calculate edge midpoint
      const sourceX = sourceNode.position.x + (sourceNode.width ?? 0) / 2;
      const sourceY = sourceNode.position.y + (sourceNode.height ?? 0) / 2;
      const targetX = targetNode.position.x + (targetNode.width ?? 0) / 2;
      const targetY = targetNode.position.y + (targetNode.height ?? 0) / 2;
      const midX = (sourceX + targetX) / 2;
      const midY = (sourceY + targetY) / 2;

      // Get label size (approximate or use actual dimensions if available)
      const labelWidth = labelNode.width ?? 60; // Guess width
      const labelHeight = labelNode.height ?? 20; // Guess height

      // Get stored offset or use default (0, 0)
      const offset = data.offset || { dx: 0, dy: 0 };

      // Calculate target position
      const targetPosition = {
        x: midX + offset.dx - labelWidth / 2, // Adjust for label dimensions
        y: midY + offset.dy - labelHeight / 2,
      };

      // Check if position needs updating (with a small tolerance)
      const tolerance = 0.1;
      if (Math.abs(labelNode.position.x - targetPosition.x) > tolerance ||
          Math.abs(labelNode.position.y - targetPosition.y) > tolerance) {
          updates.push({ id: labelNode.id, position: targetPosition });
          needsUpdate = true;
      }
    });

    if (needsUpdate) {
      // console.log("[EdgeLabel Update] Updating positions:", updates);
      setNodes(nds =>
        nds.map(n => {
          const update = updates.find(u => u.id === n.id);
          return update ? { ...n, position: update.position } : n;
        })
      );
    }
  }, [nodes, edges, setNodes, reactFlowInstance]); // Rerun when nodes or edges change

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
               domNode?.classList?.contains('react-flow__attribution') ||
               domNode?.parentElement?.classList.contains('react-flow__controls') || // Also filter children of controls
               domNode?.closest('.floating-toolbar-container') // Filter toolbar and its children
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

  // --- Sidebar Toggle Handler (Simplified) ---
  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible(prev => !prev);
    requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize')); // Keep resize dispatch
    });
  }, []);

  // --- Dynamic Tailwind class for toggle button positioning ---
  const toggleButtonLeftClass = isSidebarVisible ? `left-[${SIDEBAR_WIDTH - 13}px]` : `left-[${COLLAPSED_WIDTH - 13}px]`;

  // --- Landing Page Handler ---
  const handleLaunchApp = () => {
    setShowLandingPage(false);
  };

  // --- Edge Double Click Handler (Modified) ---
  const handleEdgeDoubleClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    // Check if a label node already exists for this edge
    // Cast node.data safely
    const existingLabelNode = nodes.find(node => node.type === 'edgeLabel' && (node.data as unknown as EdgeLabelData)?.edgeId === edge.id);
    if (existingLabelNode) {
      // Optional: Focus or trigger edit on existing node?
      console.log("Label already exists for this edge.");
      // Possibly select the node:
      // setNodes(nds => nds.map(n => ({...n, selected: n.id === existingLabelNode.id})));
      // setSelectedEdge(null); // Deselect edge if selecting label node
      return; 
    }

    // Calculate position (approximate midpoint)
    // Need source/target nodes for position calculation
    const sourceNode = reactFlowInstance.getNode(edge.source);
    const targetNode = reactFlowInstance.getNode(edge.target);

    if (!sourceNode || !targetNode) {
      console.error("Could not find source or target node for edge label positioning.");
      return;
    }

    // Simple midpoint calculation
    const position = {
      x: (sourceNode.position.x + (sourceNode.width ?? 100) / 2 + targetNode.position.x + (targetNode.width ?? 100) / 2) / 2 - 30, // Adjust for label width guess
      y: (sourceNode.position.y + (sourceNode.height ?? 50) / 2 + targetNode.position.y + (targetNode.height ?? 50) / 2) / 2 - 10, // Adjust for label height guess
    };

    // Create the new label node with empty text and startEditing flag
    const newLabelNode: Node<EdgeLabelData> = {
      id: getNextId('edgeLabel'),
      type: 'edgeLabel', // Use the correct node type
      position,
      data: { 
        edgeId: edge.id, 
        text: '', // Start with empty text
        label: '', // Satisfy NodeData 
        startEditing: true // Add the flag
      }, 
      draggable: true, 
      selectable: true,
      className: 'nopan', // Keep nopan to allow edge interaction underneath
    };

    // Add the new node to the state
    setNodes((nds) => nds.concat(newLabelNode as Node)); // Cast needed because Node<T> vs Node
    setActiveTool('select');

  }, [nodes, setNodes, reactFlowInstance, setActiveTool]);

  // --- Toolbar Handler ---
  const handleToolSelect = useCallback((tool: DrawingTool) => {
    setActiveTool(tool);
    // Restore deselect logic
    if (tool !== 'select') {
        setNodes((nds) => nds.map(n => ({ ...n, selected: false })));
        setSelectedEdge(null);
    }
  }, [setNodes, setActiveTool]);

  // --- Handle Node Drag Stop for Edge Labels ---
  const handleNodeDragStop: NodeMouseHandler = useCallback((_event, node) => {
    if (node.type !== 'edgeLabel') {
      return; // Only handle edge labels
    }
    // Assert the type via unknown
    const data = node.data as unknown as EdgeLabelData;
    const edge = reactFlowInstance.getEdge(data.edgeId);
    if (!edge) return;

    const sourceNode = reactFlowInstance.getNode(edge.source);
    const targetNode = reactFlowInstance.getNode(edge.target);
    if (!sourceNode || !targetNode) return;

    // Calculate edge midpoint
    const sourceX = sourceNode.position.x + (sourceNode.width ?? 0) / 2;
    const sourceY = sourceNode.position.y + (sourceNode.height ?? 0) / 2;
    const targetX = targetNode.position.x + (targetNode.width ?? 0) / 2;
    const targetY = targetNode.position.y + (targetNode.height ?? 0) / 2;
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    // Get label size (approximate or use actual dimensions if available)
    const labelWidth = node.width ?? 60; // Guess width
    const labelHeight = node.height ?? 20; // Guess height

    // Calculate the offset based on final dragged position
    const offsetX = (node.position.x + labelWidth / 2) - midX;
    const offsetY = (node.position.y + labelHeight / 2) - midY;
    const newOffset = { dx: offsetX, dy: offsetY };

    // console.log(`[EdgeLabel ${node.id}] Drag Stop - Calculated Offset:`, newOffset);

    // Update the node's data with the new offset
    setNodes(nds =>
      nds.map(n => {
        if (n.id === node.id) {
          return { ...n, data: { ...n.data, offset: newOffset } };
        }
        return n;
      })
    );
  }, [reactFlowInstance, setNodes, nodes, edges]); // Dependencies needed

  // Render Landing Page if needed
  if (showLandingPage) {
    return <LandingPage onLaunchApp={handleLaunchApp} />;
  }

  return (
    // Main container using Flexbox and Tailwind
    <div className="flex h-screen font-inter"> 
      <Sidebar 
        isSidebarVisible={isSidebarVisible}
        selectedNodes={selectedNodes}
        selectedEdge={selectedEdge}
        nodes={nodes}
        edges={edges}
        setEdges={setEdges}
        onAddNodeClick={handleAddNode}
        onSavePNG={handleSavePNG}
        onSaveFlow={handleSaveFlow}
        onLoadFlowTrigger={handleLoadFlowTrigger}
        onLayoutNodesClick={handleLayoutNodes}
        edgeLabelText={selectedEdgeLabelText} // Pass the label text state
      />
      {/* Toggle button using Tailwind classes */}
      <button 
        className={`absolute top-[15px] z-10 flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-gray-100 p-0 text-sm leading-none text-gray-700 shadow transition-all duration-300 ease-in-out hover:bg-gray-200 ${toggleButtonLeftClass}`}
        onClick={toggleSidebar}
        title={isSidebarVisible ? 'Collapse Sidebar' : 'Expand Sidebar'}
      >
        {isSidebarVisible ? '<' : '>'} 
      </button>
      {/* React Flow Wrapper using Tailwind */}
      <div ref={reactFlowWrapper} className="relative h-full flex-grow bg-gray-50 floating-toolbar-container"> 
        <FloatingToolbar 
           activeTool={activeTool} 
           onToolSelect={handleToolSelect}
        />
        <ReactFlow
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange} 
          onConnect={onConnect}       
          nodeTypes={nodeTypes} 
          onEdgeClick={onEdgeClick}
          onNodeDoubleClick={onNodeDoubleClick} 
          onEdgeDoubleClick={handleEdgeDoubleClick}
          onNodeDragStop={handleNodeDragStop}
          fitView 
          defaultEdgeOptions={defaultEdgeOptions}
          panOnDrag={activeTool === 'select' ? [0, 1, 2] : undefined}
          selectionOnDrag={true} // Enable drag selection box
          multiSelectionKeyCode="Shift" // Explicitly set (though it's default)
          deleteKeyCode={null} 
          proOptions={{ hideAttribution: true }}
          className={`drawing-tool-${activeTool}`}
        >
          <Controls />
          <Background />
          <MiniMap />
          {isFormVisible && (
            <NodeForm 
              key={editingNode ? `edit-${editingNode.id}` : 'add'} 
              initialData={editingNode?.data || null}
              isEditing={!!editingNode}
              onSubmit={(data) => handleFormSubmit(data, !!editingNode, editingNode?.id)}
              onCancel={handleCancelForm}
            />
          )}
        </ReactFlow>
      </div>
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleLoadFlow}
      />
    </div>
  );
}

// Wrap App with ReactFlowProvider 
function AppWrapper() {
  const [showLandingPage, setShowLandingPage] = useState(() => !localStorage.getItem(LOCAL_STORAGE_KEY_NODES));

  const handleAppLaunch = useCallback(() => {
    setShowLandingPage(false);
  }, []);

  if (showLandingPage) {
    return (
      <div className="landing-page-container">
        <LandingPage onLaunchApp={handleAppLaunch} />
      </div>
    );
  }
  
  return (
    <div className="app-container">
      <ReactFlowProvider>
        <App />
      </ReactFlowProvider>
    </div>
  );
}

// --- Helper function to trigger file download ---
function downloadFile(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link); 
  link.click();
  document.body.removeChild(link);
}

export default AppWrapper;
