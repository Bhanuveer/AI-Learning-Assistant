import AppShell, { PageHeader } from "../components/AppShell";
import LearnerOverview from "../components/LearnerOverview";
import { Loading } from "../components/ui";
import useAsync from "../hooks/useAsync";
import { getOverview } from "../services/learnerService";

function LearnerIntelligence() {

    const { data, error, loading, reload } = useAsync(getOverview);

    return (
        <AppShell>
            <PageHeader eyebrow="Understand" title="Learner overview" subtitle="What you know, where you are weak, what to do next, and how close you are to your target role." />
            {loading || error
                ? <Loading error={error} />
                : <LearnerOverview overview={data} onChange={reload} />}
        </AppShell>
    );
}

export default LearnerIntelligence;
