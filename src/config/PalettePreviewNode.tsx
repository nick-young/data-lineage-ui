import React from 'react';
import { NodePalette } from './nodePalettes';

interface PalettePreviewNodeProps {
  palette: NodePalette;
}

const PalettePreviewNode: React.FC<PalettePreviewNodeProps> = ({ palette }) => {
  const style: React.CSSProperties = {
    backgroundColor: palette.bgColor,
    borderColor: palette.borderColor,
    color: palette.textColor,
    borderWidth: 1,
    borderStyle: 'solid',
    width: '40px', // Small fixed width
    height: '24px', // Small fixed height
    fontSize: '8px', // Tiny font size for preview text
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px', // Match node border radius
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', // Subtle shadow
  };

  return (
    <div style={style} title={`${palette.name} Preview (BG: ${palette.bgColor}, Border: ${palette.borderColor})`}>
      <span>Aa</span> {/* Simple text representation */}
    </div>
  );
};

export default PalettePreviewNode; 