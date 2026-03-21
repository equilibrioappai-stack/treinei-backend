import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Share
} from 'react-native';
import { avaliarTreino } from '../services/api';

export default function TreinoScreen({ route, navigation }) {
  const { treino } = route.params;
  const [avaliacao, setAvaliacao] = useState(null);
  const [avaliado, setAvaliado] = useState(false);
  const [concluidos, setConcluidos] = useState({});

  const exercicios = treino?.treino_json?.treino?.exercicios ||
                     treino?.treino_json?.exercicios ||
                     treino?.exercicios || [];
  const grupo = treino?.grupo_muscular ||
                treino?.treino_json?.treino?.grupo_muscular ||
                treino?.treino_json?.grupo_muscular || '';
  const mensagem = treino?.treino_json?.treino?.mensagem_motivacional ||
                   treino?.treino_json?.mensagem_motivacional || '';
  const totalConcluidos = Object.values(concluidos).filter(Boolean).length;
  const progresso = exercicios.length > 0 ? totalConcluidos / exercicios.length : 0;

  function toggleConcluido(i) {
    setConcluidos(c => ({ ...c, [i]: !c[i] }));
  }

  async function handleAvaliar(nota) {
    if (avaliado) return;
    setAvaliacao(nota);
    try {
      await avaliarTreino({ treino_id: treino.id, avaliacao: nota });
      setAvaliado(true);
    } catch {}
  }

  async function handleCompartilhar() {
    try {
      const texto = exercicios.map((ex, i) =>
        `${i + 1}. ${ex.nome} — ${ex.series}x${ex.repeticoes}`
      ).join('\n');
      await Share.share({
        message: `Meu treino de hoje (${grupo.toUpperCase()}):\n\n${texto}\n\nGerado pelo Treinei`,
      });
    } catch {}
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.voltar}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.titulo}>Seu Treino</Text>
            {grupo ? <Text style={styles.grupo}>{grupo.toUpperCase()}</Text> : null}
          </View>
          <TouchableOpacity style={styles.btnCompartilhar} onPress={handleCompartilhar}>
            <Text style={styles.btnCompartilharTexto}>Compartilhar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {mensagem ? (
        <View style={styles.motivacaoCard}>
          <Text style={styles.motivacaoTexto}>{mensagem}</Text>
        </View>
      ) : null}

      {exercicios.length > 0 && (
        <View style={styles.progressoCard}>
          <Text style={styles.progressoTexto}>
            {totalConcluidos}/{exercicios.length} exercicios concluidos
          </Text>
          <View style={styles.progressoBarra}>
            <View style={[styles.progressoFill, { width: `${progresso * 100}%` }]} />
          </View>
        </View>
      )}

      {exercicios.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>Nenhum exercicio encontrado.</Text>
        </View>
      ) : (
        exercicios.map((ex, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.card, concluidos[i] && styles.cardConcluido]}
            onPress={() => toggleConcluido(i)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.checkbox, concluidos[i] && styles.checkboxAtivo]}>
                {concluidos[i] && <Text style={styles.checkboxMarca}>✓</Text>}
              </View>
              <View style={styles.numCircle}>
                <Text style={styles.numTexto}>{i + 1}</Text>
              </View>
              <Text style={[styles.nomeExercicio, concluidos[i] && styles.nomeRiscado]}>
                {ex.nome}
              </Text>
            </View>

            <View style={styles.info}>
              <View style={styles.infoItem}>
                <Text style={styles.infoValor}>{ex.series}</Text>
                <Text style={styles.infoLabel}>series</Text>
              </View>
              <View style={styles.infoDivisor} />
              <View style={styles.infoItem}>
                <Text style={styles.infoValor}>{ex.repeticoes}</Text>
                <Text style={styles.infoLabel}>reps</Text>
              </View>
              <View style={styles.infoDivisor} />
              <View style={styles.infoItem}>
                <Text style={styles.infoValor}>{ex.descanso_segundos}s</Text>
                <Text style={styles.infoLabel}>descanso</Text>
              </View>
            </View>

            {ex.aparelho ? (
              <Text style={styles.aparelho}>{ex.aparelho}</Text>
            ) : null}

            {ex.dica_tecnica ? (
              <Text style={styles.dica}>{ex.dica_tecnica}</Text>
            ) : null}

            {concluidos[i] && (
              <View style={styles.concluidoBadge}>
                <Text style={styles.concluidoTexto}>Concluido</Text>
              </View>
            )}
          </TouchableOpacity>
        ))
      )}

      <View style={styles.avaliacaoCard}>
        <Text style={styles.avaliacaoTitulo}>Como foi o treino?</Text>
        <View style={styles.estrelas}>
          {[1, 2, 3, 4, 5].map(n => (
            <TouchableOpacity key={n} onPress={() => handleAvaliar(n)}>
              <Text style={[styles.estrela, avaliacao >= n && styles.estrelaAtiva]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {avaliado && <Text style={styles.avaliadoTexto}>Avaliacao salva!</Text>}
      </View>

      <TouchableOpacity
        style={styles.botao}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.botaoTexto}>Voltar para Home</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117', padding: 24 },
  header: { marginTop: 50, marginBottom: 20 },
  voltar: { color: '#1DB954', fontSize: 16, marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  grupo: { fontSize: 12, color: '#1DB954', fontWeight: 'bold', letterSpacing: 2 },
  btnCompartilhar: {
    backgroundColor: '#1E2B3C', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#2A3F55',
  },
  btnCompartilharTexto: { color: '#1DB954', fontSize: 13, fontWeight: 'bold' },
  motivacaoCard: {
    backgroundColor: '#0A2A1A', borderRadius: 12, padding: 16,
    marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#1DB954',
  },
  motivacaoTexto: { color: '#1DB954', fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  progressoCard: { backgroundColor: '#1E2B3C', borderRadius: 12, padding: 14, marginBottom: 16 },
  progressoTexto: { color: '#888', fontSize: 13, marginBottom: 8 },
  progressoBarra: { height: 6, backgroundColor: '#2A3F55', borderRadius: 3 },
  progressoFill: { height: 6, backgroundColor: '#1DB954', borderRadius: 3 },
  card: {
    backgroundColor: '#1E2B3C', borderRadius: 16,
    padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#2A3F55',
  },
  cardConcluido: { opacity: 0.6, borderColor: '#1DB954' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2,
    borderColor: '#2A3F55', marginRight: 10, alignItems: 'center', justifyContent: 'center',
  },
  checkboxAtivo: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
  checkboxMarca: { color: '#000', fontSize: 14, fontWeight: 'bold' },
  numCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#2A3F55', alignItems: 'center',
    justifyContent: 'center', marginRight: 10,
  },
  numTexto: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  nomeExercicio: { fontSize: 16, fontWeight: 'bold', color: '#fff', flex: 1 },
  nomeRiscado: { textDecorationLine: 'line-through', color: '#666' },
  info: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoItem: { flex: 1, alignItems: 'center', paddingHorizontal: 4},
  infoDivisor: { width: 1, height: 30, backgroundColor: '#2A3F55' },
  infoValor: { fontSize: 16, fontWeight: 'bold', color: '#1DB954', textAlign: 'center' },
  infoLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  aparelho: { color: '#666', fontSize: 12, marginBottom: 6 },
  dica: {
    color: '#aaa', fontSize: 12, fontStyle: 'italic',
    backgroundColor: '#0D1117', borderRadius: 8, padding: 10, lineHeight: 18,
  },
  concluidoBadge: {
    alignSelf: 'flex-end', backgroundColor: '#0A2A1A',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8,
  },
  concluidoTexto: { color: '#1DB954', fontSize: 11, fontWeight: 'bold' },
  avaliacaoCard: {
    backgroundColor: '#1E2B3C', borderRadius: 16,
    padding: 20, marginBottom: 16, alignItems: 'center',
  },
  avaliacaoTitulo: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 16 },
  estrelas: { flexDirection: 'row', gap: 12 },
  estrela: { fontSize: 38, color: '#2A3F55' },
  estrelaAtiva: { color: '#FFD700' },
  avaliadoTexto: { color: '#1DB954', marginTop: 12, fontSize: 14 },
  vazio: { alignItems: 'center', padding: 40 },
  vazioTexto: { color: '#888', fontSize: 16 },
  botao: {
    backgroundColor: '#1E2B3C', borderRadius: 16,
    padding: 18, alignItems: 'center', marginBottom: 40,
    borderWidth: 1, borderColor: '#2A3F55',
  },
  botaoTexto: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});