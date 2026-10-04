import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, ReferenceLine
} from "recharts";
import AppShell, { PageHeader } from "../components/AppShell";
import { Card, StatusBadge, Empty, Loading } from "../components/ui";
import { STATUS_COLORS, pct } from "../components/uiHelpers";
import useAsync from "../hooks/useAsync";
import { getGaps } from "../services/learnerService";

const TREND_LABEL = {
    improving: "↑ improving",
    declining: "↓ declining",
    steady: "→ steady",
    "not enough data": "not enough data"
};

function TopicList({ topics, empty }) {

    if (!topics.length) {
        return <Empty>{empty}</Empty>;
    }

    return topics.map((t) => (
        <div className="li-row" key={t.topic_key}>
            <span className="li-row-label">{t.topic}</span>
            <span className="li-row-value">{pct(t.mastery)}</span>
            <StatusBadge status={t.status} />
        </div>
    ));
}

function SkillGaps() {

    const { data, error, loading } = useAsync(getGaps);

    return (
        <AppShell>
            <PageHeader eyebrow="Understand" title="Skill gaps" subtitle="Topic performance from your question-level results, with the reason behind each label." />
            {loading || error ? <Loading error={error} /> : !data.has_data
                ? <Empty>No question-level results yet. Take a quiz and your gaps will appear here.</Empty>
                : (
                    <div className="li-grid">

                        <Card
                            className="li-span-12"
                            title="Topic mastery"
                            subtitle={data.thresholds.method}
                        >
                            <ResponsiveContainer width="100%" height={Math.max(220, data.all_topics.length * 34)}>
                                <BarChart data={data.all_topics} layout="vertical" margin={{ left: 20, right: 24 }}>
                                    <CartesianGrid horizontal={false} stroke="var(--grid)" />
                                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                                    <YAxis type="category" dataKey="topic" width={160} interval={0} tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(v) => `${v}%`} />
                                    <ReferenceLine x={data.thresholds.weak_below} stroke="var(--weak)" strokeDasharray="4 4" />
                                    <ReferenceLine x={data.thresholds.needs_practice_below} stroke="var(--practice)" strokeDasharray="4 4" />
                                    <Bar dataKey="mastery" name="Mastery" radius={[0, 4, 4, 0]}>
                                        {data.all_topics.map((t) => (
                                            <Cell key={t.topic_key} fill={STATUS_COLORS[t.status]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <p className="li-muted">
                                Dashed lines: weak below {data.thresholds.weak_below}%, needs practice below {data.thresholds.needs_practice_below}%.
                            </p>
                        </Card>

                        <Card className="li-span-4" title="Weakest topics">
                            <TopicList topics={data.weakest} empty="No topics yet." />
                        </Card>
                        <Card className="li-span-4" title="Strongest topics">
                            <TopicList topics={data.strongest} empty="No topics yet." />
                        </Card>
                        <Card className="li-span-4" title="Needs revision" subtitle="Weak, repeatedly missed, or declining">
                            <TopicList topics={data.needs_revision} empty="Nothing needs revision right now." />
                        </Card>

                        <Card className="li-span-12" title="Why each gap was flagged">
                            {data.gaps.length === 0
                                ? <Empty>No gaps: every tracked topic is at or above the practice threshold.</Empty>
                                : (
                                    <table className="li-table">
                                        <thead>
                                            <tr>
                                                <th>Topic</th>
                                                <th>Status</th>
                                                <th>Trend</th>
                                                <th>Explanation</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.gaps.map((g) => (
                                                <tr key={g.topic_key}>
                                                    <td>
                                                        <strong>{g.topic}</strong>
                                                        <div><span className="li-tag">{g.skill}</span></div>
                                                    </td>
                                                    <td><StatusBadge status={g.status} /></td>
                                                    <td>{TREND_LABEL[g.trend]}</td>
                                                    <td>{g.reason}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                        </Card>

                    </div>
                )}
        </AppShell>
    );
}

export default SkillGaps;
