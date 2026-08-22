const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('rush', {
  openDocument: kind => ipcRenderer.invoke('dialog:open', kind),
  openMany: extensions => ipcRenderer.invoke('dialog:open-many', extensions),
  chooseFolder: () => ipcRenderer.invoke('dialog:folder'),
  saveDialog: options => ipcRenderer.invoke('dialog:save', options),
  runEngine: (tool, payload) => ipcRenderer.invoke('engine:run', tool, payload),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: patch => ipcRenderer.invoke('settings:set', patch),
  setTheme: theme => ipcRenderer.invoke('theme:set', theme),
  showItem: filePath => ipcRenderer.invoke('shell:show-item', filePath),
  openExternal: url => ipcRenderer.invoke('shell:external', url),
  version: () => ipcRenderer.invoke('app:version'),
  getCommonPaths: () => ipcRenderer.invoke('paths:common'),
  discoverLibrary: roots => ipcRenderer.invoke('library:discover', roots),
  indexLibrary: (paths, options) => ipcRenderer.invoke('library:index', paths, options),
  searchLibrary: (query, limit) => ipcRenderer.invoke('library:search', query, limit),
  libraryStats: () => ipcRenderer.invoke('library:stats'),
  onOpenFile: callback => {
    const listener = (_event, filePath) => callback(filePath);
    ipcRenderer.on('app:open-file', listener);
    return () => ipcRenderer.removeListener('app:open-file', listener);
  }
});
