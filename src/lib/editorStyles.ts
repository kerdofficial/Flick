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
