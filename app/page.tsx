"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useDeployContract,
  useWaitForTransactionReceipt,
  useSendTransaction,
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
function DeployPanel() {
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

  const handleDeploy = () => {
    deployContract({ abi: [], bytecode: HELLO_ARC_BYTECODE });
  };

  return (
    <div className="pt-4 flex flex-col gap-3">
      <p className="text-sm text-zinc-400">
        Arc Testnet üzerine ilk akıllı kontratını dağıt, zincirde bir iz bırak.
      </p>
      {isSuccess && contractAddress && (
        <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/30 px-4 py-3">
          <p className="text-xs font-medium text-emerald-400 mb-1">
            ✓ Kontrat başarıyla dağıtıldı!
          </p>
          <a
            href={`https://testnet.arcscan.app/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-500 hover:text-emerald-300 underline underline-offset-2 break-all transition-colors"
          >
            {contractAddress}
          </a>
        </div>
      )}
      <button
        onClick={isSuccess ? () => reset() : handleDeploy}
        disabled={isWaitingWallet || isConfirming}
        className="w-full rounded-lg border border-indigo-800/40 bg-indigo-950/60 px-4 py-2.5 text-sm font-medium text-indigo-300 transition-all hover:bg-indigo-900/50 hover:text-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isWaitingWallet ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-indigo-700 border-t-indigo-300 animate-spin" />
            Cüzdanı Onayla...
          </span>
        ) : isConfirming ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-indigo-700 border-t-indigo-300 animate-spin" />
            Dağıtılıyor...
          </span>
        ) : isSuccess ? (
          "Tekrar Dağıt"
        ) : (
          "Kontratı Dağıt"
        )}
      </button>
    </div>
  );
}

// ─── Task definitions ────────────────────────────────────────────────────────
type TaskId = 1 | 2 | 3 | 4;

const TASK_PANELS: Record<TaskId, React.ReactNode> = {
  1: <ConnectPanel />,
  2: <FaucetPanel />,
  3: <GmPanel />,
  4: <DeployPanel />,
};

const TASKS: { id: TaskId; label: string }[] = [
  { id: 1, label: "1. Ağ ile Tanış (Bağlan)" },
  { id: 2, label: "2. Yakıtını Al (Faucet)" },
  { id: 3, label: "3. Zincire Seslen (GM Arc!)" },
  { id: 4, label: "4. İlk Kontratını Üret" },
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
