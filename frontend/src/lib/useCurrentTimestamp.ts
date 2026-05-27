import { useState, useEffect } from "react";

/**
 * Hook that returns the current Unix timestamp (seconds) as a BigInt.
 * Updates every 30 seconds to stay reasonably current.
 * Avoids calling Date.now() directly during render (React 19 strict rules).
 */
export function useCurrentTimestamp(): bigint {
  const [now, setNow] = useState<bigint>(() =>
    BigInt(Math.floor(Date.now() / 1000)),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(BigInt(Math.floor(Date.now() / 1000)));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return now;
}
