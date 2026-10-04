import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Chat from "../pages/Chat";
import ProtectedRoute from "./ProtectedRoute";
import Summary from "../pages/Summary";
import Notes from "../pages/Notes";
import Quiz from "../pages/Quiz";
import Analytics from "../pages/Analytics";
import LearnerIntelligence from "../pages/LearnerIntelligence";
import SkillGaps from "../pages/SkillGaps";
import CareerRoadmap from "../pages/CareerRoadmap";
import SkillEvidence from "../pages/SkillEvidence";

function AppRoutes() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <Chat />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/summary"
                    element={
                        <ProtectedRoute>
                            <Summary />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/notes"
                    element={
                        <ProtectedRoute>
                            <Notes />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/quiz"
                    element={
                        <ProtectedRoute>
                            <Quiz />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/analytics"
                    element={
                        <ProtectedRoute>
                            <Analytics />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/intelligence"
                    element={
                        <ProtectedRoute>
                            <LearnerIntelligence />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/skill-gaps"
                    element={
                        <ProtectedRoute>
                            <SkillGaps />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/career"
                    element={
                        <ProtectedRoute>
                            <CareerRoadmap />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/skill-evidence"
                    element={
                        <ProtectedRoute>
                            <SkillEvidence />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>

    );
}

export default AppRoutes;