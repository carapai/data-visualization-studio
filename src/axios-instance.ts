import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.DHIS2_API_URL,
    auth: {
        username: process.env.DHIS2_USERNAME!,
        password: process.env.DHIS2_PASSWORD!,
    },
});

export default axiosInstance;
