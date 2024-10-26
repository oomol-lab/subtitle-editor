import type { DependencyList, EffectCallback } from "react";
import { useEffect, useLayoutEffect } from "react";

export const useIsomorphicLayoutEffect = (
  effect: EffectCallback,
  deps?: DependencyList,
): void => {
  const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
  return useIsoLayoutEffect(effect, deps);
};
