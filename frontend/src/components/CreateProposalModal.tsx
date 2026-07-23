import { type FC, useState } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { useProgram } from "../anchor/useProgram";
import { createProposalOnChain, friendlyTxError } from "../services/votingService";

interface Props {
  communityId: string;
  wallet: string;
  onClose: () => void;
  onCreated: (proposalAddress: string) => void;
}

export const CreateProposalModal: FC<Props> = ({ communityId, wallet, onClose, onCreated }) => {
  const program = useProgram();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["Yes", "No"]);
  const [endTime, setEndTime] = useState(""); // datetime-local string
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOption = (i: number, value: string) =>
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  const addOption = () => setOptions((prev) => (prev.length >= 5 ? prev : [...prev, ""]));
  const removeOption = (i: number) => setOptions((prev) => prev.filter((_, idx) => idx !== i));

  const canSubmit =
    title.trim().length > 0 &&
    options.filter((o) => o.trim()).length >= 2 &&
    endTime.length > 0 &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit || !program) return;
    setSubmitting(true);
    setError(null);
    try {
      const endTimeUnix = Math.floor(new Date(endTime).getTime() / 1000);
      const proposalAddress = await createProposalOnChain(
        program,
        new PublicKey(wallet),
        title.trim(),
        description.trim(),
        options.map((o) => o.trim()).filter(Boolean),
        endTimeUnix
      );
      onCreated(proposalAddress);
      onClose();
    } catch (err) {
      setError(friendlyTxError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30 px-4">
      <div className="bg-ink-900 border border-white/10 rounded-2xl shadow-soft w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition">
          <X size={20} />
        </button>

        <h2 className="font-display text-xl font-semibold text-white">New proposal</h2>
        <p className="text-sm text-slate-400 mt-1">
          This creates a real on-chain proposal account — you'll be asked to approve a transaction in Phantom.
        </p>
        <p className="text-xs text-amber-400 mt-2">
          Note: this contract allows one active proposal per wallet at a time — close your previous
          proposal first if this fails.
        </p>

        <label className="block mt-6 text-sm font-medium text-slate-400">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Should we increase the treasury allocation?"
          className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition"
        />

        <label className="block mt-4 text-sm font-medium text-slate-400">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 resize-none transition"
        />

        <label className="block mt-4 text-sm font-medium text-slate-400">Voting closes</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition [color-scheme:dark]"
        />

        <label className="block mt-4 text-sm font-medium text-slate-400">Options (max 5)</label>
        <div className="space-y-2 mt-1.5">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                maxLength={50}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition"
                placeholder={`Option ${i + 1}`}
              />
              {options.length > 2 && (
                <button onClick={() => removeOption(i)} className="text-slate-500 hover:text-red-400 transition">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
        {options.length < 5 && (
          <button onClick={addOption} className="mt-2 flex items-center gap-1 text-sm text-brand-300 hover:text-brand-200 font-medium transition">
            <Plus size={16} /> Add option
          </button>
        )}

        {error && <p className="text-sm text-red-400 mt-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-brand-600 disabled:bg-white/10 disabled:text-slate-500 disabled:shadow-none text-white font-medium rounded-xl py-3 hover:bg-brand-500 transition shadow-glow"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Confirming on-chain..." : "Publish proposal"}
        </button>
      </div>
    </div>
  );
};