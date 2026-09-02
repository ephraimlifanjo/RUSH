import { build } from 'esbuild';
import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd();
const outDir=path.join(root,'renderer','dist');
await mkdir(outDir,{recursive:true});
await build({
  entryPoints:[path.join(root,'renderer','src','main-v3.jsx')],
  bundle:true,
  outfile:path.join(outDir,'app.js'),
  platform:'browser',
  format:'esm',
  target:['chrome130'],
  minify:false,
  sourcemap:false,
  jsx:'automatic',
  loader:{'.png':'dataurl','.svg':'dataurl'},
  define:{'process.env.NODE_ENV':'"production"'}
});
await cp(path.join(root,'node_modules','pdfjs-dist','build','pdf.worker.mjs'),path.join(outDir,'pdf.worker.mjs'));
console.log('RUSH UI v3 build complete.');
