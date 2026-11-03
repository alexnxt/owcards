// Shared artwork keeps the same action recognizable across the editor.
const editorIconPaths={
 crop:'M6 3v13a2 2 0 0 0 2 2h13M3 6h13a2 2 0 0 1 2 2v13',
 frame:'M7 3H3v4m14-4h4v4M3 17v4h4m10 0h4v-4M7 7h10v10H7zM7 14l3-3 3 3 2-2 2 2',
 replace:'M4 4h12v12H4zM4 13l4-4 4 4 2-2 2 2M14 19h7m-2-2 2 2-2 2M21 14h-7m2-2-2 2 2 2',
 write:'m4 15 11-11 5 5L9 20H4v-5ZM13 6l5 5',
 font:'M2 19 8 5l6 14M4 14h8M22 12v7M22 15.5a3.5 3.5 0 1 0-7 0 3.5 3.5 0 1 0 7 0',
 color:'M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.4-3.4l-.2-.2a1.5 1.5 0 0 1 1.1-2.6H18a4 4 0 0 0 4-4C22 6.5 17.5 3 12 3ZM7 10h.01M10 7h.01M15 7h.01M18 10h.01',
 effects:'m4 18 9-9 3 3-9 9-3-3Zm7-7 3 3M17 3v4m-2-2h4M4 5v4M2 7h4M20 16v4m-2-2h4',
 position:'M12 3v18M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4M7 8l-4 4 4 4M17 8l4 4-4 4',
 zoomOut:'m15.5 15.5 5.5 5.5M18 10a8 8 0 1 1-16 0 8 8 0 1 1 16 0M6 10h8',
 zoomIn:'m15.5 15.5 5.5 5.5M18 10a8 8 0 1 1-16 0 8 8 0 1 1 16 0M6 10h8m-4-4v8',
 resetFrame:'M20 7a8 8 0 1 0 1 8M20 3v4h-4M8 9h7v7H8z',
 collage:'M3 3h8v8H3zM15 3h6v8h-6zM3 15h8v6H3zM15 15h6v6h-6z',
 design:'M4 3h16v18H4zM4 8h16M10 8v13M13 12h4m-4 4h4',
 pages:'M8 3h12v14H8zM4 7v14h12M11 7h6m-6 4h6',
 centerHorizontal:'M12 2v5m0 10v5M5 8h14v8H5z',
 centerVertical:'M2 12h5m10 0h5M8 5h8v14H8z',
 centerBoth:'M12 2v4m0 12v4M2 12h4m12 0h4M7 7h10v10H7z'
};
function editorIcon(name){return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+editorIconPaths[name]+'"/></svg>'}
