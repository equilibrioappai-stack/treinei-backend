import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { getHistorico } from '../services/api';

export default function HistoricoScreen({ navigation }) {
  const [treinos, setTreinos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarHistorico();
  }, []);

  async function carregarHistorico() {
    try {
      const r = await getHistorico();
      setTreinos(r.data);
    } catch {}
    setCarregando(false);
  }

  function formatarData(dataStr) {
    const d = new Date(dataStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function estrelas(av) {
    if (!av) return '';
    return '★'.repeat(av) + '☆'.repeat(5 - av);
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.voltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Histórico 📅</Text>
        <Text style={styles.sub}>{treinos.length} treinos registrados</Text>
      </View>

      {carregando ? (
        <ActivityIndicator color="#1DB954" size="large" style={{ marginTop: 40 }} />
      ) : treinos.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioEmoji}>📋</Text>
          <Text style={styles.vazioTexto}>Nenhum treino ainda.</Text>
          <Text style={styles.vazioSub}>Gere seu primeiro treino na Home!</Text>
        </View>
      ) : (
        treinos.map((tr, i) => {
          const exercicios = tr.treino_json?.exercicios || [];
          return (
            <View key={i} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.data}>{formatarData(tr.data)}</Text>
                  <Text style={styles.grupo}>
                    {tr.grupo_muscular?.toUpperCase() || 'TREINO'}
                  </Text>
                </View>
                <View style={styles.badges}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeTexto}>⚡ {tr.energia_dia || '-'}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeTexto}>⏱ {tr.tempo_disponivel || '-'}min</Text>
                  </View>
                </View>
              </View>
              <View style={styles.exercicioLista}>
                {exercicios.slice(0, 3).map((ex, j) => (
                  <Text key={j} style={styles.exercicioItem}>
                    • {ex.nome} — {ex.series}x{ex.repeticoes}
                  </Text>
                ))}
                {exercicios.length > 3 && (
                  <Text style={styles.mais}>+{exercicios.length - 3} exercícios</Text>
                )}
              </View>
              {tr.avaliacao && (
                <Text style={styles.estrelas}>{estrelas(tr.avaliacao)}</Text>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117', padding: 24 },
  header: { marginTop: 50, marginBottom: 24 },
  voltar: { color: '#1DB954', fontSize: 16, marginBottom: 12 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  sub: { fontSize: 14, color: '#888' },
  card: { backgroundColor: '#1E2B3C', borderRadius: 16, padding: 18, marginBottom: 14 },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 14,
  },
  data: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  grupo: { fontSize: 12, color: '#1DB954', fontWeight: 'bold', marginTop: 2 },
  badges: { flexDirection: 'row', gap: 8 },
  badge: { backgroundColor: '#0D1117', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTexto: { color: '#888', fontSize: 12 },
  exercicioLista: { marginBottom: 10 },
  exercicioItem: { color: '#aaa', fontSize: 13, marginBottom: 4 },
  mais: { color: '#1DB954', fontSize: 13, marginTop: 2 },
  estrelas: { color: '#FFD700', fontSize: 18, letterSpacing: 2 },
  vazio: { alignItems: 'center', marginTop: 60 },
  vazioEmoji: { fontSize: 64, marginBottom: 16 },
  vazioTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  vazioSub: { color: '#888', fontSize: 14 },
});