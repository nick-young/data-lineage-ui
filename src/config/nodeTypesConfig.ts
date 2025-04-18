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
// const iconBasePath = '/assets/om-icons/'; // Removed, paths will be relative now

// Default icon if a specific type doesn't have one
export const defaultIconUrl = 'assets/om-icons/service-icon-generic.png';

// --- Configuration Data ---
export const entityConfig: EntityConfig[] = [
  {
    name: 'Database',
    types: [
    {
    name: 'Redshift',
    iconUrl: 'assets/om-icons/service-icon-redshift.png',
    subTypes: [{ name: 'Table' }, { name: 'View' }, { name: 'External Table' }],
    },
    {
    name: 'Postgres',
    iconUrl: 'assets/om-icons/service-icon-post.png',
    subTypes: [{ name: 'Table' }, { name: 'View' }, { name: 'External Table' }],
    },
      {
        name: 'MySQL', 
        iconUrl: 'assets/om-icons/service-icon-sql.png', // Assuming mysql icon exists
        subTypes: [{ name: 'Table' }, { name: 'View' }],
      },
      {
        name: 'SQL Server',
        iconUrl: 'assets/om-icons/service-icon-mssql.png',
        subTypes: [{ name: 'Table' }, { name: 'View' }, { name: 'Procedure' }],
      },

      // Add other database types (Postgres, Oracle, etc.) here
      {
        name: 'Other Database', // Fallback
        iconUrl: 'assets/om-icons/service-icon-generic.png',
        subTypes: [{ name: 'Table' }, { name: 'View' }, { name: 'Procedure' }, { name: 'Function' }],
      }
    ]
  },
  {
    name: 'Pipeline',
    types: [
      {
        name: 'Airflow',
        iconUrl: 'assets/om-icons/service-icon-airflow.png',
        subTypes: [{ name: 'Pipeline' }, { name: 'Task' }], // Example sub-types
      },
      {
        name: 'Talend', // Assuming generic pipeline icon
        iconUrl: 'assets/om-icons/service-icon-talend.png', 
      },
      {
        name: 'Spark', // Assuming generic pipeline icon
        iconUrl: 'assets/om-icons/service-icon-generic.png', 
      },
      {
        name: 'Glue', // Assuming generic pipeline icon
        iconUrl: 'assets/om-icons/service-icon-glue.png', 
      },
      // Add other pipeline types here
    ]
  },
  {
    name: 'Stream',
    types: [
      {
        name: 'Kafka',
        iconUrl: 'assets/om-icons/service-icon-kafka.png',
        subTypes: [{ name: 'Topic' }],
      },
      {
        name: 'Kinesis', 
        iconUrl: 'assets/om-icons/service-icon-kinesis.png',
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
        iconUrl: 'assets/om-icons/service-icon-flink.png',
        // No specific sub-types defined for generic API
      },
      {
        name: 'Flink', 
        iconUrl: 'assets/om-icons/service-icon-flink.png',
        // No specific sub-types defined for generic API
      },

    ]
  },
   {
    name: 'API', // Treat API as its own entity for simplicity
    types: [
      {
        name: 'Generic API', 
        iconUrl: 'assets/om-icons/service-icon-generic.png',
        // No specific sub-types defined for generic API
      }
    ]
  },
  {
    name: 'Storage', // New Entity for Storage
    types: [
      {
        name: 'S3',
        iconUrl: 'assets/om-icons/service-icon-amazon-s3.svg',
        subTypes: [{ name: 'Bucket' }, { name: 'Object' }, { name: 'Prefix' }], // Example sub-types
      },
      {
        name: 'Iceberg',
        iconUrl: 'assets/om-icons/service-icon-iceberg.png', // Corrected path assuming png, adjust if svg
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
        iconUrl: 'assets/om-icons/service-icon-generic.png',
      }
    ]
  },
  // NEW Dashboard Entity
  {
    name: 'Dashboard',
    types: [
      { name: 'Looker', iconUrl: 'assets/om-icons/service-icon-looker.png', subTypes: [] },
      { name: 'Tableau', iconUrl: 'assets/om-icons/service-icon-tableau.png', subTypes: [] },
      { name: 'Domo', iconUrl: 'assets/om-icons/service-icon-domo.png', subTypes: [] },
      { name: 'Lightdash', iconUrl: 'assets/om-icons/service-icon-lightdash.png', subTypes: [] },
      { name: 'Metabase', iconUrl: 'assets/om-icons/service-icon-metabase.png', subTypes: [] },
      { name: 'Mode', iconUrl: 'assets/om-icons/service-icon-mode.png', subTypes: [] },
      { name: 'Power-bi', iconUrl: 'assets/om-icons/service-icon-power-bi.png', subTypes: [] },
      { name: 'Qlik Sense', iconUrl: 'assets/om-icons/service-icon-qlik-sense.png', subTypes: [] },
      { name: 'Quicksight', iconUrl: 'assets/om-icons/service-icon-quicksight.png', subTypes: [] },
      { name: 'Redash', iconUrl: 'assets/om-icons/service-icon-redash.png', subTypes: [] },
      { name: 'Superset', iconUrl: 'assets/om-icons/service-icon-superset.png', subTypes: [] },
    ]
  },
  {
    name: 'ML Model',
    types: [
        { name: 'MlFlow', iconUrl: 'assets/om-icons/service-icon-mlflow.png', subTypes: [] },
        { name: 'Sagemaker', iconUrl: 'assets/om-icons/service-icon-sagemaker.png', subTypes: [] },
    ]
  },
  // Updated 'All' Entity (removed dashboard types)
  {
    name: 'All',
    types: [
      // Sorted Alphabetically
      { name: 'Alation Sink', iconUrl: 'assets/om-icons/service-icon-alation-sink.png', subTypes: [] },
      { name: 'Amundsen', iconUrl: 'assets/om-icons/service-icon-amundsen.png', subTypes: [] },
      { name: 'Athena', iconUrl: 'assets/om-icons/service-icon-athena.png', subTypes: [] },
      { name: 'Atlas', iconUrl: 'assets/om-icons/service-icon-atlas.svg', subTypes: [] },
      { name: 'Azuresql', iconUrl: 'assets/om-icons/service-icon-azuresql.png', subTypes: [] },
      { name: 'Bigtable', iconUrl: 'assets/om-icons/service-icon-bigtable.png', subTypes: [] },
      { name: 'Cassandra', iconUrl: 'assets/om-icons/service-icon-cassandra.png', subTypes: [] },
      { name: 'Clickhouse', iconUrl: 'assets/om-icons/service-icon-clickhouse.png', subTypes: [] },
      { name: 'Cockroach', iconUrl: 'assets/om-icons/service-icon-cockroach.png', subTypes: [] },
      { name: 'Couchbase', iconUrl: 'assets/om-icons/service-icon-couchbase.svg', subTypes: [] },
      { name: 'Dagster', iconUrl: 'assets/om-icons/service-icon-dagster.png', subTypes: [] },
      { name: 'Data Bricks', iconUrl: 'assets/om-icons/service-icon-databrick.png', subTypes: [] },
      { name: 'Datalake', iconUrl: 'assets/om-icons/service-icon-datalake.png', subTypes: [] },
      { name: 'Dbt', iconUrl: 'assets/om-icons/service-icon-dbt.png', subTypes: [] },
      { name: 'Delta Lake', iconUrl: 'assets/om-icons/service-icon-delta-lake.png', subTypes: [] },
      { name: 'Domo', iconUrl: 'assets/om-icons/service-icon-domo.png', subTypes: [] },
      { name: 'Doris', iconUrl: 'assets/om-icons/service-icon-doris.png', subTypes: [] },
      { name: 'Druid', iconUrl: 'assets/om-icons/service-icon-druid.png', subTypes: [] },
      { name: 'Dynamodb', iconUrl: 'assets/om-icons/service-icon-dynamodb.png', subTypes: [] },
      { name: 'Exasol', iconUrl: 'assets/om-icons/service-icon-exasol.png', subTypes: [] },
      { name: 'Fivetran', iconUrl: 'assets/om-icons/service-icon-fivetran.png', subTypes: [] },
      { name: 'Gcs', iconUrl: 'assets/om-icons/service-icon-gcs.png', subTypes: [] },
      { name: 'Greenplum', iconUrl: 'assets/om-icons/service-icon-greenplum.png', subTypes: [] },
      { name: 'Hive', iconUrl: 'assets/om-icons/service-icon-hive.png', subTypes: [] },
      { name: 'Ibmdb2', iconUrl: 'assets/om-icons/service-icon-ibmdb2.png', subTypes: [] },
      { name: 'Impala', iconUrl: 'assets/om-icons/service-icon-impala.png', subTypes: [] },
      { name: 'Lightdash', iconUrl: 'assets/om-icons/service-icon-lightdash.png', subTypes: [] },
      { name: 'Looker', iconUrl: 'assets/om-icons/service-icon-looker.png', subTypes: [] },
      { name: 'Mariadb', iconUrl: 'assets/om-icons/service-icon-mariadb.png', subTypes: [] },
      { name: 'Metabase', iconUrl: 'assets/om-icons/service-icon-metabase.png', subTypes: [] },
      { name: 'Microstrategy', iconUrl: 'assets/om-icons/service-icon-microstrategy.svg', subTypes: [] },
      { name: 'MlFlow', iconUrl: 'assets/om-icons/service-icon-mlflow.png', subTypes: [] },
      { name: 'Mode', iconUrl: 'assets/om-icons/service-icon-mode.png', subTypes: [] },
      { name: 'Mongodb', iconUrl: 'assets/om-icons/service-icon-mongodb.png', subTypes: [] },
      { name: 'Ms-azure', iconUrl: 'assets/om-icons/service-icon-ms-azure.png', subTypes: [] },
      { name: 'Nifi', iconUrl: 'assets/om-icons/service-icon-nifi.png', subTypes: [] },
      { name: 'Open Lineage', iconUrl: 'assets/om-icons/service-icon-openlineage.svg', subTypes: [] },
      { name: 'Oracle', iconUrl: 'assets/om-icons/service-icon-oracle.png', subTypes: [] },
      { name: 'Pinot', iconUrl: 'assets/om-icons/service-icon-pinot.png', subTypes: [] },
      { name: 'Power-bi', iconUrl: 'assets/om-icons/service-icon-power-bi.png', subTypes: [] },
      { name: 'Prefect', iconUrl: 'assets/om-icons/service-icon-prefect.png', subTypes: [] },
      { name: 'Presto', iconUrl: 'assets/om-icons/service-icon-presto.png', subTypes: [] },
      { name: 'Pulsar', iconUrl: 'assets/om-icons/service-icon-pulsar.png', subTypes: [] },
      { name: 'Qlik Sense', iconUrl: 'assets/om-icons/service-icon-qlik-sense.png', subTypes: [] },
      { name: 'Query', iconUrl: 'assets/om-icons/service-icon-query.png', subTypes: [] },
      { name: 'Quicksight', iconUrl: 'assets/om-icons/service-icon-quicksight.png', subTypes: [] },
      { name: 'Redash', iconUrl: 'assets/om-icons/service-icon-redash.png', subTypes: [] },
      { name: 'Redpanda', iconUrl: 'assets/om-icons/service-icon-redpanda.png', subTypes: [] },
      { name: 'Sagemaker', iconUrl: 'assets/om-icons/service-icon-sagemaker.png', subTypes: [] },
      { name: 'Salesforce', iconUrl: 'assets/om-icons/service-icon-salesforce.png', subTypes: [] },
      { name: 'Sap-erp', iconUrl: 'assets/om-icons/service-icon-sap-erp.png', subTypes: [] },
      { name: 'Sap-hana', iconUrl: 'assets/om-icons/service-icon-sap-hana.png', subTypes: [] },
      { name: 'Sas', iconUrl: 'assets/om-icons/service-icon-sas.svg', subTypes: [] },
      { name: 'Scikit', iconUrl: 'assets/om-icons/service-icon-scikit.png', subTypes: [] },
      { name: 'Sigma', iconUrl: 'assets/om-icons/service-icon-sigma.png', subTypes: [] },
      { name: 'Singlestore', iconUrl: 'assets/om-icons/service-icon-singlestore.png', subTypes: [] },
      { name: 'Snowflake', iconUrl: 'assets/om-icons/service-icon-snowflakes.png', subTypes: [] },
      { name: 'Spark', iconUrl: 'assets/om-icons/service-icon-spark.png', subTypes: [] },
      { name: 'Spline', iconUrl: 'assets/om-icons/service-icon-spline.png', subTypes: [] },
      { name: 'Sqlite', iconUrl: 'assets/om-icons/service-icon-sqlite.png', subTypes: [] },
      { name: 'Superset', iconUrl: 'assets/om-icons/service-icon-superset.png', subTypes: [] },
      { name: 'Synapse', iconUrl: 'assets/om-icons/service-icon-synapse.png', subTypes: [] },
      { name: 'Tableau', iconUrl: 'assets/om-icons/service-icon-tableau.png', subTypes: [] },
      { name: 'Talend', iconUrl: 'assets/om-icons/service-icon-talend.png', subTypes: [] },
      { name: 'Trino', iconUrl: 'assets/om-icons/service-icon-trino.png', subTypes: [] },
      { name: 'Vertica', iconUrl: 'assets/om-icons/service-icon-vertica.png', subTypes: [] },
    ],
  },
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