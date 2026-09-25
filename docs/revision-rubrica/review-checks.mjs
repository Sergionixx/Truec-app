import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import ts from 'typescript';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

await mkdir('tmp/review-server', { recursive: true });
await copyFile('server/index.mjs', 'tmp/review-server/index.mjs');
await copyFile('server/data.json', 'tmp/review-server/data.json');
const compiled = ts.transpileModule(await readFile('src/services/api.ts', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 }}).outputText;
await writeFile('tmp/api-review.mjs', compiled);
const { ApiService } = await import(pathToFileURL(resolve('tmp/api-review.mjs')).href);
const memory = new Map();
globalThis.localStorage = { getItem:k=>memory.get(k)??null, setItem:(k,v)=>memory.set(k,String(v)), removeItem:k=>memory.delete(k) };
const realFetch=globalThis.fetch;
const base='http://127.0.0.1:3917';
const server=spawn(process.execPath,['tmp/review-server/index.mjs'],{env:{...process.env,API_PORT:'3917'},stdio:['ignore','pipe','pipe']});
await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error('server exit '+code)));});
globalThis.fetch=(url,opts)=>realFetch(new URL(url,base),opts);
const report=[];
function record(test,observed){report.push({test,observed});console.log(JSON.stringify(report.at(-1)));}
async function request(path,method='GET',data){const r=await fetch(path,{method,headers:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data)});return {status:r.status,body:await r.json()};}
try {
  record('health',await request('/api/health'));
  const duplicate = await request('/api/register','POST',{name:'Audit Demo',email:'demo@truec.app',password:'different123'});
  const falseAccount = await ApiService.register('Audit Demo','demo@truec.app','different123');
  record('duplicate_registration',{backendStatus:duplicate.status,clientReturnedSuccess:Boolean(falseAccount.user),mode:ApiService.getMode()});
  globalThis.fetch=async()=>{throw new TypeError('offline test');};
  await ApiService.register('Offline Test','offline@test.example','abcdef123');
  let offlineLogin;
  try {await ApiService.login('offline@test.example','abcdef123');offlineLogin='success';}catch(e){offlineLogin=e.message;}
  record('offline_registered_user_relogin',{login:offlineLogin});
  globalThis.fetch=(url,opts)=>realFetch(new URL(url,base),opts);
  const edit=await request('/api/products/1','PATCH',{name:'   ',price:-100,img:'https://example.test/new.png'});
  record('invalid_product_update_without_auth',{status:edit.status,name:edit.body.product?.name,price:edit.body.product?.price,imageUpdated:edit.body.product?.img==='https://example.test/new.png'});
  record('trade_to_missing_product',await request('/api/trades','POST',{wantedProductId:999999,offeredItem:'Audit item'}));
  record('auctions_endpoint',await request('/api/auctions'));
  memory.clear();
  globalThis.fetch=async()=>{throw new TypeError('offline test');};
  await ApiService.placeBid(1,5000);
  const mixed = await ApiService.getAuctionBids(2);
  record('offline_auction_isolation',{requestedAuction:2,returnedAuctionIds:[...new Set(mixed.map(b=>b.auctionId))]});
  globalThis.fetch=(url,opts)=>realFetch(new URL(url,base),opts);
  record('low_opening_bid_nonexistent_auction',await request('/api/auctions/987654/bids','POST',{amount:1}));
  const apk=await readFile('release/Truec-app-v1.2.0-release.apk');
  const declared=(await readFile('release/Truec-app-v1.2.0-release.apk.sha256','utf8')).split(/\s+/)[0];
  const actual=crypto.createHash('sha256').update(apk).digest('hex');
  record('release_integrity',{bytes:apk.length,declared,actual,match:declared===actual});
  function luminance(hex){const a=hex.match(/\w\w/g).map(c=>parseInt(c,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2];}
  record('contrast_white_teal',(1.05/(luminance('00897B')+.05)).toFixed(3));
} finally {server.kill();await writeFile('tmp/review-results.json',JSON.stringify(report,null,2));}
