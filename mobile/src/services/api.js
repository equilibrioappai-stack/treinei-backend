import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Copie a URL atual da aba PORTAS (porta 8000) do Codespace
const BASE_URL = 'https://treinei-backend.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email, senha) => {
  const r = await api.post('/auth/login', { email, senha });
  await AsyncStorage.setItem('access_token', r.data.access_token);
  await AsyncStorage.setItem('usuario', JSON.stringify(r.data.usuario));
  return r.data;
};

export const cadastro = async (dados) => {
  const r = await api.post('/auth/cadastro', dados);
  await AsyncStorage.setItem('access_token', r.data.access_token);
  await AsyncStorage.setItem('usuario', JSON.stringify(r.data.usuario));
  return r.data;
};

export const logout = async () => {
  const token = await AsyncStorage.getItem('access_token');
  try { await api.post('/auth/logout', { token }); } catch {}
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('usuario');
};

export const getPerfil = () => api.get('/usuarios/perfil');
export const getStreak = () => api.get('/usuarios/streak');
export const gerarTreino = (dados) => api.post('/treinos/gerar', dados);
export const getHistorico = () => api.get('/treinos/historico');
export const avaliarTreino = (dados) => api.post('/treinos/avaliar', dados);
export const getDashboard = () => api.get('/dashboard/semanal');
export const listarAparelhos = () => api.get('/aparelhos/');
export const aplicarPerfil = (nome) => api.post(`/aparelhos/perfil/${nome}`);

export default api;