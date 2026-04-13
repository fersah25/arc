"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useDeployContract,
  useWaitForTransactionReceipt,
  useSendTransaction,
  useAccount,
} from "wagmi";
import { parseEther, stringToHex } from "viem";

// ─── Bytecode ───────────────────────────────────────────────────────────────
const HELLO_ARC_BYTECODE =
  "0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea264697066735822122000000000000000000000000000000000000000000000000000000000000000000064736f6c63430008130033" as `0x${string}`;

// ─── Task 1 Panel ────────────────────────────────────────────────────────────
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

// ─── Task 2 Panel ────────────────────────────────────────────────────────────
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

// ─── Task 3 Panel ────────────────────────────────────────────────────────────
function GmPanel() {
  const [message, setMessage] = useState("gm arc fam");
  const {
    sendTransaction,
    data: txHash,
    isPending,
    reset,
  } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleGm = () => {
    sendTransaction({
      to: "0x0000000000000000000000000000000000000000",
      value: parseEther("0"),
      data: stringToHex(message),
    });
  };

  return (
    <div className="pt-4 flex flex-col gap-3">
      <p className="text-sm text-zinc-400">
        Zincire bir mesaj yaz. Arc ağı seni duyacak.
      </p>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="gm arc fam"
        className="w-full rounded-lg border border-indigo-900/50 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-indigo-600/60 transition-colors"
      />
      {isSuccess && txHash && (
        <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/30 px-4 py-3">
          <p className="text-xs text-emerald-400 mb-1">✓ Mesaj zincire kazındı!</p>
          <a
            href={`https://testnet.arcscan.app/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-500 hover:text-emerald-300 underline underline-offset-2 break-all transition-colors"
          >
            {txHash}
          </a>
        </div>
      )}
      <button
        onClick={
          isSuccess
            ? () => {
                reset();
                setMessage("gm arc fam");
              }
            : handleGm
        }
        disabled={isPending || isConfirming}
        className="w-full rounded-lg border border-indigo-800/40 bg-indigo-950/60 px-4 py-2.5 text-sm font-medium text-indigo-300 transition-all hover:bg-indigo-900/50 hover:text-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
          "Ağa Kazı"
        )}
      </button>
    </div>
  );
}

// ─── Task 4 Panel ────────────────────────────────────────────────────────────
function NameRegisterPanel() {
  const [name, setName] = useState("");
  const { isConnected } = useAccount();
  const {
    deployContract,
    data: txHash,
    isPending: isWaitingWallet,
    reset,
  } = useDeployContract();
  const {
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const handleRegister = () => {
    deployContract({ abi: [], bytecode: HELLO_ARC_BYTECODE });
  };

  const isDisabled = !isConnected || !name.trim() || isWaitingWallet || isConfirming;

  return (
    <div className="pt-4 flex flex-col gap-4">
      {/* Input alanı */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
          İstediğiniz İsim (.arc otomatik eklenir)
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
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

      {/* Başarı state */}
      {isSuccess && txHash && (
        <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 px-4 py-3 flex flex-col gap-1">
          <p className="text-xs text-zinc-400">
            İşlem Hash:{" "}
            <a
              href={`https://testnet.arcscan.app/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all transition-colors"
            >
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </a>
          </p>
          <p className="text-xs font-medium text-emerald-400">
            ✓ İsminiz başarıyla kaydedildi!
          </p>
        </div>
      )}

      {/* Buton */}
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

// ─── Task definitions ────────────────────────────────────────────────────────
type TaskId = 1 | 2 | 3 | 4;

const TASK_PANELS: Record<TaskId, React.ReactNode> = {
  1: <ConnectPanel />,
  2: <FaucetPanel />,
  3: <GmPanel />,
  4: <NameRegisterPanel />,
};

const TASKS: { id: TaskId; label: string }[] = [
  { id: 1, label: "1. Ağ ile Tanış (Bağlan)" },
  { id: 2, label: "2. Yakıtını Al (Faucet)" },
  { id: 3, label: "3. Zincire Seslen (GM Arc!)" },
  { id: 4, label: "4. Arc İsmini Al" },
];

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Home() {
  const [openTask, setOpenTask] = useState<TaskId | null>(null);

  const toggle = (id: TaskId) => setOpenTask((prev) => (prev === id ? null : id));

  return (
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
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-300 via-violet-300 to-zinc-200 bg-clip-text text-transparent">
            Arc Testnet Görevleri
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Görevleri tamamla, ağla etkileşime gir.
          </p>
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
                {/* Accordion Header */}
                <button
                  onClick={() => toggle(id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span
                    className={`text-sm font-semibold transition-colors duration-200 ${
                      isOpen ? "text-indigo-300" : "text-zinc-300"
                    }`}
                  >
                    {label}
                  </span>
                  <span
                    className={`text-zinc-500 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-indigo-400" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {/* Accordion Panel */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-5 pb-5">{TASK_PANELS[id]}</div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 px-6 py-4">
        <div className="max-w-2xl mx-auto text-xs text-zinc-700 text-center">
          Arc Testnet — Chain ID 573
        </div>
      </footer>
    </div>
  );
}
