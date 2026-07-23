import { type FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAuthWallet } from "../hooks/UseAuthWallet";
import { useWalletAuth } from "../hooks/useWalletAuth";
// import { useAppData } from "../context/AppDataContext";
import { joinCommunity } from "../services/communityApi";
import DarkVeil from "../components/DarkVeil";

export const JoinByLink: FC = () => {
  const { invite_code } = useParams();
  const { address, connected } = useAuthWallet();
  const { sign } = useWalletAuth();
  // const { joinCommunity } = useAppData();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [previewName] = useState<string | null>(null);

  // Best-effort preview so the visitor sees which community they're
  // joining before they've even connected a wallet.
  // useEffect(() => {
  //   if (!inviteCode) return;
  //   joinCommunity(inviteCode)
  //     .then((p) => setPreviewName(p.name))
  //     .catch(() => {
  //       // Preview failing is fine — joining below still works without it.
  //     });
  // }, [inviteCode]);

  // Once connected, sign a message to prove wallet ownership, then join.
  useEffect(() => {
    if (connected && address && invite_code && !joining) {
      setJoining(true);
      sign("join_community")
        .then((auth) => joinCommunity(invite_code, auth))
        .then((community) => navigate(`/api/communities/${community.invite_code}`))
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Couldn't join that community.");
          setJoining(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, address, invite_code]);

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4">
      <DarkVeil hueShift={12} noiseIntensity={0} scanlineIntensity={0} speed={0.5} scanlineFrequency={0} warpAmount={0} />

      <div className="relative z-10 bg-white/4 backdrop-blur-xl border border-white/10 rounded-2xl shadow-soft p-8 max-w-md w-full text-center">
        <h1 className="font-display text-xl font-semibold text-white">
          You've been invited{previewName ? ` to ${previewName}` : ""}
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Sign in with Phantom, then sign a message to confirm you own this wallet.
        </p>
        <div className="mt-6 flex justify-center">
          <WalletMultiButton />
        </div>
        {joining && !error && (
          <p className="text-sm text-slate-500 mt-4">Joining community...</p>
        )}
        {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  );
};