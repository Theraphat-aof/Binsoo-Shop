// src/services/adminProductService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (token) {
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

const adminProductService = {
    createFlavor: async (flavorData) => { 
        const headers = getAuthHeaders();
        const response = await axios.post(`${API_BASE_URL}/flavors`, flavorData, { headers });
        return response.data;
    },
    getAllFlavors: async (params) => { 
        const headers = getAuthHeaders();
        const response = await axios.get(`${API_BASE_URL}/flavors`, {
            headers: headers, 
            params: params   
        });
        return response.data;
    },
    getFlavorById: async (id) => {
        const headers = getAuthHeaders();
        const response = await axios.get(`${API_BASE_URL}/flavors/${id}`, { headers });
        return response.data;
    },
    updateFlavor: async (id, flavorData) => { 
        const headers = getAuthHeaders();
        const response = await axios.put(`${API_BASE_URL}/flavors/${id}`, flavorData, { headers });
        return response.data;
    },
    deleteFlavor: async (id) => {
        const headers = getAuthHeaders();
        const response = await axios.delete(`${API_BASE_URL}/flavors/${id}`, { headers });
        return response.data;
    },

    createSize: async (sizeData) => {
        const headers = getAuthHeaders();
        const response = await axios.post(`${API_BASE_URL}/sizes`, sizeData, { headers });
        return response.data;
    },
    getAllSizes: async (params) => {
        const headers = getAuthHeaders();
        const response = await axios.get(`${API_BASE_URL}/sizes`, {
            headers: headers, 
            params: params    
        });
        return response.data;
    },
    getSizeById: async (id) => {
        const headers = getAuthHeaders();
        const response = await axios.get(`${API_BASE_URL}/sizes/${id}`, { headers });
        return response.data;
    },
    updateSize: async (id, sizeData) => {
        const headers = getAuthHeaders();
        const response = await axios.put(`${API_BASE_URL}/sizes/${id}`, sizeData, { headers });
        return response.data;
    },
    deleteSize: async (id) => {
        const headers = getAuthHeaders();
        const response = await axios.delete(`${API_BASE_URL}/sizes/${id}`, { headers });
        return response.data;
    },

    createTopping: async (toppingData) => { 
        const headers = getAuthHeaders();
        const response = await axios.post(`${API_BASE_URL}/toppings`, toppingData, { headers });
        return response.data;
    },
    getAllToppings: async (params) => {
        const headers = getAuthHeaders();
        const response = await axios.get(`${API_BASE_URL}/toppings`, {
            headers: headers, 
            params: params    
        });
        return response.data;
    },
    getToppingById: async (id) => {
        const headers = getAuthHeaders();
        const response = await axios.get(`${API_BASE_URL}/toppings/${id}`, { headers });
        return response.data;
    },
    updateTopping: async (id, toppingData) => { 
        const headers = getAuthHeaders();
        const response = await axios.put(`${API_BASE_URL}/toppings/${id}`, toppingData, { headers });
        return response.data;
    },
    deleteTopping: async (id) => {
        const headers = getAuthHeaders();
        const response = await axios.delete(`${API_BASE_URL}/toppings/${id}`, { headers });
        return response.data;
    },
};

export default adminProductService;