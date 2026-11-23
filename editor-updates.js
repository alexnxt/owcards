// State and history commit immediately. Only the visual refresh is shared by a frame.
function setEditorText(element,value){value=String(value??'');if(element.textContent!==value)element.textContent=value}
function setEditorAttribute(element,name,value){value=String(value);if(element.getAttribute(name)!==value)element.setAttribute(name,value)}
function setEditorProperty(element,name,value){if(element[name]!==value)element[name]=value}
let editorPreviewFrame=null;
function cancelEditorPreview(){if(editorPreviewFrame!==null){cancelAnimationFrame(editorPreviewFrame);editorPreviewFrame=null}}
function flushEditorPreview(){if(editorPreviewFrame===null)return;cancelEditorPreview();render(false)}
function requestEditorPreview(){if(editorPreviewFrame!==null)return;editorPreviewFrame=requestAnimationFrame(()=>{editorPreviewFrame=null;render(false)})}
// Finish before another action can export, change cards or step through history.
for(const event of ['change','pointerup','pointercancel','click','keydown','focusout'])document.addEventListener(event,flushEditorPreview,true);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushEditorPreview()});
window.addEventListener('pagehide',flushEditorPreview);
