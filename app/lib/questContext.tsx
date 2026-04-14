"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// ─── Tipler ──────────────────────────────────────────────────────────────────
interface QuestStats {
  totalSiteInteractions: number;
  todaySiteInteractions: number;
  increment: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────
const QuestContext = createContext<QuestStats>({
  totalSiteInteractions: 0,
  todaySiteInteractions: 0,
  increment: () => {},
});

// ─── localStorage yardımcıları (adrese özel) ──────────────────────────────────
function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function lsKey(address: string): string {
  return `arc_quest_daily_${address.toLowerCase()}_${todayStr()}`;
}

function readToday(address: string): number {
  if (typeof window === "undefined" || !address) return 0;
  try {
    const raw = localStorage.getItem(lsKey(address));
    return raw ? (JSON.parse(raw) as number) : 0;
  } catch {
    return 0;
  }
}

function writeToday(address: string, count: number): void {
  if (!address) return;
  localStorage.setItem(lsKey(address), JSON.stringify(count));
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function QuestProvider({
  children,
  address,
  chainTotal = 0,
}: {
  children: React.ReactNode;
  address?: string;          // Wagmi'den gelen bağlı cüzdan adresi
  chainTotal?: number;       // NFT sayısı + isim bayrağı (zincirden)
}) {
  const [sessionTotal, setSessionTotal] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

  // Adres değiştiğinde (yeni cüzdan veya disconnect) state'i yenile
  useEffect(() => {
    if (!address) {
      // Cüzdan bağlantısı kesildi — sıfırla
      setSessionTotal(0);
      setTodayCount(0);
      return;
    }
    // Yeni cüzdanın bugünkü verisini yükle
    setSessionTotal(0);
    setTodayCount(readToday(address));
  }, [address]);

  const increment = useCallback(() => {
    if (!address) return;
    setSessionTotal((p) => p + 1);
    setTodayCount((p) => {
      const next = p + 1;
      writeToday(address, next);
      return next;
    });
  }, [address]);

  const value = useMemo<QuestStats>(
    () => ({
      totalSiteInteractions: Math.max(chainTotal, sessionTotal),
      todaySiteInteractions: todayCount,
      increment,
    }),
    [chainTotal, sessionTotal, todayCount, increment]
  );

  return <QuestContext.Provider value={value}>{children}</QuestContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useQuestStats(): QuestStats {
  return useContext(QuestContext);
}
