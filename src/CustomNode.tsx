import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from './App'; // Import NodeData type from App
import { getIconForType /*, defaultIconUrl */ } from './config/nodeTypesConfig'; // Removed unused import

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

  // Dynamic Tailwind classes based on selection
  const borderClass = selected ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-300';
  const shadowClass = selected ? 'shadow-lg' : 'shadow-sm';

  return (
    <div className={`flex min-w-[180px] items-center gap-2 rounded-md border bg-white p-2 px-3 ${borderClass} ${shadowClass} transition-all duration-200 ease-in-out`}>
      {/* Input handle - styled with Tailwind */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="h-2 w-2 rounded-full border border-gray-400 bg-white"
      />

      {/* Icon */}
      <img src={iconUrl} alt={data.type || 'Node'} className="h-7 w-7 flex-shrink-0" />

      {/* Text Container */}
      <div className="flex flex-col overflow-hidden text-left">
        {/* Context Line (Top) - Show "Entity: Type" */}
        <span className="mb-0.5 truncate text-xs text-gray-500">{contextText}</span>
        
        {/* Label Line (Bottom) - Include SubType if applicable */}
        <div className="flex items-baseline"> 
          <span className="truncate text-sm font-semibold text-gray-800">{data.label}</span>
          {data.subType && (
            <span className="ml-1 flex-shrink-0 text-xs text-gray-500">({data.subType})</span>
          )}
        </div>
      </div>

      {/* Output handle - styled with Tailwind */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className="h-2 w-2 rounded-full border border-gray-400 bg-white"
      />
    </div>
  );
};

// Use memo for performance optimization
export default memo(CustomNode); 