
import axios from 'axios';

import BaseUrl from '../../constants/BaseURL';

export const sendRequest = (senderId, receiverId, content) =>
    axios.post(BaseUrl, { senderId, receiverId, content });

export const respondRequest = (id, status) =>
    axios.put(`${BaseUrl}/${id}/status?status=${status}`);

export const getReceivedRequests = (receiverId) =>
    axios.get(`${BaseUrl}/received/${receiverId}`);

export const getSentRequests = (senderId) =>
    axios.get(`${BaseUrl}/sent/${senderId}`);
