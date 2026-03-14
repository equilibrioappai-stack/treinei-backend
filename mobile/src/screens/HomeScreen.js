import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { gerarTreino, getStreak } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [energia, setEnergia] = useState('media');
  const [tempo, setTempo] = useState(60);
  const [carregando, setCarregando] = useState(false);
  const [streak, setStreak] = useState(0);
  const { usuario, sair } = useAuth();

  useEffect(() => {
    carregarStreak();
  }, []);

  async function carregarStreak() {
    try {
      const r = await getStreak();
      setStreak(r.data.streak_atual || 0);
    } catch {}
  }

  async function handleGerarTreino() {
    setCarregando(true);
    try {
      const r = await gerarTreino({ energia, tempo_disponivel: tempo });
      navigation.navigate('Treino', { treino: r.data });
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível gerar o treino. Tente novamente.');
    }
    setCarregando(false);
  }

  const BotaoEnergia = ({ valor, emoji, label }) => (
    <TouchableOpacity
      style={[styles.opcao, energia === valor && styles.opcaoAtiva]}
      onPress={() => setEnergia(valor)}
    >
      <Text style={styles.opcaoEmoji}>{emoji}</Text>
      <Text style={[styles.opcaoTexto, energia === valor && styles.opcaoTextoAtivo]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const BotaoTempo = ({ valor }) => (
    <TouchableOpacity
      style={[styles.tempoBotao, tempo === valor && styles.tempoAtivo]}
      onPress={() => setTempo(valor)}
    >
      <Text style={[styles.tempoTexto, tempo === valor && styles.tempoTextoAtivo]}>
        {valor}min
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.ola}>Olá, {usuario?.nome?.split(' ')[0]} 👋</Text>
          <Text style={styles.sub}>Pronto para treinar hoje?</Text>
        </View>
        {streak > 0 && (
          <View style={styles.streak}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakNum}>{streak}</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Como está sua energia hoje?</Text>
        <View style={styles.opcoes}>
          <BotaoEnergia valor="alta" emoji="⚡" label="Alta" />
          <BotaoEnergia valor="media" emoji="😊" label="Média" />
          <BotaoEnergia valor="baixa" emoji="😴" label="Baixa" />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Tempo disponível</Text>
        <View style={styles.tempos}>
          <BotaoTempo valor={30} />
          <BotaoTempo valor={45} />
          <BotaoTempo valor={60} />
          <BotaoTempo valor={90} />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.botaoGerar, carregando && styles.botaoDesabilitado]}
        onPress={handleGerarTreino}
        disabled={carregando}
      >
        {carregando ? (
          <View style={styles.botaoConteudo}>
            <ActivityIndicator color="#000" />
            <Text style={styles.botaoTexto}>  Gerando com IA...</Text>
          </View>
        ) : (
          <Text style={styles.botaoTexto}>🤖 GERAR MEU TREINO</Text>
        )}
      </TouchableOpacity>

      <View style={styles.acoes}>
        <TouchableOpacity
          style={styles.acaoBotao}
          onPress={() => navigation.navigate('Historico')}
        >
          <Text style={styles.acaoEmoji}>📅</Text>
          <Text style={styles.acaoTexto}>Histórico</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.acaoBotao}
          onPress={() => navigation.navigate('Perfil')}
        >
          <Text style={styles.acaoEmoji}>👤</Text>
          <Text style={styles.acaoTexto}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117', padding: 24 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 50, marginBottom: 32,
  },
  ola: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  sub: { fontSize: 14, color: '#888', marginTop: 4 },
  streak: { alignItems: 'center', backgroundColor: '#1E2B3C', borderRadius: 12, padding: 12 },
  streakEmoji: { fontSize: 24 },
  streakNum: { fontSize: 20, fontWeight: 'bold', color: '#1DB954' },
  card: { backgroundColor: '#1E2B3C', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitulo: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  opcoes: { flexDirection: 'row', gap: 10 },
  opcao: {
    flex: 1, alignItems: 'center', padding: 14,
    borderRadius: 12, borderWidth: 1, borderColor: '#2A3F55',
  },
  opcaoAtiva: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
  opcaoEmoji: { fontSize: 24, marginBottom: 4 },
  opcaoTexto: { color: '#888', fontSize: 13 },
  opcaoTextoAtivo: { color: '#000', fontWeight: 'bold' },
  tempos: { flexDirection: 'row', gap: 10 },
  tempoBotao: {
    flex: 1, alignItems: 'center', padding: 12,
    borderRadius: 12, borderWidth: 1, borderColor: '#2A3F55',
  },
  tempoAtivo: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
  tempoTexto: { color: '#888', fontSize: 14 },
  tempoTextoAtivo: { color: '#000', fontWeight: 'bold' },
  botaoGerar: {
    backgroundColor: '#1DB954', borderRadius: 16,
    padding: 20, alignItems: 'center', marginBottom: 24,
  },
  botaoDesabilitado: { opacity: 0.7 },
  botaoConteudo: { flexDirection: 'row', alignItems: 'center' },
  botaoTexto: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  acoes: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  acaoBotao: {
    flex: 1, backgroundColor: '#1E2B3C', borderRadius: 16,
    padding: 20, alignItems: 'center',
  },
  acaoEmoji: { fontSize: 32, marginBottom: 8 },
  acaoTexto: { color: '#888', fontSize: 14 },
});