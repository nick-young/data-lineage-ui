import React, { useState, useEffect } from 'react';
// Import new config structure and helpers
import { 
  // entityConfig, // Remove unused import
  getEntityNames, 
  getTypesForEntity, 
  getSubTypesForType,
  getIconForType // Import the icon helper
  // TypeConfig, // Remove unused import
  // SubTypeConfig // Remove unused import
} from './config/nodeTypesConfig';
import { NodeData } from './App'; // Use shared NodeData type

// Form data structure (used internally for state)
interface NodeFormState {
  label: string;
  entity: string; 
  type: string;   
  subType?: string; 
  domain: string;
  owner: string;
  description: string;
  transformations: string;
  filters: string;
}

// NodeForm Props - Accept NodeData directly
interface NodeFormProps {
  initialData?: NodeData | null; // Use NodeData from App directly
  isEditing: boolean;
  onSubmit: (data: NodeData) => void; // Submit function expects NodeData
  onCancel: () => void;
}

// --- Component Logic ---
const NodeForm: React.FC<NodeFormProps> = ({ initialData, isEditing, onSubmit, onCancel }) => {
  const entityNames = getEntityNames();
  
  // Initialize state using NodeFormState structure
  const [formData, setFormData] = useState<NodeFormState>(() => {
    const defaults: NodeFormState = {
      label: '', entity: entityNames[0] || '', type: '', subType: '',
      domain: '', owner: '', description: '', transformations: '', filters: ''
    };
    // Merge initialData (which might have optional fields) into defaults
    return { ...defaults, ...(initialData || {}) };
  });

  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableSubTypes, setAvailableSubTypes] = useState<string[]>([]);

  // --- Effects to manage dropdowns and default label ---
  // Effect to update Type options when Entity changes
  useEffect(() => {
    const types = getTypesForEntity(formData.entity).map(t => t.name);
    setAvailableTypes(types);
    // If editing and current type is valid for new entity, keep it, else reset
    if (!isEditing || !types.includes(formData.type)) {
      const newType = types[0] || '';
      setFormData(prev => ({ ...prev, type: newType, subType: '' })); // Reset type and subType
    }
  }, [formData.entity, isEditing]); // Only needs entity and isEditing

  // Effect to update Sub Type options when Type changes
  useEffect(() => {
    const typeIsValidForEntity = getTypesForEntity(formData.entity).some(t => t.name === formData.type);
    if (!formData.type || !typeIsValidForEntity) {
        setAvailableSubTypes([]);
        // Don't necessarily reset subtype if type is just temporarily invalid during entity switch
        // setFormData(prev => ({ ...prev, subType: '' })); 
        return;
    }
    const subTypes = getSubTypesForType(formData.entity, formData.type).map(st => st.name);
    setAvailableSubTypes(subTypes);
    // If editing and current subType is valid for new type, keep it, else reset
    if (!isEditing || !subTypes.includes(formData.subType || '')) {
       setFormData(prev => ({ ...prev, subType: subTypes[0] || '' })); 
    }
  }, [formData.entity, formData.type, isEditing]); // Needs entity, type, isEditing

  // Effect to automatically set the label based on Type and SubType when adding a new node
  useEffect(() => {
    if (!isEditing) { // Only run when adding a new node
      let defaultLabel = formData.type;
      if (formData.subType) {
        defaultLabel += ` - ${formData.subType}`; // Combine Type and SubType
      }
      // Update the label state if the generated label is not empty
      if (defaultLabel) {
         setFormData((prev) => ({ ...prev, label: defaultLabel }));
      }
    }
    // This effect now runs whenever type, subType, or isEditing changes
  }, [formData.type, formData.subType, isEditing]);

  // --- Handlers ---
  // Generic handler for input/textarea changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit the current formData (which matches NodeData structure)
    // Ensure optional fields are handled correctly (undefined if empty string? based on NodeData definition)
    const submitData: NodeData = {
      ...formData,
      // Convert empty optional strings back to undefined if needed by NodeData definition
      subType: formData.subType || undefined,
      domain: formData.domain || undefined,
      owner: formData.owner || undefined,
      description: formData.description || undefined,
      transformations: formData.transformations || undefined,
      filters: formData.filters || undefined,
    };
    onSubmit(submitData); 
  };

  // Get the icon URL for the currently selected type
  const currentTypeIcon = formData.entity && formData.type ? getIconForType(formData.entity, formData.type) : null;

  // --- Render Logic ---
  return (
    // Modal Overlay - Tailwind styled
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      {/* Modal Container - Tailwind styled */}
      <div className="z-50 flex max-h-[85vh] w-[450px] max-w-[90vw] flex-col overflow-hidden rounded-lg border border-gray-300 bg-white font-inter shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="m-0 text-lg font-semibold text-gray-800">
            {isEditing ? 'Edit Node' : 'Add New Node'}
          </h2>
        </div>

        {/* Scrollable Content Area */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto px-6 py-5">
          {/* Entity */}
          <div className="mb-4">
            <label htmlFor="entity" className="mb-1.5 block text-sm font-medium text-gray-700">Entity *</label>
            <select id="entity" name="entity" value={formData.entity} onChange={handleChange} required className="select-arrow w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              {entityNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          {/* Type with Icon */}
          <div className="mb-4">
            <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-gray-700">Type *</label>
            <div className="flex items-center gap-2"> {/* Flex container for select + icon */} 
              <select 
                id="type" 
                name="type" 
                value={formData.type} 
                onChange={handleChange} 
                required 
                disabled={!formData.entity || availableTypes.length === 0} 
                className="select-arrow flex-grow rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              >
                {availableTypes.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
              {/* Display icon if available */}
              {currentTypeIcon && (
                <img src={currentTypeIcon} alt={`${formData.type} icon`} className="h-6 w-6 flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Sub Type */}
          {availableSubTypes.length > 0 && (
             <div className="mb-4">
                <label htmlFor="subType" className="mb-1.5 block text-sm font-medium text-gray-700">Sub Type</label>
                <select id="subType" name="subType" value={formData.subType || ''} onChange={handleChange} disabled={!formData.type} className="select-arrow w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100">
                   <option value="">-- Select Sub Type --</option>
                   {availableSubTypes.map(name => <option key={name} value={name}>{name}</option>)}
                 </select>
             </div>
          )}

          {/* Label (Moved Here) */}
          <div className="mb-4">
            <label htmlFor="label" className="mb-1.5 block text-sm font-medium text-gray-700">Name (Label) *</label>
            <input type="text" id="label" name="label" value={formData.label} onChange={handleChange} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          
          {/* Optional Fields */}
          <div className="mb-4">
            <label htmlFor="domain" className="mb-1.5 block text-sm font-medium text-gray-700">Domain</label>
            <input type="text" id="domain" name="domain" value={formData.domain} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="owner" className="mb-1.5 block text-sm font-medium text-gray-700">Owner</label>
            <input type="text" id="owner" name="owner" value={formData.owner} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="transformations" className="mb-1.5 block text-sm font-medium text-gray-700">Transformations</label>
            <textarea id="transformations" name="transformations" value={formData.transformations} onChange={handleChange} rows={3} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="filters" className="mb-1.5 block text-sm font-medium text-gray-700">Filters</label>
            <textarea id="filters" name="filters" value={formData.filters} onChange={handleChange} rows={3} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
          </div>
        </form>

        {/* Footer with Buttons - Tailwind styled */}
        <div className="flex flex-shrink-0 justify-end gap-2 border-t border-gray-200 px-6 py-4">
          <button type="button" onClick={onCancel} className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} className="rounded border border-transparent bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
            {isEditing ? 'Save Changes' : 'Add Node'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeForm; 