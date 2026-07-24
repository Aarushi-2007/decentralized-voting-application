import { type FC, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import { PublicKey } from "@solana/web3.js";
import { Navbar } from "../components/Navbar";
import { ProposalCard } from "../components/ProposalCard";
import { CreateProposalModal } from "../components/CreateProposalModal";
import { useAuthWallet } from "../hooks/UseAuthWallet";
import { useWalletAuth } from "../hooks/useWalletAuth";
// import { useProgram } from "../anchor/useProgram";
// import { hasWalletVoted } from "../services/votingService";
import { getCommunity, buildInviteLink, addProposalToCommunity } from "../services/communityApi";
import { type Community } from "../types";
import { ArrowLeft, Plus, Copy, Check, Loader2 } from "lucide-react";
import DarkVeil from "../components/DarkVeil";

export const CommunityDetail: FC = () => {
  const { invite_code } = useParams();
  const { address, connected } = useAuthWallet();
  const { sign } = useWalletAuth();
  // const program = useProgram();
  const navigate = useNavigate();

  const [community, setCommunity] = useState<Community | null>(null);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Guard: only signed-in users may view a community
  useEffect(() => {
    if (!connected) navigate("/");
  }, [connected, navigate]);

  // Load the community from the backend
  useEffect(() => {
    if (!invite_code || !address) return;
    setLoadingCommunity(true);
    setLoadError(null);
    getCommunity(invite_code)
      .then(setCommunity)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load community."))
      .finally(() => setLoadingCommunity(false));
  }, [invite_code, address]);

  // Check the contract-wide vote flag for this wallet. NOTE: the Vote PDA
  // is seeded only by wallet, not by proposal, so this is a global
  // "has this wallet ever voted" check, not per-proposal — see the
  // "Known contract limitations" note in the README.
  // useEffect(() => {
  //   if (!program || !address) return;
  //   hasWalletVoted(program, new PublicKey(address), new PublicKey(proposalAddress)).then(setHasVotedGlobally).catch(() => {});
  // }, [program, address]);

  const handleProposalClosed = useCallback((proposalAddress: string) => {
    setCommunity((prev) =>
      prev
        ? { ...prev, proposalAddresses: prev.proposals.filter((a) => a !== proposalAddress) }
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
      const updated = await addProposalToCommunity(community._id, proposalAddress, auth);
      setCommunity(updated);
    } catch {
      // The proposal is already live on-chain even if linking it to the
      // community off-chain fails — don't block the creator on that; just
      // reflect it locally so they still see it in this session.
      setCommunity((prev) =>
        prev ? { ...prev, proposalAddresses: [...prev.proposals, proposalAddress] } : prev
      );
    }
  };

  if (!address) return null;

  if (loadingCommunity) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <DarkVeil hueShift={12} noiseIntensity={0} scanlineIntensity={0} speed={0.5} scanlineFrequency={0} warpAmount={0} />
        <div className="relative z-10 min-h-screen">
          <Navbar />
          <div className="max-w-4xl mx-auto px-6 py-16 flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Loading community...
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !community) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <DarkVeil hueShift={12} noiseIntensity={0} scanlineIntensity={0} speed={0.5} scanlineFrequency={0} warpAmount={0} />
        <div className="relative z-10 min-h-screen">
          <Navbar />
          <div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate-400">
            {loadError ?? "Community not found, or you're not a member of it."}
          </div>
        </div>
      </div>
    );
  }

  const isMember = community.members.includes(address);

  if (!isMember) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <DarkVeil hueShift={12} noiseIntensity={0} scanlineIntensity={0} speed={0.5} scanlineFrequency={0} warpAmount={0} />
        <div className="relative z-10 min-h-screen">
          <Navbar />
          <div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate-400">
            You need to join this community with an invite link before you can view it.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <DarkVeil hueShift={12} noiseIntensity={0} scanlineIntensity={0} speed={0.5} scanlineFrequency={0} warpAmount={0} />

      <div className="relative z-10 min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand-300 transition"
          >
            <ArrowLeft size={16} /> Back to dashboard
          </button>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-white tracking-tight">{community.name}</h1>
              {community.description && (
                <p className="text-sm text-slate-400 mt-1">{community.description}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCopyInvite}
                className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 text-white font-medium rounded-xl px-4 py-2.5 hover:bg-white/10 hover:border-white/20 transition"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                Invite link
              </button>
              <button
                onClick={() => setShowCreateProposal(true)}
                className="flex items-center gap-2 bg-brand-600 text-white font-medium rounded-xl px-4 py-2.5 hover:bg-brand-500 transition shadow-glow"
              >
                <Plus size={16} /> New proposal
              </button>
            </div>
          </div>

          

          <h2 className="mt-8 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active proposals
          </h2>

          {community.proposals.length === 0 ? (
            <div className="mt-4 bg-white/4 backdrop-blur-xl border border-dashed border-white/15 rounded-2xl p-10 text-center">
              <p className="text-slate-400">No proposals yet. Create the first one.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {community.proposals.map((addr) => (
                <ProposalCard
                  key={addr}
                  proposalAddress={addr}
                  wallet={address}
                  onClosed={handleProposalClosed}
                />
              ))}
            </div>
          )}
        </div>

        {showCreateProposal && (
          <CreateProposalModal
            // communityId={community._id}
            wallet={address}
            onClose={() => setShowCreateProposal(false)}
            onCreated={handleProposalCreated}
          />
        )}
      </div>
    </div>
  );
};