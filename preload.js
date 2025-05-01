const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  executeQuery: (sql) => ipcRenderer.invoke('db:query', sql),
  openDatabase: () => ipcRenderer.invoke('db:open'),
  listTables: () => ipcRenderer.invoke('db:listTables'),
  getDatabaseInfo: () => ipcRenderer.invoke('db:getInfo')
});
