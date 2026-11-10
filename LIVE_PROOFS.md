# Verified StudioNet receipts

[Contract and deployed source](https://explorer-studio.genlayer.com/address/0x971320B04c43Ddb2b7AFc635e5D976e461569F71)

Normalized source SHA-256: adfa7b881bcb0c5ffa6a56f215df67f86ca57c0820103eabf3e4303f201dd93d

[Source commit](https://github.com/Al1ranger/semantic-effect-commutator/tree/a44a5a5eebfed29d017cdf98fbcf325f49c9a18d)

| Step | Finality | Execution | Consensus | Agree / disagree / idle |
|---|---|---|---|---|
| [deploy](https://explorer-studio.genlayer.com/tx/0xed62a03d92cb08d78164dd514a26a7c09bd9dfa6f9373ce1fa877a83e40334f4) | FINALIZED | SUCCESS | MAJORITY_AGREE | 3 / 0 / 2 |
| [register-order-sensitive](https://explorer-studio.genlayer.com/tx/0x359ea2355e2a0eaa7d2412db2351fccbdb6d328e2e3cdb25d8527d739ae227d4) | FINALIZED | SUCCESS | MAJORITY_AGREE | 3 / 0 / 2 |
| [analyze-order-sensitive](https://explorer-studio.genlayer.com/tx/0x0873d06f704566efac59d2a33ef955abe2e3ad259d48660230e4abb8bb487c02) | FINALIZED | SUCCESS | MAJORITY_AGREE | 3 / 0 / 2 |
| [register-commuting](https://explorer-studio.genlayer.com/tx/0x62e646f2389fbd3eba01877ce189d7c7d675e75d60c93d28755542ece9b29382) | FINALIZED | SUCCESS | MAJORITY_AGREE | 3 / 0 / 2 |
| [analyze-commuting](https://explorer-studio.genlayer.com/tx/0xa293a166e892863e3cf01b91fe1231e378adae35a3fe780274703dfa59858ba6) | FINALIZED | SUCCESS | MAJORITY_AGREE | 3 / 0 / 2 |
| [foreign-input](https://explorer-studio.genlayer.com/tx/0x645d1a5290642d477cdc04dfd85e90bed20aa758f5dfea0e7e3cb4334ea5040a) | FINALIZED | ERROR | MAJORITY_AGREE | 5 / 0 / 0 |
| [immutable-report](https://explorer-studio.genlayer.com/tx/0xf976f085b73c9fc291179ce2f67f2886505a2cbc6148687b8514fe406419677d) | FINALIZED | ERROR | MAJORITY_AGREE | 4 / 0 / 1 |

## order-sensitive

Operations: Change red to blue, blue to green, and green to red. / Set the token to red regardless of its current color.

Result: **ORDER_SENSITIVE**. Start states witnessing a difference: [0,1,2].

| Start | A then B | B then A | Relation |
|---|---|---|---|
| The token is red. | S1 → S0 | S0 → S1 | DIFFERENT |
| The token is blue. | S2 → S0 | S0 → S1 | DIFFERENT |
| The token is green. | S0 → S0 | S0 → S1 | DIFFERENT |

## commuting

Operations: Change red to blue, blue to green, and green to red. / Change red to green, blue to red, and green to blue.

Result: **COMMUTES_ON_FRAME**. Start states witnessing a difference: [].

| Start | A then B | B then A | Relation |
|---|---|---|---|
| The token is red. | S1 → S0 | S2 → S0 | SAME |
| The token is blue. | S2 → S1 | S0 → S1 | SAME |
| The token is green. | S0 → S2 | S1 → S2 | SAME |

The verifier checked source equality, native signers and nonces, both independently reconstructed reports, six bound row reads, two mismatched report-root read rejections, and exact contract transaction history. The proof records are in [PROOFS.json](PROOFS.json).
