import React, { useState, useCallback, useRef } from 'react';

export function useResizableColumns<T extends string>(
  storageKey: string,
  initialWidths: Record<T, number>,
  minWidths: Partial<Record<T, number>> = {}
) {
  const [widths, setWidths] = useState<Record<T, number>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialWidths, ...parsed };
      }
    } catch (e) {}
    return initialWidths;
  });

  const resizingRef = useRef<{ col: T; startX: number; startWidth: number } | null>(null);

  const startResizing = useCallback(
    (col: T, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resizingRef.current = {
        col,
        startX: e.clientX,
        startWidth: widths[col] || initialWidths[col] || 100,
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizingRef.current) return;
        const { col: activeCol, startX, startWidth } = resizingRef.current;
        const delta = moveEvent.clientX - startX;
        const minW = minWidths[activeCol] || 60;
        const newWidth = Math.max(minW, Math.round(startWidth + delta));

        setWidths(prev => ({
          ...prev,
          [activeCol]: newWidth,
        }));
      };

      const handleMouseUp = () => {
        if (resizingRef.current) {
          setWidths(latest => {
            try {
              localStorage.setItem(storageKey, JSON.stringify(latest));
            } catch (e) {}
            return latest;
          });
        }
        resizingRef.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [widths, initialWidths, minWidths, storageKey]
  );

  const resetWidths = useCallback(() => {
    setWidths(initialWidths);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
  }, [initialWidths, storageKey]);

  return { widths, startResizing, resetWidths };
}
