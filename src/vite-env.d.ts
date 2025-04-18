/// <reference types="vite/client" />

// This adds proper typing for import.meta.env
interface ImportMeta {
  readonly env: {
    readonly BASE_URL: string;
    readonly MODE: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly SSR: boolean;
    [key: string]: any;
  };
} 