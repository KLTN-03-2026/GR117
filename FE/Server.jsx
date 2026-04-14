import axios from "axios";

async function CustomApi({ Url, method = 'GET', data = {}, params = {}, headers = {} }) {
    try {
        const res = await axios({
            url: `${import.meta.env.VITE_API_URL || ""}${Url}`,
            method,
            data,
            params,
            headers,
        });
        return res.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error.response?.data || error;
    }
}

export default CustomApi;