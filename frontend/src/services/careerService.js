import API from "./api";

export const getRoles = async () =>
    (await API.get("/career/roles")).data;

export const getTargetRole = async () =>
    (await API.get("/career/target")).data;

export const setTargetRole = async (role) =>
    (await API.post("/career/target", { role })).data;

export const getRoleGaps = async (role) =>
    (await API.get(`/career/${encodeURIComponent(role)}/gaps`)).data;

export const getRoadmap = async () =>
    (await API.get("/roadmap")).data;

export const completeRoadmapItem = async (itemId) =>
    (await API.post("/roadmap/action/complete", {
        item_id: itemId
    })).data;
