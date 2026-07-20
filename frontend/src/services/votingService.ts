// Single choke point for every on-chain call the app makes. Mirrors the
// exact instruction/account shapes in your Rust program — no invented
// behavior beyond it.
import { BN, Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { deriveProposalPda, deriveVotePda } from "../anchor/pda";

export interface OnChainProposal {
  address: string;
  creator: string;
  id: string;
  title: string;
  description: string;
  options: string[];
  voteCounts: number[];
  endTime: number; // unix seconds
  finalized: boolean;
  winningOption: number | null;
}

function mapProposal(address: PublicKey, acc: any): OnChainProposal {
  return {
    address: address.toBase58(),
    creator: acc.creator.toBase58(),
    id: acc.id.toString(),
    title: acc.title,
    description: acc.description,
    options: acc.options,
    voteCounts: acc.voteCounts.map((v: BN) => v.toNumber()),
    endTime: acc.endTime.toNumber(),
    finalized: acc.finalized,
    winningOption: acc.winningOption ?? null,
  };
}

export async function createProposalOnChain(
  program: Program,
  creator: PublicKey,
  title: string,
  description: string,
  options: string[],
  endTimeUnix: number
): Promise<string> {
  const [proposalPda] = deriveProposalPda(creator);
  const id = new BN(Date.now());

  await program.methods
    .createProposal(title, description, options, id, new BN(endTimeUnix))
    .accounts({
      proposal: proposalPda,
      creator,
      systemProgram: SystemProgram.programId,
    } as any)
    .rpc();

  return proposalPda.toBase58();
}

export async function fetchProposal(program: Program, address: string): Promise<OnChainProposal> {
  const pubkey = new PublicKey(address);
  const acc = await (program.account as any).proposal.fetch(pubkey);
  return mapProposal(pubkey, acc);
}

export async function castVoteOnChain(
  program: Program,
  member: PublicKey,
  proposalAddress: string,
  option: number
): Promise<void> {
  const proposalPubkey = new PublicKey(proposalAddress);
  const [votePda] = deriveVotePda(member);

  await program.methods
    .castVote(option)
    .accounts({
      vote: votePda,
      proposal: proposalPubkey,
      member,
      systemProgram: SystemProgram.programId,
    } as any)
    .rpc();
}

// Reflects the contract's real (global, not per-proposal) vote limit.
export async function hasWalletVoted(program: Program, member: PublicKey): Promise<boolean> {
  const [votePda] = deriveVotePda(member);
  const info = await program.provider.connection.getAccountInfo(votePda);
  return info !== null;
}

export async function finalizeProposalOnChain(
  program: Program,
  signer: PublicKey,
  proposalAddress: string
): Promise<void> {
  await program.methods
    .finalizeProposal()
    .accounts({ proposal: new PublicKey(proposalAddress), signer } as any)
    .rpc();
}

export async function closeProposalOnChain(
  program: Program,
  creator: PublicKey,
  proposalAddress: string
): Promise<void> {
  await program.methods
    .closeProposal()
    .accounts({ creator, proposal: new PublicKey(proposalAddress) } as any)
    .rpc();
}

export function friendlyTxError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("already in use")) {
    return "That account already exists on-chain — this wallet may already have an active proposal, or has already cast its vote.";
  }
  if (msg.includes("VotingStillOpen")) return "Voting is still open — you can't finalize this proposal yet.";
  if (msg.includes("AlreadyFinalized")) return "This proposal has already been finalized.";
  if (msg.includes("NoOptions")) return "This proposal has no options to finalize.";
  if (msg.includes("Unauthorized")) return "You're not authorized to perform this action.";
  return msg;
}