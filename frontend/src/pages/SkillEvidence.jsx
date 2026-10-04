import { useMemo, useState } from "react";
import AppShell, { PageHeader } from "../components/AppShell";
import { Card, Meter, Empty, Loading, StatusBadge } from "../components/ui";
import { pct } from "../components/uiHelpers";
import useAsync from "../hooks/useAsync";
import {
    getSkillEvidence, getPracticalTasks, submitPractical
} from "../services/skillEvidenceService";

function Component({ label, value }) {
    return (
        <div className="li-row">
            <span className="li-row-label" style={{ width: 90 }}>{label}</span>
            <Meter value={value ?? 0} color={value === null ? "var(--bar-muted)" : "var(--accent)"} />
            <span className="li-row-value">{pct(value)}</span>
        </div>
    );
}

function SkillEvidence() {

    const evidence = useAsync(getSkillEvidence);
    const tasks = useAsync(getPracticalTasks);

    const [chosenTask, setChosenTask] = useState("");
    const [drafts, setDrafts] = useState({});
    const [result, setResult] = useState(null);
    const [running, setRunning] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const taskList = useMemo(() => tasks.data?.tasks ?? [], [tasks.data]);
    const task = taskList.find((t) => t.id === chosenTask) ?? taskList[0];
    const taskId = task?.id ?? "";
    const code = drafts[taskId] ?? task?.starter ?? "";

    const choose = (id) => {
        setChosenTask(id);
        setResult(null);
        setSubmitError("");
    };

    const submit = async () => {
        setRunning(true);
        setSubmitError("");
        try {
            setResult(await submitPractical(taskId, code));
            evidence.reload();
        } catch (e) {
            setSubmitError(e?.response?.data?.detail || "Submission failed");
        } finally {
            setRunning(false);
        }
    };

    return (
        <AppShell>
            <PageHeader eyebrow="Understand" title="Skill evidence" subtitle="Demonstrated skill inside this app: knowledge and quiz results combined with practical tasks." />
            <p className="li-notice">
                Skill Evidence is not a professional certification. Practical tasks run in a prototype
                evaluator (isolated process with time limits); it is not a hardened sandbox.
            </p>

            <div className="li-grid">

                <div className="li-span-12">
                    {evidence.loading || evidence.error
                        ? <Loading error={evidence.error} />
                        : evidence.data.skills.length === 0
                            ? <Empty>No evidence yet. Take a quiz or complete a practical task below.</Empty>
                            : (
                                <div className="li-grid">
                                    {evidence.data.skills.map((s) => (
                                        <Card
                                            key={s.skill}
                                            className="li-span-4"
                                            title={s.skill}
                                            subtitle={s.basis}
                                            action={<StatusBadge status={s.level} />}
                                        >
                                            <div className="li-kpi-value">{pct(s.evidence_score)}</div>
                                            <Component label="Knowledge" value={s.knowledge} />
                                            <Component label="Quiz" value={s.quiz} />
                                            <Component label="Practical" value={s.practical} />
                                        </Card>
                                    ))}
                                </div>
                            )}
                    <p className="li-muted li-mt-8">
                        Evidence score weights knowledge 40%, quiz 20% and practical 40%, using only the components available.
                        Without a practical task a skill stays "unverified".
                    </p>
                </div>

                <Card className="li-span-12" title="Practical task" subtitle="Write the function and submit it against test cases.">
                    {tasks.loading || tasks.error ? <Loading error={tasks.error} /> : (
                        <>
                            <select className="li-select" value={taskId} onChange={(e) => choose(e.target.value)}>
                                {taskList.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.skill} · {t.title} ({t.difficulty})
                                    </option>
                                ))}
                            </select>

                            {task && (
                                <>
                                    <p className="li-prompt">{task.prompt}</p>
                                    <p className="li-muted li-mb-8">
                                        Allowed imports: math, itertools, collections, functools, heapq, bisect, re, string, statistics.
                                    </p>
                                    <textarea
                                        className="li-textarea"
                                        value={code}
                                        spellCheck={false}
                                        onChange={(e) => setDrafts({ ...drafts, [taskId]: e.target.value })}
                                    />
                                    <div style={{ marginTop: 10 }}>
                                        <button className="li-btn" onClick={submit} disabled={running}>
                                            {running ? "Running tests…" : "Submit for evaluation"}
                                        </button>
                                    </div>
                                </>
                            )}

                            {submitError && <p className="li-error li-mt-12">{submitError}</p>}

                            {result && (
                                <div style={{ marginTop: 14 }}>
                                    <strong className={result.verdict === "Passed" ? "li-pass" : "li-fail"}>
                                        {result.verdict}: {result.passed}/{result.total} tests · score {result.score}%
                                    </strong>
                                    {result.perf_ok === false && (
                                        <p className="li-reason">Correct output but too slow on the large input (efficiency 20% not awarded).</p>
                                    )}
                                    {result.error && <p className="li-error li-mt-8">{result.error}</p>}
                                    {result.sample_failures.map((f, i) => (
                                        <p className="li-reason" key={i}>
                                            Input <code>{JSON.stringify(f.input)}</code> expected <code>{JSON.stringify(f.expected)}</code>, got{" "}
                                            <code>{f.error || f.got}</code>
                                        </p>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </Card>

                {evidence.data?.recent_submissions?.length > 0 && (
                    <Card className="li-span-12" title="Recent submissions">
                        <table className="li-table">
                            <thead>
                                <tr><th>Task</th><th>Skill</th><th>Tests</th><th>Score</th><th>When</th></tr>
                            </thead>
                            <tbody>
                                {evidence.data.recent_submissions.map((s, i) => (
                                    <tr key={i}>
                                        <td>{s.task_id}</td>
                                        <td>{s.skill}</td>
                                        <td>{s.passed}/{s.total}</td>
                                        <td>{Math.round(s.score * 100)}%</td>
                                        <td>{new Date(s.date).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                )}

            </div>
        </AppShell>
    );
}

export default SkillEvidence;
