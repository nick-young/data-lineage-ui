// CSS modules
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// For direct CSS imports
declare module 'reactflow/dist/style.css' {
  const styles: any;
  export default styles;
}

// For image imports
declare module '*.png';
declare module '*.svg';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif'; 