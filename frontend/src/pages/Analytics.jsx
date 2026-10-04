import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import AppShell, { PageHeader } from "../components/AppShell";
import { Card, Empty, Loading } from "../components/ui";
import useAsync from "../hooks/useAsync";
import { getAnalytics } from "../services/analyticsService";

const load = () => getAnalytics();

function Analytics() {

    const { data, error, loading } = useAsync(load);

    return (
        <AppShell>
            <PageHeader
                eyebrow="History"
                title="Quiz analytics"
                subtitle="Raw scores across all your quizzes. For what the scores mean topic by topic, see Skill gaps."
            />

            {loading || error ? <Loading error={error} /> : data.total_quizzes === 0
                ? <Empty>No quizzes taken yet.</Empty>
                : (
                    <>
                        <div className="li-kpis">
                            <div className="li-kpi"><div className="li-kpi-label">Quizzes taken</div><div className="li-kpi-value">{data.total_quizzes}</div></div>
                            <div className="li-kpi"><div className="li-kpi-label">Average score</div><div className="li-kpi-value">{data.average_score}%</div></div>
                            <div className="li-kpi"><div className="li-kpi-label">Best score</div><div className="li-kpi-value">{data.best_score}%</div></div>
                        </div>

                        <div className="li-grid">
                            <Card className="li-span-8" title="Score trend" subtitle="Percentage on each attempt, oldest to newest">
                                <ResponsiveContainer width="100%" height={240}>
                                    <LineChart data={data.history}>
                                        <CartesianGrid stroke="var(--grid)" />
                                        <XAxis dataKey="attempt" tick={{ fontSize: 12 }} />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                        <Tooltip formatter={(v) => `${v}%`} />
                                        <Line type="monotone" dataKey="percentage" stroke="var(--accent)" strokeWidth={2} dot />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>

                            <Card className="li-span-4" title="Recent attempts">
                                {[...data.recent_attempts].reverse().map((a, i) => (
                                    <div className="li-row" key={i}>
                                        <span style={{ flex: 1 }}>{a.file_name}</span>
                                        <strong>{a.score}/{a.total}</strong>
                                    </div>
                                ))}
                            </Card>
                        </div>
                    </>
                )}
        </AppShell>
    );
}

export default Analytics;
