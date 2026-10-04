import { useCallback, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import AppShell, { PageHeader } from "../components/AppShell";
import { Card, Empty, Loading } from "../components/ui";
import { pct } from "../components/uiHelpers";
import useAsync from "../hooks/useAsync";
import {
    getRoles, getTargetRole, setTargetRole, getRoleGaps,
    getRoadmap, completeRoadmapItem
} from "../services/careerService";

function CareerRoadmap() {

    const roles = useAsync(getRoles);
    const target = useAsync(getTargetRole);
    const [chosen, setChosen] = useState(null);
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState("");

    const role = chosen ?? target.data?.role ?? "";

    const loadView = useCallback(async () => {
        if (!role) return null;
        const [g, r] = await Promise.all([getRoleGaps(role), getRoadmap()]);
        return { gaps: g, roadmap: r };
    }, [role]);
    const view = useAsync(loadView);
    const gaps = view.data?.gaps ?? null;
    const roadmap = view.data?.roadmap ?? null;

    const choose = async (name) => {
        setMessage("");
        if (!name) return;
        try {
            await setTargetRole(name);
            setChosen(name);
        } catch (e) {
            setMessage(e?.response?.data?.detail || "Could not save the role");
        }
    };

    const complete = async (item) => {
        setBusy(item.id);
        setMessage("");
        try {
            await completeRoadmapItem(item.id);
            await view.reload();
        } catch (e) {
            setMessage(e?.response?.data?.detail || "Could not update the roadmap");
        } finally {
            setBusy("");
        }
    };

    const chartData = gaps?.skills.map((s) => ({
        skill: s.skill, Required: s.required, Demonstrated: s.current
    }));

    return (
        <AppShell>
            <PageHeader eyebrow="Career" title="Career roadmap" subtitle="Compare your demonstrated skills with a target role and follow a personalised plan." />
            <p className="li-notice">
                {roles.data?.notice || "Prototype data: role requirements are illustrative, not from real job postings."}
            </p>

            {roles.loading || roles.error ? <Loading error={roles.error} /> : (
                <Card title="Target role">
                    <select className="li-select" value={role} onChange={(e) => choose(e.target.value)}>
                        <option value="">Select a role…</option>
                        {roles.data.roles.map((r) => (
                            <option key={r.role} value={r.role}>{r.role}: {r.description}</option>
                        ))}
                    </select>
                </Card>
            )}

            {message && <p className="li-error li-mt-12">{message}</p>}

            {gaps && (
                <div className="li-grid" style={{ marginTop: 16 }}>

                    <Card
                        className="li-span-8"
                        title="Skill gaps for target role"
                        subtitle={`Readiness for ${gaps.role}: ${pct(gaps.readiness)}`}
                    >
                        <ResponsiveContainer width="100%" height={Math.max(220, gaps.skills.length * 48)}>
                            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 16 }}>
                                <CartesianGrid horizontal={false} stroke="var(--grid)" />
                                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                                <YAxis type="category" dataKey="skill" width={130} interval={0} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(v) => `${v}%`} />
                                <Legend />
                                <Bar dataKey="Required" fill="var(--bar-muted)" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="Demonstrated" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card className="li-span-4" title="Gap detail">
                        {gaps.skills.map((s) => (
                            <div className="li-row" key={s.skill}>
                                <span className="li-row-label" style={{ width: 120 }}>{s.skill}</span>
                                <span className="li-muted" style={{ flex: 1 }}>{s.status}</span>
                                <span className="li-row-value" style={{ width: 70 }}>
                                    {pct(s.current)}/{s.required}
                                </span>
                            </div>
                        ))}
                    </Card>

                </div>
            )}

            {roadmap && roadmap.target_role && (
                <Card
                    title="Your roadmap"
                    subtitle={`${roadmap.total_effort_hours} h estimated effort remaining`}
                >
                    {roadmap.items.length === 0
                        ? <Empty>No gaps remain for this role based on current evidence.</Empty>
                        : roadmap.items.map((i) => (
                            <div key={i.id} className={`li-step li-step-${i.status}`}>
                                <div className="li-step-num">{String(i.order).padStart(2, "0")}</div>
                                <div>
                                    <div className="li-step-title">{i.title}</div>
                                    <div>
                                        <span className="li-tag">{i.action.replace("_", " ")}</span>
                                        <span className="li-tag">{i.skill}</span>
                                        <span className="li-tag">~{i.effort_hours} h</span>
                                        <span className="li-tag">{i.status}</span>
                                    </div>
                                    <p className="li-reason">{i.reason}</p>
                                    {i.prerequisite && (
                                        <p className="li-muted">Prerequisite: {i.prerequisite}</p>
                                    )}
                                </div>
                                <div>
                                    {i.status !== "completed" && !i.auto_completes && (
                                        <button
                                            className="li-btn li-btn-ghost"
                                            disabled={busy === i.id}
                                            onClick={() => complete(i)}
                                        >
                                            Mark complete
                                        </button>
                                    )}
                                    {i.auto_completes && i.status !== "completed" && (
                                        <span className="li-muted">Completes when you pass a task</span>
                                    )}
                                </div>
                            </div>
                        ))}
                </Card>
            )}
        </AppShell>
    );
}

export default CareerRoadmap;
