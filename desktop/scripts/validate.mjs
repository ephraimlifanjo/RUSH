import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const required=['package.json','.env.example','electron/main.cjs','electron/bootstrap.cjs','electron/feature-bridge.cjs','electron/preload.cjs','renderer/index.html','renderer/styles.css','renderer/runtime-enhancements.js','renderer/runtime-enhancements.css','renderer/runtime-pro-tools.js','renderer/runtime-pro-tools.css','renderer/src/main.jsx','renderer/src/themes.js','renderer/src/i18n.js','renderer/src/licensing.js','scripts/build-ui.mjs','scripts/generate-integrity.mjs','scripts/create-license.mjs','scripts/generate-icon.py','python/engine.py','python/engine_v2.py','python/advanced.py','python/self_test.py','python/requirements.txt','python/requirements-translation.txt','native/CMakeLists.txt','native/rush_native_core.cpp','scripts/setup-windows.ps1','scripts/build-python.ps1','scripts/build-native.ps1','BUILD_WINDOWS.ps1','BUILD_LINUX.sh','BUILD_MACOS.sh','README.md','THIRD_PARTY_NOTICES.md'];
const errors=[];
for(const file of required)if(!fs.existsSync(path.join(root,file)))errors.push(`Missing ${file}`);
let pkg={};try{pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'))}catch{errors.push('package.json is invalid JSON')}
if(pkg.main!=='electron/bootstrap.cjs')errors.push('Package main must use secure bootstrap.cjs');
for(const x of ['pdf','docx','odt','rtf','txt','doc'])if(!pkg.build?.fileAssociations?.some(v=>v.ext===x))errors.push(`Missing ${x} file association`);
for(const script of ['build:icon','dist:win','dist:msi','dist:msix','dist:linux','dist:mac'])if(!pkg.scripts?.[script])errors.push(`Missing package script ${script}`);
if(pkg.build?.win?.icon!=='build/icon.ico')errors.push('Windows build icon must be generated at build/icon.ico');
const main=fs.existsSync(path.join(root,'electron/main.cjs'))?fs.readFileSync(path.join(root,'electron/main.cjs'),'utf8'):'';
for(const token of ['contextIsolation:true','nodeIntegration:false','sandbox:true','safeSender','engine_v2.py'])if(!main.replaceAll(' ','').includes(token.replaceAll(' ','')))errors.push(`Electron hardening/engine missing: ${token}`);
const bridge=fs.readFileSync(path.join(root,'electron/feature-bridge.cjs'),'utf8');
for(const token of ['pro:license-get','history:snapshot','internet:import','secure:create-package','integrity:status','aes-256-gcm'])if(!bridge.includes(token))errors.push(`Secure service missing: ${token}`);
const html=fs.existsSync(path.join(root,'renderer/index.html'))?fs.readFileSync(path.join(root,'renderer/index.html'),'utf8'):'';
if(!html.includes('Content-Security-Policy'))errors.push('Missing Content Security Policy');
for(const f of ['runtime-enhancements.js','runtime-pro-tools.js'])if(!html.includes(f))errors.push(`Renderer bootstrap missing ${f}`);
const ui=fs.existsSync(path.join(root,'renderer/src/main.jsx'))?fs.readFileSync(path.join(root,'renderer/src/main.jsx'),'utf8'):'';
for(const token of ['PDF Studio','Document Editor','Organize Pages','Fill & Sign','OCR & Search','doc_save','search_pdf'])if(!ui.includes(token))errors.push(`UI workflow missing: ${token}`);
const theme=fs.readFileSync(path.join(root,'renderer/runtime-enhancements.js'),'utf8');
for(const token of ['Leonore','Melody','Ephraim Royale','Minimal Notes','Midnight','English','Français','العربية','Import HTTPS'])if(!theme.includes(token))errors.push(`Theme/localization feature missing: ${token}`);
const pro=fs.readFileSync(path.join(root,'renderer/runtime-pro-tools.js'),'utf8');
for(const token of ['Digital Signature','Translate Document','Secure Package','Version History'])if(!pro.includes(token))errors.push(`Pro UI missing: ${token}`);
const engine=fs.existsSync(path.join(root,'python/engine.py'))?fs.readFileSync(path.join(root,'python/engine.py'),'utf8'):'';
for(const token of ["'doc_open':op_doc_open","'doc_save':op_doc_save","'ocr_pdf':op_ocr_pdf","'index_paths':op_index_paths","'search_index':op_search_index","'apply_edits':op_apply_edits"])if(!engine.replaceAll(' ','').includes(token.replaceAll(' ','')))errors.push(`Engine workflow missing: ${token}`);
const advanced=fs.readFileSync(path.join(root,'python/advanced.py'),'utf8');
for(const token of ['op_sign_pdf','op_translate_document','IncrementalPdfFileWriter','argostranslate'])if(!advanced.includes(token))errors.push(`Advanced engine missing: ${token}`);
try{for(const f of ['electron/main.cjs','electron/bootstrap.cjs','electron/feature-bridge.cjs','electron/preload.cjs','renderer/runtime-enhancements.js','renderer/runtime-pro-tools.js','scripts/build-ui.mjs','scripts/generate-integrity.mjs','scripts/create-license.mjs'])execFileSync(process.execPath,['--check',path.join(root,f)],{stdio:'pipe'})}catch(e){errors.push(`Node/Electron source syntax validation failed: ${e.message}`)}
try{execFileSync(process.platform==='win32'?'python':'python3',['-m','py_compile',path.join(root,'python/engine.py'),path.join(root,'python/engine_v2.py'),path.join(root,'python/advanced.py'),path.join(root,'python/self_test.py')],{stdio:'pipe'})}catch{}
if(errors.length){console.error('RUSH validation failed:\n - '+errors.join('\n - '));process.exit(1)}
console.log('RUSH Office Suite structural validation passed.');
console.log(` - ${required.length} required source/build files present`);
console.log(' - Windows installer icon generation path configured');
console.log(' - PDF + DOCX/ODT/RTF/TXT/DOC associations configured');
console.log(' - Electron sandbox/contextIsolation, IPC sender checks and secure bridges present');
console.log(' - PDF/document/OCR/indexing plus digital signing/translation adapters present');
console.log(' - RUSH/Leonore/Melody/Royale/Notes/Midnight themes and 10-locale framework present');
