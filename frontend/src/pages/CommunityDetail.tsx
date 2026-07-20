import { type FC, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { Navbar } from "../components/Navbar";
import { ProposalCard } from "../components/ProposalCard";
import { CreateProposalModal } from "../components/CreateProposalModal";
import { useAuthWallet } from "../hooks/UseAuthWallet";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { useProgram } from "../anchor/useProgram";
import { hasWalletVoted } from "../services/votingService";
import { getCommunity, buildInviteLink, addProposalToCommunity } from "../services/communityApi";
import { type Community } from "../types";
import { ArrowLeft, Plus, Copy, Check, Info, Loader2 } from "lucide-react";

export const CommunityDetail: FC = () => {
  const { communityId } = useParams();
  const { address, connected } = useAuthWallet();
  const { sign } = useWalletAuth();
  const program = useProgram();
  const navigate = useNavigate();

  const [community, setCommunity] = useState<Community | null>(null);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasVotedGlobally, setHasVotedGlobally] = useState(false);

  // Guard: only signed-in users may view a community
  useEffect(() => {
    if (!connected) navigate("/");
  }, [connected, navigate]);

  // Load the community from the backend
  useEffect(() => {
    if (!communityId) return;
    setLoadingCommunity(true);
    setLoadError(null);
    getCommunity(communityId)
      .then(setCommunity)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load community."))
      .finally(() => setLoadingCommunity(false));
  }, [communityId]);

  // Check the contract-wide vote flag for this wallet. NOTE: the Vote PDA
  // is seeded only by wallet, not by proposal, so this is a global
  // "has this wallet ever voted" check, not per-proposal — see the
  // "Known contract limitations" note in the README.
  useEffect(() => {
    if (!program || !address) return;
    hasWalletVoted(program, new PublicKey(address)).then(setHasVotedGlobally).catch(() => {});
  }, [program, address]);

  const handleProposalClosed = useCallback((proposalAddress: string) => {
    setCommunity((prev) =>
      prev
        ? { ...prev, proposalAddresses: prev.proposalAddresses.filter((a) => a !== proposalAddress) }
        : prev
    );
  }, []);

  const handleCopyInvite = async () => {
    if (!community) return;
    await navigator.clipboard.writeText(buildInviteLink(community));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleProposalCreated = async (proposalAddress: string) => {
    if (!community) return;
    try {
      const auth = await sign("add_proposal_to_community");
      const updated = await addProposalToCommunity(community.id, proposalAddress, auth);
      setCommunity(updated);
    } catch {
      // The proposal is already live on-chain even if linking it to the
      // community off-chain fails — don't block the creator on that; just
      // reflect it locally so they still see it in this session.
      setCommunity((prev) =>
        prev ? { ...prev, proposalAddresses: [...prev.proposalAddresses, proposalAddress] } : prev
      );
    }
  };

  if (!address) return null;

  if (loadingCommunity) {
    return (
      <div className="min-h-screen bg-[#f6f5ff]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-16 flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 size={16} className="animate-spin" /> Loading community...
        </div>
      </div>
    );
  }

  if (loadError || !community) {
    return (
      <div className="min-h-screen bg-[#f6f5ff]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate-500">
          {loadError ?? "Community not found, or you're not a member of it."}
        </div>
      </div>
    );
  }

  const isMember = community.memberWallets.includes(address);

  if (!isMember) {
    return (
      <div className="min-h-screen bg-[#f6f5ff]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate-500">
          You need to join this community with an invite link before you can view it.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f5ff]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">{community.name}</h1>
            {community.description && (
              <p className="text-sm text-slate-500 mt-1">{community.description}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCopyInvite}
              className="flex items-center gap-2 bg-white border border-slate-200 text-brand-900 font-medium rounded-xl px-4 py-2.5 hover:border-brand-300 transition"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              Invite link
            </button>
            <button
              onClick={() => setShowCreateProposal(true)}
              className="flex items-center gap-2 bg-brand-600 text-white font-medium rounded-xl px-4 py-2.5 hover:bg-brand-500 transition"
            >
              <Plus size={16} /> New proposal
            </button>
          </div>
        </div>

        {hasVotedGlobally && (
          <div className="mt-4 flex items-start gap-2 bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-xl px-4 py-3">
            <Info size={16} className="shrink-0 mt-0.5" />
            This wallet has already cast its vote. The connected contract currently allows one
            vote per wallet total (not per proposal) — voting is disabled everywhere until that's
            changed on-chain.
          </div>
        )}

        <h2 className="mt-8 text-sm font-semibold text-slate-500 uppercase tracking-wide">
          Active proposals
        </h2>

        {community.proposalAddresses.length === 0 ? (
          <div className="mt-4 bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
            <p className="text-slate-500">No proposals yet. Create the first one.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {community.proposalAddresses.map((addr) => (
              <ProposalCard
                key={addr}
                proposalAddress={addr}
                wallet={address}
                hasVotedGlobally={hasVotedGlobally}
                onVoted={() => setHasVotedGlobally(true)}
                onClosed={handleProposalClosed}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateProposal && (
        <CreateProposalModal
          communityId={community.id}
          wallet={address}
          onClose={() => setShowCreateProposal(false)}
          onCreated={handleProposalCreated}
        />
      )}
    </div>
  );
};