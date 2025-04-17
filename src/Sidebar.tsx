import React, { useMemo, useCallback, useState, useRef } from 'react';
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
  selectedNodes: Node<NodeData>[];
  selectedEdge: Edge<EdgeData> | null;
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  setEdges: React.Dispatch<React.SetStateAction<Edge<EdgeData>[]>>;
  onAddNodeClick: () => void;
  onEditNodeClick?: (node: Node<NodeData>) => void;
  onDeleteNodesClick: () => void;
  onSavePNG: () => void;
  onSaveFlow: () => void;
  onLoadFlowTrigger: () => void;
}

// --- Constants ---
const SIDEBAR_WIDTH = 280; // Fixed width for now

// --- Styles ---
const sidebarStyle: React.CSSProperties = { // Simplified style
  width: `${SIDEBAR_WIDTH}px`,
  height: '100%', // Fill height of flex container
  background: '#f8f9fa',
  borderRight: '1px solid #D5D7DA',
  padding: '20px 0',      // Corrected: No horizontal padding on main container
  boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  color: '#333',
  fontSize: '14px',
  overflow: 'hidden', // Prevent overall sidebar scroll
};

// Style for clickable section headers
const clickableHeaderStyle: React.CSSProperties = {
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  userSelect: 'none', // Prevent text selection on click
  paddingBottom: '10px', // Ensure padding matches titleStyle
  borderBottom: '1px solid #E9EAEB', // Ensure border matches titleStyle
  marginBottom: '16px', // Ensure margin matches titleStyle
};

const arrowStyle = (isExpanded: boolean): React.CSSProperties => ({
  fontSize: '12px', 
  marginLeft: '8px', 
  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
  transition: 'transform 0.2s ease-in-out',
});

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
    wordBreak: 'break-word', 
};

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  paddingLeft: 0, 
  margin: '5px 0',
};

const listItemStyle: React.CSSProperties = {
    marginBottom: '5px', // Consistent small spacing
    color: '#333', // Ensure standard text color
    wordBreak: 'break-word',
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
  selectedNodes,
  selectedEdge,
  nodes,
  edges,
  setEdges,
  onAddNodeClick,
  onEditNodeClick,
  onDeleteNodesClick,
  onSavePNG,
  onSaveFlow,
  onLoadFlowTrigger,
}) => {
  
  // REMOVED resize state/handlers
  // const sidebarRef = useRef<HTMLDivElement>(null);
  // const [sidebarWidth, setSidebarWidth] = useState(INITIAL_WIDTH);
  // const [isResizing, setIsResizing] = useState(false);

  // --- State for collapsible sections ---
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    inputs: true,
    outputs: true,
    description: false, // Default some to collapsed
    transformations: false,
    filters: false,
    edgeDetails: true,
    relationshipDetails: true,
  });

  // --- Toggle function ---
  const toggleSection = (sectionName: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  // --- Determine single selected node for details/edit --- 
  const singleSelectedNode = useMemo(() => {
    return selectedNodes.length === 1 ? selectedNodes[0] : null;
  }, [selectedNodes]);

  const { inputs, outputs } = useMemo(() => {
    if (!singleSelectedNode) return { inputs: [], outputs: [] };

    const inputEdges = edges.filter((edge) => edge.target === singleSelectedNode.id);
    const outputEdges = edges.filter((edge) => edge.source === singleSelectedNode.id);

    const inputNodeLabels = inputEdges.map((edge) => {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      return sourceNode?.data?.label || edge.source;
    });

    const outputNodeLabels = outputEdges.map((edge) => {
      const targetNode = nodes.find((node) => node.id === edge.target);
      return targetNode?.data?.label || edge.target;
    });

    return { inputs: inputNodeLabels, outputs: outputNodeLabels };
  }, [singleSelectedNode, nodes, edges]);

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
  if (singleSelectedNode && !selectedEdge) {
    const { label = 'N/A', entity = 'N/A', type = 'N/A', subType, domain = '-', owner = '-', description = '-', transformations = '-', filters = '-'} = singleSelectedNode.data || {};
    content = (
      <>
        <h3 style={{...titleStyle, ...clickableHeaderStyle}} onClick={() => toggleSection('details')}>Node Details<span style={arrowStyle(expandedSections.details)}>▶</span></h3>
        {expandedSections.details && (
          <div style={sectionStyle}>
            <div style={detailRowStyle}>
              <span style={labelStyle}>ID:</span> 
              <span style={valueStyle}>{singleSelectedNode.id}</span>
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
        )}

        <h4 style={{...subTitleStyle, ...clickableHeaderStyle}} onClick={() => toggleSection('inputs')}>Inputs ({inputs.length})<span style={arrowStyle(expandedSections.inputs)}>▶</span></h4>
        {expandedSections.inputs && (
            inputs.length > 0 
              ? (<ul style={listStyle}>{inputs.map((inputLabel, index) => <li style={listItemStyle} key={index}>{inputLabel}</li>)}</ul>) 
              : (<p style={{ ...descriptionParagraphStyle, fontStyle: 'italic', color: '#757575' }}>None</p>)
        )}
        
        <h4 style={{...subTitleStyle, ...clickableHeaderStyle}} onClick={() => toggleSection('outputs')}>Outputs ({outputs.length})<span style={arrowStyle(expandedSections.outputs)}>▶</span></h4>
        {expandedSections.outputs && (
            outputs.length > 0 
              ? (<ul style={listStyle}>{outputs.map((outputLabel, index) => <li style={listItemStyle} key={index}>{outputLabel}</li>)}</ul>)
              : (<p style={{ ...descriptionParagraphStyle, fontStyle: 'italic', color: '#757575' }}>None</p>)
        )}

        <h4 style={{...subTitleStyle, ...clickableHeaderStyle}} onClick={() => toggleSection('description')}>Description<span style={arrowStyle(expandedSections.description)}>▶</span></h4>
        {expandedSections.description && <p style={descriptionParagraphStyle}>{description}</p>}

        <h4 style={{...subTitleStyle, ...clickableHeaderStyle}} onClick={() => toggleSection('transformations')}>Transformations<span style={arrowStyle(expandedSections.transformations)}>▶</span></h4>
        {expandedSections.transformations && <p style={descriptionParagraphStyle}>{transformations}</p>}

        <h4 style={{...subTitleStyle, ...clickableHeaderStyle}} onClick={() => toggleSection('filters')}>Filters<span style={arrowStyle(expandedSections.filters)}>▶</span></h4>
        {expandedSections.filters && <p style={descriptionParagraphStyle}>{filters}</p>}
      </>
    );
  } else if (selectedEdge) {
    const sourceNode = nodes.find(node => node.id === selectedEdge.source);
    const targetNode = nodes.find(node => node.id === selectedEdge.target);

    content = (
      <>
        <h3 style={{...titleStyle, ...clickableHeaderStyle}} onClick={() => toggleSection('relationshipDetails')}>Relationship Details<span style={arrowStyle(expandedSections.relationshipDetails)}>▶</span></h3>
        {expandedSections.relationshipDetails && (
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
        )}
        <h4 style={{...subTitleStyle, ...clickableHeaderStyle}} onClick={() => toggleSection('edgeDetails')}>Details<span style={arrowStyle(expandedSections.edgeDetails)}>▶</span></h4>
        {expandedSections.edgeDetails && (
          <textarea 
            style={textareaStyle}
            value={selectedEdge.data?.details || ''}
            onChange={onEdgeDetailsChange}
            placeholder="Enter relationship details..."
          />
        )}
      </>
    );
  } else if (selectedNodes.length > 1) {
    content = (
      <>
        <h3 style={titleStyle}>Multiple Nodes Selected</h3>
        <p style={descriptionParagraphStyle}>{selectedNodes.length} nodes selected.</p>
        <ul style={listStyle}>
          {selectedNodes.map(node => (
             <li style={listItemStyle} key={node.id}>{node.data.label || node.id}</li>
          ))}
        </ul>
      </>
    )
  } else {
    content = (
      <p style={descriptionParagraphStyle}>Select a node or edge to see details</p>
    );
  }

  return (
    <div style={sidebarStyle}>
      <div style={{ ...sidebarControlsStyle, paddingLeft: '10px', paddingRight: '10px' }}>
        <button 
          onClick={onAddNodeClick}
          style={primarySidebarButtonStyle}
        >
          Add Node
        </button>
        {singleSelectedNode && onEditNodeClick && (
          <button 
            onClick={() => onEditNodeClick(singleSelectedNode)}
            style={secondarySidebarButtonStyle}
          >
            Edit Node
          </button>
        )}
      </div>

      <div style={{
        flexGrow: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden', 
        paddingTop: '20px',
        paddingLeft: '10px',
        paddingRight: '10px'
      }}>
        {content}
      </div>

      <div style={{
        ...sidebarControlsStyle, 
        borderBottom: 'none', 
        borderTop: '1px solid #E9EAEB', 
        paddingTop: '15px', 
        marginTop: 'auto',
        paddingLeft: '10px',
        paddingRight: '10px'
      }}>
         <button 
          onClick={onSavePNG}
          style={secondarySidebarButtonStyle}
          title="Save view as PNG image"
        >
          Save PNG
        </button>
        <button 
          onClick={onSaveFlow}
          style={secondarySidebarButtonStyle}
          title="Save nodes and edges to a JSON file"
        >
          Save Flow
        </button>
         <button 
          onClick={onLoadFlowTrigger}
          style={secondarySidebarButtonStyle}
          title="Load nodes and edges from a JSON file"
        >
          Load Flow
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 