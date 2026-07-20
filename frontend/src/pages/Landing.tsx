import { type FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAuthWallet } from "../hooks/UseAuthWallet";
import { ShieldCheck, Users, BarChart3 } from "lucide-react";

export const Landing: FC = () => {
  const { connected } = useAuthWallet();
  const navigate = useNavigate();

  // Only signed-in users can proceed — redirect straight to the dashboard
  // the moment Phantom reports a connected wallet.
  useEffect(() => {
    if (connected) navigate("/dashboard");
  }, [connected, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f1f4ff] to-white flex flex-col">
      <div className="max-w-6xl mx-auto w-full px-6 pt-24 pb-16 flex-1 flex flex-col items-center text-center">
        <span className="px-4 py-1.5 rounded-full bg-brand-50 text-brand-600 text-sm font-medium border border-brand-100">
          Built on Solana
        </span>

        <h1 className="mt-8 text-5xl md:text-6xl font-bold text-brand-900 tracking-tight max-w-3xl">
          Vote together. Trust the chain, not the admin.
        </h1>
        <p className="mt-6 text-lg text-slate-500 max-w-xl">
          Create a community, invite your people, and run proposals where
          every wallet gets exactly one vote — verifiably, every time.
        </p>

        <div className="mt-10">
          <WalletMultiButton />
        </div>
        <p className="mt-3 text-sm text-slate-400">
          Sign in with Phantom to create or join a community.
        </p>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <FeatureCard
            icon={<Users size={20} />}
            title="Communities"
            copy="Spin up a community in seconds and share one invite link."
          />
          <FeatureCard
            icon={<BarChart3 size={20} />}
            title="Live Proposals"
            copy="Post proposals and watch results update as votes come in."
          />
          <FeatureCard
            icon={<ShieldCheck size={20} />}
            title="One Wallet, One Vote"
            copy="Enforced at the protocol level — no ballot stuffing, no duplicates."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard: FC<{ icon: React.ReactNode; title: string; copy: string }> = ({
  icon,
  title,
  copy,
}) => (
  <div className="bg-white rounded-2xl border border-black/5 shadow-soft p-6 text-left">
    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-semibold text-brand-900">{title}</h3>
    <p className="text-sm text-slate-500 mt-1">{copy}</p>
  </div>
);