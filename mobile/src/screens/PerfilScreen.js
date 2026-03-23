import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, TextInput
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { aplicarPerfil } from '../services/api';
import api from '../services/api';

export default function PerfilScreen({ navigation }) {
  const { usuario, sair, atualizarUsuario } = useAuth();
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);
  const [perfilAplicado, setPerfilAplicado] = useState(null);
  const [editando, setEditando] = useState(false);
  const [dados, setDados] = useState({
    peso: usuario?.peso?.toString() || '',
    altura: usuario?.altura?.toString() || '',
    idade: usuario?.idade?.toString() || '',
  });

  async function handleAplicarPerfil(nome) {
    setCarregandoPerfil(true);
    try {
      await aplicarPerfil(nome);
      setPerfilAplicado(nome);
      Alert.alert('Sucesso', `Perfil "${nome}" aplicado!`);
    } catch {
      Alert.alert('Erro', 'Nao foi possivel aplicar o perfil.');
    }
    setCarregandoPerfil(false);
  }

  async function handleSalvarDados() {
    try {
      const novosDados = {
        peso: dados.peso ? parseFloat(dados.peso) : null,
        altura: dados.altura ? parseInt(dados.altura) : null,
        idade: dados.idade ? parseInt(dados.idade) : null,
      };
      await api.patch('/usuarios/perfil', novosDados);
      await atualizarUsuario(novosDados);
      setEditando(false);
      Alert.alert('Sucesso', 'Dados salvos!');
    } catch {
      Alert.alert('Erro', 'Nao foi possivel salvar os dados.');
    }
  }

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sair },
    ]);
  }

  const CardInfo = ({ label, valor, campo, unidade }) => (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{label}</Text>
      {editando ? (
        <TextInput
          style={styles.infoInput}
          value={dados[campo]}
          onChangeText={v => setDados(d => ({ ...d, [campo]: v }))}
          keyboardType="numeric"
          placeholder="—"
          placeholderTextColor="#555"
        />
      ) : (
        <Text style={styles.infoValor}>
          {valor ? `${valor}${unidade}` : '—'}
        </Text>
      )}
    </View>
  );

  const BotaoPerfil = ({ nome, label, descricao }) => (
    <TouchableOpacity
      style={[styles.perfilBotao, perfilAplicado === nome && styles.perfilAtivo]}
      onPress={() => handleAplicarPerfil(nome)}
      disabled={carregandoPerfil}
    >
      <View style={styles.perfilTextos}>
        <Text style={[styles.perfilNome, perfilAplicado === nome && styles.perfilNomeAtivo]}>
          {label}
        </Text>
        <Text style={styles.perfilDesc}>{descricao}</Text>
      </View>
      {perfilAplicado === nome && (
        <View style={styles.checkBadge}>
          <Text style={styles.checkTexto}>Ativo</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.voltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Perfil</Text>
      </View>

      <View style={styles.avatarCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarLetra}>
            {usuario?.nome?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.nome}>{usuario?.nome}</Text>
        <Text style={styles.email}>{usuario?.email}</Text>
        <View style={styles.planoBadge}>
          <Text style={styles.planoTexto}>
            {usuario?.plano === 'free' ? 'Plano Free' : 'Plano Premium'}
          </Text>
        </View>
      </View>

      <View style={styles.secaoHeader}>
        <Text style={styles.secaoTitulo}>Meus Dados</Text>
        <TouchableOpacity
          style={editando ? styles.btnSalvar : styles.btnEditar}
          onPress={editando ? handleSalvarDados : () => setEditando(true)}
        >
          <Text style={editando ? styles.btnSalvarTexto : styles.btnEditarTexto}>
            {editando ? 'Salvar' : 'Editar'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoGrid}>
        <CardInfo label="Objetivo" valor={usuario?.objetivo} campo="objetivo" unidade="" />
        <CardInfo label="Nivel" valor={usuario?.nivel} campo="nivel" unidade="" />
        <CardInfo label="Peso" valor={usuario?.peso} campo="peso" unidade="kg" />
        <CardInfo label="Altura" valor={usuario?.altura} campo="altura" unidade="cm" />
        <CardInfo label="Idade" valor={usuario?.idade} campo="idade" unidade=" anos" />
      </View>

      <Text style={styles.secaoTitulo}>Meus Aparelhos</Text>
      <Text style={styles.secaoSub}>Selecione o perfil da sua academia:</Text>

      {carregandoPerfil ? (
        <ActivityIndicator color="#1DB954" style={{ marginVertical: 20 }} />
      ) : (
        <>
          <BotaoPerfil
            nome="academia_completa"
            label="Academia Completa"
            descricao="Supino, Leg Press, Pulley, Smith e mais 8 aparelhos"
          />
          <BotaoPerfil
            nome="academia_basica"
            label="Academia Basica"
            descricao="Halteres, Barra, Leg Press e Pulley"
          />
          <BotaoPerfil
            nome="em_casa"
            label="Em Casa"
            descricao="Halteres, Peso corporal e Elastico"
          />
        </>
      )}

      <TouchableOpacity style={styles.botaoSair} onPress={handleLogout}>
        <Text style={styles.botaoSairTexto}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117', padding: 24 },
  header: { marginTop: 50, marginBottom: 24 },
  voltar: { color: '#1DB954', fontSize: 16, marginBottom: 12 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  avatarCard: {
    backgroundColor: '#1E2B3C', borderRadius: 16,
    padding: 24, alignItems: 'center', marginBottom: 20,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#1DB954', alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  },
  avatarLetra: { fontSize: 36, fontWeight: 'bold', color: '#000' },
  nome: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  email: { fontSize: 13, color: '#888', marginBottom: 12 },
  planoBadge: { backgroundColor: '#0D1117', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  planoTexto: { color: '#1DB954', fontSize: 13, fontWeight: 'bold' },
  secaoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  secaoTitulo: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  secaoSub: { color: '#888', fontSize: 13, marginBottom: 16 },
  btnEditar: { backgroundColor: '#1E2B3C', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: '#2A3F55' },
  btnEditarTexto: { color: '#1DB954', fontSize: 13, fontWeight: 'bold' },
  btnSalvar: { backgroundColor: '#1DB954', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6 },
  btnSalvarTexto: { color: '#000', fontSize: 13, fontWeight: 'bold' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  infoCard: {
    backgroundColor: '#1E2B3C', borderRadius: 12,
    padding: 14, alignItems: 'center', width: '47%',
  },
  infoLabel: { color: '#888', fontSize: 12, marginBottom: 6 },
  infoValor: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  infoInput: {
    color: '#fff', fontSize: 15, fontWeight: 'bold',
    borderBottomWidth: 1, borderBottomColor: '#1DB954',
    paddingVertical: 2, textAlign: 'center', width: '100%',
  },
  perfilBotao: {
    backgroundColor: '#1E2B3C', borderRadius: 16, padding: 18, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2A3F55',
  },
  perfilAtivo: { borderColor: '#1DB954', backgroundColor: '#0A2A1A' },
  perfilTextos: { flex: 1 },
  perfilNome: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  perfilNomeAtivo: { color: '#1DB954' },
  perfilDesc: { color: '#888', fontSize: 12 },
  checkBadge: { backgroundColor: '#1DB954', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  checkTexto: { color: '#000', fontSize: 12, fontWeight: 'bold' },
  botaoSair: {
    backgroundColor: '#1E2B3C', borderRadius: 16, padding: 18, alignItems: 'center',
    marginTop: 8, marginBottom: 40, borderWidth: 1, borderColor: '#A93226',
  },
  botaoSairTexto: { color: '#A93226', fontSize: 16, fontWeight: 'bold' },
});