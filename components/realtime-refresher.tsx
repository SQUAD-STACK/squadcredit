"use client";

import { useEffect, useRef, useCallback, startTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface RealtimeRefresherProps {
  traderId: string;
}

export default function RealtimeRefresher({ traderId }: RealtimeRefresherProps) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce so that rapid back-to-back events (traders UPDATE followed
  // immediately by transactions INSERT) collapse into one refresh after all
  // DB writes have settled. startTransition is required by Next.js App Router
  // for router.refresh() to work correctly from async event handlers.
  const scheduleRefresh = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      startTransition(() => {
        router.refresh();
      });
    }, 600);
  }, [router]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`trader-${traderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "traders", filter: `id=eq.${traderId}` },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions", filter: `trader_id=eq.${traderId}` },
        scheduleRefresh
      )
      .subscribe();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      supabase.removeChannel(channel);
    };
  }, [traderId, scheduleRefresh]);

  return null;
}
