export const STATUS_COLORS = {
    Weak: "var(--weak)",
    "Needs Practice": "var(--practice)",
    Good: "var(--good)",
    Strong: "var(--strong)"
};

export const pct = (v) =>
    v === null || v === undefined ? "–" : `${Math.round(v)}%`;
