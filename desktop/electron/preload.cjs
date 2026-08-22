const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('rush', {
  openDocument: kind => ipcRenderer.invoke('dialog:open', kind),
  openMany: extensions => ipcRenderer.invoke('dialog:open-many', extensions),
  chooseFolder: () => ipcRenderer.invoke('dialog:folder'),
  saveDialog: options => ipcRenderer.invoke('dialog:save', options),
  readFile: filePath => ipcRenderer.invoke('file:read', filePath),
  readFileDataUrl: filePath => ipcRenderer.invoke('file:data-url', filePath),
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
  getLicense: () => ipcRenderer.invoke('pro:license-get'),
  importLicense: () => ipcRenderer.invoke('pro:license-import'),
  clearLicense: () => ipcRenderer.invoke('pro:license-clear'),
  snapshotVersion: (filePath, label) => ipcRenderer.invoke('history:snapshot', filePath, label),
  listVersions: filePath => ipcRenderer.invoke('history:list', filePath),
  restoreVersion: (id, target) => ipcRenderer.invoke('history:restore', id, target),
  importFromInternet: url => ipcRenderer.invoke('internet:import', url),
  importFont: () => ipcRenderer.invoke('font:import'),
  createSecurePackage: (input, output, password, expiresAt) => ipcRenderer.invoke('secure:create-package', input, output, password, expiresAt),
  integrityStatus: () => ipcRenderer.invoke('integrity:status'),
  onOpenFile: callback => {
    const listener = (_event, filePath) => callback(filePath);
    ipcRenderer.on('app:open-file', listener);
    return () => ipcRenderer.removeListener('app:open-file', listener);
  }
});
