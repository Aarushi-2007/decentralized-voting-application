import { type FC, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import { useWalletAuth } from "../hooks/useWalletAuth";

interface Props {
  onClose: () => void;
  onJoined: (invite_code: string) => void;
}

export const JoinCommunityModal: FC<Props> = ({ onClose, onJoined }) => {
  const { joinCommunity } = useAppData();
  const { sign } = useWalletAuth();
  const [inviteInput, setInviteInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const extractCode = (input: string) => {
    const trimmed = input.trim();
    const parts = trimmed.split("/");
    return parts[parts.length - 1];
  };

  const handleJoin = async () => {
    const code = extractCode(inviteInput);
    if (!code) {
      setError("Paste an invite link or code first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const auth = await sign("join_community");
      const community = await joinCommunity(code, auth);
      onJoined(community.invite_code);
      console.log("community= ", community);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't join that community.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30 px-4">
      <div className="bg-ink-900 border border-white/10 rounded-2xl shadow-soft w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition">
          <X size={20} />
        </button>

        <h2 className="font-display text-xl font-semibold text-white">Join a community</h2>
        <p className="text-sm text-slate-400 mt-1">
          Paste the invite link or code someone shared with you. You'll sign a message with Phantom to confirm.
        </p>

        <input
          value={inviteInput}
          onChange={(e) => {
            setInviteInput(e.target.value);
            setError(null);
          }}
          placeholder="https://vota.app/join/ABCD1234"
          className="w-full mt-5 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition"
        />
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}

        <button
          onClick={handleJoin}
          disabled={submitting}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-brand-600 disabled:bg-white/10 disabled:text-slate-500 disabled:shadow-none text-white font-medium rounded-xl py-3 hover:bg-brand-500 transition shadow-glow"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Waiting for signature..." : "Join community"}
        </button>
      </div>
    </div>
  );
};