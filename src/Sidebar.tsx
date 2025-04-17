import React, { useMemo, useCallback } from 'react';
import { Node, Edge, ReactFlowState, useStore } from 'reactflow';

// Define the expected data structure for the selected node
interface NodeData {
  label: string;
  type: string;
  domain?: string;
  owner?: string;
  description?: string;
  transformations?: string;
  filters?: string;
}

interface EdgeData {
  details?: string;
}

interface SidebarProps {
  selectedNode: Node<NodeData> | null;
  selectedEdge: Edge<EdgeData> | null;
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  setEdges: React.Dispatch<React.SetStateAction<Edge<EdgeData>[]>>;
}

const sidebarStyle: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 0,
  width: '250px',
  height: '100%',
  background: '#f0f0f0',
  borderLeft: '1px solid #ccc',
  padding: '15px',
  boxSizing: 'border-box',
  fontFamily: 'sans-serif',
  overflowY: 'auto',
  color: '#333',
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '15px',
};

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  paddingLeft: '10px',
  margin: '5px 0',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '80px',
  boxSizing: 'border-box',
  border: '1px solid #ccc',
  borderRadius: '4px',
  padding: '5px',
  fontFamily: 'inherit',
  fontSize: 'inherit',
};

const Sidebar: React.FC<SidebarProps> = ({ selectedNode, selectedEdge, nodes, edges, setEdges }) => {

  const { inputs, outputs } = useMemo(() => {
    if (!selectedNode) return { inputs: [], outputs: [] };

    const inputEdges = edges.filter((edge) => edge.target === selectedNode.id);
    const outputEdges = edges.filter((edge) => edge.source === selectedNode.id);

    const inputNodeLabels = inputEdges.map((edge) => {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      return sourceNode?.data?.label || edge.source;
    });

    const outputNodeLabels = outputEdges.map((edge) => {
      const targetNode = nodes.find((node) => node.id === edge.target);
      return targetNode?.data?.label || edge.target;
    });

    return { inputs: inputNodeLabels, outputs: outputNodeLabels };
  }, [selectedNode, nodes, edges]);

  const onEdgeDetailsChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!selectedEdge) return;

      const selectedEdgeId = selectedEdge.id;
      const newDetails = event.target.value;

      setEdges((currentEdges) =>
        currentEdges.map((edge) => {
          if (edge.id === selectedEdgeId) {
            const currentData = edge.data || {};
            return { ...edge, data: { ...currentData, details: newDetails } };
          }
          return edge;
        })
      );
    },
    [selectedEdge, setEdges]
  );

  if (selectedNode) {
    const { 
      label = 'N/A', 
      type = 'N/A', 
      domain = '-', 
      owner = '-', 
      description = '-', 
      transformations = '-', 
      filters = '-'
    } = selectedNode.data || {};

    return (
      <div style={sidebarStyle}>
        <h3>Node Details</h3>
        <div style={sectionStyle}>
          <p><strong>ID:</strong> {selectedNode.id}</p>
          <p><strong>Label:</strong> {label}</p>
          <p><strong>Type:</strong> {type}</p>
          <p><strong>Domain:</strong> {domain}</p>
          <p><strong>Owner:</strong> {owner}</p>
        </div>

        <div style={sectionStyle}>
          <h4>Inputs ({inputs.length})</h4>
          {inputs.length > 0 ? (
            <ul style={listStyle}>
              {inputs.map((inputLabel, index) => <li key={index}>{inputLabel}</li>)}
            </ul>
          ) : (
            <p style={{ marginLeft: '10px', fontStyle: 'italic' }}>None</p>
          )}
        </div>

        <div style={sectionStyle}>
          <h4>Outputs ({outputs.length})</h4>
          {outputs.length > 0 ? (
            <ul style={listStyle}>
              {outputs.map((outputLabel, index) => <li key={index}>{outputLabel}</li>)}
            </ul>
          ) : (
            <p style={{ marginLeft: '10px', fontStyle: 'italic' }}>None</p>
          )}
        </div>

        <div style={sectionStyle}>
          <h4>Description</h4>
          <p>{description}</p>
        </div>
        
        <div style={sectionStyle}>
          <h4>Transformations</h4>
          <p>{transformations}</p>
        </div>

        <div style={sectionStyle}>
          <h4>Filters</h4>
          <p>{filters}</p>
        </div>

      </div>
    );
  } else if (selectedEdge) {
    const sourceNode = nodes.find(node => node.id === selectedEdge.source);
    const targetNode = nodes.find(node => node.id === selectedEdge.target);

    return (
      <div style={sidebarStyle}>
        <h3>Relationship Details</h3>
        <div style={sectionStyle}>
          <p><strong>ID:</strong> {selectedEdge.id}</p>
          <p><strong>Source:</strong> {sourceNode?.data?.label || selectedEdge.source}</p>
          <p><strong>Target:</strong> {targetNode?.data?.label || selectedEdge.target}</p>
        </div>
        <div style={sectionStyle}>
          <h4>Details:</h4>
          <textarea 
            style={textareaStyle}
            value={selectedEdge.data?.details || ''}
            onChange={onEdgeDetailsChange}
            placeholder="Enter relationship details..."
          />
        </div>
      </div>
    );
  } else {
    return (
      <div style={sidebarStyle}>
        <p>Select a node or edge to see details</p>
      </div>
    );
  }
};

export default Sidebar; 