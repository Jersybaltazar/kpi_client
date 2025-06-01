import axios from 'axios';
import { CTQCreationRequest, CTQResponse, Process, StudyRequest } from '../types.ts'; 
import {  StudyResponse } from '../types.ts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL, // URL de tu backend FastAPI
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- CTQ API ---
export const defineCtq = async (data: CTQCreationRequest): Promise<CTQResponse> => {
  const response = await apiClient.post<CTQResponse>('/ctqs', data);
  return response.data;
};

export const fetchCtqById = async (ctqId: string): Promise<CTQResponse> => {
  const response = await apiClient.get<CTQResponse>(`/ctqs/${ctqId}`);
  return response.data;
};

// Obtener todos los CTQs
export const fetchCtqs = async (): Promise<CTQResponse[]> => {
  const response = await apiClient.get<CTQResponse[]>('/ctqs');
  return response.data;
};


// --- Study API ---
export const createStudy = async (ctqId: string, data: StudyRequest): Promise<StudyResponse> => {
  // Usar apiClient en lugar de axios directamente para aprovechar la baseURL
  const response = await apiClient.post<StudyResponse>(`/ctqs/${ctqId}/studies`, data);
  return response.data;
};

// Añadir esta función a tu archivo de API existente
export const fetchProcesses = async (): Promise<Process[]> => {
  const response = await apiClient.get<Process[]>('/processes');
  return response.data;
};