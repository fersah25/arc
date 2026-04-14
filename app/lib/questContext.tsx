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

// ─── localStorage yardımcıları ────────────────────────────────────────────────
const LS_KEY = "arc_quest_today";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // "2026-04-14"
}

function readToday(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw) as { date: string; count: number };
    // Gün değiştiyse sıfırla
    return date === todayStr() ? count : 0;
  } catch {
    return 0;
  }
}

function writeToday(count: number): void {
  localStorage.setItem(LS_KEY, JSON.stringify({ date: todayStr(), count }));
}

// ─── Provider ────────────────────────────────────────────────────────────────
// chainTotal: Home'dan gelen zincir verisi (NFT sayısı + isim bayrağı)
// totalSiteInteractions = max(chainTotal, sessionTotal)
//   - Kullanıcı yeni oturumda cüzdanı bağlarsa zincir değerini gösterir.
//   - Bu oturumda yaptığı ekstra GM gönderimleri de eklenir.
export function QuestProvider({
  children,
  chainTotal = 0,
}: {
  children: React.ReactNode;
  chainTotal?: number;
}) {
  const [sessionTotal, setSessionTotal] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

  // Client-only: localStorage'ı hydrate et
  useEffect(() => {
    setTodayCount(readToday());
  }, []);

  const increment = useCallback(() => {
    setSessionTotal((p) => p + 1);
    setTodayCount((p) => {
      const next = p + 1;
      writeToday(next);
      return next;
    });
  }, []);

  const value = useMemo<QuestStats>(
    () => ({
      // Zincir değeri > session değerinden büyükse (eski işlemler) onu göster;
      // GM gibi zincirde görünmeyen işlemler sessionTotal'ı yükseltir.
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
