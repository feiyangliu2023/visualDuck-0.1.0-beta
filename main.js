const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const duckdb = require('@duckdb/node-api'); // Import DuckDB
const url = require('url'); // Import url module

// Global database variables
let dbInstance = null;
let dbConnection = null;
let currentDbPath = null;

// Initialize DuckDB using the specified database path
async function initDatabase(dbPath) {
  try {
    // Close existing connection if any
    if (dbConnection) {
      dbConnection.disconnectSync();
    }
    if (dbInstance) {
      dbInstance.closeSync();
    }

    console.log(`Opening database: ${dbPath}`);
    
    // Create a DuckDB instance with the provided file path
    // Use ':memory:' for in-memory database or a file path for persistent storage
    const instance = await duckdb.DuckDBInstance.create(dbPath || ':memory:');
    
    // Connect to the instance
    const connection = await instance.connect();
    
    // If using in-memory database, create sample data
    if (dbPath === ':memory:') {
      await connection.run(`
        CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY,
          name VARCHAR,
          value INTEGER
        );
        
        INSERT OR REPLACE INTO items (id, name, value) VALUES
          (1, 'Alpha', 10),
          (2, 'Bravo', 25),
          (3, 'Charlie', 5),
          (4, 'Delta', 30),
          (5, 'Echo', 15),
          (6, 'Foxtrot', 40),
          (7, 'Golf', 20);
      `);
    }
    
    currentDbPath = dbPath;
    console.log('DuckDB initialized successfully');
    return { instance, connection };
  } catch (error) {
    console.error('Failed to initialize DuckDB:', error);
    throw error;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Log path information to help debug file loading
  console.log('App path:', app.getAppPath());
  console.log('__dirname:', __dirname);
  console.log('Preload path:', path.join(__dirname, 'preload.js'));

  // Log when web contents are created
  win.webContents.on('did-finish-load', () => {
    console.log('Window finished loading');
  });

  // Listen for console messages from renderer
  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] ${message}`);
  });

  if (app.isPackaged) {
    // If the app is packaged, load the index.html file from the out directory
    // which is created by Next.js static export
    const htmlPath = path.join(__dirname, 'out/index.html');
    console.log('Loading HTML from:', htmlPath);
    
    win.loadFile(htmlPath);
  } else {
    // In development, load the Next.js development server URL
    win.loadURL('http://localhost:3000');
    // Open DevTools only in development mode
    win.webContents.openDevTools();
  }

  // Report any errors that occur when loading the HTML file
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`Failed to load: ${errorDescription} (${errorCode})`);
  });

  return win;
}

// Handle database query requests from the renderer process
ipcMain.handle('db:query', async (event, sql) => {
  console.log(`Received query: ${sql}`);
  
  if (!dbConnection) {
    throw new Error('Database connection not initialized');
  }
  
  try {
    // Use runAndReadAll to execute the query and get the results
    const reader = await dbConnection.runAndReadAll(sql);
    const results = reader.getRowObjects();
    console.log('Query result:', results);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error(`Query failed: ${error.message}`);
  }
});

// Handle open database file dialog
ipcMain.handle('db:open', async () => {
  try {
    console.log('Opening file dialog');
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'DuckDB Files', extensions: ['duckdb', 'db'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    console.log('Dialog result:', { canceled, filePaths });

    if (canceled || filePaths.length === 0) {
      console.log('User canceled file dialog');
      return { success: false, message: 'No file selected' };
    }

    const dbPath = filePaths[0];
    console.log(`Selected file path: ${dbPath}`);
    
    try {
      const db = await initDatabase(dbPath);
      dbInstance = db.instance;
      dbConnection = db.connection;
      console.log('Successfully connected to database');
      return { success: true, path: dbPath };
    } catch (dbError) {
      console.error('Failed to initialize database:', dbError);
      return { success: false, message: `Failed to open database: ${dbError.message}` };
    }
  } catch (error) {
    console.error('Failed to open database dialog:', error);
    return { success: false, message: `Dialog error: ${error.message}` };
  }
});

// List tables in the current database
ipcMain.handle('db:listTables', async () => {
  if (!dbConnection) {
    throw new Error('Database connection not initialized');
  }
  
  try {
    const result = await dbConnection.runAndReadAll(
      `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`
    );
    return result.getRowObjects();
  } catch (error) {
    console.error('Error listing tables:', error);
    throw new Error(`Failed to list tables: ${error.message}`);
  }
});

// Get current database info
ipcMain.handle('db:getInfo', () => {
  return {
    connected: !!dbConnection,
    path: currentDbPath || ':memory:'
  };
});

app.whenReady().then(async () => {
  try {
    // Start with in-memory database by default
    const db = await initDatabase(':memory:');
    dbInstance = db.instance;
    dbConnection = db.connection;
    
    createWindow();
    
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

app.on('window-all-closed', async () => {
  // Close the database connection when the app quits
  if (dbConnection) {
    try {
      dbConnection.disconnectSync();
      console.log('DuckDB connection closed.');
    } catch (error) {
      console.error('Error closing DuckDB connection:', error);
    }
  }
  
  if (process.platform !== 'darwin') app.quit();
});

