import React, { useState, useEffect } from 'react';
// Import new config structure and helpers
import { 
  entityConfig, 
  getEntityNames, 
  getTypesForEntity, 
  getSubTypesForType 
} from './config/nodeTypesConfig';

// Updated form data interface
interface NodeFormData {
  label: string;
  entity: string; // Renamed from type
  type: string;   // New field for specific technology
  subType?: string; // Optional specific object type
  domain: string;
  owner: string;
  description: string;
  transformations: string;
  filters: string;
}

// NodeForm Props - Add initialData and isEditing
interface NodeFormProps {
  initialData?: NodeFormData | null; // Make initialData compatible
  isEditing: boolean;
  onSubmit: (data: NodeFormData) => void;
  onCancel: () => void;
}

// Get main types from config
const nodeTypes = entityConfig.map(config => config.name);

// Modal styling refinements - Adjusted for scrolling layout
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', // Use fixed to cover viewport
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.4)', // Dimming overlay
  zIndex: 9, // Below modal itself
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalStyle: React.CSSProperties = {
  // Removed position: absolute, top, left, transform
  background: '#ffffff',
  // padding: '24px', // Padding moved to inner elements
  border: '1px solid #D5D7DA',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  zIndex: 10,
  width: '450px', // Fixed width
  maxWidth: '90vw', // Max width relative to viewport
  maxHeight: '85vh', // Max height relative to viewport
  fontFamily: 'Inter, sans-serif',
  display: 'flex', // Use flex column for header/content/footer
  flexDirection: 'column',
  overflow: 'hidden', // Prevent shadow clipping
};

const modalHeaderStyle: React.CSSProperties = {
  padding: '16px 24px',
  borderBottom: '1px solid #E9EAEB',
  flexShrink: 0, // Header should not shrink
};

const modalTitleStyle: React.CSSProperties = {
  margin: 0, // Remove default margins
  color: '#1B1D21',
  fontSize: '18px',
  fontWeight: 600,
};

const modalContentStyle: React.CSSProperties = {
  padding: '20px 24px', // Padding for the form content
  overflowY: 'auto', // Make this part scrollable
  flexGrow: 1, // Allow content to take available space
};

const modalFooterStyle: React.CSSProperties = {
  padding: '16px 24px',
  borderTop: '1px solid #E9EAEB',
  textAlign: 'right',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
  flexShrink: 0, // Footer should not shrink
};

// --- Form Element Styles (mostly unchanged, just added classes) ---
const formGroupStyle: React.CSSProperties = {
  marginBottom: '16px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: 500,
  color: '#37352F',
  fontSize: '13px',
};

const inputBaseStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  boxSizing: 'border-box',
  border: '1px solid #DDE3EA',
  borderRadius: '4px',
  color: '#333',
  backgroundColor: '#ffffff',
  fontSize: '14px',
  fontFamily: 'inherit',
};

const selectDropdownStyle: React.CSSProperties = {
  ...inputBaseStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%20256%20448%27%20enable-background%3D%27new%200%200%20256%20448%27%3E%3Cstyle%20type%3D%27text%2Fcss%27%3E.arrow%7Bfill%3A%23424242%3B%7D%3C%2Fstyle%3E%3Cpath%20class%3D%27arrow%27%20d%3D%27M255.9%20168c0-4.2-1.7-7.9-4.8-11.2L137.9%2044.8c-3.1-3.1-6.8-4.8-11.2-4.8h-35.7c-4.4%200-8.1%201.7-11.2%204.8L4.8%20156.8C1.7%20160.1%200%20163.8%200%20168c0%204.4%201.7%208.1%204.8%2011.2l11.2%2011.2c3.1%203.1%206.8%204.8%2011.2%204.8h212.8c4.4%200%208.1-1.7%2011.2-4.8l11.2-11.2c3.1-3.1%204.8-6.8%204.8-11.2z%27%2F%3E%3C%2Fsvg%3E%0A")`,
  backgroundPosition: 'right 12px center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '8px 10px',
  paddingRight: '30px',
};

const buttonBaseStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: '1px solid #D5D7DA',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '13px',
  fontFamily: 'inherit',
};

// --- Component Logic ---
const NodeForm: React.FC<NodeFormProps> = ({ initialData, isEditing, onSubmit, onCancel }) => {
  const entityNames = getEntityNames();
  
  // Initialize state based on initialData or defaults
  const [selectedEntity, setSelectedEntity] = useState<string>(initialData?.entity || entityNames[0] || '');
  const [selectedType, setSelectedType] = useState<string>(initialData?.type || '');
  const [selectedSubType, setSelectedSubType] = useState<string>(initialData?.subType || '');

  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableSubTypes, setAvailableSubTypes] = useState<string[]>([]);

  const [otherFormData, setOtherFormData] = useState({
    label: initialData?.label || '',
    domain: initialData?.domain || '',
    owner: initialData?.owner || '',
    description: initialData?.description || '',
    transformations: initialData?.transformations || '',
    filters: initialData?.filters || '',
  });

  // Effect to update Type options when Entity changes (or on initial load)
  useEffect(() => {
    const types = getTypesForEntity(selectedEntity).map(t => t.name);
    setAvailableTypes(types);
    // If not editing or type doesn't match initial, set to first available type
    if (!isEditing || !types.includes(selectedType)) {
      setSelectedType(types[0] || '');
    }
  }, [selectedEntity, isEditing]); // Rerun if isEditing changes (e.g. form re-opens)

  // Effect to update Sub Type options when Type changes (or on initial load)
  useEffect(() => {
    const typeIsValidForEntity = getTypesForEntity(selectedEntity).some(t => t.name === selectedType);
    if (!typeIsValidForEntity) {
        setAvailableSubTypes([]);
        setSelectedSubType('');
        return;
    }
    const subTypes = getSubTypesForType(selectedEntity, selectedType).map(st => st.name);
    setAvailableSubTypes(subTypes);
    // If not editing or subType doesn't match initial, set to first available sub-type
    if (!isEditing || !subTypes.includes(selectedSubType)) {
       setSelectedSubType(subTypes[0] || ''); 
    }
  }, [selectedEntity, selectedType, isEditing]); // Rerun if isEditing changes

  // Handle changes for standard input/textarea fields
  const handleOtherDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setOtherFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes for dropdowns
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'entity') {
      setSelectedEntity(value);
      // Type and SubType will be reset by useEffect hooks
    } else if (name === 'type') {
      setSelectedType(value);
       // SubType will be reset by useEffect hook
    } else if (name === 'subType') {
      setSelectedSubType(value);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData: NodeFormData = {
      ...otherFormData, 
      entity: selectedEntity,
      type: selectedType,
      ...(availableSubTypes.length > 0 && { subType: selectedSubType }), 
    };
    onSubmit(finalData);
  };

  const formTitle = isEditing ? 'Edit Node' : 'Add New Node';
  const submitButtonText = isEditing ? 'Save Changes' : 'Add Node';

  // --- JSX Structure ---
  return (
    <div style={modalOverlayStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}> 
        <div style={modalHeaderStyle}>
           <h3 style={modalTitleStyle}>{formTitle}</h3> {/* Dynamic Title */}
        </div>
        
        <div style={modalContentStyle}> 
          <form onSubmit={handleSubmit} id="node-form">
            {/* Label */}
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="label">Name (Label):</label>
              <input style={inputBaseStyle} className="node-form-input" type="text" id="label" name="label" value={otherFormData.label} onChange={handleOtherDataChange} required />
            </div>

            {/* Entity Dropdown */}
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="entity">Entity:</label>
              <select style={selectDropdownStyle} className="node-form-select" id="entity" name="entity" value={selectedEntity} onChange={handleSelectChange}>
                {entityNames.map((entity) => <option key={entity} value={entity}>{entity}</option>)}
              </select>
            </div>

            {/* Type Dropdown (Dynamic based on Entity) */}
            {availableTypes.length > 0 && (
                <div style={formGroupStyle}>
                  <label style={labelStyle} htmlFor="type">Type:</label>
                  <select style={selectDropdownStyle} className="node-form-select" id="type" name="type" value={selectedType} onChange={handleSelectChange}>
                    {availableTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
            )}

            {/* Sub Type Dropdown (Dynamic based on Type) */}
            {availableSubTypes.length > 0 && (
              <div style={formGroupStyle}>
                <label style={labelStyle} htmlFor="subType">Sub Type:</label>
                <select 
                  style={selectDropdownStyle} 
                  className="node-form-select" 
                  id="subType" 
                  name="subType" 
                  value={selectedSubType} 
                  onChange={handleSelectChange}
                >
                  {availableSubTypes.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
            )}

            {/* Domain */}
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="domain">Domain:</label>
              <input style={inputBaseStyle} className="node-form-input" type="text" id="domain" name="domain" value={otherFormData.domain} onChange={handleOtherDataChange} />
            </div>
            
            {/* Owner */}
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="owner">Owner:</label>
              <input style={inputBaseStyle} className="node-form-input" type="text" id="owner" name="owner" value={otherFormData.owner} onChange={handleOtherDataChange} />
            </div>
            
            {/* Description */}
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="description">Description:</label>
              <textarea style={{...inputBaseStyle, minHeight: '80px', resize: 'vertical'}} className="node-form-textarea" id="description" name="description" rows={3} value={otherFormData.description} onChange={handleOtherDataChange} />
            </div>
            
            {/* Transformations */}
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="transformations">Transformations:</label>
              <textarea style={{...inputBaseStyle, minHeight: '60px', resize: 'vertical'}} className="node-form-textarea" id="transformations" name="transformations" rows={2} value={otherFormData.transformations} onChange={handleOtherDataChange} />
            </div>
            
            {/* Filters */}
            <div style={{...formGroupStyle, marginBottom: 0}}> 
              <label style={labelStyle} htmlFor="filters">Filters:</label>
              <textarea style={{...inputBaseStyle, minHeight: '60px', resize: 'vertical'}} className="node-form-textarea" id="filters" name="filters" rows={2} value={otherFormData.filters} onChange={handleOtherDataChange} />
            </div>
          </form>
        </div>

        <div style={modalFooterStyle}> 
           <button 
                type="button" 
                style={{...buttonBaseStyle, backgroundColor: '#fff', color: '#333'}} 
                className="node-form-button-secondary" 
                onClick={onCancel}
            >
                Cancel
            </button>
            <button 
                type="submit" 
                style={{...buttonBaseStyle, background: '#0950c5', color: 'white', borderColor: '#0950c5'}}
                className="node-form-button-primary"
                form="node-form" 
            >
                {submitButtonText} {/* Dynamic Button Text */}
            </button>
        </div>
      </div>
    </div>
  );
};

export default NodeForm; 