import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const resources = path.join(root, 'resources');
const manifestPath = path.join(resources, 'integrity-manifest.json');
const includeRoots = ['python', 'native', 'ocr'];
const files = [];

async function walk(dir, prefix='') {
  let entries = [];
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) await walk(full, rel);
    else if (entry.isFile()) {
      const info = await stat(full);
      if (info.size > 2 * 1024 * 1024 * 1024) throw new Error(`Refusing to hash >2GB file: ${rel}`);
      const bytes = await readFile(full);
      const sha256 = createHash('sha256').update(bytes).digest('hex');
      files.push({ path: rel, size: info.size, sha256 });
    }
  }
}

for (const name of includeRoots) await walk(path.join(resources, name), name);
files.sort((a,b)=>a.path.localeCompare(b.path));
const manifest = { version: 1, generated: true, generatedAt: new Date().toISOString(), algorithm: 'sha256', files };
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`RUSH integrity manifest generated for ${files.length} packaged resource file(s).`);
