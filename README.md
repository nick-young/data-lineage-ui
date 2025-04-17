# Data Lineage Visualization Tool (MVP)

This project implements a basic Minimum Viable Product (MVP) for a data lineage visualization tool, built with React, TypeScript, Vite, and React Flow.

## Features Implemented (MVP)

*   **Visual Graph Canvas:** Renders nodes and edges using React Flow.
*   **Node Rendering:** Displays nodes with labels and type information using a custom node component.
*   **Node Selection:** Allows selecting nodes to view their properties in a sidebar.
*   **Node Creation:** Provides an "Add Node" button and a modal form to create new nodes with properties:
    *   Name (Label)
    *   Type (Dropdown: API, Database Table, Airflow Pipeline, Storage (S3), Kafka Topic, External System)
    *   Domain
    *   Owner
    *   Description
    *   Transformations
    *   Filters
*   **Edge Creation:** Allows connecting nodes via drag-and-drop between handles.
*   **Relationship Details:** Allows selecting edges to view source/target information and add/edit free-text details in the sidebar.
*   **Sidebar Display:** Shows details for the currently selected node or edge, including dynamically calculated inputs/outputs for nodes.
*   **Local Storage Persistence:** Saves the graph state (nodes and edges, including edge details) to the browser's local storage, so the graph persists across page refreshes.

## Setup and Running

1.  **Clone the repository (if you haven't already).**
2.  **Navigate to the project directory:**
    ```bash
    cd data-lineage-ui
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
5.  Open your browser and navigate to the local URL provided (usually `http://localhost:5173` or similar).

## Next Steps / Future Enhancements (From PRD)

*   Backend storage for persistent graphs.
*   User authentication and collaboration features.
*   Ability to import/export lineage data.
*   Search and filtering capabilities.
*   Automatic lineage discovery via integrations (e.g., Airflow, dbt).
*   Version history for graphs.
*   More sophisticated layout algorithms.
*   Node grouping/layering.
*   Visual node icons.
*   UI styling improvements (e.g., align with OpenMetadata theme).
