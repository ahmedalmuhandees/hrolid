import axios from 'axios';

const API_BASE = (
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.PROD
    ? 'https://hrsolid.execute-iq.com'
    : 'http://localhost:5080')
).replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_BASE,
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('token');
  }
}

const saved = localStorage.getItem('token');
if (saved) setAuthToken(saved);

export type LoginResponse = {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: string;
  hasFaceRegistered: boolean;
};

export type WorkLocation = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
};

export type Employee = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  hasFaceRegistered: boolean;
  isActive: boolean;
  createdAt: string;
};

export type Attendance = {
  id: number;
  userId: number;
  employeeName: string;
  checkInAt: string;
  checkOutAt?: string | null;
  checkInLatitude: number;
  checkInLongitude: number;
  checkOutLatitude?: number | null;
  checkOutLongitude?: number | null;
  checkInDistanceMeters: number;
  checkOutDistanceMeters?: number | null;
  checkInFaceMatchScore: number;
  checkOutFaceMatchScore?: number | null;
  checkInProofImageUrl?: string | null;
  checkOutProofImageUrl?: string | null;
  status: string;
  workLocationName?: string | null;
  durationHours?: number | null;
};

export { API_BASE };
