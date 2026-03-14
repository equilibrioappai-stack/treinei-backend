import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { entrar } = useAuth();

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Atencao', 'Preencha email e senha.');
      return;
    }
    setCarregando(true);
    try {
      await entrar(email, senha);
    } catch (e) {
      Alert.alert('Erro', 'Email ou senha incorretos.');
    }
    setCarregando(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.logoBox}>
        <Text style={styles.logoTexto}>T</Text>
      </View>
      <Text style={styles.titulo}>TREINEI</Text>
      <Text style={styles.sub}>Seu personal trainer com IA</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#888"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={handleLogin}
        disabled={carregando}
      >
        {carregando
          ? <ActivityIndicator color="#000" />
          : <Text style={styles.botaoTexto}>ENTRAR</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.link}>Nao tem conta? <Text style={styles.linkVerde}>Cadastre-se</Text></Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0D1117',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  logoBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#1DB954', alignItems: 'center',
    justifyContent: 'center', marginBottom: 16,
  },
  logoTexto: { fontSize: 36, fontWeight: 'bold', color: '#000' },
  titulo: { fontSize: 36, fontWeight: 'bold', color: '#1DB954', marginBottom: 4 },
  sub: { fontSize: 14, color: '#888', marginBottom: 40 },
  input: {
    width: '100%', backgroundColor: '#1E2B3C',
    borderRadius: 12, padding: 16, color: '#fff',
    fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2A3F55',
  },
  botao: {
    width: '100%', backgroundColor: '#1DB954',
    borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16,
  },
  botaoTexto: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#888', fontSize: 14 },
  linkVerde: { color: '#1DB954', fontWeight: 'bold' },
});