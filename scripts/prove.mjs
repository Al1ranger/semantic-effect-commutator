import fs from 'node:fs';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {rpc, receipt, source, read, denied, digest} from './check.mjs';

const main={name:'studio-proof-deployer', address:'0x7a413BB4AB62E31d62d4cD9efC8C8a8Dae37FB42'};
const peer={name:'fairresolve-demo', address:'0x34346773a22564cbcc5F1D67D1c1F9f196DaEA35'};
const states=['The token is red.','The token is blue.','The token is green.'];
const rotate='Change red to blue, blue to green, and green to red.';
const cases=[
 {name:'order-sensitive',operations:[rotate,'Set the token to red regardless of its current color.'],effects:{a:['S1','S2','S0'],b:['S0','S0','S0']},status:'ORDER_SENSITIVE'},
 {name:'commuting',operations:[rotate,'Change red to green, blue to red, and green to blue.'],effects:{a:['S1','S2','S0'],b:['S2','S0','S1']},status:'COMMUTES_ON_FRAME'},
];
const file='PROOFS.json', code='contracts/SemanticEffectCommutator.py';
const commit=process.argv[2];
assert(/^[a-f0-9]{40}$/.test(commit??''));
const p=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{network:'StudioNet',source_commit:commit,transactions:[],studies:{}};
assert.equal(p.source_commit,commit);
const save=()=>fs.writeFileSync(file,JSON.stringify(p,null,2)+'\n');
const readOnly=process.argv.includes('--read-only');
function send(args, signer, t) {
 return new Promise((resolve,reject)=>{
  const c=spawn(process.execPath,['scripts/run-cli.cjs',...args],{windowsHide:true,env:{...process.env,COMMUTATOR_TEST_ACCOUNT:signer.name},stdio:['ignore','pipe','pipe']});
  let buf='';c.stderr.resume();
  c.stdout.on('data',b=>{
   buf+=b;const lines=buf.split(/\r?\n/);buf=lines.pop();
   for(const line of lines) if(/^BROADCAST_HASH 0x[0-9a-f]{64}$/i.test(line)){t.hash=line.split(' ')[1];save();console.log(t.step,t.hash);}
  });
  c.on('error',reject);c.on('close',resolve);
 });
}
async function transaction(step,args,signer,expected='SUCCESS',message) {
 let t=p.transactions.find(t=>t.step===step);
 if(!t){
  assert(!readOnly,'Missing journal entry in read-only verification');
  const nonce=await rpc('eth_getTransactionCount',[signer.address,'latest']);
  assert.equal(await rpc('eth_getTransactionCount',[signer.address,'pending']),nonce);
  t={step,args,nonce,signer:signer.address,expected,...(message?{message}:{})};p.transactions.push(t);save();
  await send(args,signer,t);
 }
 assert.deepEqual(t.args,args);assert.equal(t.signer,signer.address);
 assert(t.hash,'Unknown broadcast outcome. Inspect history; do not rebroadcast.');
 try { t.receipt=await receipt(t.hash,expected,message); }
 catch(e) {
  const raw=await rpc('eth_getTransactionByHash',[t.hash]);
  t.observed={status:raw.status,consensus:raw.result_name,execution:raw.consensus_data?.leader_receipt?.find(x=>x.mode==='leader')?.execution_result};save();throw e;
 }
 save();assert.equal(t.receipt.committed,expected==='SUCCESS');console.log(step,t.receipt.status,t.receipt.execution);
 const native=await rpc('eth_getTransactionByHash',[t.hash]);
 assert.equal(native.from_address.toLowerCase(),signer.address.toLowerCase());assert.equal(BigInt(native.nonce),BigInt(t.nonce));assert.equal(BigInt(native.value),0n);
 return t.receipt.address;
}
assert.equal(await rpc('eth_chainId',[]),'0xf22f');
p.address=await transaction('deploy',['deploy','--contract',code],main);
p.source=await source(p.address);save();
const write=(step,name,args,signer,expected,message)=>transaction(step,['write',p.address,name,'--args',...args],signer,expected,message);
const policy='semantic-effect-commutator-v1';
for(const f of cases){
 assert.equal(await write('register-'+f.name,'register',[f.name,...states,...f.operations],main),p.address);
 const id=digest({contract:p.address,author:main.address,nonce:f.name});
 const spec={id,policy,contract:p.address,author:main.address,nonce:f.name,states,operations:f.operations};
 spec.root=digest(spec);
 assert.deepEqual(await read(p.address,'get_study',[id]),spec);
 assert.equal(await write('analyze-'+f.name,'analyze',[id,spec.root],peer),p.address);
 const report=await read(p.address,'get_report',[id]);p.studies[f.name]={spec,report};save();
 assert.deepEqual(report.effects,f.effects,'Preserved unexpected interpretation; no resampling');
 const run=(ops,start)=>{
  const table=Object.fromEntries(['S0','S1','S2'].map((s,i)=>[s,ops[1][i]]));
  const first=ops[0][start];
  return {after_first:first,atomic_outcome:table[first]??first};
 };
 const rows=states.map((_,i)=>{
  const ab=run([f.effects.a,f.effects.b],i),ba=run([f.effects.b,f.effects.a],i);
  return {state:i,a_then_b:ab,b_then_a:ba,relation:ab.atomic_outcome===ba.atomic_outcome?'SAME':'DIFFERENT'};
 });
 const expected={policy,study_id:id,input_root:spec.root,effects:f.effects,rows,witnesses:rows.filter(x=>x.relation==='DIFFERENT').map(x=>x.state),unresolved:[],status:f.status};
 expected.root=digest(expected);assert.deepEqual(report,expected);
 for(const row of rows)assert.deepEqual(await read(p.address,'inspect_order',[id,spec.root,report.root,row.state]),row);
 assert(await denied(p.address,'inspect_order',[id,spec.root,'wrong-root',0]));
}
const a=p.studies['order-sensitive'].spec,b=p.studies.commuting.spec;
assert.equal(await write('foreign-input','analyze',[a.id,b.root],peer,'ERROR','Input root mismatch'),p.address);
assert.equal(await write('immutable-report','analyze',[a.id,a.root],main,'ERROR','Report already published'),p.address);
const history=await rpc('sim_getTransactionsForAddress',[p.address]);
assert.deepEqual(history.map(t=>t.hash).sort(),p.transactions.map(t=>t.hash).sort());
p.verified=true;save();
console.log('Seven receipts, two full reports, six bound order reads, and matching source verified.');
