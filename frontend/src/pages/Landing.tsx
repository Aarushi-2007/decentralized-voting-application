import { type FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAuthWallet } from "../hooks/UseAuthWallet";
import { ShieldCheck, Users, BarChart3, Vote } from "lucide-react";
import DarkVeil from "../components/DarkVeil";

export const Landing: FC = () => {
  const { connected } = useAuthWallet();
  const navigate = useNavigate();

  // Only signed-in users can proceed — redirect straight to the dashboard
  // the moment Phantom reports a connected wallet.
  useEffect(() => {
    if (connected) navigate("/dashboard");
  }, [connected, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <DarkVeil
        hueShift={12}
        noiseIntensity={0}
        scanlineIntensity={0}
        speed={0.5}
        scanlineFrequency={0}
        warpAmount={0}
      />

      {/* Foreground */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="max-w-6xl mx-auto w-full px-6 pt-8 flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-glow">
            <Vote size={17} />
          </span>
          <span className="font-display font-semibold text-white text-lg tracking-tight">Vota</span>
        </header>

        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-6xl mx-auto w-full px-6 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium text-brand-300">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              Built on Solana
            </span>

            <h1 className="mt-8 font-display text-5xl md:text-7xl font-semibold text-white tracking-tight max-w-4xl mx-auto leading-[1.05]">
              Vote together. Trust the chain, not the admin.
            </h1>

            <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-8">
              Create a community, invite your people, and run proposals where every
              wallet gets exactly one vote — verifiably, every time.
            </p>

            <div className="mt-10 flex justify-center">
              <WalletMultiButton />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Sign in with Phantom to create or join a community.
            </p>

            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeatureCard
                icon={<Users size={20} />}
                title="Communities"
                copy="Spin up a community in seconds and share one invite link."
              />
              <FeatureCard
                icon={<BarChart3 size={20} />}
                title="Live proposals"
                copy="Post proposals and watch results update as votes come in."
              />
              <FeatureCard
                icon={<ShieldCheck size={20} />}
                title="One wallet, one vote"
                copy="Enforced at the protocol level — no ballot stuffing, no duplicates."
              />
            </div>
          </div>
        </div>

        <footer className="px-6 pb-8 text-center text-xs text-slate-600">
          Every vote is a Solana transaction — check it on-chain, not on our word.
        </footer>
      </div>
    </div>
  );
};

const FeatureCard: FC<{
  icon: React.ReactNode;
  title: string;
  copy: string;
}> = ({ icon, title, copy }) => (
  <div className="rounded-2xl bg-white/4 backdrop-blur-xl border border-white/10 p-6 text-left hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">
    <div className="w-11 h-11 rounded-xl bg-brand-500/15 text-brand-300 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm text-slate-400 leading-6">{copy}</p>
  </div>
);