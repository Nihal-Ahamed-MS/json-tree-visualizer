import sampleJson from "./sampleJson.json"

export const SIDEBAR_STATE = {
    OPEN: true,
    CLOSED: false
}

export const LOCAL_STORAGE_KEY = {
    JSON_DATA: "JSON_DATA",
    SIDEBAR:  "SIDEBAR"
}

export const DEFAULT_JSON = JSON.stringify(sampleJson, null, 4)
