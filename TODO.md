# Canvas Rectangles Feature Implementation

## Overview
Add the ability to create, manipulate, and style rectangular boxes on the canvas. These boxes will be in the background behind nodes and can be used for grouping or annotation purposes.

## Tasks

### 1. Implement Rectangle Creation and Basic Handling
- [x] Create a new `CanvasRectangle` component that renders an SVG rectangle
- [x] Add state management for rectangles in App.tsx (similar to nodes/edges)
- [x] Implement rectangle drawing functionality:
  - [x] Add event handlers to ReactFlow to detect drag start/drag/drag end for rectangle creation
  - [x] Create a visual indicator during the drawing process
  - [x] Store the created rectangle in state when drawing completes

### 2. Implement Rectangle Resizing
- [x] Add resize handlers to the rectangles (top, bottom, left, right, corners)
- [x] Implement functionality to detect resize operations
- [x] Implement resize logic to update rectangle dimensions
- [x] Add visual indicators during resize operations
- [x] Ensure rectangles maintain minimum dimensions

### 3. Implement Rectangle Movement
- [x] Add mouse event handlers for rectangle selection and dragging
- [x] Implement logic to move rectangles when dragged
- [x] Add visual indicators or cursor changes during move operations
- [x] Ensure rectangles don't move outside the canvas boundaries (if needed)

### 4. Implement Rectangle Styling
- [x] Integrate with existing color palette system used for nodes
- [x] Add ability to change rectangle background color
- [x] Add ability to change rectangle border color
- [x] Add ability to change border width
- [x] Implement border style options (solid, dashed, dotted)
- [x] Create UI controls in the sidebar to modify rectangle appearance

### 5. Implement Rectangle Text Labels
- [x] Add text element to rectangles
- [x] Implement text editing capabilities
- [x] Add font size controls
- [x] Add text alignment options:
  - [x] Horizontal alignment (left, center, right)
  - [x] Vertical alignment (top, middle, bottom)
- [x] Create UI controls for text styling options

### 6. Implement Z-Index Management
- [x] Ensure rectangles are rendered behind nodes
- [ ] Add ability to control the stacking order of rectangles
- [ ] Create UI controls for z-index management

### 7. Integration and Persistence
- [x] Integrate rectangle functionality with existing save/load capabilities
- [x] Update the save/load logic to include rectangle data
- [x] Ensure rectangles persist when the application is reloaded
- [x] Add rectangle-related properties to localStorage or JSON exports

### 8. UI/UX Enhancements
- [ ] Add keyboard shortcuts for rectangle operations
- [x] Add rectangle selection highlighting
- [ ] Implement multi-select capabilities for rectangles
- [x] Add rectangle deletion capabilities
- [ ] Add undo/redo support for rectangle operations


### 9. Testing and Refinement
- [ ] Test all rectangle operations
- [ ] Test interaction between rectangles and nodes
- [ ] Test edge cases (very large/small rectangles, many rectangles)
- [ ] Refine interactions based on testing

### 10. Documentation
- [ ] Update documentation to include rectangle features
- [ ] Add usage examples and best practices
- [ ] Document the rectangle data structure and API 