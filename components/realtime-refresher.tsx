"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface RealtimeRefresherProps {
  traderId: string;
}

export default function RealtimeRefresher({ traderId }: RealtimeRefresherProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`trader-${traderId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "traders",
          filter: `id=eq.${traderId}`,
        },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
          filter: `trader_id=eq.${traderId}`,
        },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [traderId, router]);

  return null;
}
