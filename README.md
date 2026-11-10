# SemanticEffectCommutator

A GenLayer analysis primitive for checking whether two written operations can be reordered on a declared three-state model. Any author can register a study; anyone can trigger analysis of the immutable input. A report can be published once, and reads bind both input and report roots.

The leader and each validator independently interpret the complete operations and states into two three-cell effect rows using GenVM's LLM. They must match the full reconstructed report, not only the headline result. Exact normalized labels determine the analysis: no confidence tolerance or caller-supplied labels. See [GenLayer's equivalence principle](https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle).

Each row cell is S0/S1/S2, BLOCKED or UNKNOWN. The contract composes the rows in both directions for each starting state and keeps the first step plus final outcome. A definite difference yields ORDER_SENSITIVE with concrete starting-state witnesses. If none differs and any outcome is unknown, the result is INCONCLUSIVE. Only three definite equal outcomes yield COMMUTES_ON_FRAME.

A BLOCKED sequence is modeled as an atomic abort: a blocked second step does not retain the first step's effects. An abort and a successful no-op differ. Equal final results do not establish equal intermediate traces; inspect the rows if those matter. This is a bounded comparison of authored operation semantics, not proof of real executions, source authenticity, service delivery, or agent behavior. Declared states may omit relevant facts, and validators can share interpretation errors.

## Why this mechanism

The stored artifact is a reusable finite composition report. There is no live graph, graph head, owner approval, certificate, consumption, or actual action execution. SemanticFlowEnvelope calculates definite/possible allocation with capacity constraints; this contract composes partial state effects and produces noncommutation witnesses. NibbleRewriteForge proves equality of executable nibble programs; this contract takes two natural-language specifications, compares both orders of their inferred effects, and retains blocked and unknown behavior. It makes no general equivalence or novelty claim outside this comparison.

## Local verification

```powershell
python -m pip install -r requirements-dev.txt
genvm-lint check contracts/SemanticEffectCommutator.py
python -m pytest tests -q
```

The exhaustive helper test checks all 15,625 pairs of effect tables and all three start states. Callback tests run the actual comparison logic with injected model responses; direct tests exercise public writes and bound reads. These local checks do not establish live validator consensus.

The contract and analysis are new to this repository. The native CLI transport, receipt helpers and Windows test cleanup are adapted from [ParaphraseDistanceCodec](https://github.com/mahdiaqal/paraphrase-distance-codec) under the included MIT notices. The proof script journals each native test-wallet send before broadcasting and checks the original hash on resume. An unknown broadcast outcome requires manual receipt/history inspection. Only use the scripts with a dedicated StudioNet test account and zero value.

Deployment and receipt evidence: pending.
