import { deleteAccessToken, deleteRefreshToken, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from "./TokenUtils";
import { HTTP_STATUS } from "../constants/Constants";
import { RequestTypes } from "../enums/RequestType";
import axios from "axios";
import { showToast } from "./ToastUtils";
import { translate } from "./LocalizationUtils";

const BaseURL = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    validateStatus: function (status) {
        //An error of 500 or above is considered an error
        return status < 500;
    }
});

export const request = async ({
    requestType,
    url,
    data,
    headers,
    params,
}) => {

    let res;
    headers ??= {};
    params ??= {};

    const userAccessToken = getAccessToken();

    // Add AccessToken to header
    if (userAccessToken != null && !headers.authorization) {
        headers.authorization = `Bearer ${userAccessToken}`;
    }

    try {
        switch (requestType) {
            case RequestTypes.post:
                res = await BaseURL.post(url, data, { headers, params });
                break;
            case RequestTypes.patch:
                res = await BaseURL.patch(url, data, { headers, params });
                break;
            case RequestTypes.put:
                res = await BaseURL.put(url, data, { headers, params });
                break;
            case RequestTypes.delete:
                res = await BaseURL.delete(url, { headers, params, data });
                break;
            default:
                res = await BaseURL.get(url, { headers, params });
                break;
        }

        // Eğer login, register veya şifre sıfırlama işlemleriyse 401/403 interceptor'ına sokma.
        // Çünkü hatalı şifre denemesinde 401 dönerse direk hatayı sayfaya yansıtmalıyız, sayfayı yenilememeliyiz.
        if (url.includes('/login') || url.includes('/register') || url.includes('/forgot') || url.includes('/reset')) {
            return res;
        }

        if (res.status === HTTP_STATUS.FORBIDDEN || res.status === HTTP_STATUS.UNAUTHORIZED) {
            const refreshToken = getRefreshToken();
            if (refreshToken != null) {
                try {
                    res = await BaseURL.post('/auth/refresh', { refreshToken });
                    
                    if (res.status === HTTP_STATUS.OK && res.data?.success) {
                        const newTokens = res.data.data;
                        if (newTokens?.token) setAccessToken(newTokens.token);
                        if (newTokens?.refreshToken) setRefreshToken(newTokens.refreshToken);
                        
                        headers.authorization = `Bearer ${newTokens?.token || getAccessToken()}`;
                        return await request({ requestType, url, data, headers, params });
                    } else {
                        deleteAccessToken();
                        deleteRefreshToken();
                        window.location.reload();
                    }
                } catch (error) {
                    console.error("Refresh token request failed:", error);
                    showToast(translate("errors.session_expired"), "error");
                }
            } else {
                window.location.reload();
            }
        } else {
            return res;
        }
    } catch (error) {
        if (error.response) {
            // Errors 500 and above
            return error.response;
        }
        return { status: 500, message: "Sunucu hatası oluştu!" };
    }
}
