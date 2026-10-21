import React, { useState, useRef, useCallback } from "react";

const PULL_THRESHOLD = 70;
const MAX_PULL = 100;

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);

  const handleTouchStart = useCallback(
    (e) => {
      if (refreshing || window.scrollY > 0) return;
      startYRef.current = e.touches[0].clientY;
      pullingRef.current = true;
    },
    [refreshing]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!pullingRef.current || refreshing) return;
      const diff = e.touches[0].clientY - startYRef.current;
      if (diff <= 0) {
        setPullDistance(0);
        return;
      }
      const pull = Math.min(diff * 0.5, MAX_PULL);
      setPullDistance(pull);
    },
    [refreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!pullingRef.current) return;
    pullingRef.current = false;
    if (pullDistance >= PULL_THRESHOLD) {
      setRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, onRefresh, refreshing]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {(pullDistance > 0 || refreshing) && (
        <div
          className="flex items-center justify-center overflow-hidden"
          style={{ height: pullDistance }}
        >
          <div
            className={`h-7 w-7 rounded-full border-2 border-slate-200 border-t-indigo-500 ${
              refreshing ? "animate-spin" : ""
            }`}
            style={{ opacity: Math.min(pullDistance / PULL_THRESHOLD, 1) }}
          />
        </div>
      )}
      {children}
    </div>
  );
}