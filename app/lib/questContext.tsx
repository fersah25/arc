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
  // chainNftCount + localExtra (kalıcı, sayfa yenilemesine dayanıklı)
  totalSiteInteractions: number;
  // Bugünkü tüm görev sayısı (adres + tarih bazlı)
  todaySiteInteractions: number;
  // NFT dışı görevler (GMGM, İsim) → extra + daily artırır
  incrementOffChain: () => void;
  // NFT mint → sadece daily artırır (toplam zincirden okunur)
  incrementOnChain: () => void;
}

const QuestContext = createContext<QuestStats>({
  totalSiteInteractions: 0,
  todaySiteInteractions: 0,
  incrementOffChain: () => {},
  incrementOnChain: () => {},
});

// ─── localStorage key'leri ────────────────────────────────────────────────────
function extraKey(address: string) {
  return `arc_quest_extra_${address.toLowerCase()}`;
}

function dailyKey(address: string) {
  const today = new Date().toISOString().slice(0, 10);
  return `arc_quest_daily_${address.toLowerCase()}_${today}`;
}

// ─── Okuma / yazma yardımcıları ───────────────────────────────────────────────
function readNum(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as number) : 0;
  } catch {
    return 0;
  }
}

function writeNum(key: string, value: number) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Provider ────────────────────────────────────────────────────────────────
// chainNftCount : NFT kontratından gelen sayı (wagmi refetch ile güncellenir)
// totalSiteInteractions = chainNftCount + localExtra
export function QuestProvider({
  children,
  address,
  chainNftCount = 0,
}: {
  children: React.ReactNode;
  address?: string;
  chainNftCount?: number;
}) {
  const [localExtra, setLocalExtra] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);

  // Adres değişince (yeni cüzdan veya disconnect) ilgili localStorage'ı yükle
  useEffect(() => {
    if (!address) {
      setLocalExtra(0);
      setDailyCount(0);
      return;
    }
    setLocalExtra(readNum(extraKey(address)));
    setDailyCount(readNum(dailyKey(address)));
  }, [address]);

  // GMGM veya İsim Görevi: ekstra + günlük artır
  const incrementOffChain = useCallback(() => {
    if (!address) return;
    setLocalExtra((prev) => {
      const next = prev + 1;
      writeNum(extraKey(address), next);
      return next;
    });
    setDailyCount((prev) => {
      const next = prev + 1;
      writeNum(dailyKey(address), next);
      return next;
    });
  }, [address]);

  // NFT Mint: sadece günlük artır (toplam zincirden okunur)
  const incrementOnChain = useCallback(() => {
    if (!address) return;
    setDailyCount((prev) => {
      const next = prev + 1;
      writeNum(dailyKey(address), next);
      return next;
    });
  }, [address]);

  const value = useMemo<QuestStats>(
    () => ({
      totalSiteInteractions: chainNftCount + localExtra,
      todaySiteInteractions: dailyCount,
      incrementOffChain,
      incrementOnChain,
    }),
    [chainNftCount, localExtra, dailyCount, incrementOffChain, incrementOnChain]
  );

  return <QuestContext.Provider value={value}>{children}</QuestContext.Provider>;
}

export function useQuestStats(): QuestStats {
  return useContext(QuestContext);
}
