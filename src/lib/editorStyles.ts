export const LINE_HEIGHT = 21;

export const scrollbarStyles = `
  /* style scrollbar for macOS */
  .textarea-scrollbar::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }

  .textarea-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(140, 140, 140, 0.3);
    border-radius: 10px;
    background-clip: padding-box;
    border: 16px solid transparent;
    background-clip: padding-box;
    border-radius: 9999px;
  }
  
  .textarea-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(140, 140, 140, 0.5);
  }
  
  .textarea-scrollbar::-webkit-scrollbar-thumb:active {
    width: 12px;
    background-color: rgba(140, 140, 140, 0.6);
  }
  
  .textarea-scrollbar::-webkit-scrollbar-track {
    background-color: transparent;
  }
  
  /* For Firefox */
  .textarea-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(140, 140, 140, 0.3) transparent;
  }
  
  .textarea-scrollbar:active {
    scrollbar-width: auto;
  }
  
  /* style scrollbar for textarea */
  .scrollbar-textarea::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }
  
  .scrollbar-textarea::-webkit-scrollbar-thumb {
    background-color: rgba(140, 140, 140, 0.3);
    border-radius: 10px;
    background-clip: padding-box;
    border: 2px solid transparent;
  }
  
  .scrollbar-textarea::-webkit-scrollbar-thumb:hover {
    background-color: rgba(140, 140, 140, 0.5);
  }
  
  .scrollbar-textarea::-webkit-scrollbar-thumb:active {
    width: 12px;
    background-color: rgba(140, 140, 140, 0.6);
  }
  
  .scrollbar-textarea::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

export const editorLineNumberStyles = `
  .editor {
    counter-reset: line;
    font-variant-ligatures: none;
    min-height: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  .editor pre {
    padding-left: 60px !important;
  }

  .editor textarea {
    outline: none !important;
    padding-left: 60px !important;
  }

  /* Container styling for proper scrolling */
  .editor-container {
    position: relative;
    height: 100%;
    overflow: auto;
  }
  
  /* Make sure the editor fills the container height */
  .editor-container > div,
  .editor-container > div > textarea,
  .editor-container > div > pre {
    height: 100% !important;
    min-height: 100%;
    box-sizing: border-box;
  }

  .editor .editorLineNumber {
    position: absolute;
    left: 0px;
    color: var(--tw-text-foreground-50, rgba(245, 245, 245, 0.5));
    text-align: right;
    width: 40px;
    font-size: 0.875rem;
    font-weight: 400;
    font-family: var(--font-mono, Roboto Mono, monospace);
    font-variant-numeric: tabular-nums;
    user-select: none;
    mix-blend-mode: screen;
  }
`;
