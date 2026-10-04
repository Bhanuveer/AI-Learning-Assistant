import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Icon from "./icons";
import ThemeToggle from "./ThemeToggle";
import useAsync from "../hooks/useAsync";
import { getProfile } from "../services/profileService";

const STUDY_PATHS = ["/chat", "/summary", "/notes", "/quiz"];

const GROUPS = [
    {
        label: "Learn",
        items: [
            { to: "/dashboard", label: "Home", icon: "home" },
            { to: "/chat", label: "Study", icon: "study", match: STUDY_PATHS }
        ]
    },
    {
        label: "Understand",
        items: [
            { to: "/intelligence", label: "Learner overview", icon: "overview" },
            { to: "/skill-gaps", label: "Skill gaps", icon: "gaps" },
            { to: "/skill-evidence", label: "Skill evidence", icon: "evidence" },
            { to: "/analytics", label: "Quiz analytics", icon: "analytics" }
        ]
    },
    {
        label: "Career",
        items: [
            { to: "/career", label: "Career roadmap", icon: "career" }
        ]
    }
];

export function PageHeader({ eyebrow, title, subtitle, actions }) {

    return (
        <header className="li-page-head">
            <div>
                {eyebrow && <div className="li-eyebrow">{eyebrow}</div>}
                <h1>{title}</h1>
                {subtitle && <p className="li-muted">{subtitle}</p>}
            </div>
            {actions}
        </header>
    );
}

function AppShell({ children }) {

    const navigate = useNavigate();
    const { pathname } = useLocation();
    const profile = useAsync(getProfile);

    const name = profile.data?.name || "";

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div className="li-shell">

            <aside className="li-side">

                <Link to="/dashboard" className="li-brand">
                    <div className="li-brand-mark">L</div>
                    <div>
                        <strong>Learning Assistant</strong>
                        <span>Adaptive learning &amp; careers</span>
                    </div>
                </Link>

                <nav>
                    {GROUPS.map((group) => (
                        <div className="li-nav-group" key={group.label}>
                            <div className="li-nav-label">{group.label}</div>
                            {group.items.map((item) => {
                                const active = item.match
                                    ? item.match.includes(pathname)
                                    : pathname === item.to;
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        className={active ? "li-nav li-nav-active" : "li-nav"}
                                    >
                                        <Icon name={item.icon} />
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="li-user">
                    <div className="li-avatar">{(name || "?").charAt(0).toUpperCase()}</div>
                    <div>
                        <div className="li-user-name">{name || "Signed in"}</div>
                        <button className="li-link-btn" onClick={logout}>Log out</button>
                    </div>
                    <ThemeToggle />
                </div>

            </aside>

            <main className="li-main">
                <div className="li-content">{children}</div>
            </main>

        </div>
    );
}

export default AppShell;
