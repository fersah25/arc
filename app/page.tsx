"use client";

import { useState, useEffect, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useDeployContract,
  useWaitForTransactionReceipt,
  useWriteContract,
  useSendTransaction,
  useReadContract,
  useAccount,
} from "wagmi";
import { toHex } from "viem";
import { ARC_QUEST_ABI, ARC_QUEST_BYTECODE } from "./lib/arcQuest";
import { QuestProvider, useQuestStats } from "./lib/questContext";
import { HologramBackground } from "../components/HologramBackground";

// ─── Kontrat sabitleri ────────────────────────────────────────────────────────
const NAME_REGISTRY_ADDRESS =
  "0x0000000000000000000000000000000000000000" as `0x${string}`;

const NAME_REGISTRY_ABI = [
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getName",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const NFT_CONTRACT_ADDRESS =
  "0xEe4AB577E9D706819c96E888623ce5a5fb2E8F47" as `0x${string}`;

const NFT_MINT_ABI = [
  {
    inputs: [],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getUserMintCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ─── Task 1 ───────────────────────────────────────────────────────────────────
function ConnectPanel() {
  return (
    <div className="pt-4 flex flex-col gap-2">
      <p className="text-sm text-zinc-400">
        Cüzdanını Arc Testnet&apos;e bağla, ağı keşfetmeye başla.
      </p>
      <div className="mt-1">
        <ConnectButton />
      </div>
    </div>
  );
}

// ─── Task 2 ───────────────────────────────────────────────────────────────────
function FaucetPanel() {
  return (
    <div className="pt-4 flex flex-col gap-2">
      <p className="text-sm text-zinc-400">
        Circle Faucet üzerinden test USDC al, işlem yapmak için yakıtını doldur.
      </p>
      <button
        onClick={() => window.open("https://faucet.circle.com/", "_blank")}
        className="mt-1 w-full rounded-lg border border-indigo-800/40 bg-indigo-950/60 px-4 py-2.5 text-sm font-medium text-indigo-300 transition-all hover:bg-indigo-900/50 hover:text-indigo-200"
      >
        Faucet&apos;e Git →
      </button>
    </div>
  );
}

// ─── Task 3 ─ isim kaydı ──────────────────────────────────────────────────────
function NameRegisterPanel({ onSuccess }: { onSuccess?: () => void }) {
  const [name, setName] = useState("");
  const { isConnected } = useAccount();
  const { incrementOffChain } = useQuestStats();
  const lastHandledHash = useRef<string | undefined>(undefined);
  const {
    deployContract,
    data: txHash,
    isPending: isWaitingWallet,
    reset,
  } = useDeployContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const contractAddress = receipt?.contractAddress;

  useEffect(() => {
    if (isSuccess && txHash && lastHandledHash.current !== txHash) {
      lastHandledHash.current = txHash;
      console.log("Görev Başarılı: Arc İsmi Al, Sayaç Artırıldı", txHash);
      onSuccess?.();
      incrementOffChain();
    }
  }, [isSuccess, txHash, onSuccess, incrementOffChain]);

  const handleRegister = () => {
    deployContract({ abi: ARC_QUEST_ABI, bytecode: ARC_QUEST_BYTECODE });
  };

  const isDisabled = !isConnected || !name.trim() || isWaitingWallet || isConfirming;

  return (
    <div className="pt-4 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
          İstediğiniz İsim (.arc otomatik eklenir)
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
            }
            placeholder="fersah"
            maxLength={32}
            className="w-full rounded-xl border border-indigo-900/40 bg-[#070710] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-700 outline-none focus:border-indigo-600/50 focus:ring-1 focus:ring-indigo-600/20 transition-all"
          />
          {name && (
            <span className="absolute right-4 text-xs text-zinc-500 pointer-events-none">
              {name}.arc
            </span>
          )}
        </div>
      </div>

      {isSuccess && contractAddress && (
        <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 px-4 py-3 flex flex-col gap-1">
          <p className="text-xs text-zinc-400">
            İşlem Hash:{" "}
            <a
              href={`https://testnet.arcscan.app/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all transition-colors"
            >
              {txHash?.slice(0, 10)}...{txHash?.slice(-8)}
            </a>
          </p>
          <p className="text-xs font-medium text-emerald-400">
            ✓ İsminiz başarıyla kaydedildi!
          </p>
        </div>
      )}

      <button
        onClick={isSuccess ? () => { reset(); setName(""); } : handleRegister}
        disabled={isDisabled}
        className="w-full rounded-xl border border-indigo-700/40 bg-indigo-950/50 px-4 py-3 text-sm font-semibold tracking-widest text-indigo-300 uppercase transition-all hover:bg-indigo-900/40 hover:border-indigo-600/50 hover:text-indigo-200 hover:shadow-[0_0_16px_rgba(99,102,241,0.15)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        {isWaitingWallet ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-indigo-700 border-t-indigo-300 animate-spin" />
            Cüzdanı Onayla...
          </span>
        ) : isConfirming ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-indigo-700 border-t-indigo-300 animate-spin" />
            Kaydediliyor...
          </span>
        ) : isSuccess ? (
          "Tekrar Kaydet"
        ) : !isConnected ? (
          "Önce Cüzdanı Bağla"
        ) : (
          "İsmi Kaydet"
        )}
      </button>

      {!isConnected && (
        <p className="text-xs text-zinc-600 text-center -mt-1">
          Bu görevi tamamlamak için cüzdanını bağlaman gerekiyor.
        </p>
      )}
    </div>
  );
}

// ─── Task 4 ─ NFT mint ────────────────────────────────────────────────────────
function NftMintPanel({
  balance,
  onMintSuccess,
}: {
  balance?: number;
  onMintSuccess?: () => void;
}) {
  const { incrementOnChain } = useQuestStats();
  const lastHandledHash = useRef<string | undefined>(undefined);
  const {
    writeContract,
    data: txHash,
    isPending,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess && txHash && lastHandledHash.current !== txHash) {
      lastHandledHash.current = txHash;
      console.log("Görev Başarılı: NFT Mint Et, Sayaç Artırıldı", txHash);
      onMintSuccess?.();
      incrementOnChain();
    }
  }, [isSuccess, txHash, onMintSuccess, incrementOnChain]);

  const handleMint = () => {
    writeContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: NFT_MINT_ABI,
      functionName: "mint",
    });
  };

  const displayBalance = balance ?? 0;

  return (
    <div className="pt-4 flex flex-col gap-4">
      <div className="rounded-xl border border-indigo-900/40 bg-[#0d0d1a] px-4 py-3 flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-widest text-indigo-600 uppercase">
          Sizin Mint&apos;leriniz
        </span>
        <span className={`text-2xl font-bold transition-colors duration-300 ${displayBalance > 0 ? "text-indigo-300" : "text-zinc-600"}`}>
          {displayBalance}
        </span>
      </div>

      {isSuccess && txHash && (
        <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 px-4 py-3 flex flex-col gap-1">
          <p className="text-xs font-medium text-emerald-400">✓ NFT Başarıyla Mintlendi!</p>
          <a
            href={`https://testnet.arcscan.app/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-500 hover:text-emerald-300 underline underline-offset-2 break-all transition-colors"
          >
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </a>
        </div>
      )}

      <button
        onClick={isSuccess ? () => reset() : handleMint}
        disabled={isPending || isConfirming}
        className="w-full rounded-xl border border-indigo-700/40 bg-indigo-950/50 px-4 py-3 text-sm font-semibold tracking-widest text-indigo-300 uppercase transition-all hover:bg-indigo-900/40 hover:border-indigo-600/50 hover:text-indigo-200 hover:shadow-[0_0_20px_rgba(99,102,241,0.18)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-indigo-700 border-t-indigo-300 animate-spin" />
            Cüzdanı Onayla...
          </span>
        ) : isConfirming ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-indigo-700 border-t-indigo-300 animate-spin" />
            Mint Ediliyor...
          </span>
        ) : isSuccess ? (
          "Tekrar Mint Et"
        ) : (
          "NFT Mint Et"
        )}
      </button>
    </div>
  );
}

// ─── Task 5 ─ zincire mesaj ───────────────────────────────────────────────────
function GmGmPanel() {
  const [message, setMessage] = useState("gm arc fam");
  const { incrementOffChain } = useQuestStats();
  const lastHandledHash = useRef<string | undefined>(undefined);
  const {
    sendTransaction,
    data: txHash,
    isPending,
    reset,
  } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess && txHash && lastHandledHash.current !== txHash) {
      lastHandledHash.current = txHash;
      console.log("Görev Başarılı: GMGM Gönder, Sayaç Artırıldı", txHash);
      incrementOffChain();
    }
  }, [isSuccess, txHash, incrementOffChain]);

  const handleSend = () => {
    sendTransaction({ to: undefined, data: toHex(message) });
  };

  return (
    <div className="pt-4 flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
          M E S A J I N I Z
        </label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="gm arc fam"
          className="w-full rounded-xl border border-indigo-900/40 bg-[#070710] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-700 outline-none focus:border-indigo-600/50 focus:ring-1 focus:ring-indigo-600/20 transition-all"
        />
      </div>

      {isSuccess && txHash && (
        <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 px-4 py-3 flex flex-col gap-1">
          <p className="text-xs font-medium text-emerald-400">
            ✓ Mesajınız Arc ağına başarıyla kazındı!
          </p>
          <a
            href={`https://testnet.arcscan.app/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-500 hover:text-emerald-300 underline underline-offset-2 break-all transition-colors"
          >
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </a>
        </div>
      )}

      <button
        onClick={isSuccess ? () => { reset(); setMessage("gm arc fam"); } : handleSend}
        disabled={!message.trim() || isPending || isConfirming}
        className="w-full rounded-xl border border-indigo-700/40 bg-indigo-950/50 px-4 py-3 text-sm font-semibold tracking-widest text-indigo-300 uppercase transition-all hover:bg-indigo-900/40 hover:border-indigo-600/50 hover:text-indigo-200 hover:shadow-[0_0_16px_rgba(99,102,241,0.15)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-indigo-700 border-t-indigo-300 animate-spin" />
            Cüzdanı Onayla...
          </span>
        ) : isConfirming ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-indigo-700 border-t-indigo-300 animate-spin" />
            Ağda İşleniyor...
          </span>
        ) : isSuccess ? (
          "Tekrar Gönder"
        ) : (
          "Mesaj Gönder"
        )}
      </button>
    </div>
  );
}

// ─── İstatistik paneli ────────────────────────────────────────────────────────
function QuestStatsPanel() {
  const { totalSiteInteractions, todaySiteInteractions } = useQuestStats();
  return (
    <div className="grid grid-cols-2 gap-3 mb-8">
      <div className="rounded-xl border border-zinc-800/50 bg-[#0a0a14] px-5 py-4 flex flex-col gap-1.5">
        <span className="text-[10px] font-medium tracking-widest text-zinc-600 uppercase">
          Toplam İşlem
        </span>
        <span className="text-4xl font-bold tracking-tight text-indigo-300 tabular-nums">
          {totalSiteInteractions}
        </span>
      </div>
      <div className="rounded-xl border border-violet-900/40 bg-[#0d0a1e] px-5 py-4 flex flex-col gap-1.5">
        <span className="text-[10px] font-medium tracking-widest text-violet-600 uppercase">
          Bugünkü İşlem
        </span>
        <span className="text-4xl font-bold tracking-tight text-violet-300 tabular-nums">
          {todaySiteInteractions}
        </span>
      </div>
    </div>
  );
}

// ─── Task definitions ─────────────────────────────────────────────────────────
type TaskId = 1 | 2 | 3 | 4 | 5;

const TASKS: { id: TaskId; label: string }[] = [
  { id: 1, label: "1. Ağ ile Tanış (Bağlan)" },
  { id: 2, label: "2. Yakıtını Al (Faucet)" },
  { id: 3, label: "3. Arc İsmini Al" },
  { id: 4, label: "4. NFT Mint Et" },
  { id: 5, label: "5. GMGM Guys (Zincire Seslen)" },
];

// ─── Ana sayfa ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [openTask, setOpenTask] = useState<TaskId | null>(null);
  const { address, isConnected } = useAccount();

  // Sorgu A — isim kaydı
  const { data: resolvedName, refetch: refetchName } = useReadContract({
    address: NAME_REGISTRY_ADDRESS,
    abi: NAME_REGISTRY_ABI,
    functionName: "getName",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Sorgu B — NFT mint sayısı
  const { data: rawBalance, refetch: refetchBalance } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: NFT_MINT_ABI,
    functionName: "getUserMintCount",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const userName = resolvedName?.trim() || null;
  const nftBalance = rawBalance !== undefined ? Number(rawBalance) : undefined;

  // Zincirden başlangıç değeri: NFT sayısı + isim bayrağı
  const chainNftCount = nftBalance ?? 0;

  const greeting = !isConnected
    ? "Lütfen Cüzdanınızı Bağlayın"
    : userName
    ? `Hoş geldin, ${userName}.arc`
    : `Hoş geldin, ${address?.slice(0, 6)}...${address?.slice(-4)}`;

  const toggle = (id: TaskId) =>
    setOpenTask((prev) => (prev === id ? null : id));

  const taskPanels: Record<TaskId, React.ReactNode> = {
    1: <ConnectPanel />,
    2: <FaucetPanel />,
    3: <NameRegisterPanel onSuccess={refetchName} />,
    4: <NftMintPanel balance={nftBalance} onMintSuccess={refetchBalance} />,
    5: <GmGmPanel />,
  };

  return (
    <QuestProvider address={address} chainNftCount={chainNftCount}>
      <HologramBackground />
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
        {/* Header */}
        <header className="border-b border-zinc-800/60 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.8)]" />
              <span className="text-sm font-semibold tracking-tight text-zinc-100">
                Arc Quest Dashboard
              </span>
            </div>
            <ConnectButton showBalance={false} />
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
          <div className="mb-8">
            {/* Karşılama */}
            <p className={`text-xs font-medium tracking-widest uppercase mb-3 ${
              !isConnected ? "text-zinc-600" : "text-indigo-400"
            }`}>
              {greeting}
            </p>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-300 via-violet-300 to-zinc-200 bg-clip-text text-transparent">
              Arc Testnet Görevleri
            </h1>
            <p className="text-sm text-zinc-500 mt-1 mb-6">
              Görevleri tamamla, ağla etkileşime gir.
            </p>

            {/* İstatistik paneli */}
            <QuestStatsPanel />
          </div>

          {/* Accordion */}
          <div className="flex flex-col gap-3">
            {TASKS.map(({ id, label }) => {
              const isOpen = openTask === id;
              return (
                <div
                  key={id}
                  className={`rounded-xl border transition-all duration-300 ${
                    isOpen
                      ? "border-indigo-700/50 bg-[#0d0d1a] shadow-[0_0_24px_rgba(99,102,241,0.12)]"
                      : "border-zinc-800/70 bg-[#0a0a14] hover:border-zinc-700/60 hover:shadow-[0_0_12px_rgba(99,102,241,0.07)]"
                  }`}
                >
                  <button
                    onClick={() => toggle(id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className={`text-sm font-semibold transition-colors duration-200 ${isOpen ? "text-indigo-300" : "text-zinc-300"}`}>
                      {label}
                    </span>
                    <span className={`text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-400" : ""}`}>
                      ▾
                    </span>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="px-5 pb-5">{taskPanels[id]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800/60 px-6 py-4">
          <div className="max-w-2xl mx-auto text-xs text-zinc-700 text-center">
            Arc Network Testnet — Chain ID 5042002
          </div>
        </footer>
      </div>
    </QuestProvider>
  );
}
