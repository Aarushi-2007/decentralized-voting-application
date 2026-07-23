import { type FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { CreateCommunityModal } from "../components/CreateCommunityModal";
import { JoinCommunityModal } from "../components/JoinCommunityModal";
import { CommunityCard } from "../components/CommunityCard";
import { useAppData } from "../context/AppDataContext";
import { useAuthWallet } from "../hooks/UseAuthWallet";
import { Plus, LogIn, Loader2 } from "lucide-react";
import DarkVeil from "../components/DarkVeil";

export const Dashboard: FC = () => {
  const { address, connected } = useAuthWallet();
  const { communities, loading, error, refresh } = useAppData();
  const navigate = useNavigate();

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  // Guard: only signed-in users may view the dashboard
  useEffect(() => {
    if (!connected) navigate("/");
  }, [connected, navigate]);

  // Load this wallet's communities from the backend
  useEffect(() => {
    if (address) refresh(address);
  }, [address, refresh]);

  if (!address) return null;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <DarkVeil
        hueShift={12}
        noiseIntensity={0}
        scanlineIntensity={0}
        speed={0.5}
        scanlineFrequency={0}
        warpAmount={0}
      />

      {/* Dashboard content */}
      <div className="relative z-10 min-h-screen">
        <Navbar />

        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-white tracking-tight">
                Your dashboard
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Signed in as{" "}
                <span className="font-mono text-slate-300">
                  {address.slice(0, 4)}...{address.slice(-4)}
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowJoin(true)}
                className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 text-white font-medium rounded-xl px-4 py-2.5 hover:bg-white/10 hover:border-white/20 transition"
              >
                <LogIn size={16} />
                Join community
              </button>

              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 bg-brand-600 text-white font-medium rounded-xl px-4 py-2.5 hover:bg-brand-500 transition shadow-glow"
              >
                <Plus size={16} />
                Create community
              </button>
            </div>
          </div>

          <h2 className="mt-10 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Your communities
          </h2>

          {loading ? (
            <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 size={16} className="animate-spin" />
              Loading communities...
            </div>
          ) : error ? (
            <div className="mt-4 bg-red-500/10 border border-red-400/20 text-red-300 rounded-2xl p-6">
              {error}
            </div>
          ) : communities.length === 0 ? (
            <div className="mt-4 bg-white/4 backdrop-blur-xl border border-dashed border-white/15 rounded-2xl p-10 text-center">
              <p className="text-slate-400">
                You haven't joined or created a community yet.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {communities.map((c) => (
                <CommunityCard
                  key={c._id}
                  community={c}
                  onClick={() => navigate(`/api/communities/${c.invite_code}`)}
                />
              ))}
            </div>
          )}
        </div>

        {showCreate && (
          <CreateCommunityModal onClose={() => setShowCreate(false)} />
        )}

        {showJoin && (
          <JoinCommunityModal
            onClose={() => setShowJoin(false)}
            onJoined={(invite_code) => {
              setShowJoin(false);
              navigate(`/api/communities/${invite_code}`);
            }}
          />
        )}
      </div>
    </div>
  );
};