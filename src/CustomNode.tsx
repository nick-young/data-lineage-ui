import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from './App'; // Import NodeData type from App
import { getIconForType /*, defaultIconUrl */ } from './config/nodeTypesConfig'; // Removed unused import
// Import palettes and helper
import { NodePalette, getPaletteByName, nodePalettes } from './config/nodePalettes';

// Removed direct icon imports as they come from config now
// import DatabaseIconUrl from './assets/om-icons/service-icon-sql.png';
// import PipelineIconUrl from './assets/om-icons/service-icon-airflow.png';
// import TopicIconUrl from './assets/om-icons/service-icon-kafka.png';
// import StorageIconUrl from './assets/om-icons/service-icon-amazon-s3.svg'; // This one exists as SVG
// import ApiIconUrl from './assets/om-icons/service-icon-generic.png';
// import DefaultIconUrl from './assets/om-icons/service-icon-generic.png';

// --- Styling Constants ---

// Removed style constants, will use Tailwind classes

// --- Styles ---

// Icon style
// const iconStyle: React.CSSProperties = { ... };

// Container for the text lines
// const textContainerStyle: React.CSSProperties = { ... };

// Style for the top context line (now using Entity)
// const contextTextStyle: React.CSSProperties = { ... };

// Style for the main label line (bold)
// const labelTextStyle: React.CSSProperties = { ... };

// Style for the handles
// const handleStyle: React.CSSProperties = { ... };

// Style for the subType text
// const subTypeTextStyle: React.CSSProperties = { ... };

// --- Component Logic ---

// The Custom Node Component
const CustomNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  // Get icon based on Entity and Type from config
  const iconUrl = getIconForType(data.entity, data.type);
  // Construct context text as "Entity: Type"
  const contextText = `${data.entity}: ${data.type}`;

  // Determine the active palette or use defaults
  const activePalette: NodePalette = 
    getPaletteByName(data.palette) || 
    { 
      name: 'Custom',
      bgColor: data.bgColor || nodePalettes[0].bgColor, // Fallback to custom or first palette default
      borderColor: data.borderColor || nodePalettes[0].borderColor, 
      textColor: '#374151' // Default text color if custom
    };

  // Dynamic Tailwind classes for selection border/ring (overrides palette border color when selected)
  const selectionClasses = selected ? 'border-blue-600 ring-1 ring-blue-600' : '';
  const shadowClass = selected ? 'shadow-lg' : 'shadow-sm';

  // Inline style primarily for palette colors
  const style: React.CSSProperties = {
    backgroundColor: activePalette.bgColor,
    borderColor: selected ? '#2563eb' : activePalette.borderColor, // Use selection color or palette border
    color: activePalette.textColor, // Apply text color from palette
    borderWidth: 1,
    borderStyle: 'solid',
    transition: 'all 0.2s', // Keep transition
  };

  // Determine text color classes (override inline style if needed, e.g., for specific elements)
  // For now, we rely on the main `color` style. Could add specific classes if needed.
  // const textColorClass = activePalette.textColor === '#ffffff' ? 'text-white' : 'text-gray-800';

  return (
    <div
      // Combine base classes, dynamic shadow, and selection classes
      className={`flex min-w-[180px] items-center gap-2 rounded-md p-2 px-3 ${shadowClass} ${selectionClasses}`}
      style={style}
    >
      {/* Input handle - style needs to adapt to background? */}
      {/* For now, keeping handles simple white/gray */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!h-2 !w-2 !min-w-0 !min-h-0 !rounded-full !border !border-gray-400 !bg-white"
        style={{ borderColor: activePalette.textColor === '#f3f4f6' ? '#f3f4f6' : '#9ca3af'}} // Adjust handle border slightly on dark bg
      />

      {/* Icon */}
      <img src={iconUrl} alt={data.type || 'Node'} className="h-7 w-7 flex-shrink-0" />

      {/* Text Container */}
      <div className="flex flex-col overflow-hidden text-left">
        {/* Context Line (Top) - Inherits color from main style */}
        <span 
          className="mb-0.5 truncate text-xs"
          style={{ color: activePalette.textColor === '#f3f4f6' ? '#cbd5e1' : '#6b7280' }} // Lighter/darker gray based on main text
        >
          {contextText}
        </span>
        
        {/* Label Line (Bottom) - Inherits color from main style */}
        <div className="flex items-baseline"> 
          <span className="truncate text-sm font-semibold">{data.label}</span>
          {data.subType && (
            <span 
              className="ml-1 flex-shrink-0 text-xs"
              style={{ color: activePalette.textColor === '#f3f4f6' ? '#cbd5e1' : '#6b7280' }} // Lighter/darker gray
            >
              ({data.subType})
            </span>
          )}
        </div>
      </div>

      {/* Output handle - style needs to adapt? */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!h-2 !w-2 !min-w-0 !min-h-0 !rounded-full !border !border-gray-400 !bg-white"
        style={{ borderColor: activePalette.textColor === '#f3f4f6' ? '#f3f4f6' : '#9ca3af'}} // Adjust handle border slightly
      />
    </div>
  );
};

// Use memo for performance optimization
export default memo(CustomNode); 