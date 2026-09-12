const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

let mainWindow;
let serialPort = null;
let isConnected = false;
let currentPort = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1100,
    minHeight: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: "SoilGuard Urban",
    icon: path.join(__dirname, 'assets/icon.png'),
    frame: true,
    backgroundColor: '#f8fafc'
  });

  mainWindow.loadFile('index.html');

  // Optional: Open DevTools in development
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (serialPort) {
      serialPort.close();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ==================== SERIAL PORT HANDLING ====================

// Get list of available serial ports
ipcMain.handle('get-ports', async () => {
  try {
    const ports = await SerialPort.list();
    return ports.map(port => ({
      path: port.path,
      manufacturer: port.manufacturer || 'Unknown',
      serialNumber: port.serialNumber || ''
    }));
  } catch (err) {
    console.error('Error listing ports:', err);
    return [];
  }
});

// Connect to serial port
ipcMain.handle('connect-serial', async (event, portPath, baudRate = 9600) => {
  try {
    if (serialPort && serialPort.isOpen) {
      await serialPort.close();
    }

    serialPort = new SerialPort({ 
      path: portPath, 
      baudRate: baudRate,
      autoOpen: true 
    });

    const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    serialPort.on('open', () => {
      isConnected = true;
      currentPort = portPath;
      mainWindow.webContents.send('serial-status', { 
        connected: true, 
        port: portPath 
      });
    });

    serialPort.on('error', (err) => {
      console.error('Serial error:', err);
      isConnected = false;
      mainWindow.webContents.send('serial-status', { 
        connected: false, 
        error: err.message 
      });
    });

    serialPort.on('close', () => {
      isConnected = false;
      mainWindow.webContents.send('serial-status', { connected: false });
    });

    // Parse incoming data
    parser.on('data', (line) => {
      const trimmed = line.trim();
      if (trimmed.length > 5) {
        const parsedData = parseSensorData(trimmed);
        if (parsedData) {
          mainWindow.webContents.send('sensor-data', parsedData);
        }
      }
    });

    return { success: true, port: portPath };
  } catch (error) {
    console.error('Connection failed:', error);
    return { success: false, error: error.message };
  }
});

// Disconnect
ipcMain.handle('disconnect-serial', async () => {
  try {
    if (serialPort && serialPort.isOpen) {
      await serialPort.close();
    }
    isConnected = false;
    serialPort = null;
    currentPort = null;
    mainWindow.webContents.send('serial-status', { connected: false });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Send command to sensor (optional)
ipcMain.handle('send-to-sensor', async (event, command) => {
  if (serialPort && serialPort.isOpen) {
    serialPort.write(command + '\r\n');
    return { success: true };
  }
  return { success: false, error: 'Not connected' };
});

// Parse various sensor data formats
function parseSensorData(line) {
  // Common formats supported:
  // 1. T:24.5,H:63,EC:1480,PH:6.4,N:210,P:65,K:295
  // 2. 24.5,63,1480,6.4,210,65,295
  // 3. {"temp":24.5,"moist":63,...}

  try {
    // JSON format
    if (line.startsWith('{') && line.endsWith('}')) {
      const data = JSON.parse(line);
      return normalizeData(data);
    }

    // Key-value format (most common for these sensors)
    if (line.includes(':')) {
      const parts = line.split(',');
      const result = {};
      
      parts.forEach(part => {
        const [key, value] = part.split(':');
        const k = key.trim().toLowerCase();
        const v = parseFloat(value);
        
        if (k === 't' || k === 'temp' || k === 'temperature') result.temp = v;
        else if (k === 'h' || k === 'moist' || k === 'humidity' || k === 'moisture') result.moist = v;
        else if (k === 'ec' || k === 'conductivity') result.ec = v;
        else if (k === 'ph' || k === 'pH') result.ph = v;
        else if (k === 'n' || k === 'nitrogen') result.n = v;
        else if (k === 'p' || k === 'phosphorus' || k === 'phos') result.p = v;
        else if (k === 'k' || k === 'potassium' || k === 'kali') result.k = v;
      });

      return normalizeData(result);
    }

    // Simple CSV format: temp,moist,ec,ph,n,p,k
    if (line.includes(',')) {
      const values = line.split(',').map(v => parseFloat(v.trim()));
      if (values.length >= 7) {
        return {
          temp: values[0],
          moist: values[1],
          ec: values[2],
          ph: values[3],
          n: values[4],
          p: values[5],
          k: values[6]
        };
      }
    }
  } catch (e) {
    console.log('Could not parse line:', line);
  }
  return null;
}

function normalizeData(data) {
  return {
    temp: data.temp ?? data.t ?? data.temperature ?? 25,
    moist: data.moist ?? data.h ?? data.moisture ?? data.humidity ?? 55,
    ec: data.ec ?? data.conductivity ?? 1400,
    ph: data.ph ?? data.pH ?? 6.3,
    n: data.n ?? data.nitrogen ?? 180,
    p: data.p ?? data.phosphorus ?? data.phos ?? 70,
    k: data.k ?? data.potassium ?? data.kali ?? 260
  };
}

// Quit application
ipcMain.on('quit-app', () => {
  app.quit();
});

// Get connection status
ipcMain.handle('get-connection-status', () => {
  return {
    connected: isConnected,
    port: currentPort
  };
});

// ==================== SETTINGS (REVISI) ====================
// Sebelumnya preload.js mengekspos saveSettings/loadSettings tapi tidak ada handler-nya
// di sini -> dead code yang bakal error kalau dipanggil. Sekarang disimpan ke file JSON.
const fs = require('fs');
const settingsFile = () => path.join(app.getPath('userData'), 'soilguard-settings.json');

ipcMain.handle('save-settings', (event, settings) => {
  try {
    fs.writeFileSync(settingsFile(), JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Gagal menyimpan settings:', err);
    return false;
  }
});

ipcMain.handle('load-settings', () => {
  try {
    return JSON.parse(fs.readFileSync(settingsFile(), 'utf8'));
  } catch (err) {
    return null;
  }
});