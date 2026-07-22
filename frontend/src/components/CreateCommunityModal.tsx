import { type FC, useState } from "react";
import { X, Copy, Check, Loader2 } from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { buildInviteLink } from "../services/communityApi";

interface Props {
  onClose: () => void;
}

export const CreateCommunityModal: FC<Props> = ({ onClose }) => {
  const { createCommunity } = useAppData();
  const { sign } = useWalletAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createdInvite, setCreatedInvite] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const auth = await sign("create_community");
      const community = await createCommunity(name.trim(), description.trim(), auth);
      setCreatedInvite(buildInviteLink(community));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the community.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!createdInvite) return;
    await navigator.clipboard.writeText(createdInvite);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-30 px-4">
      <div className="bg-white rounded-2xl shadow-soft w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>

        {!createdInvite ? (
          <>
            <h2 className="text-xl font-semibold text-slate-900">Create a community</h2>
            <p className="text-sm text-slate-500 mt-1">
              You'll be asked to sign a message with Phantom to verify this wallet, then get a unique invite link.
            </p>

            <label className="block mt-6 text-sm font-medium text-slate-600">Community name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Core Contributors DAO"
              className="w-full mt-1.5 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
            />

            <label className="block mt-4 text-sm font-medium text-slate-600">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What is this community about?"
              className="w-full mt-1.5 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-400 resize-none"
            />

            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={!name.trim() || submitting}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-medium rounded-xl py-3 hover:bg-violet-700 transition disabled:bg-slate-200 disabled:text-slate-400"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Waiting for signature..." : "Create community"}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-brand-900">Community created </h2>
            <p className="text-sm text-slate-500 mt-1">Share this invite link so others can join.</p>
            <div className="mt-5 flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-3 bg-slate-50">
              <span className="text-sm text-slate-600 truncate flex-1">{createdInvite}</span>
              <button onClick={handleCopy} className="text-violet-600 shrink-0">
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full bg-violet-900 text-white font-medium rounded-xl py-3 hover:bg-violet-600 transition"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
};