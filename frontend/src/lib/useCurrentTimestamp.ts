import { useState, useEffect } from "react";

export function useCurrentTimestamp(): bigint {
  const [now, setNow] = useState<bigint>(0n);

  useEffect(() => {
    setNow(BigInt(Math.floor(Date.now() / 1000)));
    const timer = setInterval(() => {
      setNow(BigInt(Math.floor(Date.now() / 1000)));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return now;
}
