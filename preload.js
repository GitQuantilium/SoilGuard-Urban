const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Serial port
  getPorts: () => ipcRenderer.invoke('get-ports'),
  connectSerial: (port, baud) => ipcRenderer.invoke('connect-serial', port, baud),
  disconnectSerial: () => ipcRenderer.invoke('disconnect-serial'),
  sendToSensor: (cmd) => ipcRenderer.invoke('send-to-sensor', cmd),
  getConnectionStatus: () => ipcRenderer.invoke('get-connection-status'),
  
  // Events
  onSensorData: (callback) => ipcRenderer.on('sensor-data', callback),
  onSerialStatus: (callback) => ipcRenderer.on('serial-status', callback),
  
  // App control
  quitApp: () => ipcRenderer.send('quit-app'),
  
  // Settings
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
});