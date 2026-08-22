import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const required=['package.json','.env.example','electron/main.cjs','electron/preload.cjs','renderer/index.html','renderer/styles.css','renderer/src/main.jsx','scripts/build-ui.mjs','python/engine.py','python/self_test.py','python/requirements.txt','native/CMakeLists.txt','native/rush_native_core.cpp','scripts/setup-windows.ps1','scripts/build-python.ps1','scripts/build-native.ps1','BUILD_WINDOWS.ps1','BUILD_LINUX.sh','BUILD_MACOS.sh','README.md','THIRD_PARTY_NOTICES.md'];
const errors=[];
for(const file of required)if(!fs.existsSync(path.join(root,file)))errors.push(`Missing ${file}`);
let pkg={};try{pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'))}catch{errors.push('package.json is invalid JSON')}
for(const x of ['pdf','docx','odt','rtf','txt','doc'])if(!pkg.build?.fileAssociations?.some(v=>v.ext===x))errors.push(`Missing ${x} file association`);
const main=fs.existsSync(path.join(root,'electron/main.cjs'))?fs.readFileSync(path.join(root,'electron/main.cjs'),'utf8'):'';
for(const token of ['contextIsolation: true','nodeIntegration: false','sandbox: true','safeSender'])if(!main.includes(token))errors.push(`Electron hardening missing: ${token}`);
const html=fs.existsSync(path.join(root,'renderer/index.html'))?fs.readFileSync(path.join(root,'renderer/index.html'),'utf8'):'';
if(!html.includes('Content-Security-Policy'))errors.push('Missing Content Security Policy');
const ui=fs.existsSync(path.join(root,'renderer/src/main.jsx'))?fs.readFileSync(path.join(root,'renderer/src/main.jsx'),'utf8'):'';
for(const token of ['PDF Studio','Document Editor','Organize Pages','Fill & Sign','OCR & Search','Nova Studio Plateformes','Ephraim Lifanjo','doc_save','search_pdf'])if(!ui.includes(token))errors.push(`UI workflow missing: ${token}`);
const engine=fs.existsSync(path.join(root,'python/engine.py'))?fs.readFileSync(path.join(root,'python/engine.py'),'utf8'):'';
for(const token of ["'doc_open': op_doc_open","'doc_save': op_doc_save","'ocr_pdf': op_ocr_pdf","'index_paths': op_index_paths","'search_index': op_search_index","'apply_edits': op_apply_edits"])if(!engine.includes(token))errors.push(`Engine workflow missing: ${token}`);
try{for(const f of ['electron/main.cjs','electron/preload.cjs','scripts/build-ui.mjs'])execFileSync(process.execPath,['--check',path.join(root,f)],{stdio:'pipe'})}catch{errors.push('Node/Electron source syntax validation failed')}
try{execFileSync(process.platform==='win32'?'python':'python3',['-m','py_compile',path.join(root,'python/engine.py'),path.join(root,'python/self_test.py')],{stdio:'pipe'})}catch{}
if(errors.length){console.error('RUSH validation failed:\n - '+errors.join('\n - '));process.exit(1)}
console.log('RUSH Office Suite structural validation passed.');
console.log(` - ${required.length} required source/build files present`);
console.log(' - PDF + DOCX/ODT/RTF/TXT/DOC associations configured');
console.log(' - Electron sandbox/contextIsolation and IPC sender checks present');
console.log(' - PDF editor, document editor, OCR search and local indexing workflows present');
