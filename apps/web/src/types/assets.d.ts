// SVG imports
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  const src: string;
  export default src;
}

declare module '*.svg?url' {
  const content: string;
  export default content;
}

declare module '*.svg?component' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

// PNG imports
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.png?url' {
  const content: string;
  export default content;
}

// JPG/JPEG imports
declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.jpg?url' {
  const content: string;
  export default content;
}

declare module '*.jpeg?url' {
  const content: string;
  export default content;
}

// GIF imports
declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.gif?url' {
  const content: string;
  export default content;
}

// WebP imports
declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.webp?url' {
  const content: string;
  export default content;
}

// AVIF imports
declare module '*.avif' {
  const content: string;
  export default content;
}

declare module '*.avif?url' {
  const content: string;
  export default content;
}

// ICO imports
declare module '*.ico' {
  const content: string;
  export default content;
}

declare module '*.ico?url' {
  const content: string;
  export default content;
}
