import React from 'react';
import { toPng } from 'html-to-image';
import { useReactFlow, getNodesBounds, getViewportForBounds } from 'reactflow';

const imageWidth = 3840;  // Increased for higher resolution
const imageHeight = 2160; // Increased for higher resolution

function downloadImage(dataUrl: string) {
  const a = document.createElement('a');
  a.setAttribute('download', 'data-lineage.png');
  a.setAttribute('href', dataUrl);
  a.click();
}

const DownloadButton: React.FC = () => {
  const { getNodes } = useReactFlow();

  const onClick = () => {
    // Calculate a transform for the nodes so that all nodes are visible
    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
    );

    // Hide overlays during export
    const overlays = [
      ...document.querySelectorAll('.react-flow__minimap, .react-flow__controls, .react-flow__panel')
    ] as HTMLElement[];
    overlays.forEach(el => el.style.display = 'none');

    // Target the viewport element directly, as in the official example
    const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewportElement) {
      overlays.forEach(el => el.style.display = '');
      return;
    }

    toPng(viewportElement, {
      backgroundColor: '#ffffff',
      width: imageWidth,
      height: imageHeight,
      skipFonts: true, // Skip fonts to avoid CORS errors
      pixelRatio: 2,   // Increase pixel ratio for better quality
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then(dataUrl => {
      downloadImage(dataUrl);
      overlays.forEach(el => el.style.display = '');
    }).catch(error => {
      console.error('Failed to export image:', error);
      overlays.forEach(el => el.style.display = '');
    });
  };

  return (
    <button 
      className="rounded border border-gray-400 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-100 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition duration-150 ease-in-out"
      title="Save as PNG"
      onClick={onClick}
    >
      Save as PNG
    </button>
  );
};

export default DownloadButton; 