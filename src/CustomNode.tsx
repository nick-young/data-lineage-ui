import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { getIconForType /*, defaultIconUrl */ } from './config/nodeTypesConfig'; // Removed unused import

// Removed direct icon imports as they come from config now
// import DatabaseIconUrl from './assets/om-icons/service-icon-sql.png';
// import PipelineIconUrl from './assets/om-icons/service-icon-airflow.png';
// import TopicIconUrl from './assets/om-icons/service-icon-kafka.png';
// import StorageIconUrl from './assets/om-icons/service-icon-amazon-s3.svg'; // This one exists as SVG
// import ApiIconUrl from './assets/om-icons/service-icon-generic.png';
// import DefaultIconUrl from './assets/om-icons/service-icon-generic.png';

// Node data type - Reflect new hierarchy
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
  // context field removed
}

// --- Styling Constants ---

const NODE_BORDER_COLOR = '#E0E0E0'; // Lighter grey border
const NODE_BORDER_COLOR_SELECTED = '#0950c5'; // Use primary blue for selected border
const NODE_BACKGROUND = '#FFFFFF';
const NODE_BORDER_RADIUS = '6px'; // Slightly more rounded
const NODE_SHADOW = '0 1px 3px rgba(0,0,0,0.05)'; // Subtle shadow
const NODE_SHADOW_SELECTED = '0 3px 8px rgba(0,0,0,0.15)'; // Stronger shadow when selected
const TEXT_COLOR_NORMAL = '#333333';
const TEXT_COLOR_FADED = '#757575'; // Grey for context text
const HANDLE_SIZE = '10px';
const HANDLE_BORDER_COLOR = '#BDBDBD'; // Light grey border for handles

// --- Styles ---

// Icon style
const iconStyle: React.CSSProperties = {
  width: '28px', // Slightly larger icon
  height: '28px',
  flexShrink: 0,
};

// Container for the text lines
const textContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column', // Stack text vertically
  overflow: 'hidden', // Prevent text overflow issues
  textAlign: 'left',
};

// Style for the top context line (now using Entity)
const contextTextStyle: React.CSSProperties = {
  fontSize: '11px',
  color: TEXT_COLOR_FADED,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginBottom: '2px', // Small space below context
};

// Style for the main label line (bold)
const labelTextStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600, // Bolder label
  color: TEXT_COLOR_NORMAL,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

// Style for the handles
const handleStyle: React.CSSProperties = {
  width: HANDLE_SIZE,
  height: HANDLE_SIZE,
  background: NODE_BACKGROUND, // White background
  border: `1px solid ${HANDLE_BORDER_COLOR}`, // Light grey border
  borderRadius: '50%', // Circular
};

// Style for the subType text
const subTypeTextStyle: React.CSSProperties = {
  fontSize: '11px',
  color: TEXT_COLOR_FADED,
  marginLeft: '5px', // Space between label and subType
};

// --- Component Logic ---

// The Custom Node Component
const CustomNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  // Get icon based on Entity and Type from config
  const iconUrl = getIconForType(data.entity, data.type);
  // Construct context text as "Entity: Type"
  const contextText = `${data.entity}: ${data.type}`; 

  // Dynamically adjust style based on selection state
  const nodeWrapperStyle: React.CSSProperties = {
    background: NODE_BACKGROUND,
    border: `1px solid ${selected ? NODE_BORDER_COLOR_SELECTED : NODE_BORDER_COLOR}`,
    borderRadius: NODE_BORDER_RADIUS,
    padding: '10px 15px', 
    boxShadow: selected ? NODE_SHADOW_SELECTED : NODE_SHADOW,
    display: 'flex',
    alignItems: 'center', 
    gap: '10px', 
    minWidth: '180px',
    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out', // Add transition
  };

  return (
    <div style={nodeWrapperStyle}>
      {/* Input handle */}
      <Handle type="target" position={Position.Left} style={handleStyle} />

      {/* Icon */}
      <img src={iconUrl} alt={data.type || 'Node'} style={iconStyle} />

      {/* Text Container */}
      <div style={textContainerStyle}>
        {/* Context Line (Top) - Show "Entity: Type" */}
        <span style={contextTextStyle}>{contextText}</span>
        
        {/* Label Line (Bottom) - Include SubType if applicable */}
        <div style={{ display: 'flex', alignItems: 'baseline' }}> 
          <span style={labelTextStyle}>{data.label}</span>
          {data.subType && (
            <span style={subTypeTextStyle}>({data.subType})</span>
          )}
        </div>
      </div>

      {/* Output handle */}
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </div>
  );
};

// Use memo for performance optimization
export default memo(CustomNode); 