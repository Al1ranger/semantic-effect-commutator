Contribution type: **Builder → Intelligent Contracts**

SemanticEffectCommutator — Order Sensitivity of Written Operations

SemanticEffectCommutator checks whether two written operations can be reordered on a declared three-state model. The leader and validators independently interpret the full state and operation text, producing six effect cells. Consensus must match the exact cells and complete report. There is no confidence tolerance.

The contract composes the effects in both orders from every state. It stores definite counterexamples, keeps unknown outcomes explicit, and distinguishes atomic abort from successful no-op. Anyone can analyze a registered study. Public reads bind both the input and report roots.

StudioNet verified a rotation and reset that differ in all three states, and inverse rotations that commute on the frame. These are analyses of authored operations, not observations of actual executions.

Evidence:

- [GitHub repository](https://github.com/Al1ranger/semantic-effect-commutator)
- [Contract source](https://github.com/Al1ranger/semantic-effect-commutator/blob/a44a5a5eebfed29d017cdf98fbcf325f49c9a18d/contracts/SemanticEffectCommutator.py)
- [StudioNet contract](https://explorer-studio.genlayer.com/address/0x971320B04c43Ddb2b7AFc635e5D976e461569F71)
- [Proof matrix](https://github.com/Al1ranger/semantic-effect-commutator/blob/main/LIVE_PROOFS.md)
- [deploy](https://explorer-studio.genlayer.com/tx/0xed62a03d92cb08d78164dd514a26a7c09bd9dfa6f9373ce1fa877a83e40334f4)
- [analyze-order-sensitive](https://explorer-studio.genlayer.com/tx/0x0873d06f704566efac59d2a33ef955abe2e3ad259d48660230e4abb8bb487c02)
- [analyze-commuting](https://explorer-studio.genlayer.com/tx/0xa293a166e892863e3cf01b91fe1231e378adae35a3fe780274703dfa59858ba6)
- [foreign-input](https://explorer-studio.genlayer.com/tx/0x645d1a5290642d477cdc04dfd85e90bed20aa758f5dfea0e7e3cb4334ea5040a)
- [immutable-report](https://explorer-studio.genlayer.com/tx/0xf976f085b73c9fc291179ce2f67f2886505a2cbc6148687b8514fe406419677d)
