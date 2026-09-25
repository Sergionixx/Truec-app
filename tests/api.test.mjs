import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import ts from "typescript";
test("API: registro, permisos, integridad, concurrencia y persistencia", async () => {
 const dir=await mkdtemp(join(tmpdir(),"truec-test-")); const file=join(dir,"data.json");
 const seed=JSON.parse(await readFile("server/data.json","utf8"));
 seed.auctions=[{id:1,name:"Abierta",startingPrice:3500,sellerId:2,endsAt:new Date(Date.now()+86400000).toISOString()},{id:2,name:"Cerrada",startingPrice:100,sellerId:2,endsAt:"2020-01-01T00:00:00Z"}];
 await writeFile(file,JSON.stringify(seed));
 let server;
 const start=async()=>{server=spawn(process.execPath,["server/index.mjs"],{env:{...process.env,API_PORT:"3918",DATA_FILE:file},stdio:["ignore","pipe","pipe"]}); await new Promise((ok,no)=>{server.stdout.once("data",ok);server.once("exit",c=>no(Error("server "+c)));server.once("error",no);});};
 const stop=async()=>{if(server?.exitCode===null){const done=new Promise(r=>server.once("exit",r));server.kill();await done;}};
 const req=async(path,method="GET",body,token)=>{const r=await fetch("http://127.0.0.1:3918/api"+path,{method,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,...await r.json()};};
 try {
 await start();
 const login=await req("/login","POST",{email:"demo@truec.app",password:"demo123"});assert.equal(login.status,200); const token=login.token;
 assert.equal((await req("/register","POST",{name:"Demo",email:"DEMO@truec.app",password:"demo123"})).status,409);
 assert.equal((await req("/products/1","PATCH",{price:-1})).status,401);
 assert.equal((await req("/products/1","PATCH",{price:5},token)).status,403);
 const data={name:"Prueba",price:150,condition:"Bueno",category:"Audio",description:"Descripción de prueba",img:"https://example.com/image.png",acceptsBarter:true};
 const created=await req("/products","POST",data,token);assert.equal(created.status,201);const id=created.product.id;
 assert.equal((await req("/products/"+id,"PATCH",{price:-100},token)).status,400);
 assert.equal((await req("/products/"+id,"PATCH",{name:"  "},token)).status,400);
 const edited=await req("/products/"+id,"PATCH",{img:"https://example.com/new.png",price:180},token);assert.equal(edited.product.img,"https://example.com/new.png");
 assert.equal((await req("/trades","POST",{wantedProductId:999999,offeredItem:"Ejemplo"},token)).status,404);
 assert.equal((await req("/auctions")).status,200);
 assert.equal((await req("/auctions/999999/bids","POST",{amount:1},token)).status,404);
 assert.equal((await req("/auctions/1/bids","POST",{amount:100},token)).status,409);
 assert.equal((await req("/auctions/2/bids","POST",{amount:1000},token)).status,409);
 assert.equal((await req("/auctions/1/bids","POST",{amount:3600},token)).status,201);
 assert.equal((await req("/auctions/2/bids")).bids.length,0);
 const concurrent=await Promise.all(Array.from({length:8},(_,i)=>req("/products","POST",{...data,name:"Concurrent "+i},token)));
 assert.ok(concurrent.every(x=>x.status===201));assert.equal(new Set(concurrent.map(x=>x.product.id)).size,8);
 const productIds=(await req("/products")).products.map(x=>x.id);assert.ok(concurrent.every(x=>productIds.includes(x.product.id)));
 const trade=await req("/trades","POST",{wantedProductId:1,offeredItem:"Control",offeredValue:150},token);assert.equal(trade.status,201);
 assert.equal((await req("/trades/"+trade.trade.id,"PATCH",{status:"accepted"},token)).status,403);
 const seller=(await req("/login","POST",{email:"vendedor@truec.app",password:"demo123"})).token;
 assert.equal((await req("/trades/"+trade.trade.id,"PATCH",{status:"accepted"},seller)).status,200);
 const newAccount=await req("/register","POST",{name:"Ana Prueba",email:"ana@example.com",password:"abcdef"});
 assert.equal(newAccount.status,201);
 await stop();await start();
 assert.equal((await req("/login","POST",{email:"ana@example.com",password:"abcdef"})).status,200);
 assert.ok((await req("/products")).products.some(x=>x.id===id));
 const disk=JSON.parse(await readFile(file,"utf8"));assert.ok(disk.users.every(u=>!u.password && u.passwordHash));assert.ok(disk.sessions.every(s=>!s.token));
 // Exercise the actual browser client against the server, then a network failure.
 const out=join(dir,"api.mjs");const source=await readFile("src/services/api.ts","utf8");
 await writeFile(out,ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
 const actualFetch=globalThis.fetch;
 globalThis.fetch=(url,options)=>actualFetch(new URL(url,"http://127.0.0.1:3918"),options);
 try {
 const {ApiService}=await import(pathToFileURL(out).href);
 await assert.rejects(ApiService.register("Demo","demo@truec.app","demo123"),/registrado/);assert.equal(memory.has("truec-session"),false);
 await ApiService.login("demo@truec.app","demo123");
 await ApiService.getAuctionBids(1); await ApiService.getAuctionBids(2);
 globalThis.fetch=async()=>{throw Error("offline");};
 assert.deepEqual(await ApiService.getAuctionBids(2),[]);
 await assert.rejects(ApiService.register("Otro","otro@example.com","abcdef"),/Sin conexión/);
 await assert.rejects(ApiService.createProduct(data),/Sin conexión/);
 } finally {globalThis.fetch=actualFetch;}
 } finally {await stop();await rm(dir,{recursive:true,force:true});}
});

