import API from "./api";

export const getSkillEvidence = async () =>
    (await API.get("/skill-evidence")).data;

export const getPracticalTasks = async (skill) =>
    (await API.get("/skill-evidence/tasks", {
        params: skill ? { skill } : undefined
    })).data;

export const submitPractical = async (taskId, code) =>
    (await API.post("/skill-evidence", {
        task_id: taskId,
        code
    })).data;
