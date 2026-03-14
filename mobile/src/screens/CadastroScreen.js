import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function CadastroScreen({ navigation }) {
  const [dados, setDados] = useState({
    nome: '', email: '', senha: '',
    objetivo: 'hipertrofia', nivel: 'iniciante',
  });
  const [carregando, setCarregando] = useState(false);
  const { registrar } = useAuth();

  function atualizar(campo, valor) {
    setDados(d => ({ ...d, [campo]: valor }));
  }

  async function handleCadastro() {
    if (!dados.nome || !dados.email || !dados.senha) {
      Alert.alert('Atenção', 'Preencha nome, email e senha.');
      return;
    }
    setCarregando(true);
    try {
      await registrar(dados);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível criar a conta. Tente outro email.');
    }
    setCarregando(false);
  }

  const BotaoOpcao = ({ campo, valor, label }) => (
    <TouchableOpacity
      style={[styles.opcao, dados[campo] === valor && styles.opcaoAtiva]}
      onPress={() => atualizar(campo, valor)}
    >
      <Text style={[styles.opcaoTexto, dados[campo] === valor && styles.opcaoTextoAtivo]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0D1117' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Criar conta</Text>
        <Text style={styles.sub}>Vamos personalizar seus treinos</Text>

        <TextInput style={styles.input} placeholder="Nome completo"
          placeholderTextColor="#888" value={dados.nome}
          onChangeText={v => atualizar('nome', v)} />

        <TextInput style={styles.input} placeholder="Email"
          placeholderTextColor="#888" value={dados.email}
          onChangeText={v => atualizar('email', v)}
          keyboardType="email-address" autoCapitalize="none" />

        <TextInput style={styles.input} placeholder="Senha"
          placeholderTextColor="#888" value={dados.senha}
          onChangeText={v => atualizar('senha', v)} secureTextEntry />

        <Text style={styles.label}>Objetivo</Text>
        <View style={styles.opcoes}>
          <BotaoOpcao campo="objetivo" valor="hipertrofia" label="💪 Hipertrofia" />
          <BotaoOpcao campo="objetivo" valor="emagrecimento" label="🔥 Emagrecer" />
          <BotaoOpcao campo="objetivo" valor="forca" label="🏋️ Força" />
        </View>

        <Text style={styles.label}>Nível</Text>
        <View style={styles.opcoes}>
          <BotaoOpcao campo="nivel" valor="iniciante" label="🌱 Iniciante" />
          <BotaoOpcao campo="nivel" valor="intermediario" label="⚡ Intermediário" />
          <BotaoOpcao campo="nivel" valor="avancado" label="🔥 Avançado" />
        </View>

        <TouchableOpacity
          style={styles.botao} onPress={handleCadastro} disabled={carregando}
        >
          {carregando
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.botaoTexto}>CRIAR CONTA</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Já tem conta? <Text style={styles.linkVerde}>Entrar</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  sub: { fontSize: 14, color: '#888', marginBottom: 32 },
  input: {
    backgroundColor: '#1E2B3C', borderRadius: 12, padding: 16,
    color: '#fff', fontSize: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#2A3F55',
  },
  label: { color: '#888', fontSize: 14, marginBottom: 10, marginTop: 4 },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  opcao: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: '#2A3F55',
    backgroundColor: '#1E2B3C',
  },
  opcaoAtiva: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
  opcaoTexto: { color: '#888', fontSize: 14 },
  opcaoTextoAtivo: { color: '#000', fontWeight: 'bold' },
  botao: {
    backgroundColor: '#1DB954', borderRadius: 12,
    padding: 16, alignItems: 'center', marginBottom: 16, marginTop: 8,
  },
  botaoTexto: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#888', fontSize: 14, textAlign: 'center' },
  linkVerde: { color: '#1DB954', fontWeight: 'bold' },
});