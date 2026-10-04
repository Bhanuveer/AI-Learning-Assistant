import { useNavigate } from "react-router-dom";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import { Card, StatusBadge, Meter, Empty } from "./ui";
import { STATUS_COLORS, pct } from "./uiHelpers";
import NextActionCard from "./NextActionCard";

function Kpi({ label, value, note }) {
    return (
        <div className="li-kpi">
            <div className="li-kpi-label">{label}</div>
            <div className="li-kpi-value">{value}</div>
            {note && <div className="li-kpi-note">{note}</div>}
        </div>
    );
}

// Answers: what does the learner know, where are they weak, what next, how close to the target role.
function LearnerOverview({ overview, compact = false, onChange }) {

    const navigate = useNavigate();
    const { state, gaps, next, evidence, career_gap: career, roadmap } = overview;

    const verified = evidence.skills.filter((s) => s.verified).length;
    const topGaps = gaps.gaps.slice(0, 4);
    const roadmapItems = roadmap.items.filter((i) => i.status !== "completed").slice(0, 5);

    return (
        <div>

            <div className="li-kpis">
                <Kpi
                    label="Overall learning progress"
                    value={pct(state.overall_progress)}
                    note={`${state.totals.questions_answered} questions · ${state.totals.quizzes_taken} quizzes`}
                />
                <Kpi
                    label="Skill gaps"
                    value={gaps.gaps.length}
                    note={`${state.totals.topics_tracked} topics tracked`}
                />
                <Kpi
                    label="Skills verified by practice"
                    value={`${verified}/${evidence.skills.length}`}
                    note="Demonstrated in this app"
                />
                <Kpi
                    label={overview.target_role ? `Readiness: ${overview.target_role}` : "Target career"}
                    value={career ? pct(career.readiness) : "–"}
                    note={career ? "Prototype role data" : "Choose a role"}
                />
            </div>

            <div className="li-grid">

                <div className="li-span-8">
                    <NextActionCard next={next} onChange={onChange} />
                </div>

                <Card
                    className="li-span-4"
                    title="Top strengths"
                    subtitle="Topics with the highest scores"
                >
                    {state.strengths.length === 0
                        ? <Empty>Strengths appear after your first quiz.</Empty>
                        : state.strengths.map((s) => (
                            <div className="li-row" key={s.topic}>
                                <span className="li-row-label">{s.topic}</span>
                                <Meter value={s.mastery} color={STATUS_COLORS.Strong} />
                                <span className="li-row-value">{pct(s.mastery)}</span>
                            </div>
                        ))}
                </Card>

                <Card
                    className="li-span-6"
                    title="Knowledge state"
                    subtitle="Mastery by skill, calculated from your answers"
                    action={!compact && (
                        <button className="li-btn li-btn-ghost" onClick={() => navigate("/skill-evidence")}>
                            Skill evidence
                        </button>
                    )}
                >
                    {state.skills.length === 0
                        ? <Empty>No topic-level data yet. Take a quiz to build it.</Empty>
                        : (
                            <ResponsiveContainer width="100%" height={Math.max(150, state.skills.length * 38)}>
                                <BarChart data={state.skills} layout="vertical" margin={{ left: 10, right: 16 }}>
                                    <CartesianGrid horizontal={false} stroke="var(--grid)" />
                                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                                    <YAxis type="category" dataKey="skill" width={120} interval={0} tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(v) => `${v}%`} />
                                    <Bar dataKey="mastery" name="Mastery" radius={[0, 4, 4, 0]}>
                                        {state.skills.map((s) => (
                                            <Cell key={s.skill} fill={STATUS_COLORS[s.status]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                </Card>

                <Card
                    className="li-span-6"
                    title="Skill gaps"
                    subtitle="Weakest topics and why"
                    action={
                        <button className="li-btn li-btn-ghost" onClick={() => navigate("/skill-gaps")}>
                            Details
                        </button>
                    }
                >
                    {topGaps.length === 0
                        ? <Empty>No gaps detected from your current results.</Empty>
                        : topGaps.map((g) => (
                            <div className="li-row" key={g.topic_key}>
                                <span className="li-row-label">{g.topic}</span>
                                <Meter value={g.mastery} color={STATUS_COLORS[g.status]} />
                                <span className="li-row-value">{pct(g.mastery)}</span>
                                <StatusBadge status={g.status} />
                            </div>
                        ))}
                </Card>

                <Card
                    className="li-span-6"
                    title="Career skill gap"
                    subtitle={overview.target_role
                        ? `Required vs demonstrated for ${overview.target_role}`
                        : "Select a target role to compare skills"}
                    action={
                        <button className="li-btn li-btn-ghost" onClick={() => navigate("/career")}>
                            {overview.target_role ? "Open roadmap" : "Choose role"}
                        </button>
                    }
                >
                    {!career
                        ? <Empty>No target career selected.</Empty>
                        : career.skills.slice(0, 5).map((s) => (
                            <div className="li-row" key={s.skill}>
                                <span className="li-row-label">{s.skill}</span>
                                <Meter value={s.current} color={s.gap > 0 ? "var(--practice)" : "var(--strong)"} />
                                <span className="li-row-value">{pct(s.current)}</span>
                                <span className="li-muted">/ {s.required}%</span>
                            </div>
                        ))}
                </Card>

                <Card
                    className="li-span-6"
                    title="Learning roadmap"
                    subtitle="Next steps toward your target role"
                    action={
                        <button className="li-btn li-btn-ghost" onClick={() => navigate("/career")}>
                            Full roadmap
                        </button>
                    }
                >
                    {roadmapItems.length === 0
                        ? <Empty>{roadmap.message || "Roadmap complete or no gaps remain."}</Empty>
                        : roadmapItems.map((i) => (
                            <div className="li-row" key={i.id}>
                                <span className="li-tag">{i.action.replace("_", " ")}</span>
                                <span>{i.title}</span>
                            </div>
                        ))}
                </Card>

                {!compact && (
                    <>
                        <Card
                            className="li-span-4"
                            title="Recent assessment"
                        >
                            {state.recent_assessment
                                ? (
                                    <>
                                        <div className="li-kpi-value">
                                            {pct(state.recent_assessment.percentage)}
                                        </div>
                                        <p className="li-muted">
                                            {state.recent_assessment.file_name}
                                            {state.recent_assessment.difficulty
                                                ? ` · ${state.recent_assessment.difficulty}`
                                                : ""}
                                        </p>
                                    </>
                                )
                                : <Empty>No quiz taken yet.</Empty>}
                        </Card>

                        <Card
                            className="li-span-8"
                            title="Progress trend"
                            subtitle="Score of each quiz attempt"
                        >
                            {state.progress_trend.length < 2
                                ? <Empty>Take at least two quizzes to see a trend.</Empty>
                                : (
                                    <ResponsiveContainer width="100%" height={180}>
                                        <LineChart data={state.progress_trend}>
                                            <CartesianGrid stroke="var(--grid)" />
                                            <XAxis dataKey="attempt" tick={{ fontSize: 12 }} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                            <Tooltip formatter={(v) => `${v}%`} />
                                            <Line type="monotone" dataKey="percentage" stroke="var(--accent)" strokeWidth={2} dot />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                        </Card>
                    </>
                )}

            </div>
        </div>
    );
}

export default LearnerOverview;
