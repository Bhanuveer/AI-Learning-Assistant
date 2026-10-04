import { STATUS_COLORS } from "./uiHelpers";

export function Card({ title, subtitle, action, children, className = "" }) {

    return (
        <section className={`li-card ${className}`}>
            {(title || action) && (
                <header className="li-card-head">
                    <div>
                        <h3>{title}</h3>
                        {subtitle && <p className="li-muted">{subtitle}</p>}
                    </div>
                    {action}
                </header>
            )}
            {children}
        </section>
    );
}

export function StatusBadge({ status }) {

    return (
        <span
            className="li-badge"
            style={{
                color: STATUS_COLORS[status] || "var(--muted)",
                borderColor: STATUS_COLORS[status] || "var(--bar-muted)"
            }}
        >
            {status}
        </span>
    );
}

export function Meter({ value, color = "var(--accent)", label }) {

    const pct = Math.max(0, Math.min(100, value ?? 0));

    return (
        <div className="li-meter" title={label}>
            <div
                className="li-meter-fill"
                style={{ width: `${pct}%`, background: color }}
            />
        </div>
    );
}

export function Empty({ children }) {
    return <p className="li-empty">{children}</p>;
}

export function Loading({ error }) {

    if (error) {
        return <p className="li-error">{error}</p>;
    }

    return <p className="li-muted">Loading…</p>;
}
