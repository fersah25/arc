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
  "0x9EA15D331cD4C04858013f67B394D0521EbAA6b3" as `0x${string}`;

const NFT_MINT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "uint256", name: "_supply", type: "uint256" },
    ],
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
  const [nftName, setNftName] = useState("");
  const [nftSupply, setNftSupply] = useState("");
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
      args: [nftName, BigInt(nftSupply || 0)],
    });
  };

  const isDisabled = isPending || isConfirming || !nftName.trim() || !nftSupply || Number(nftSupply) <= 0;
  const displayBalance = balance ?? 0;

  const inputClass = "w-full rounded-xl border border-zinc-800/70 bg-transparent px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-indigo-600/60 focus:ring-1 focus:ring-indigo-600/20 transition-all";

  return (
    <div className="pt-4 flex flex-col gap-4">
      {/* Mint sayacı */}
      <div className="rounded-xl border border-indigo-900/40 bg-[#0d0d1a] px-4 py-3 flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-widest text-indigo-600 uppercase">
          Sizin Mint&apos;leriniz
        </span>
        <span className={`text-2xl font-bold transition-colors duration-300 ${displayBalance > 0 ? "text-indigo-300" : "text-zinc-600"}`}>
          {displayBalance}
        </span>
      </div>

      {/* Inputlar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium tracking-widest text-zinc-500 uppercase">NFT Adı</label>
          <input
            type="text"
            value={nftName}
            onChange={(e) => setNftName(e.target.value)}
            placeholder="Arc Founders"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium tracking-widest text-zinc-500 uppercase">Supply</label>
          <input
            type="number"
            min="1"
            value={nftSupply}
            onChange={(e) => setNftSupply(e.target.value)}
            placeholder="10000"
            className={inputClass}
          />
        </div>
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
        onClick={isSuccess ? () => { reset(); setNftName(""); setNftSupply(""); } : handleMint}
        disabled={isDisabled}
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
    <div className="grid grid-cols-2 gap-4 mb-8">
      {/* Toplam İşlem */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-[#1a1f35] to-[#0B0F1A] backdrop-blur-md px-5 py-5 flex flex-col gap-2">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-indigo-400/70 uppercase">
          Toplam İşlem
        </span>
        <span className="text-5xl font-bold tabular-nums text-white drop-shadow-[0_0_12px_rgba(108,92,231,0.7)]">
          {totalSiteInteractions}
        </span>
      </div>
      {/* Bugünkü İşlem */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[#0f1e2e] to-[#0B0F1A] backdrop-blur-md px-5 py-5 flex flex-col gap-2">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-cyan-400/70 uppercase">
          Bugünkü İşlem
        </span>
        <span className="text-5xl font-bold tabular-nums text-white drop-shadow-[0_0_12px_rgba(0,209,255,0.6)]">
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
  const watermarkRef = useRef<HTMLDivElement>(null);

  // Mouse pozisyonuna göre FERSAH maskesini güncelle
  useEffect(() => {
    const el = watermarkRef.current;
    if (!el) return;
    const handleMouseMove = (e: MouseEvent) => {
      const mask = `radial-gradient(circle 200px at ${e.clientX}px ${e.clientY}px, black 0%, transparent 100%)`;
      el.style.webkitMaskImage = mask;
      el.style.maskImage = mask;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
      {/* 1. EN ARKA: Simsiyah zemin */}
      <div className="relative min-h-screen bg-[#0B0F1A] overflow-hidden">

        {/* 2. HOLOGRAM: Siyahın üstünde, içeriğin altında (z-[1]) */}
        <HologramBackground />

        {/* 3. FERSAH YAZISI: Hologramla beraber arkada (z-[2]) */}
        <div
          ref={watermarkRef}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-[2]"
          style={{ maskImage: "radial-gradient(circle 200px at -999px -999px, black 0%, transparent 100%)", WebkitMaskImage: "radial-gradient(circle 200px at -999px -999px, black 0%, transparent 100%)" }}
        >
          <span className="text-[12vw] font-black tracking-[0.3em] select-none text-white/20 cursor-default">
            FERSAH
          </span>
        </div>

        {/* 4. ASIL İÇERİK: Saydam ve en üstte (z-10) */}
        <div className="relative z-10 bg-transparent text-white flex flex-col min-h-screen">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0B0F1A]/80 backdrop-blur-md px-6 py-4">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#6C5CE7] shadow-[0_0_8px_rgba(108,92,231,0.9)]" />
                <span className="text-sm font-semibold tracking-tight text-white">
                  Arc Quest Dashboard
                </span>
              </div>
              <ConnectButton showBalance={false} />
            </div>
          </header>

          {/* ── Main ───────────────────────────────────────────────────────── */}
          <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">

            {/* Karşılama + Başlık */}
            <div className="mb-10">
              <p className={`text-[11px] font-semibold tracking-[0.22em] uppercase mb-2 ${
                !isConnected ? "text-white/20" : "text-[#6C5CE7]"
              }`}>
                {greeting}
              </p>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-[#6C5CE7] bg-clip-text text-transparent leading-tight">
                Arc Testnet Görevleri
              </h1>
              <p className="text-sm text-zinc-500 mt-2 mb-8">
                Görevleri tamamla, ağla etkileşime gir.
              </p>

              {/* İstatistik kartları */}
              <QuestStatsPanel />
            </div>

            {/* ── Accordion ──────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3">
              {TASKS.map(({ id, label }) => {
                const isOpen = openTask === id;
                return (
                  <div
                    key={id}
                    className={`rounded-2xl border backdrop-blur-md transition-all duration-300
                      ${isOpen
                        ? "border-[#6C5CE7]/50 bg-[#131B2F]/90 shadow-[0_0_28px_rgba(108,92,231,0.18)] -translate-y-0.5"
                        : "border-indigo-500/10 bg-[#131B2F]/70 hover:-translate-y-1 hover:border-indigo-400/30 hover:shadow-[0_0_20px_rgba(108,92,231,0.12)]"
                      }`}
                  >
                    {/* Açık kart üst çizgisi */}
                    {isOpen && (
                      <div className="h-[2px] w-full rounded-t-2xl bg-gradient-to-r from-transparent via-[#6C5CE7] to-transparent" />
                    )}

                    {/* Başlık butonu */}
                    <button
                      onClick={() => toggle(id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                    >
                      <span className={`text-sm font-semibold transition-colors duration-200 ${
                        isOpen ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                      }`}>
                        {label}
                      </span>
                      <span className={`text-base transition-all duration-300 ${
                        isOpen ? "rotate-180 text-[#6C5CE7]" : "text-white/20"
                      }`}>
                        ▾
                      </span>
                    </button>

                    {/* Panel içeriği */}
                    <div className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    }`}>
                      <div className="px-5 pb-6">{taskPanels[id]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>

          {/* ── Footer ─────────────────────────────────────────────────────── */}
          <footer className="border-t border-white/5 px-6 py-4">
            <div className="max-w-2xl mx-auto text-[11px] text-white/15 text-center tracking-widest uppercase">
              Arc Network Testnet · Chain ID 5042002
            </div>
          </footer>
        </div>
      </div>
    </QuestProvider>
  );
}
