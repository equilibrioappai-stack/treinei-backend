import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, cadastro, logout } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function carregarUsuario() {
    try {
      const dados = await AsyncStorage.getItem('usuario');
      if (dados) setUsuario(JSON.parse(dados));
    } catch {}
    setCarregando(false);
  }

  async function entrar(email, senha) {
    const dados = await login(email, senha);
    setUsuario(dados.usuario);
    await AsyncStorage.setItem('usuario', JSON.stringify(dados.usuario));
    return dados;
  }

  async function registrar(dados) {
    const r = await cadastro(dados);
    setUsuario(r.usuario);
    await AsyncStorage.setItem('usuario', JSON.stringify(r.usuario));
    return r;
  }

  async function atualizarUsuario(novosDados) {
    const atualizado = { ...usuario, ...novosDados };
    setUsuario(atualizado);
    await AsyncStorage.setItem('usuario', JSON.stringify(atualizado));
  }

  async function sair() {
    await logout();
    await AsyncStorage.removeItem('usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, registrar, sair, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}