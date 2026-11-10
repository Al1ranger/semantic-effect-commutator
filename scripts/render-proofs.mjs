import fs from 'node:fs';
import assert from 'node:assert/strict';

const p=JSON.parse(fs.readFileSync('PROOFS.json','utf8'));
assert(p.verified&&p.source.source_match);
assert.equal(p.transactions.length,7);
assert.equal(p.transactions.filter(t=>t.receipt.committed).length,5);
const repo='https://github.com/Al1ranger/semantic-effect-commutator';
const explorer='https://explorer-studio.genlayer.com';
const contract=explorer+'/address/'+p.address;
const title='SemanticEffectCommutator — Order Sensitivity of Written Operations';
const description='SemanticEffectCommutator checks whether two written operations can be reordered on a declared three-state model. The leader and validators independently interpret the full state and operation text, producing six effect cells. Consensus must match the exact cells and complete report. There is no confidence tolerance.\n\nThe contract composes the effects in both orders from every state. It stores definite counterexamples, keeps unknown outcomes explicit, and distinguishes atomic abort from successful no-op. Anyone can analyze a registered study. Public reads bind both the input and report roots.\n\nStudioNet verified a rotation and reset that differ in all three states, and inverse rotations that commute on the frame. These are analyses of authored operations, not observations of actual executions.';
assert(title.length<=80&&description.length<=1000);
const tx=t=>explorer+'/tx/'+t.hash;
const lines=['# Verified StudioNet receipts','',
 '[Contract and deployed source]('+contract+')','',
 'Normalized source SHA-256: '+p.source.sha256,'',
 '[Source commit]('+repo+'/tree/'+p.source_commit+')','',
 '| Step | Finality | Execution | Consensus | Agree / disagree / idle |',
 '|---|---|---|---|---|',
 ...p.transactions.map(t=>'| ['+t.step+']('+tx(t)+') | '+t.receipt.status+' | '+t.receipt.execution+' | '+t.receipt.consensus+' | '+t.receipt.agree_votes+' / '+t.receipt.disagree_votes+' / '+t.receipt.idle_votes+' |'),'',
 ...Object.entries(p.studies).flatMap(([name,{spec,report}])=>[
 '## '+name,'','Operations: '+spec.operations.join(' / '),'',
 'Result: **'+report.status+'**. Start states witnessing a difference: '+JSON.stringify(report.witnesses)+'.','',
 '| Start | A then B | B then A | Relation |','|---|---|---|---|',
 ...report.rows.map(r=>'| '+spec.states[r.state]+' | '+r.a_then_b.after_first+' → '+r.a_then_b.atomic_outcome+' | '+r.b_then_a.after_first+' → '+r.b_then_a.atomic_outcome+' | '+r.relation+' |'),'']),
 'The verifier checked source equality, native signers and nonces, both independently reconstructed reports, six bound row reads, two mismatched report-root read rejections, and exact contract transaction history. The proof records are in [PROOFS.json](PROOFS.json).',''];
fs.writeFileSync('LIVE_PROOFS.md',lines.join('\n'));
const evidence=[['GitHub repository',repo],['Contract source',repo+'/blob/'+p.source_commit+'/contracts/SemanticEffectCommutator.py'],
 ['StudioNet contract',contract],['Proof matrix',repo+'/blob/main/LIVE_PROOFS.md'],
 ...p.transactions.filter(t=>['deploy','analyze-order-sensitive','analyze-commuting','foreign-input','immutable-report'].includes(t.step)).map(t=>[t.step,tx(t)])];
fs.writeFileSync('SUBMISSION.md',['Contribution type: **Builder → Intelligent Contracts**','',title,'',description,'','Evidence:','',...evidence.map(([label,url])=>'- ['+label+']('+url+')'),''].join('\n'));
