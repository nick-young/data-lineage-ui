import React, { useState } from 'react';

// Define the structure of the data the form will submit
interface NodeFormData {
  label: string;
  type: string;
  domain: string;
  owner: string;
  description: string;
  transformations: string;
  filters: string;
}

interface NodeFormProps {
  onSubmit: (data: NodeFormData) => void;
  onCancel: () => void;
}

// Predefined node types from PRD
const nodeTypes = [
  'API', 
  'Database Table', 
  'Airflow Pipeline', 
  'Storage (S3)', 
  'Kafka Topic', 
  'External System'
];

// Basic modal styling
const modalStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'white',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  zIndex: 10,
  minWidth: '300px',
  fontFamily: 'sans-serif',
};

const formGroupStyle: React.CSSProperties = {
  marginBottom: '15px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '5px',
  fontWeight: 'bold',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  boxSizing: 'border-box',
  border: '1px solid #ccc',
  borderRadius: '4px',
};

const buttonGroupStyle: React.CSSProperties = {
  marginTop: '20px',
  textAlign: 'right',
};

const buttonStyle: React.CSSProperties = {
  marginLeft: '10px',
  padding: '8px 15px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const NodeForm: React.FC<NodeFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<NodeFormData>({
    label: '',
    type: nodeTypes[0], // Default to the first type
    domain: '',
    owner: '',
    description: '',
    transformations: '',
    filters: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div style={modalStyle}>
      <h3>Add New Node</h3>
      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="label">Name (Label):</label>
          <input
            style={inputStyle}
            type="text"
            id="label"
            name="label"
            value={formData.label}
            onChange={handleChange}
            required
          />
        </div>
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="type">Type:</label>
          <select
            style={inputStyle}
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            {nodeTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="domain">Domain:</label>
          <input
            style={inputStyle}
            type="text"
            id="domain"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
          />
        </div>
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="owner">Owner:</label>
          <input
            style={inputStyle}
            type="text"
            id="owner"
            name="owner"
            value={formData.owner}
            onChange={handleChange}
          />
        </div>
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="description">Description:</label>
          <textarea
            style={inputStyle}
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="transformations">Transformations:</label>
          <textarea
            style={inputStyle}
            id="transformations"
            name="transformations"
            rows={2}
            value={formData.transformations}
            onChange={handleChange}
          />
        </div>
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="filters">Filters:</label>
          <textarea
            style={inputStyle}
            id="filters"
            name="filters"
            rows={2}
            value={formData.filters}
            onChange={handleChange}
          />
        </div>
        <div style={buttonGroupStyle}>
          <button type="button" style={buttonStyle} onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" style={{...buttonStyle, background: '#007bff', color: 'white'}}>
            Add Node
          </button>
        </div>
      </form>
    </div>
  );
};

export default NodeForm; 