const { app, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const dns = require('dns').promises;

function safe(event){
  const url=event?.senderFrame?.url||'';
  if(!url.startsWith('file://')) throw new Error('Blocked untrusted IPC sender');
}
function userDir(...parts){return path.join(app.getPath('userData'),...parts)}
function jsonRead(file,fallback){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch{return fallback}}
function jsonWrite(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2))}
function cleanName(v){return String(v||'document').replace(/[^a-zA-Z0-9._ -]/g,'_').slice(0,120)}
function privateIp(ip){
  if(!ip)return true;
  if(ip==='::1'||ip.startsWith('fc')||ip.startsWith('fd')||ip.startsWith('fe80:'))return true;
  const p=ip.split('.').map(Number);
  if(p.length===4){if(p[0]===10||p[0]===127)return true;if(p[0]===169&&p[1]===254)return true;if(p[0]===172&&p[1]>=16&&p[1]<=31)return true;if(p[0]===192&&p[1]===168)return true;}
  return false;
}
async function assertPublicHttps(raw){
  const u=new URL(raw);
  if(u.protocol!=='https:')throw new Error('Only HTTPS imports are allowed.');
  if(!u.hostname||u.username||u.password)throw new Error('Invalid import URL.');
  const answers=await dns.lookup(u.hostname,{all:true});
  if(!answers.length||answers.some(x=>privateIp(x.address)))throw new Error('Private/local network URLs are blocked.');
  return u;
}
function licenseFile(){return userDir('license.json')}
function publicKey(){
  const candidates=[process.env.RUSH_LICENSE_PUBLIC_KEY_PEM,app.isPackaged?path.join(process.resourcesPath,'license-public-key.pem'):path.join(__dirname,'..','resources','license-public-key.pem')].filter(Boolean);
  for(const c of candidates){try{return c.includes('BEGIN PUBLIC KEY')?c:fs.readFileSync(c,'utf8')}catch{}}
  return null;
}
function verifyLicense(doc){
  if(!doc||!doc.payload||!doc.signature)return {plan:'free',valid:true,source:'local'};
  const key=publicKey();
  if(!key)return {plan:'free',valid:true,source:'local',reason:'No vendor public key configured'};
  try{
    const body=Buffer.from(JSON.stringify(doc.payload));
    const ok=crypto.verify(null,body,key,Buffer.from(doc.signature,'base64'));
    if(!ok)return {plan:'free',valid:false,source:'direct',reason:'Invalid signature'};
    if(doc.payload.expiresAt&&Date.now()>Date.parse(doc.payload.expiresAt))return {plan:'free',valid:false,source:'direct',reason:'License expired'};
    return {plan:doc.payload.plan==='pro'?'pro':'free',valid:true,source:doc.payload.source||'direct',owner:doc.payload.owner||null,licenseId:doc.payload.licenseId||null,expiresAt:doc.payload.expiresAt||null};
  }catch(e){return {plan:'free',valid:false,source:'direct',reason:e.message}}
}
function historyRoot(){return userDir('version-history')}
function historyIndex(){return userDir('version-history','index.json')}
function loadHistory(){return jsonRead(historyIndex(),[])}
function hashFile(file){const h=crypto.createHash('sha256');h.update(fs.readFileSync(file));return h.digest('hex')}

ipcMain.handle('pro:license-get',event=>{safe(event);return verifyLicense(jsonRead(licenseFile(),null))});
ipcMain.handle('pro:license-import',async event=>{
  safe(event);const r=await dialog.showOpenDialog({properties:['openFile'],filters:[{name:'RUSH License',extensions:['rushlicense','json']}]});if(r.canceled)return null;
  const doc=jsonRead(r.filePaths[0],null),checked=verifyLicense(doc);if(!checked.valid||checked.plan!=='pro')throw new Error(checked.reason||'This is not a valid RUSH Pro license.');jsonWrite(licenseFile(),doc);return checked;
});
ipcMain.handle('pro:license-clear',event=>{safe(event);try{fs.rmSync(licenseFile(),{force:true})}catch{}return {plan:'free',valid:true,source:'local'}});

ipcMain.handle('history:snapshot',(event,filePath,label='Auto save')=>{
  safe(event);if(!filePath||!fs.existsSync(filePath))throw new Error('File not found');const st=fs.statSync(filePath);if(!st.isFile()||st.size>1024*1024*1024)throw new Error('File is too large for local version history.');
  const id=`${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;const dir=historyRoot();fs.mkdirSync(dir,{recursive:true});const copy=path.join(dir,`${id}-${cleanName(path.basename(filePath))}`);fs.copyFileSync(filePath,copy);
  const entry={id,source:path.resolve(filePath),copy,label:String(label||'Snapshot').slice(0,100),createdAt:new Date().toISOString(),size:st.size,sha256:hashFile(copy)};const list=[entry,...loadHistory()].slice(0,200);jsonWrite(historyIndex(),list);return entry;
});
ipcMain.handle('history:list',(event,filePath)=>{safe(event);const source=filePath?path.resolve(filePath):null;return loadHistory().filter(x=>!source||x.source===source).slice(0,100)});
ipcMain.handle('history:restore',(event,id,target)=>{safe(event);const entry=loadHistory().find(x=>x.id===id);if(!entry||!fs.existsSync(entry.copy))throw new Error('Version snapshot not found');const dest=target||entry.source;if(!dest)throw new Error('Restore destination required');fs.copyFileSync(entry.copy,dest);return {output:dest,restored:entry}});

ipcMain.handle('internet:import',async(event,url)=>{
  safe(event);const u=await assertPublicHttps(url);const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),30000);
  try{
    const res=await fetch(u,{redirect:'follow',signal:controller.signal,headers:{'User-Agent':'RUSH-Office-Suite/2'}});if(!res.ok)throw new Error(`Download failed (${res.status})`);const len=Number(res.headers.get('content-length')||0);if(len>100*1024*1024)throw new Error('Remote file exceeds 100 MB import limit.');
    const type=(res.headers.get('content-type')||'').toLowerCase();const allowed=['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/rtf','text/plain','text/html','application/vnd.oasis.opendocument.text','image/png','image/jpeg','image/webp'];if(type&&!allowed.some(x=>type.startsWith(x)))throw new Error('Remote content type is not supported.');
    const bytes=Buffer.from(await res.arrayBuffer());if(bytes.length>100*1024*1024)throw new Error('Remote file exceeds 100 MB import limit.');const base=cleanName(path.basename(u.pathname)||'download');const dest=path.join(app.getPath('downloads'),base);fs.writeFileSync(dest,bytes);return {output:dest,size:bytes.length,type};
  }finally{clearTimeout(timer)}
});

ipcMain.handle('font:import',async event=>{
  safe(event);const r=await dialog.showOpenDialog({properties:['openFile'],filters:[{name:'Font',extensions:['ttf','otf','woff','woff2']}]});if(r.canceled)return null;const f=r.filePaths[0],st=fs.statSync(f);if(st.size>20*1024*1024)throw new Error('Font file is too large.');const e=path.extname(f).toLowerCase();const mime=e==='.woff2'?'font/woff2':e==='.woff'?'font/woff':e==='.otf'?'font/otf':'font/ttf';return {name:path.basename(f,path.extname(f)),dataUrl:`data:${mime};base64,${fs.readFileSync(f).toString('base64')}`};
});

ipcMain.handle('secure:create-package',(event,input,output,password,expiresAt)=>{
  safe(event);if(!input||!fs.existsSync(input))throw new Error('Input file not found');if(!password||String(password).length<8)throw new Error('Use a password of at least 8 characters.');const st=fs.statSync(input);if(st.size>250*1024*1024)throw new Error('Secure packages are limited to 250 MB.');
  const salt=crypto.randomBytes(16),iv=crypto.randomBytes(12),key=crypto.scryptSync(String(password),salt,32),cipher=crypto.createCipheriv('aes-256-gcm',key,iv),plain=fs.readFileSync(input),enc=Buffer.concat([cipher.update(plain),cipher.final()]),tag=cipher.getAuthTag();const header=Buffer.from(JSON.stringify({version:1,name:path.basename(input),createdAt:new Date().toISOString(),expiresAt:expiresAt||null,salt:salt.toString('base64'),iv:iv.toString('base64'),tag:tag.toString('base64')}));const len=Buffer.alloc(4);len.writeUInt32BE(header.length,0);fs.writeFileSync(output,Buffer.concat([Buffer.from('RUSHPKG1'),len,header,enc]));return {output,size:fs.statSync(output).size};
});

ipcMain.handle('integrity:status',event=>{
  safe(event);const manifest=app.isPackaged?path.join(process.resourcesPath,'integrity-manifest.json'):path.join(__dirname,'..','resources','integrity-manifest.json');if(!fs.existsSync(manifest))return {verified:false,mode:'development',reason:'No release integrity manifest'};const m=jsonRead(manifest,null);if(!m||!Array.isArray(m.files))return {verified:false,reason:'Invalid integrity manifest'};for(const item of m.files){const f=path.join(process.resourcesPath,item.path);if(!fs.existsSync(f)||hashFile(f)!==item.sha256)return {verified:false,reason:`Integrity mismatch: ${item.path}`}}return {verified:true,files:m.files.length};
});
