import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { aplicarPerfil } from '../services/api';

export default function PerfilScreen({ navigation }) {
  const { usuario, sair } = useAuth();
  const [carregando, setCarregando] = useState(false);
  const [perfilAplicado, setPerfilAplicado] = useState(null);

  async function handleAplicarPerfil(nome) {
    setCarregando(true);
    try {
      await aplicarPerfil(nome);
      setPerfilAplicado(nome);
      Alert.alert('✅ Sucesso', `Perfil "${nome}" aplicado!`);
    } catch {
      Alert.alert('Erro', 'Não foi possível aplicar o perfil.');
    }
    setCarregando(false);
  }

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sair },
    ]);
  }

  const CardInfo = ({ emoji, label, valor }) => (
    <View style={styles.infoCard}>
      <Text style={styles.infoEmoji}>{emoji}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValor}>{valor || '—'}</Text>
    </View>
  );

  const BotaoPerfil = ({ nome, emoji, descricao }) => (
    <TouchableOpacity
      style={[styles.perfilBotao, perfilAplicado === nome && styles.perfilAtivo]}
      onPress={() => handleAplicarPerfil(nome)}
      disabled={carregando}
    >
      <Text style={styles.perfilEmoji}>{emoji}</Text>
      <View style={styles.perfilTextos}>
        <Text style={[styles.perfilNome, perfilAplicado === nome && styles.perfilNomeAtivo]}>
          {nome.replace('_', ' ').toUpperCase()}
        </Text>
        <Text style={styles.perfilDesc}>{descricao}</Text>
      </View>
      {perfilAplicado === nome && <Text style={styles.check}>✅</Text>}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.voltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Perfil 👤</Text>
      </View>

      <View style={styles.avatarCard}>
        <Text style={styles.avatar}>💪</Text>
        <Text style={styles.nome}>{usuario?.nome}</Text>
        <Text style={styles.email}>{usuario?.email}</Text>
        <View style={styles.planoBadge}>
          <Text style={styles.planoTexto}>
            {usuario?.plano === 'free' ? '🆓 Plano Free' : '⭐ Plano Premium'}
          </Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <CardInfo emoji="🎯" label="Objetivo" valor={usuario?.objetivo} />
        <CardInfo emoji="📊" label="Nível" valor={usuario?.nivel} />
        <CardInfo emoji="⚖️" label="Peso" valor={usuario?.peso ? `${usuario.peso}kg` : null} />
        <CardInfo emoji="📏" label="Altura" valor={usuario?.altura ? `${usuario.altura}cm` : null} />
      </View>

      <Text style={styles.secaoTitulo}>🏋️ Meus Aparelhos</Text>
      <Text style={styles.secaoSub}>Selecione o perfil da sua academia:</Text>

      {carregando ? (
        <ActivityIndicator color="#1DB954" style={{ marginVertical: 20 }} />
      ) : (
        <>
          <BotaoPerfil nome="academia_completa" emoji="🏆"
            descricao="Supino, Leg Press, Pulley, Smith e mais 8 aparelhos" />
          <BotaoPerfil nome="academia_basica" emoji="💪"
            descricao="Halteres, Barra, Leg Press e Pulley" />
          <BotaoPerfil nome="em_casa" emoji="🏠"
            descricao="Halteres, Peso corporal e Elástico" />
        </>
      )}

      <TouchableOpacity style={styles.botaoSair} onPress={handleLogout}>
        <Text style={styles.botaoSairTexto}>🚪 Sair da conta</Text>
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
  avatar: { fontSize: 64, marginBottom: 12 },
  nome: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: '#888', marginBottom: 12 },
  planoBadge: { backgroundColor: '#0D1117', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  planoTexto: { color: '#1DB954', fontSize: 14, fontWeight: 'bold' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  infoCard: {
    backgroundColor: '#1E2B3C', borderRadius: 12,
    padding: 14, alignItems: 'center', width: '47%',
  },
  infoEmoji: { fontSize: 24, marginBottom: 6 },
  infoLabel: { color: '#888', fontSize: 12, marginBottom: 4 },
  infoValor: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  secaoTitulo: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  secaoSub: { color: '#888', fontSize: 13, marginBottom: 16 },
  perfilBotao: {
    backgroundColor: '#1E2B3C', borderRadius: 16, padding: 18, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2A3F55',
  },
  perfilAtivo: { borderColor: '#1DB954', backgroundColor: '#0A2A1A' },
  perfilEmoji: { fontSize: 32, marginRight: 14 },
  perfilTextos: { flex: 1 },
  perfilNome: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  perfilNomeAtivo: { color: '#1DB954' },
  perfilDesc: { color: '#888', fontSize: 12 },
  check: { fontSize: 20 },
  botaoSair: {
    backgroundColor: '#1E2B3C', borderRadius: 16, padding: 18, alignItems: 'center',
    marginTop: 8, marginBottom: 40, borderWidth: 1, borderColor: '#A93226',
  },
  botaoSairTexto: { color: '#A93226', fontSize: 16, fontWeight: 'bold' },
});