import {
    useState,
    useEffect
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    generateNotes
}
    from "../services/notesService";

import "./Summary.css";

function Notes() {

    const navigate =
        useNavigate();

    const fileName =
        localStorage.getItem(
            "selected_pdf"
        );

    const [notes,
        setNotes] =
        useState("");

    const [loading,
        setLoading] =
        useState(true);

    useEffect(() => {

        fetchNotes();

    }, []);

    const fetchNotes =
        async () => {

            try {

                const response =
                    await generateNotes(
                        fileName
                    );

                setNotes(
                    response.notes
                );

            } catch {

                setNotes(
                    "Failed to generate notes."
                );

            } finally {

                setLoading(false);

            }

        };

    return (

        <div className="summary-container">

            <div className="summary-card">

                <button
                    className="back-btn"
                    onClick={() =>
                        navigate(
                            "/dashboard"
                        )
                    }
                >
                    Back
                </button>

                <h1 className="summary-title">
                    Study Notes
                </h1>

                <p className="summary-file">
                    {fileName}
                </p>

                <div
                    className="summary-content"
                >

                    {
                        loading

                            ?

                            "Generating Notes..."

                            :

                            notes
                    }

                </div>

            </div>

        </div>

    );

}

export default Notes;