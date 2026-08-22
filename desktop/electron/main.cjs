const { app, BrowserWindow, dialog, ipcMain, shell, nativeTheme, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');

let mainWindow = null;
let pendingOpen = null;
const SUPPORTED = new Set(['.pdf','.doc','.docx','.odt','.rtf','.txt','.html','.htm']);
const IMAGE_EXT = new Set(['.png','.jpg','.jpeg','.webp','.gif','.bmp']);

function loadDotEnv() {
  if (app.isPackaged) return;
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const raw of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] == null) process.env[key] = value;
  }
}
function safeSender(event) { const url = event?.senderFrame?.url || ''; if (!url.startsWith('file://')) throw new Error('Blocked untrusted IPC sender'); }
function checkedLocalFile(filePath, allowed = null, maxBytes = 300 * 1024 * 1024) {
  if (typeof filePath !== 'string' || !filePath) throw new Error('Invalid file path');
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) throw new Error('File does not exist');
  const extension = path.extname(resolved).toLowerCase();
  if (allowed && !allowed.has(extension)) throw new Error('File type not permitted for this operation');
  if (fs.statSync(resolved).size > maxBytes) throw new Error('File is too large for direct renderer transfer');
  return resolved;
}
function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function writeJson(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2)); }
function settingsFile() { return path.join(app.getPath('userData'), 'settings.json'); }
function settingsRead() { return readJson(settingsFile(), { theme:'light', sidebarCollapsed:false, ecoMode:true, ocrLanguages:'eng+fra', recent:[] }); }
function settingsPatch(patch) { const next = { ...settingsRead(), ...(patch || {}) }; writeJson(settingsFile(), next); return next; }

function resolveEngine() {
  if (app.isPackaged) {
    const name = process.platform === 'win32' ? 'rush-office-engine.exe' : 'rush-office-engine';
    const exe = path.join(process.resourcesPath, 'python', name);
    if (fs.existsSync(exe)) return { cmd: exe, args: [] };
  }
  const script = path.join(__dirname, '..', 'python', 'engine.py');
  const candidates = [process.env.RUSH_PYTHON_EXE, process.platform === 'win32' ? path.join(__dirname, '..', '.venv', 'Scripts', 'python.exe') : path.join(__dirname, '..', '.venv', 'bin', 'python'), process.platform === 'win32' ? 'python' : 'python3'].filter(Boolean);
  for (const cmd of candidates) { if (cmd.includes(path.sep) && !fs.existsSync(cmd)) continue; return { cmd, args: [script] }; }
  throw new Error('RUSH document engine not found. Run the setup script first.');
}
function runEngine(tool, payload = {}, timeoutMs = 20 * 60 * 1000) {
  return new Promise((resolve, reject) => {
    let engine; try { engine = resolveEngine(); } catch (error) { reject(error); return; }
    const child = spawn(engine.cmd, [...engine.args, tool], { windowsHide:true, shell:false, stdio:['pipe','pipe','pipe'], env:{...process.env,RUSH_USER_DATA:app.getPath('userData')} });
    let stdout='', stderr='', settled=false;
    const finish=(fn,value)=>{if(settled)return;settled=true;clearTimeout(timer);fn(value)};
    const timer=setTimeout(()=>{try{child.kill()}catch{}finish(reject,new Error(`${tool} timed out.`))},timeoutMs);
    child.stdout.on('data',d=>{stdout+=d.toString();if(stdout.length>40_000_000){try{child.kill()}catch{}finish(reject,new Error('Engine response exceeded safety limit.'))}});
    child.stderr.on('data',d=>{stderr+=d.toString();if(stderr.length>5_000_000)stderr=stderr.slice(-5_000_000)});
    child.on('error',e=>finish(reject,e));
    child.on('close',code=>{if(settled)return;if(code!==0)return finish(reject,new Error(stderr.trim()||`Engine exited with code ${code}`));try{const r=JSON.parse(stdout.trim()||'{}');if(r.ok===false)finish(reject,new Error(r.error||`${tool} failed`));else finish(resolve,r)}catch{finish(reject,new Error(`Invalid engine response: ${stdout.slice(0,700)}`))}});
    child.stdin.end(JSON.stringify(payload));
  });
}
function resolveNativeCore() {
  const name = process.platform === 'win32' ? 'rush-native-core.exe' : 'rush-native-core';
  const candidates = app.isPackaged ? [path.join(process.resourcesPath, 'native', name)] : [path.join(__dirname, '..', 'resources', 'native', name), path.join(__dirname, '..', 'native', 'build', name)];
  return candidates.find(p => fs.existsSync(p)) || null;
}
function nativeScan(root) {
  const exe=resolveNativeCore(); if(!exe)return Promise.resolve(null);
  return new Promise(resolve=>{const child=spawn(exe,['scan',root],{windowsHide:true,shell:false});let stdout='';child.stdout.on('data',d=>stdout+=d.toString());child.on('error',()=>resolve(null));child.on('close',code=>{if(code!==0)return resolve(null);try{resolve(JSON.parse(stdout))}catch{resolve(null)}})});
}
function fileFromArgs(argv) { return argv.find(value => typeof value === 'string' && SUPPORTED.has(path.extname(value).toLowerCase()) && fs.existsSync(value)) || null; }
function sendOpenFile(filePath) { if(!filePath)return;if(mainWindow&&!mainWindow.isDestroyed()){if(mainWindow.isMinimized())mainWindow.restore();mainWindow.focus();mainWindow.webContents.send('app:open-file',filePath)}else pendingOpen=filePath; }
function createWindow() {
  mainWindow=new BrowserWindow({width:1540,height:960,minWidth:1080,minHeight:720,title:'RUSH Office Suite',backgroundColor:'#f5f5f5',show:false,icon:path.join(__dirname,'..','build',process.platform==='win32'?'icon.ico':'icon.png'),webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,spellcheck:true}});
  mainWindow.removeMenu();mainWindow.loadFile(path.join(__dirname,'..','renderer','index.html'));mainWindow.once('ready-to-show',()=>mainWindow.show());mainWindow.webContents.on('did-finish-load',()=>{if(pendingOpen){const f=pendingOpen;pendingOpen=null;sendOpenFile(f)}});mainWindow.webContents.setWindowOpenHandler(({url})=>{if(/^https?:\/\//i.test(url))shell.openExternal(url);return{action:'deny'}});
}
loadDotEnv();
const gotLock=app.requestSingleInstanceLock();if(!gotLock)app.quit();else app.on('second-instance',(_e,argv)=>sendOpenFile(fileFromArgs(argv)));
app.on('open-file',(e,filePath)=>{e.preventDefault();sendOpenFile(filePath)});
app.whenReady().then(()=>{Menu.setApplicationMenu(null);pendingOpen=fileFromArgs(process.argv)||pendingOpen;createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()})});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});

ipcMain.handle('dialog:open',async(event,kind='document')=>{safeSender(event);const filters=kind==='pdf'?[{name:'PDF',extensions:['pdf']}]:[{name:'RUSH Documents',extensions:['pdf','doc','docx','odt','rtf','txt','html','htm']}];const r=await dialog.showOpenDialog(mainWindow,{properties:['openFile'],filters});return r.canceled?null:r.filePaths[0]});
ipcMain.handle('dialog:open-many',async(event,extensions=['pdf'])=>{safeSender(event);const r=await dialog.showOpenDialog(mainWindow,{properties:['openFile','multiSelections'],filters:[{name:'Files',extensions}]});return r.canceled?[]:r.filePaths});
ipcMain.handle('dialog:folder',async event=>{safeSender(event);const r=await dialog.showOpenDialog(mainWindow,{properties:['openDirectory']});return r.canceled?null:r.filePaths[0]});
ipcMain.handle('dialog:save',async(event,options={})=>{safeSender(event);const r=await dialog.showSaveDialog(mainWindow,{defaultPath:options.defaultPath,filters:options.filters});return r.canceled?null:r.filePath});
ipcMain.handle('file:read',(event,filePath)=>{safeSender(event);const f=checkedLocalFile(filePath,SUPPORTED);return fs.readFileSync(f)});
ipcMain.handle('file:data-url',(event,filePath)=>{safeSender(event);const f=checkedLocalFile(filePath,IMAGE_EXT,50*1024*1024);const extension=path.extname(f).toLowerCase();const mime=extension==='.png'?'image/png':extension==='.webp'?'image/webp':extension==='.gif'?'image/gif':'image/jpeg';return `data:${mime};base64,${fs.readFileSync(f).toString('base64')}`});
ipcMain.handle('engine:run',async(event,tool,payload)=>{safeSender(event);return runEngine(tool,payload||{})});
ipcMain.handle('settings:get',event=>{safeSender(event);return settingsRead()});
ipcMain.handle('settings:set',(event,patch)=>{safeSender(event);return settingsPatch(patch)});
ipcMain.handle('theme:set',(event,theme)=>{safeSender(event);nativeTheme.themeSource=['dark','light'].includes(theme)?theme:'system';return nativeTheme.shouldUseDarkColors});
ipcMain.handle('shell:show-item',(event,filePath)=>{safeSender(event);shell.showItemInFolder(filePath);return true});
ipcMain.handle('shell:external',(event,url)=>{safeSender(event);if(!/^https?:\/\//i.test(url))throw new Error('Blocked URL');return shell.openExternal(url)});
ipcMain.handle('app:version',event=>{safeSender(event);return app.getVersion()});
ipcMain.handle('paths:common',event=>{safeSender(event);return{desktop:app.getPath('desktop'),documents:app.getPath('documents'),downloads:app.getPath('downloads'),home:os.homedir()}});
ipcMain.handle('library:discover',async(event,roots)=>{safeSender(event);const result=[];for(const root of roots||[]){if(!root||!fs.existsSync(root))continue;const native=await nativeScan(root);if(Array.isArray(native))result.push(...native.map(x=>x.path||x).filter(Boolean));else{const stack=[root];while(stack.length&&result.length<50000){const dir=stack.pop();let entries=[];try{entries=fs.readdirSync(dir,{withFileTypes:true})}catch{continue}for(const entry of entries){const full=path.join(dir,entry.name);if(entry.isDirectory()){if(!['node_modules','.git','Windows','$Recycle.Bin'].includes(entry.name))stack.push(full)}else if(entry.isFile()&&SUPPORTED.has(path.extname(entry.name).toLowerCase()))result.push(full)}}}}return[...new Set(result)]});
ipcMain.handle('library:index',async(event,paths,options)=>{safeSender(event);return runEngine('index_paths',{paths:paths||[],...(options||{})},60*60*1000)});
ipcMain.handle('library:search',async(event,query,limit=100)=>{safeSender(event);return runEngine('search_index',{query,limit})});
ipcMain.handle('library:stats',async event=>{safeSender(event);return runEngine('library_stats',{})});
