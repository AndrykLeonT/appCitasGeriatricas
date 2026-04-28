import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';

interface SARCFQuestion {
  key: string;
  titulo: string;
  descripcion: string;
  opciones: { label: string; score: number }[];
}

const PREGUNTAS: SARCFQuestion[] = [
  {
    key: 'fuerza',
    titulo: 'S – Fuerza (Strength)',
    descripcion: '¿Cuánta dificultad tiene para levantar y cargar 4.5 kg?',
    opciones: [
      { label: 'Ninguna', score: 0 },
      { label: 'Alguna', score: 1 },
      { label: 'Mucha o incapaz', score: 2 },
    ],
  },
  {
    key: 'asistencia',
    titulo: 'A – Asistencia al caminar',
    descripcion: '¿Cuánta dificultad tiene para cruzar un cuarto caminando?',
    opciones: [
      { label: 'Ninguna', score: 0 },
      { label: 'Alguna', score: 1 },
      { label: 'Mucha, usa ayuda o incapaz', score: 2 },
    ],
  },
  {
    key: 'levantarse',
    titulo: 'R – Levantarse de una silla',
    descripcion: '¿Cuánta dificultad tiene para levantarse de una silla o cama?',
    opciones: [
      { label: 'Ninguna', score: 0 },
      { label: 'Alguna', score: 1 },
      { label: 'Mucha o incapaz sin ayuda', score: 2 },
    ],
  },
  {
    key: 'escaleras',
    titulo: 'C – Subir escaleras',
    descripcion: '¿Cuánta dificultad tiene para subir 10 escalones?',
    opciones: [
      { label: 'Ninguna', score: 0 },
      { label: 'Alguna', score: 1 },
      { label: 'Mucha o incapaz', score: 2 },
    ],
  },
  {
    key: 'caidas',
    titulo: 'F – Caídas (Falls)',
    descripcion: '¿Cuántas veces ha caído en el último año?',
    opciones: [
      { label: 'Ninguna', score: 0 },
      { label: 'Entre 1 y 3 caídas', score: 1 },
      { label: '4 o más caídas', score: 2 },
    ],
  },
];

const getResultado = (total: number) => {
  if (total >= 4) {
    return {
      texto: 'Alta probabilidad de sarcopenia',
      descripcion: 'Se recomienda referir para evaluación de composición corporal y fuerza muscular.',
      color: '#FEE2E2',
      borderColor: '#EF4444',
    };
  }
  return {
    texto: 'Baja probabilidad de sarcopenia',
    descripcion: 'Continúe con seguimiento periódico y promoción de actividad física.',
    color: '#F0FDF4',
    borderColor: '#22C55E',
  };
};

export default function SARCFScreen() {
  const { pacienteId = '', pacienteNombre = '' } = useLocalSearchParams<{
    pacienteId: string;
    pacienteNombre: string;
  }>();

  const [scores, setScores] = useState<Record<string, number>>({});
  const [guardado, setGuardado] = useState(false);

  const setScore = (key: string, score: number) => {
    setScores(prev => ({ ...prev, [key]: score }));
  };

  const allAnswered = PREGUNTAS.every(p => scores[p.key] !== undefined);
  const total = allAnswered ? Object.values(scores).reduce((a, b) => a + b, 0) : null;
  const resultado = total !== null ? getResultado(total) : null;

  const handleGuardar = async () => {
    if (!allAnswered || total === null) {
      Alert.alert('Incompleto', 'Por favor responda todas las preguntas antes de guardar.');
      return;
    }
    if (guardado) return;
    try {
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: '17_sarc_f',
        fecha: new Date().toISOString().split('T')[0],
        puntaje: total,
      });
      setGuardado(true);
      Alert.alert(
        'Evaluación guardada',
        `${pacienteNombre ? 'Paciente: ' + pacienteNombre + '\n' : ''}Puntaje: ${total}/10\n${getResultado(total).texto}`
      );
    } catch {
      Alert.alert('Error', 'No se pudo guardar. Verifique su conexión.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Cuestionario SARC-F</Text>
      <Text style={styles.subtitulo}>Detección de sarcopenia</Text>

      {pacienteNombre !== '' && (
        <View style={styles.pacienteBanner}>
          <Text style={styles.pacienteBannerText}>👤 {pacienteNombre}</Text>
        </View>
      )}

      <View style={styles.instrucciones}>
        <Text style={styles.instruccionesTexto}>
          Seleccione la opción que mejor describe la situación del paciente en cada área.
          Un puntaje ≥ 4 indica alta probabilidad de sarcopenia (máximo 10 pts).
        </Text>
      </View>

      {PREGUNTAS.map(p => (
        <View key={p.key} style={styles.card}>
          <Text style={styles.questionTitle}>{p.titulo}</Text>
          <Text style={styles.description}>{p.descripcion}</Text>
          {p.opciones.map(op => {
            const isSelected = scores[p.key] === op.score;
            return (
              <Pressable
                key={op.score}
                style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                onPress={() => setScore(p.key, op.score)}
              >
                <View style={[styles.scoreBadge, isSelected && styles.scoreBadgeSelected]}>
                  <Text style={[styles.scoreBadgeText, isSelected && styles.scoreBadgeTextSelected]}>
                    {op.score}
                  </Text>
                </View>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {op.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      {resultado && (
        <View style={[styles.resultCard, { backgroundColor: resultado.color, borderColor: resultado.borderColor }]}>
          <Text style={styles.resultScore}>Puntaje: {total} / 10</Text>
          <Text style={styles.resultTexto}>{resultado.texto}</Text>
          <Text style={styles.resultDescripcion}>{resultado.descripcion}</Text>
        </View>
      )}

      <Pressable
        style={[
          styles.btnGuardar,
          guardado && styles.btnGuardado,
          !allAnswered && styles.btnDisabled,
        ]}
        onPress={handleGuardar}
        disabled={guardado || !allAnswered}
      >
        <Text style={styles.btnText}>
          {guardado ? '✓ Evaluación guardada' : 'Guardar evaluación'}
        </Text>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  content: { padding: 16, paddingBottom: 40 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 16 },

  pacienteBanner: {
    backgroundColor: '#EFF6FF', borderRadius: 8, padding: 10,
    marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE',
  },
  pacienteBannerText: { fontSize: 14, fontWeight: '700', color: '#1E40AF', textAlign: 'center' },

  instrucciones: {
    backgroundColor: '#F5F3FF', borderRadius: 8, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: '#DDD6FE',
  },
  instruccionesTexto: { fontSize: 13, color: '#5B21B6', lineHeight: 18 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  questionTitle: { fontSize: 16, fontWeight: 'bold', color: '#5B21B6', marginBottom: 4 },
  description: { fontSize: 14, color: '#4B5563', marginBottom: 12, lineHeight: 20 },

  optionBtn: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB', marginBottom: 8,
  },
  optionBtnSelected: { backgroundColor: '#EDE9FE', borderColor: '#7C3AED' },

  scoreBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#E5E7EB',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  scoreBadgeSelected: { backgroundColor: '#7C3AED' },
  scoreBadgeText: { fontSize: 13, fontWeight: 'bold', color: '#374151' },
  scoreBadgeTextSelected: { color: '#fff' },
  optionLabel: { fontSize: 14, color: '#374151', flex: 1 },
  optionLabelSelected: { color: '#5B21B6', fontWeight: '600' },

  resultCard: {
    borderRadius: 12, padding: 20, marginBottom: 16,
    borderWidth: 2, alignItems: 'center',
  },
  resultScore: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  resultTexto: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 6, textAlign: 'center' },
  resultDescripcion: { fontSize: 13, color: '#374151', textAlign: 'center', lineHeight: 18 },

  btnGuardar: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 10, alignItems: 'center' },
  btnGuardado: { backgroundColor: '#10B981' },
  btnDisabled: { backgroundColor: '#93C5FD' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
