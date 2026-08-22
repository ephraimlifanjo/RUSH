import { readFile, writeFile } from 'node:fs/promises';
import { sign } from 'node:crypto';
import path from 'node:path';

function arg(name, fallback=null){
  const i=process.argv.indexOf(`--${name}`);
  return i>=0?process.argv[i+1]:fallback;
}
const privateKeyPath=arg('private-key');
const output=arg('output','RUSH-Pro.rushlicense');
const owner=arg('owner','RUSH Pro Customer');
const licenseId=arg('license-id',`RUSH-${Date.now()}`);
const expiresAt=arg('expires-at',null);
if(!privateKeyPath) throw new Error('Usage: node scripts/create-license.mjs --private-key /secure/path/private.pem --owner "Name" --output customer.rushlicense');
const privateKey=await readFile(path.resolve(privateKeyPath),'utf8');
const payload={licenseId,plan:'pro',owner,source:'direct',issuedAt:new Date().toISOString(),expiresAt:expiresAt||null};
const body=Buffer.from(JSON.stringify(payload));
const signature=sign(null,body,privateKey).toString('base64');
await writeFile(path.resolve(output),JSON.stringify({payload,signature},null,2)+'\n','utf8');
console.log(`Signed RUSH Pro license: ${output}`);
console.log('Private key was read from the supplied path and was not copied into the project.');
