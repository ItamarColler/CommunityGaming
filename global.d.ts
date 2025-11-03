declare module '*.module.css' {
  const classes_css: { [key: string]: string };
  export default classes_css;
}

declare module '*.module.scss' {
  const classes_scss: { [key: string]: string };
  export default classes_scss;
}

declare module '*.module.sass' {
  const classes_sass: { [key: string]: string };
  export default classes_sass;
}

// Allow importing non-module CSS/SCSS/SASS files (global styles).
// These don't expose a class map at compile time; the import is typed as `any`.
declare module '*.css';
declare module '*.scss';
declare module '*.sass';


