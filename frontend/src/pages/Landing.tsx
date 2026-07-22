import { type FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAuthWallet } from "../hooks/UseAuthWallet";
import { ShieldCheck, Users, BarChart3 } from "lucide-react";
import  DarkVeil  from "../components/DarkVeil"

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
      hueShift={0}
      noiseIntensity={0}
      scanlineIntensity={0}
      speed={0.5}
      scanlineFrequency={0}
      warpAmount={0}
    />

    {/* Foreground */}
    <div className="relative z-10 min-h-screen flex flex-col justify-center">

      <div className="max-w-6xl mx-auto w-full px-6 text-center">

        <span className="inline-block px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-violet-300">
          Built on Solana
        </span>

        <h1 className="mt-8 text-5xl md:text-6xl font-bold text-white tracking-tight max-w-4xl mx-auto">
          Vote together. Trust the chain, not the admin.
        </h1>

        <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-8">
          Create a community, invite your people, and run proposals where every
          wallet gets exactly one vote — verifiably, every time.
        </p>

        <div className="mt-10 flex justify-center">
          <WalletMultiButton />
        </div>

        <p className="mt-4 text-slate-400">
          Sign in with Phantom to create or join a community.
        </p>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">

          <FeatureCard
            icon={<Users size={22} />}
            title="Communities"
            copy="Spin up a community in seconds and share one invite link."
          />

          <FeatureCard
            icon={<BarChart3 size={22} />}
            title="Live Proposals"
            copy="Post proposals and watch results update as votes come in."
          />

          <FeatureCard
            icon={<ShieldCheck size={22} />}
            title="One Wallet, One Vote"
            copy="Enforced at the protocol level — no ballot stuffing, no duplicates."
          />

        </div>

      </div>

    </div>

  </div>
  );
};

const FeatureCard: FC<{
  icon: React.ReactNode;
  title: string;
  copy: string;
}> = ({ icon, title, copy }) => (
  <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-6 text-left hover:bg-white/15 transition-all duration-300">

    <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center mb-4">
      {icon}
    </div>

    <h3 className="text-xl font-semibold text-white">
      {title}
    </h3>

    <p className="mt-2 text-slate-300 leading-6">
      {copy}
    </p>

  </div>
);