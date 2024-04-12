import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_DHIS2_API_URL,
    auth: {
        username: import.meta.env.VITE_DHIS2_USERNAME,
        password: import.meta.env.VITE_DHIS2_PASSWORD,
    },
});

export default axiosInstance;
