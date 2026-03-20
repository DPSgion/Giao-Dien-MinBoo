import axiosClient from './axiosClient';

const authService = {
    login: (data) => {
        return axiosClient.post('/auth/login', data);
    },
    register: (data) => {
        return axiosClient.post('/auth/register', data);
    },
};

export default authService;
