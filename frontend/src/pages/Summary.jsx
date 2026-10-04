import ReadingPage from "../components/ReadingPage";
import { generateSummary } from "../services/summaryService";

function Summary() {

    return (
        <ReadingPage
            label="Summary"
            generate={generateSummary}
            field="summary"
        />
    );
}

export default Summary;
