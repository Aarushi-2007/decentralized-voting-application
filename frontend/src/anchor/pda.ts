import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

// This must match declare_id!() in lib.rs — NOTE: Anchor.toml currently
// points to a *different* program id (B8aK6tZe...). Reconcile before deploying.
export const PROGRAM_ID = new PublicKey("6HF7SL2ydXxthwKgFmw5ELh9QzkgrTav7AWEuKcCqh5S");

export function deriveProposalPda(creator: PublicKey, proposalId: BN): [PublicKey, number] {
  // Seeded only by creator (create_proposal.rs) — a wallet can only have
  // ONE live proposal at a time until it's closed. Not scoped by `id`.
  return PublicKey.findProgramAddressSync(
    [Buffer.from("proposal"), creator.toBuffer(), proposalId.toArrayLike(Buffer, "le", 8),],
    PROGRAM_ID
  );
}

export function deriveVotePda(member: PublicKey, proposal: PublicKey ): [PublicKey, number] {
  // Seeded only by the voter (cast_vote.rs) — NOT by proposal. This means a
  // wallet can hold only one Vote account program-wide, i.e. one vote EVER,
  // not one vote per proposal. See README "Known contract limitations".
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vote"), member.toBuffer(), proposal.toBuffer()],
    PROGRAM_ID
  );
}