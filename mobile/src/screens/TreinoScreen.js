import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import { avaliarTreino } from '../services/api';

export default function TreinoScreen({ route, navigation }) {
  const { treino } = route.params;
  const [avaliacao, setAvaliacao] = useState(null);
  const [avaliado, setAvaliado] = useState(false);

  const exercicios = treino?.treino_json?.exercicios || treino?.exercicios || [];
  const grupo = treino?.grupo_muscular || treino?.treino_json?.grupo_muscular || '';

  async function handleAvaliar(nota) {
    if (avaliado) return;
    setAvaliacao(nota);
    try {
      await avaliarTreino({ treino_id: treino.id, avaliacao: nota });
      setAvaliado(true);
    } catch {}
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.voltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Seu Treino 💪</Text>
        {grupo ? <Text style={styles.grupo}>{grupo.toUpperCase()}</Text> : <View />}
      </View>

      {exercicios.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>Nenhum exercício encontrado.</Text>
        </View>
      ) : (
        exercicios.map((ex, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.num}>{i + 1}</Text>
              <Text style={styles.nomeExercicio}>{ex.nome}</Text>
            </View>
            <View style={styles.info}>
              <View style={styles.infoItem}>
                <Text style={styles.infoValor}>{ex.series}</Text>
                <Text style={styles.infoLabel}>séries</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoValor}>{ex.repeticoes}</Text>
                <Text style={styles.infoLabel}>reps</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoValor}>{ex.descanso_segundos}s</Text>
                <Text style={styles.infoLabel}>descanso</Text>
              </View>
            </View>
            {ex.aparelho && (
              <Text style={styles.aparelho}>🏋️ {ex.aparelho}</Text>
            )}
            {ex.dica_tecnica && (
              <Text style={styles.dica}>💡 {ex.dica_tecnica}</Text>
            )}
          </View>
        ))
      )}

      <View style={styles.avaliacaoCard}>
        <Text style={styles.avaliacaoTitulo}>Como foi o treino?</Text>
        <View style={styles.estrelas}>
          {[1, 2, 3, 4, 5].map(n => (
            <TouchableOpacity key={n} onPress={() => handleAvaliar(n)}>
              <Text style={[styles.estrela, avaliacao >= n && styles.estrelaAtiva]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        {avaliado && <Text style={styles.avaliadoTexto}>✅ Avaliação salva!</Text>}
      </View>

      <TouchableOpacity style={styles.botao} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.botaoTexto}>🏠 Voltar para Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117', padding: 24 },
  header: { marginTop: 50, marginBottom: 24 },
  voltar: { color: '#1DB954', fontSize: 16, marginBottom: 12 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  grupo: { fontSize: 13, color: '#1DB954', fontWeight: 'bold', letterSpacing: 1 },
  card: { backgroundColor: '#1E2B3C', borderRadius: 16, padding: 18, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  num: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#1DB954', color: '#000',
    fontWeight: 'bold', fontSize: 16,
    textAlign: 'center', lineHeight: 32, marginRight: 12,
  },
  nomeExercicio: { fontSize: 17, fontWeight: 'bold', color: '#fff', flex: 1 },
  info: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  infoItem: { alignItems: 'center' },
  infoValor: { fontSize: 22, fontWeight: 'bold', color: '#1DB954' },
  infoLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  aparelho: { color: '#888', fontSize: 13, marginBottom: 6 },
  dica: {
    color: '#aaa', fontSize: 13, fontStyle: 'italic',
    backgroundColor: '#0D1117', borderRadius: 8, padding: 10, marginTop: 4,
  },
  avaliacaoCard: {
    backgroundColor: '#1E2B3C', borderRadius: 16,
    padding: 20, marginBottom: 16, alignItems: 'center',
  },
  avaliacaoTitulo: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  estrelas: { flexDirection: 'row', gap: 12 },
  estrela: { fontSize: 40, color: '#2A3F55' },
  estrelaAtiva: { color: '#FFD700' },
  avaliadoTexto: { color: '#1DB954', marginTop: 12, fontSize: 15 },
  vazio: { alignItems: 'center', padding: 40 },
  vazioTexto: { color: '#888', fontSize: 16 },
  botao: {
    backgroundColor: '#1E2B3C', borderRadius: 16,
    padding: 18, alignItems: 'center', marginBottom: 40,
  },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});