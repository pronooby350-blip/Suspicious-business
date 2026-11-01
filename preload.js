const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('sb',{ask:p=>ipcRenderer.invoke('ai',p),getCfg:()=>ipcRenderer.invoke('cfg:get'),setCfg:v=>ipcRenderer.invoke('cfg:set',v)});
