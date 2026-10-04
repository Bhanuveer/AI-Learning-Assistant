const base = {
    width: 17, height: 17, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round"
};

const paths = {
    home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
    study: "M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zM4 19a2 2 0 012-2h13",
    overview: "M4 20V10M10 20V4M16 20v-7M22 20H2",
    gaps: "M12 3v18M3 12h18M7 7l10 10",
    evidence: "M9 12l2 2 4-4M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z",
    analytics: "M3 3v18h18M7 15l4-5 3 3 5-7",
    career: "M4 7h16v12H4zM9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M4 13h16",
    send: "M5 12l14-7-5 14-2-6-7-1z",
    upload: "M12 16V4M7 9l5-5 5 5M4 20h16"
};

export default function Icon({ name, ...rest }) {
    return (
        <svg {...base} {...rest} aria-hidden="true">
            <path d={paths[name]} />
        </svg>
    );
}
