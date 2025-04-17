import React, { useMemo, useCallback } from 'react';
import { Node, Edge, ReactFlowState, useStore } from 'reactflow';

// Define the expected data structure for the selected node
interface NodeData {
  label: string;
  entity: string;
  type: string;
  subType?: string;
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
  onAddNodeClick: () => void;
  onEditNodeClick?: (node: Node<NodeData>) => void;
  onLayoutClick: (direction: string) => void;
}

// Styles inspired by OM
const sidebarStyle: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 0,
  width: '280px', // Slightly wider
  height: '100%',
  background: '#f8f9fa', // OM Body background
  borderLeft: '1px solid #D5D7DA', // OM Border color
  padding: '20px', // Consistent padding
  boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif', // OM Font
  overflowY: 'auto',
  color: '#333', 
  fontSize: '14px', // Base font size
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '24px', // Increased spacing between sections
};

const titleStyle: React.CSSProperties = {
    fontSize: '16px', 
    fontWeight: 600, 
    marginBottom: '16px', // Increased space below title
    borderBottom: '1px solid #E9EAEB', 
    paddingBottom: '10px', 
    color: '#1B1D21', // Darker title color
};

// Style for the container holding a label and its value
const detailRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between', // Pushes label and value apart slightly
  alignItems: 'center',
  marginBottom: '8px', // Space below each row (OM @size-xs)
  lineHeight: 1.5,
};

const labelStyle: React.CSSProperties = {
  fontWeight: 500,
  color: '#757575', 
  marginRight: '10px', // Space after label
  flexShrink: 0, // Prevent label from shrinking
};

const valueStyle: React.CSSProperties = {
  color: '#333', // Standard text color for values
  textAlign: 'right', // Align value text to the right
  wordBreak: 'break-word', // Allow long values to wrap
};

// Style for descriptive paragraphs (like description, filters etc)
const descriptionParagraphStyle: React.CSSProperties = {
    margin: '4px 0 8px 0', 
    lineHeight: 1.5, 
    color: '#333', // Ensure standard text color
};

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  paddingLeft: 0, 
  margin: '5px 0',
};

const listItemStyle: React.CSSProperties = {
    marginBottom: '5px', // Consistent small spacing
    color: '#333', // Ensure standard text color
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '80px',
  boxSizing: 'border-box',
  border: '1px solid #D5D7DA',
  borderRadius: '4px',
  padding: '8px 12px',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  color: '#333',
  backgroundColor: '#ffffff',
};

// Style for sub-section headers (e.g., Inputs, Outputs, Description)
const subTitleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#333',
  marginBottom: '8px',
  paddingBottom: '4px',
  borderBottom: '1px solid #dee2e6', // Lighter border for sub-sections
};

// --- New Styles for Buttons in Sidebar ---
const sidebarControlsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  marginBottom: '20px', // Space below buttons
  paddingBottom: '15px', // Space above border
  borderBottom: '1px solid #E9EAEB', // Separator line
};

const sidebarButtonStyle: React.CSSProperties = {
  flexGrow: 1, // Make buttons share space
  padding: '8px 12px',
  border: '1px solid #D5D7DA',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '13px',
  fontFamily: 'inherit',
  textAlign: 'center',
  transition: 'background-color 0.2s, border-color 0.2s',
};

const primarySidebarButtonStyle: React.CSSProperties = {
  ...sidebarButtonStyle,
  background: '#0950c5',
  color: 'white',
  borderColor: '#0950c5',
  fontWeight: 600,
};

const secondarySidebarButtonStyle: React.CSSProperties = {
  ...sidebarButtonStyle,
  background: '#fff',
  color: '#333',
};
// -------------------------------------------

const Sidebar: React.FC<SidebarProps> = ({ 
  selectedNode, 
  selectedEdge, 
  nodes, 
  edges, 
  setEdges, 
  onAddNodeClick,
  onEditNodeClick,
  onLayoutClick
}) => {

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

  let content;
  if (selectedNode) {
    const { 
      label = 'N/A', 
      entity = 'N/A',
      type = 'N/A',
      subType,
      domain = '-', 
      owner = '-', 
      description = '-', 
      transformations = '-', 
      filters = '-'
    } = selectedNode.data || {};

    content = (
      <>
        <h3 style={titleStyle}>Node Details</h3>
        
        <div style={sectionStyle}>
            <div style={detailRowStyle}>
              <span style={labelStyle}>ID:</span> 
              <span style={valueStyle}>{selectedNode.id}</span>
            </div>
            <div style={detailRowStyle}>
              <span style={labelStyle}>Label:</span> 
              <span style={valueStyle}>{label}</span>
            </div>
            <div style={detailRowStyle}>
              <span style={labelStyle}>Entity:</span> 
              <span style={valueStyle}>{entity}</span>
            </div>
            <div style={detailRowStyle}>
              <span style={labelStyle}>Type:</span> 
              <span style={valueStyle}>{type}</span>
            </div>
            
            {subType && (
              <div style={detailRowStyle}>
                <span style={labelStyle}>Sub Type:</span>
                <span style={valueStyle}>{subType}</span>
              </div>
            )}
            
            <div style={detailRowStyle}>
              <span style={labelStyle}>Domain:</span> 
              <span style={valueStyle}>{domain}</span>
            </div>
             <div style={detailRowStyle}>
              <span style={labelStyle}>Owner:</span> 
              <span style={valueStyle}>{owner}</span>
            </div>
        </div>

        <div style={sectionStyle}>
            <h4 style={subTitleStyle}>Inputs ({inputs.length})</h4>
            {inputs.length > 0 ? (
            <ul style={listStyle}>
                {inputs.map((inputLabel, index) => <li style={listItemStyle} key={index}>{inputLabel}</li>)}
            </ul>
            ) : (
            <p style={{ ...descriptionParagraphStyle, fontStyle: 'italic', color: '#757575' }}>None</p>
            )}
        </div>
        
        <div style={sectionStyle}>
            <h4 style={subTitleStyle}>Outputs ({outputs.length})</h4>
            {outputs.length > 0 ? (
            <ul style={listStyle}>
                {outputs.map((outputLabel, index) => <li style={listItemStyle} key={index}>{outputLabel}</li>)}
            </ul>
            ) : (
            <p style={{ ...descriptionParagraphStyle, fontStyle: 'italic', color: '#757575' }}>None</p>
            )}
        </div>

        <div style={sectionStyle}>
            <h4 style={subTitleStyle}>Description</h4>
            <p style={descriptionParagraphStyle}>{description}</p>
        </div>

        <div style={sectionStyle}>
            <h4 style={subTitleStyle}>Transformations</h4>
            <p style={descriptionParagraphStyle}>{transformations}</p>
        </div>

        <div style={sectionStyle}>
            <h4 style={subTitleStyle}>Filters</h4>
            <p style={descriptionParagraphStyle}>{filters}</p>
        </div>
      </>
    );
  } else if (selectedEdge) {
    const sourceNode = nodes.find(node => node.id === selectedEdge.source);
    const targetNode = nodes.find(node => node.id === selectedEdge.target);

    content = (
      <>
        <h3 style={titleStyle}>Relationship Details</h3>
        <div style={sectionStyle}>
          <div style={detailRowStyle}>
              <span style={labelStyle}>ID:</span> 
              <span style={valueStyle}>{selectedEdge.id}</span>
          </div>
           <div style={detailRowStyle}>
              <span style={labelStyle}>Source:</span> 
              <span style={valueStyle}>{sourceNode?.data?.label || selectedEdge.source}</span>
          </div>
           <div style={detailRowStyle}>
              <span style={labelStyle}>Target:</span> 
              <span style={valueStyle}>{targetNode?.data?.label || selectedEdge.target}</span>
          </div>
        </div>
        <div style={sectionStyle}>
          <h4 style={subTitleStyle}>Details:</h4>
          <textarea 
            style={textareaStyle}
            value={selectedEdge.data?.details || ''}
            onChange={onEdgeDetailsChange}
            placeholder="Enter relationship details..."
          />
        </div>
      </>
    );
  } else {
    content = (
      <p style={descriptionParagraphStyle}>Select a node or edge to see details</p>
    );
  }

  return (
    <div style={sidebarStyle}>
      <div style={sidebarControlsStyle}>
        <button 
          onClick={onAddNodeClick}
          style={primarySidebarButtonStyle}
        >
          Add Node
        </button>
        {selectedNode && onEditNodeClick && (
          <button 
            onClick={() => onEditNodeClick(selectedNode)}
            style={secondarySidebarButtonStyle}
          >
            Edit Node
          </button>
        )}
        <button 
          onClick={() => onLayoutClick('LR')}
          style={secondarySidebarButtonStyle}
        >
          Layout Nodes
        </button>
      </div>

      {content}
    </div>
  );
};

export default Sidebar; 