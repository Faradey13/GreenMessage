import axios from "axios";

export const API_URL = `https://1103.api.green-api.com/`
const $api = axios.create({
    baseURL: API_URL,

})

$api.interceptors.request.use((config) => {
    config.headers["Content-Type"] = "application/json";
    return config
})

export default $api