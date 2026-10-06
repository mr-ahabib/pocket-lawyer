import { useSyncExternalStore } from 'react';

/** Tiny shared UI state (no extra deps): whether the floating tab bar should be hidden. */
let hideTabBar = false;
const subs = new Set<() => void>();

export function setHideTabBar(v: boolean) {
  if (hideTabBar === v) return;
  hideTabBar = v;
  subs.forEach((f) => f());
}

export function useHideTabBar() {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => hideTabBar,
  );
}
