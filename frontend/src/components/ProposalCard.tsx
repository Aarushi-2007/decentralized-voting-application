import { type FC, useCallback, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { CheckCircle2, Loader2, Flag, XCircle } from "lucide-react";
import { useProgram } from "../anchor/useProgram";
import {
  type OnChainProposal,
  castVoteOnChain,
  closeProposalOnChain,
  fetchProposal,
  finalizeProposalOnChain,
  friendlyTxError,
} from "../services/votingService";

interface Props {
  proposalAddress: string;
  wallet: string;
  hasVotedGlobally: boolean;
  onVoted: () => void;
  onClosed: (proposalAddress: string) => void;
}

export const ProposalCard: FC<Props> = ({
  proposalAddress,
  wallet,
  hasVotedGlobally,
  onVoted,
  onClosed,
}) => {
  const program = useProgram();
  const [proposal, setProposal] = useState<OnChainProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!program) return;
    try {
      const data = await fetchProposal(program, proposalAddress);
      setProposal(data);
    } catch {
      setError("Couldn't load this proposal on-chain — it may have been closed.");
    } finally {
      setLoading(false);
    }
  }, [program, proposalAddress]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="bg-white/4 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-soft flex items-center gap-2 text-slate-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Loading proposal...
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="bg-white/4 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-soft text-sm text-slate-400">
        {error ?? "Proposal unavailable."}
      </div>
    );
  }

  const totalVotes = proposal.voteCounts.reduce((a, b) => a + b, 0);
  const isCreator = proposal.creator === wallet;
  const votingClosed = Date.now() / 1000 >= proposal.endTime;

  const handleVote = async (optionIndex: number) => {
    if (!program || hasVotedGlobally || proposal.finalized) return;
    setPendingAction(`vote-${optionIndex}`);
    setError(null);
    try {
      await castVoteOnChain(program, new PublicKey(wallet), proposalAddress, optionIndex);
      await load();
      onVoted();
    } catch (err) {
      setError(friendlyTxError(err));
    } finally {
      setPendingAction(null);
    }
  };

  const handleFinalize = async () => {
    if (!program) return;
    setPendingAction("finalize");
    setError(null);
    try {
      await finalizeProposalOnChain(program, new PublicKey(wallet), proposalAddress);
      await load();
    } catch (err) {
      setError(friendlyTxError(err));
    } finally {
      setPendingAction(null);
    }
  };

  const handleClose = async () => {
    if (!program) return;
    setPendingAction("close");
    setError(null);
    try {
      await closeProposalOnChain(program, new PublicKey(wallet), proposalAddress);
      onClosed(proposalAddress);
    } catch (err) {
      setError(friendlyTxError(err));
      setPendingAction(null);
    }
  };

  return (
    <div className="bg-white/4 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display font-semibold text-white">{proposal.title}</h3>
          {proposal.description && (
            <p className="text-sm text-slate-400 mt-1">{proposal.description}</p>
          )}
        </div>
        {proposal.finalized && (
          <span className="shrink-0 flex items-center gap-1 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={14} /> Finalized
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {proposal.options.map((option, i) => {
          const count = proposal.voteCounts[i] ?? 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isWinner = proposal.finalized && proposal.winningOption === i;
          return (
            <button
              key={i}
              onClick={() => handleVote(i)}
              disabled={hasVotedGlobally || proposal.finalized || pendingAction !== null}
              className="w-full relative overflow-hidden rounded-xl border border-white/10 disabled:cursor-default group hover:border-white/20 transition-colors"
            >
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                  isWinner ? "bg-emerald-500/15" : "bg-brand-500/15"
                }`}
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between px-4 py-2.5">
                <span className="text-sm font-medium text-white flex items-center gap-1.5">
                  {pendingAction === `vote-${i}` && <Loader2 size={14} className="animate-spin" />}
                  {option}
                  {isWinner && <Flag size={14} className="text-emerald-400" />}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {count} vote{count !== 1 ? "s" : ""} · {pct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-400 mt-3">{error}</p>}

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-slate-500">
          {totalVotes} total vote{totalVotes !== 1 ? "s" : ""} ·{" "}
          {votingClosed
            ? "Voting closed"
            : `Closes ${new Date(proposal.endTime * 1000).toLocaleString()}`}
        </p>
        <div className="flex gap-3">
          {votingClosed && !proposal.finalized && (
            <button
              onClick={handleFinalize}
              disabled={pendingAction !== null}
              className="text-xs font-medium text-brand-300 hover:text-brand-200 transition"
            >
              Finalize
            </button>
          )}
          {isCreator && (
            <button
              onClick={handleClose}
              disabled={pendingAction !== null}
              className="text-xs font-medium text-slate-500 hover:text-red-400 flex items-center gap-1 transition"
            >
              <XCircle size={14} /> Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};