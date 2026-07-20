import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Vote } from "lucide-react";

export const Navbar: FC = () => {
  const navigate = useNavigate();
  return (
    <nav className="w-full border-b border-black/5 bg-white/70 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-semibold text-brand-900 text-lg"
        >
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center text-white">
            <Vote size={18} />
          </span>
          Vota
        </button>
        <WalletMultiButton />
      </div>
    </nav>
  );
};