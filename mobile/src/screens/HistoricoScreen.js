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
    const hoje = new Date();
    const diff = Math.floor((hoje - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    if (diff < 7) return `${diff} dias atras`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  function estrelas(av) {
    if (!av) return '';
    return '★'.repeat(av) + '☆'.repeat(5 - av);
  }

  function repetirTreino(treino) {
    navigation.navigate('Treino', { treino });
  }

  const ultimos7 = treinos.filter(tr => {
    const d = new Date(tr.data);
    const diff = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
    return diff <= 7;
  });

  const maisAntigos = treinos.filter(tr => {
    const d = new Date(tr.data);
    const diff = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
    return diff > 7;
  });

  function renderTreino(tr, i) {
    const exercicios = tr.treino_json?.treino?.exercicios ||
                       tr.treino_json?.exercicios || [];
    const isRecente = (() => {
      const d = new Date(tr.data);
      const diff = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
      return diff <= 7;
    })();

    return (
      <View key={i} style={[styles.card, isRecente && styles.cardRecente]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.data}>{formatarData(tr.data)}</Text>
            <Text style={styles.grupo}>
              {tr.grupo_muscular?.toUpperCase() || 'TREINO'}
            </Text>
          </View>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeTexto}>{tr.energia_dia || '-'}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeTexto}>{tr.tempo_disponivel || '-'}min</Text>
            </View>
          </View>
        </View>

        <View style={styles.exercicioLista}>
          {exercicios.slice(0, 3).map((ex, j) => (
            <Text key={j} style={styles.exercicioItem}>
              {ex.nome}  {ex.series}x{ex.repeticoes}
            </Text>
          ))}
          {exercicios.length > 3 && (
            <Text style={styles.mais}>+{exercicios.length - 3} exercicios</Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          {tr.avaliacao ? (
            <Text style={styles.estrelas}>{estrelas(tr.avaliacao)}</Text>
          ) : (
            <View />
          )}
          {isRecente && (
            <TouchableOpacity
              style={styles.repetirBtn}
              onPress={() => repetirTreino(tr)}
            >
              <Text style={styles.repetirTexto}>Repetir treino</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.voltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Historico</Text>
        <Text style={styles.sub}>{treinos.length} treinos registrados</Text>
      </View>

      {carregando ? (
        <ActivityIndicator color="#1DB954" size="large" style={{ marginTop: 40 }} />
      ) : treinos.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>Nenhum treino ainda.</Text>
          <Text style={styles.vazioSub}>Gere seu primeiro treino na Home!</Text>
        </View>
      ) : (
        <>
          {ultimos7.length > 0 && (
            <>
              <Text style={styles.secaoTitulo}>Ultimos 7 dias</Text>
              {ultimos7.map((tr, i) => renderTreino(tr, i))}
            </>
          )}
          {maisAntigos.length > 0 && (
            <>
              <Text style={styles.secaoTitulo}>Anteriores</Text>
              {maisAntigos.map((tr, i) => renderTreino(tr, `old-${i}`))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117', padding: 24 },
  header: { marginTop: 50, marginBottom: 24 },
  voltar: { color: '#1DB954', fontSize: 16, marginBottom: 12 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  sub: { fontSize: 13, color: '#888' },
  secaoTitulo: {
    fontSize: 13, fontWeight: 'bold', color: '#555',
    letterSpacing: 1, marginBottom: 12, marginTop: 4,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#1E2B3C', borderRadius: 16,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#2A3F55',
  },
  cardRecente: { borderColor: '#1DB95433' },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12,
  },
  data: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  grupo: { fontSize: 11, color: '#1DB954', fontWeight: 'bold', marginTop: 3, letterSpacing: 1 },
  badges: { flexDirection: 'row', gap: 6 },
  badge: {
    backgroundColor: '#0D1117', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeTexto: { color: '#666', fontSize: 11 },
  exercicioLista: { marginBottom: 12 },
  exercicioItem: { color: '#888', fontSize: 12, marginBottom: 3 },
  mais: { color: '#1DB954', fontSize: 12, marginTop: 2 },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderTopWidth: 1,
    borderTopColor: '#2A3F55', paddingTop: 10,
  },
  estrelas: { color: '#FFD700', fontSize: 14, letterSpacing: 1 },
  repetirBtn: {
    backgroundColor: '#0A2A1A', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: '#1DB95444',
  },
  repetirTexto: { color: '#1DB954', fontSize: 12, fontWeight: 'bold' },
  vazio: { alignItems: 'center', marginTop: 60 },
  vazioTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  vazioSub: { color: '#888', fontSize: 14 },
});