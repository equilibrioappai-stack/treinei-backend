import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { gerarTreino, getStreak } from '../services/api';

const GRUPOS = [
  { id: 'livre', label: 'Livre', sub: 'IA decide' },
  { id: 'superior', label: 'Superior', sub: 'Peito + Triceps' },
  { id: 'costas_biceps', label: 'Costas', sub: 'Costas + Biceps' },
  { id: 'ombro', label: 'Ombro', sub: 'Ombro + Trapezio' },
  { id: 'pernas', label: 'Pernas', sub: 'Quadriceps + Posterior' },
  { id: 'full_body', label: 'Full Body', sub: 'Corpo todo' },
];

export default function HomeScreen({ navigation }) {
  const [energia, setEnergia] = useState('media');
  const [tempo, setTempo] = useState(60);
  const [grupo, setGrupo] = useState('livre');
  const [carregando, setCarregando] = useState(false);
  const [streak, setStreak] = useState(0);
  const { usuario } = useAuth();

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
      const r = await gerarTreino({
        energia,
        tempo_disponivel: tempo,
        foco: grupo === 'livre' ? null : grupo,
      });
      navigation.navigate('Treino', { treino: r.data });
    } catch (e) {
      Alert.alert('Erro', 'Nao foi possivel gerar o treino. Tente novamente.');
    }
    setCarregando(false);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <View>
          <Text style={styles.ola}>Ola, {usuario?.nome?.split(' ')[0]}!</Text>
          <Text style={styles.sub}>Pronto para treinar hoje?</Text>
        </View>
        {streak > 0 && (
          <View style={styles.streak}>
            <Text style={styles.streakNum}>{streak}</Text>
            <Text style={styles.streakLabel}>dias</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Qual grupo hoje?</Text>
        <View style={styles.grupoGrid}>
          {GRUPOS.map(g => (
            <TouchableOpacity
              key={g.id}
              style={[styles.grupoBotao, grupo === g.id && styles.grupoAtivo]}
              onPress={() => setGrupo(g.id)}
            >
              <Text style={[styles.grupoLabel, grupo === g.id && styles.grupoLabelAtivo]}>
                {g.label}
              </Text>
              <Text style={[styles.grupoSub, grupo === g.id && styles.grupoSubAtivo]}>
                {g.sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Como esta sua energia?</Text>
        <View style={styles.opcoes}>
          {[
            { v: 'alta', label: 'Alta' },
            { v: 'media', label: 'Media' },
            { v: 'baixa', label: 'Baixa' },
          ].map(e => (
            <TouchableOpacity
              key={e.v}
              style={[styles.opcao, energia === e.v && styles.opcaoAtiva]}
              onPress={() => setEnergia(e.v)}
            >
              <Text style={[styles.opcaoTexto, energia === e.v && styles.opcaoTextoAtivo]}>
                {e.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Tempo disponivel</Text>
        <View style={styles.tempos}>
          {[30, 45, 60, 90].map(v => (
            <TouchableOpacity
              key={v}
              style={[styles.tempoBotao, tempo === v && styles.tempoAtivo]}
              onPress={() => setTempo(v)}
            >
              <Text style={[styles.tempoTexto, tempo === v && styles.tempoTextoAtivo]}>
                {v} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.botaoGerar, carregando && styles.botaoDesabilitado]}
        onPress={handleGerarTreino}
        disabled={carregando}
      >
        {carregando ? (
          <View style={styles.botaoConteudo}>
            <ActivityIndicator color="#000" size={20} />
            <Text style={styles.botaoTexto}>  Gerando treino...</Text>
          </View>
        ) : (
          <Text style={styles.botaoTexto}>GERAR MEU TREINO</Text>
        )}
      </TouchableOpacity>

      <View style={styles.acoes}>
        <TouchableOpacity
          style={styles.acaoBotao}
          onPress={() => navigation.navigate('Historico')}
        >
          <Text style={styles.acaoTexto}>Historico</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.acaoBotao}
          onPress={() => navigation.navigate('Perfil')}
        >
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
    alignItems: 'center', marginTop: 50, marginBottom: 24,
  },
  ola: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  sub: { fontSize: 14, color: '#888', marginTop: 4 },
  streak: {
    alignItems: 'center', backgroundColor: '#1DB954',
    borderRadius: 12, padding: 12, minWidth: 56,
  },
  streakNum: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  streakLabel: { fontSize: 11, color: '#000', fontWeight: 'bold' },
  card: { backgroundColor: '#1E2B3C', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitulo: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 14 },
  grupoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grupoBotao: {
    width: '31%', paddingVertical: 12, paddingHorizontal: 6,
    borderRadius: 12, borderWidth: 1, borderColor: '#2A3F55',
    backgroundColor: '#0D1117', alignItems: 'center',
  },
  grupoAtivo: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
  grupoLabel: { color: '#aaa', fontSize: 13, fontWeight: 'bold' },
  grupoLabelAtivo: { color: '#000' },
  grupoSub: { color: '#666', fontSize: 10, marginTop: 2, textAlign: 'center' },
  grupoSubAtivo: { color: '#004d1a' },
  opcoes: { flexDirection: 'row', gap: 10 },
  opcao: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: 12, borderWidth: 1, borderColor: '#2A3F55', backgroundColor: '#0D1117',
  },
  opcaoAtiva: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
  opcaoTexto: { color: '#888', fontSize: 14, fontWeight: 'bold' },
  opcaoTextoAtivo: { color: '#000', fontWeight: 'bold' },
  tempos: { flexDirection: 'row', gap: 10 },
  tempoBotao: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, borderColor: '#2A3F55', backgroundColor: '#0D1117',
  },
  tempoAtivo: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
  tempoTexto: { color: '#888', fontSize: 13, fontWeight: 'bold' },
  tempoTextoAtivo: { color: '#000', fontWeight: 'bold' },
  botaoGerar: {
    backgroundColor: '#1DB954', borderRadius: 16,
    padding: 20, alignItems: 'center', marginBottom: 16,
  },
  botaoDesabilitado: { opacity: 0.7 },
  botaoConteudo: { flexDirection: 'row', alignItems: 'center' },
  botaoTexto: { color: '#000', fontSize: 17, fontWeight: 'bold', letterSpacing: 1 },
  acoes: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  acaoBotao: {
    flex: 1, backgroundColor: '#1E2B3C', borderRadius: 16,
    padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#2A3F55',
  },
  acaoTexto: { color: '#aaa', fontSize: 14, fontWeight: 'bold' },
});