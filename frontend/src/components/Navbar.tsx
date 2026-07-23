import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Vote } from "lucide-react";

export const Navbar: FC = () => {
  const navigate = useNavigate();
  return (
    <nav className="w-full border-b border-white/10 bg-ink-950/60 backdrop-blur-xl sticky top-0 z-20">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 font-display font-semibold text-white text-lg tracking-tight"
        >
          <span className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-glow">
            <Vote size={17} />
          </span>
          Vota
        </button>
        <WalletMultiButton />
      </div>
    </nav>
  );
};