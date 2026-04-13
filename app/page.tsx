"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

const quests = [
  {
    title: "Test Token Al",
    description: "Circle Faucet üzerinden test USDC alın.",
    button: "Faucet'e Git",
    tag: "Başlangıç",
  },
  {
    title: "Kontrat Dağıt",
    description: "Arc Testnet üzerine ilk akıllı kontratını yükle.",
    button: "Deploy Now",
    tag: "Geliştirici",
  },
];

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
        {/* Section title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Görevler</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Arc Testnet üzerinde görevleri tamamla ve ekosistemi keşfet.
          </p>
        </div>

        {/* Quest cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quests.map((quest) => (
            <div
              key={quest.title}
              className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-zinc-700"
            >
              {/* Tag */}
              <span className="inline-flex items-center rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs font-medium text-zinc-400 mb-4 w-fit">
                {quest.tag}
              </span>

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-base font-semibold text-zinc-100 mb-1">
                  {quest.title}
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {quest.description}
                </p>
              </div>

              {/* Button */}
              <div className="mt-6">
                <button
                  disabled
                  className="w-full rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {quest.button}
                </button>
              </div>
            </div>
          ))}
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
