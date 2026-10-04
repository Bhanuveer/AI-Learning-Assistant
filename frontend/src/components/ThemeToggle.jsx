import useTheme from "../hooks/useTheme";

const SUN = "M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6L4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 8a4 4 0 100 8 4 4 0 000-8z";
const MOON = "M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z";

function ThemeToggle({ className = "" }) {

    const { theme, toggle } = useTheme();
    const dark = theme === "dark";

    return (
        <button
            type="button"
            className={`theme-toggle ${className}`}
            onClick={toggle}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            title={dark ? "Light theme" : "Dark theme"}
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={dark ? SUN : MOON} />
            </svg>
        </button>
    );
}

export default ThemeToggle;
