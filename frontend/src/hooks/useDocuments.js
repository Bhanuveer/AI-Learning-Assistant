import { useEffect, useState } from "react";
import useAsync from "./useAsync";
import { getDocuments } from "../services/documentService";

const KEY = "selected_pdf";

const loadNames = async () =>
    (await getDocuments()).documents.map((d) => d.file_name);

// The selected PDF lives in localStorage (the app's existing contract); this
// hook keeps the list and the selection in sync.
export default function useDocuments() {

    const docs = useAsync(loadNames);
    const [chosen, setChosen] = useState(() => localStorage.getItem(KEY));

    const names = docs.data ?? [];
    const selected = names.includes(chosen) ? chosen : names[0] ?? null;

    useEffect(() => {
        if (selected) localStorage.setItem(KEY, selected);
    }, [selected]);

    return {
        documents: names,
        selected,
        select: setChosen,
        loading: docs.loading,
        error: docs.error,
        reload: docs.reload
    };
}
