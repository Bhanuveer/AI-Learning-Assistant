import { useCallback, useEffect, useState } from "react";

// Loads data on mount and whenever `loader` changes. reload() refreshes quietly
// (keeps current data on screen); errors become a readable message.
export default function useAsync(loader) {

    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const run = useCallback(async (showLoading) => {

        if (showLoading) setLoading(true);

        try {
            setData(await loader());
            setError("");
        } catch (e) {
            setError(
                e?.response?.data?.detail
                || "Could not load data. Is the backend running?"
            );
        } finally {
            setLoading(false);
        }

    }, [loader]);

    useEffect(() => {
        // Fetch-on-mount; state is only changed by the request lifecycle.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        run(true);
    }, [run]);

    const reload = useCallback(() => run(false), [run]);

    return { data, error, loading, reload };
}
