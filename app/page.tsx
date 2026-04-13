"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDeployContract, useWaitForTransactionReceipt } from "wagmi";

// Minimal "Hello Arc" contract — empty constructor, no functions
// Compiled bytecode: PUSH1 0x80 PUSH1 0x40 MSTORE + non-payable guard + RETURN empty runtime
const HELLO_ARC_BYTECODE =
  "0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea264697066735822122000000000000000000000000000000000000000000000000000000000000000000064736f6c63430008130033" as `0x${string}`;

function DeployCard() {
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
    deployContract({
      abi: [],
      bytecode: HELLO_ARC_BYTECODE,
    });
  };

  const buttonLabel = isWaitingWallet
    ? "Cüzdanı Onayla..."
    : isConfirming
    ? "Ağda Dağıtılıyor..."
    : isSuccess
    ? "Tekrar Dağıt"
    : "Deploy Now";

  const isDisabled = isWaitingWallet || isConfirming;

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-zinc-700">
      {/* Tag */}
      <span className="inline-flex items-center rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs font-medium text-zinc-400 mb-4 w-fit">
        Geliştirici
      </span>

      {/* Content */}
      <div className="flex-1">
        <h2 className="text-base font-semibold text-zinc-100 mb-1">
          Kontrat Dağıt
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Arc Testnet üzerine ilk akıllı kontratını yükle.
        </p>
      </div>

      {/* Success state */}
      {isSuccess && contractAddress && (
        <div className="mt-4 rounded-lg border border-emerald-800 bg-emerald-950 px-4 py-3">
          <p className="text-xs font-medium text-emerald-400 mb-1">
            ✓ Başarıyla Dağıtıldı!
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

      {/* Button */}
      <div className="mt-4">
        <button
          onClick={isSuccess ? () => { reset(); } : handleDeploy}
          disabled={isDisabled}
          className="w-full rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isWaitingWallet || isConfirming ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-zinc-500 border-t-zinc-200 animate-spin" />
              {buttonLabel}
            </span>
          ) : (
            buttonLabel
          )}
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              Arc Quest Dashboard
            </span>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Görevler</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Arc Testnet üzerinde görevleri tamamla ve ekosistemi keşfet.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Faucet Card */}
          <div className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-zinc-700">
            <span className="inline-flex items-center rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs font-medium text-zinc-400 mb-4 w-fit">
              Başlangıç
            </span>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-zinc-100 mb-1">
                Test Token Al
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Circle Faucet üzerinden test USDC alın.
              </p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => window.open("https://faucet.circle.com/", "_blank")}
                className="w-full rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
              >
                Faucet&apos;e Git
              </button>
            </div>
          </div>

          {/* Deploy Card */}
          <DeployCard />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto text-xs text-zinc-600 text-center">
          Arc Testnet — Chain ID 573
        </div>
      </footer>
    </div>
  );
}
