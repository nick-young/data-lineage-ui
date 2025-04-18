# Data Lineage UI

[View Live Demo on GitHub Pages](https://nick-young.github.io/data-lineage-ui/)

This project provides a user interface for visualizing data lineage using React and ReactFlow.

![Screenshot of Data Lineage Visualiser](public/assets/screen.png)

## Features

*   **Interactive Canvas:** Build and manipulate lineage graphs using drag-and-drop.
*   **Node Management:**
    *   Add new nodes with hierarchical types (Entity, Type, SubType) via the "Add Node" button and form.
    *   Edit existing node details via a modal form (double-click a node).
    *   Delete single or multiple selected nodes.
    *   Copy (Ctrl/Cmd+C) and Paste (Ctrl/Cmd+V) nodes.
*   **Custom Nodes:** Visually distinct nodes showing key information (Label, Entity, Type, SubType).
    *   Icons are dynamically assigned based on the node's Entity and Type (configured in `src/config/nodeTypesConfig.ts`, using icons from `public/assets/om-icons/`).
*   **Edge Management:**
    *   Connect nodes to represent relationships.
    *   View and edit relationship details by selecting an edge.
*   **Collapsible Sidebar:**
    *   View detailed information about selected nodes or edges.
    *   See connected input and output nodes.
    *   Access control buttons (Add, Layout, Delete, Save, Load).
*   **Automatic Layout:** Arrange nodes automatically in a Left-to-Right flow using the Dagre library ("Layout Nodes" button).
*   **Persistence:** Save the current graph state (nodes, edges, viewport) to a JSON file and load it back.
*   **Export:** Save the current view of the graph as a PNG image.
*   **Styling:** UI elements styled for a clean look, inspired by OpenMetadata.

## Installation & Setup

1.  **Navigate to the UI directory:**
    Assuming you are in the project root:
    ```bash
    cd data-lineage-ui
    ```

2.  **Install dependencies:**
    Requires Node.js and npm.
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the application:**
    Navigate to http://localhost:5173 (or the port specified in the terminal output) in your web browser.

## Deployment to GitHub Pages

To deploy the latest version of the application to the live GitHub Pages site:

1.  **Navigate to the UI directory:**
    ```bash
    cd data-lineage-ui
    ```

2.  **Run the deployment script:**
    ```bash
    npm run deploy
    ```
    This script will:
    *   Run `npm run build` to create a production build in the `dist` directory.
    *   Use the `gh-pages` package to push the contents of the `dist` directory to the `gh-pages` branch of your repository.

GitHub Pages is configured to serve from the `gh-pages` branch, so this command updates the live site.

## Running with Docker (Alternative)

If you have Docker and Docker Compose (or the integrated `docker compose` command) installed, you can build and run the application in a container:

1.  **Navigate to the UI directory:**
    ```bash
    cd data-lineage-ui
    ```

2.  **Build and run the container:**
    ```bash
    docker compose up -d --build
    ```
    *(Note: Use `docker-compose` with a hyphen if the command above fails)*

3.  **Open the application:**
    Navigate to http://localhost:5174 in your web browser.

4.  **To stop the container:**
    ```bash
    docker compose down
    ```

## Development Notes

*   Built with React, TypeScript, and Vite.
*   Uses React Flow for the graph visualization and interaction.
*   Uses Dagre for automatic layout.
*   State is primarily managed within the `App.tsx` component using React hooks (`useState`, `useCallback`, `useMemo`, `useEffect`).
*   Node icons are configured in `src/config/nodeTypesConfig.ts` and sourced from `public/assets/om-icons/`.
*   The `public` directory is served at the root by Vite.

## Versioning

This project uses [`standard-version`](https://github.com/conventional-changelog/standard-version) for automated version bumping and CHANGELOG generation based on [Conventional Commits](https://www.conventionalcommits.org/).

1.  **Commit Changes:** Make your code changes and commit them using the Conventional Commits format. Examples:
    *   `git commit -m "fix: resolve sidebar layout issue"` (Patches the version)
    *   `git commit -m "feat: add node copy/paste functionality"` (Minor version bump)
    *   `git commit -m "refactor!: change node data structure"` (Major version bump due to BREAKING CHANGE)

2.  **Run Release Script:** When ready to cut a new version, run the following command **from within the `data-lineage-ui` directory**:
    ```bash
    npm run release
    ```
    This command will:
    *   Analyze commits since the last Git tag.
    *   Determine the appropriate version bump (patch, minor, or major).
    *   Update the `version` in `package.json`.
    *   Generate/update a `CHANGELOG.md` file (if not present, may need initial configuration).
    *   Create a new Git commit for the version bump.
    *   Create a Git tag for the new version.

3.  **Push Changes:** Push the commits and the new tag to your remote repository:
    ```bash
    git push --follow-tags origin <your-branch-name>
    ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Next Steps / Future Enhancements (From PRD)

*   Backend storage for persistent graphs.
*   User authentication and collaboration features.
*   Ability to import/export lineage data.
*   Search and filtering capabilities.
*   Automatic lineage discovery via integrations (e.g., Airflow, dbt).
*   Version history for graphs.
*   More sophisticated layout algorithms.
*   Node grouping/layering.
*   UI styling improvements (e.g., align with OpenMetadata theme).
