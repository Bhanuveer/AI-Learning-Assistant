import { useSyncExternalStore } from "react";

const KEY = "theme";
const listeners = new Set();

const read = () => document.documentElement.dataset.theme === "dark" ? "dark" : "light";

function apply(theme) {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(KEY, theme); } catch { /* private mode */ }
    listeners.forEach((l) => l());
}

// Shared by every toggle on the page, so they stay in sync.
export default function useTheme() {

    const theme = useSyncExternalStore(
        (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
        read
    );

    return { theme, toggle: () => apply(theme === "dark" ? "light" : "dark") };
}
