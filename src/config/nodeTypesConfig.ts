// Configuration for Node Entities, Types, and Sub Types (Revised Hierarchy)

export interface SubTypeConfig {
  name: string;
}

export interface TypeConfig {
  name: string;         // Specific technology (e.g., 'MySQL', 'Airflow')
  iconUrl?: string;      // Icon for the specific technology
  subTypes?: SubTypeConfig[]; // Optional specific object types (e.g., Table, View)
}

export interface EntityConfig {
  name: string;         // Broad category (e.g., 'Database', 'Pipeline')
  types: TypeConfig[];  // Array of specific technologies within this entity
}

// Base path for icons in the public directory
const iconBasePath = '/assets/om-icons/';

// Default icon if a specific type doesn't have one
export const defaultIconUrl = `${iconBasePath}service-icon-generic.png`;

// --- Configuration Data ---
export const entityConfig: EntityConfig[] = [
  {
    name: 'Database',
    types: [
    {
    name: 'Redshift',
    iconUrl: `${iconBasePath}service-icon-redshift.png`,
    subTypes: [{ name: 'Table' }, { name: 'View' }, { name: 'External Table' }],
    },
    {
    name: 'Postgres',
    iconUrl: `${iconBasePath}service-icon-post.png`,
    subTypes: [{ name: 'Table' }, { name: 'View' }, { name: 'External Table' }],
    },
      {
        name: 'MySQL', 
        iconUrl: `${iconBasePath}service-icon-sql.png`, // Assuming mysql icon exists
        subTypes: [{ name: 'Table' }, { name: 'View' }],
      },
      {
        name: 'SQL Server',
        iconUrl: `${iconBasePath}service-icon-mssql.png`,
        subTypes: [{ name: 'Table' }, { name: 'View' }, { name: 'Procedure' }],
      },

      // Add other database types (Postgres, Oracle, etc.) here
      {
        name: 'Other Database', // Fallback
        iconUrl: `${iconBasePath}service-icon-generic.png`,
        subTypes: [{ name: 'Table' }, { name: 'View' }, { name: 'Procedure' }, { name: 'Function' }],
      }
    ]
  },
  {
    name: 'Pipeline',
    types: [
      {
        name: 'Airflow',
        iconUrl: `${iconBasePath}service-icon-airflow.png`,
        subTypes: [{ name: 'Pipeline' }, { name: 'Task' }], // Example sub-types
      },
      {
        name: 'Talend', // Assuming generic pipeline icon
        iconUrl: `${iconBasePath}service-icon-talend.png`, 
      },
      {
        name: 'Spark', // Assuming generic pipeline icon
        iconUrl: `${iconBasePath}service-icon-generic.png`, 
      },
      {
        name: 'Glue', // Assuming generic pipeline icon
        iconUrl: `${iconBasePath}service-icon-glue.png`, 
      },
      // Add other pipeline types here
    ]
  },
  {
    name: 'Stream',
    types: [
      {
        name: 'Kafka',
        iconUrl: `${iconBasePath}service-icon-kafka.png`,
        subTypes: [{ name: 'Topic' }],
      },
      {
        name: 'Kinesis', 
        iconUrl: `${iconBasePath}service-icon-kinesis.png`,
        // No specific sub-types defined for generic API
      }
      // Add other stream types here
    ]
  },
  {
    name: 'Stream Processing',
    types: [
      {
        name: 'Stream Processing Framework', 
        iconUrl: `${iconBasePath}service-icon-flink.png`,
        // No specific sub-types defined for generic API
      },
      {
        name: 'Flink', 
        iconUrl: `${iconBasePath}service-icon-flink.png`,
        // No specific sub-types defined for generic API
      },

    ]
  },
   {
    name: 'API', // Treat API as its own entity for simplicity
    types: [
      {
        name: 'Generic API', 
        iconUrl: `${iconBasePath}service-icon-generic.png`,
        // No specific sub-types defined for generic API
      }
    ]
  },
  {
    name: 'Storage', // New Entity for Storage
    types: [
      {
        name: 'S3',
        iconUrl: `${iconBasePath}service-icon-amazon-s3.svg`,
        subTypes: [{ name: 'Bucket' }, { name: 'Object' }, { name: 'Prefix' }], // Example sub-types
      },
      {
        name: 'Iceberg',
        iconUrl: `${iconBasePath}service-icon-iceberg.svg`,
        subTypes: [{ name: 'Bucket' }, { name: 'Object' }, { name: 'Prefix' }], // Example sub-types
      },
      // Add other storage types (GCS, Azure Blob, etc.)
    ]
  },
  {
    name: 'External', // New Entity for External Systems
    types: [
      {
        name: 'External System',
        iconUrl: `${iconBasePath}service-icon-generic.png`,
      }
    ]
  },
  // Add more Entities (e.g., Dashboard, ML Model) here
];

// --- Helper Functions ---

// Get all unique Entity names
export const getEntityNames = (): string[] => {
  return entityConfig.map(e => e.name);
};

// Get Type configurations for a selected Entity name
export const getTypesForEntity = (entityName: string): TypeConfig[] => {
  return entityConfig.find(e => e.name === entityName)?.types || [];
};

// Get SubType configurations for a selected Entity and Type name
export const getSubTypesForType = (entityName: string, typeName: string): SubTypeConfig[] => {
  const entity = entityConfig.find(e => e.name === entityName);
  const type = entity?.types.find(t => t.name === typeName);
  return type?.subTypes || [];
};

// Get icon URL for a specific Type within an Entity
export const getIconForType = (entityName: string, typeName: string): string => {
   const entity = entityConfig.find(e => e.name === entityName);
   const type = entity?.types.find(t => t.name === typeName);
   return type?.iconUrl || defaultIconUrl;
}; 