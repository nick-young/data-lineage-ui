import React from 'react';

// Define the DrawingTool type here or import from types if it exists there
export type DrawingTool = 'select' | 'rectangle' | 'text'; // Add other tools as needed

interface FloatingToolbarProps {
  activeTool: DrawingTool;
  onToolSelect: (tool: DrawingTool) => void;
}

// Simple icons (replace with actual icons later if desired)
const SelectIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M5.834 7.166l-1.591-1.591M4.5 10.5H6M12 20.25V18m-5.834-.166l1.591-1.591M3.75 10.5h1.5m11.25 0h1.5" /></svg>;
const RectangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" /></svg>;
const TextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-2.138a1.125 1.125 0 01.865-.501 48.171 48.171 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>;

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ activeTool, onToolSelect }) => {
  const tools: { name: DrawingTool; icon: React.JSX.Element; label: string }[] = [
    { name: 'select', icon: <SelectIcon />, label: 'Select' },
    { name: 'rectangle', icon: <RectangleIcon />, label: 'Rectangle' },
    { name: 'text', icon: <TextIcon />, label: 'Text' },
  ];

  return (
    // Added floating-toolbar-container class for PNG export filtering
    <div className="floating-toolbar-container absolute top-4 left-4 z-10 flex flex-col gap-1 p-1 rounded-md bg-white shadow-lg border border-gray-200">
      {tools.map((tool) => (
        <button
          key={tool.name}
          onClick={() => onToolSelect(tool.name)}
          className={`p-1.5 rounded hover:bg-gray-100 ${activeTool === tool.name ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-500' : 'text-gray-600'}`}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
};

export default FloatingToolbar; 