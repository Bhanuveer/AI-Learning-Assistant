import ReadingPage from "../components/ReadingPage";
import { generateNotes } from "../services/notesService";
import { downloadNotes } from "../services/exportService";

const handleDownload = async (fileName) => {

    try {

        const blob = await downloadNotes(fileName);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "notes.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {

        alert(error?.response?.data?.detail || "Something went wrong");

    }
};

function Notes() {

    return (
        <ReadingPage
            label="Study notes"
            generate={generateNotes}
            field="notes"
            extra={(disabled) => (
                <button
                    className="li-btn"
                    disabled={disabled}
                    onClick={() => handleDownload(localStorage.getItem("selected_pdf"))}
                >
                    Download PDF
                </button>
            )}
        />
    );
}

export default Notes;
