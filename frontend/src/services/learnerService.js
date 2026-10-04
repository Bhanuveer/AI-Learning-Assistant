import API from "./api";

export const getOverview = async () =>
    (await API.get("/learner/overview")).data;

export const getGaps = async () =>
    (await API.get("/learner/gaps")).data;

export const getNextAction = async (explain = false) =>
    (await API.get("/learner/next-action", {
        params: explain ? { explain: true } : undefined
    })).data;

export const getAssessmentPlan = async () =>
    (await API.get("/assessment/plan")).data;

export const createAdaptiveAssessment = async (fileName) =>
    (await API.post("/assessment/adaptive", {
        file_name: fileName
    })).data;
