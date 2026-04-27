import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';

const CRITERIOS_NORTON = [
  {
    campo: 'fisico',
    label: 'Estado físico',
    opciones: [
      { score: 1, texto: 'Muy malo' },
      { score: 2, texto: 'Malo' },
      { score: 3, texto: 'Regular' },
      { score: 4, texto: 'Bueno' },
    ],
  },
  {
    campo: 'mental',
    label: 'Estado mental',
    opciones: [
      { score: 1, texto: 'Estuporoso' },
      { score: 2, texto: 'Confuso' },
      { score: 3, texto: 'Apático' },
      { score: 4, texto: 'Alerta' },
    ],
  },
  {
    campo: 'actividad',
    label: 'Actividad',
    opciones: [
      { score: 1, texto: 'Encamado' },
      { score: 2, texto: 'En silla' },
      { score: 3, texto: 'Camina con ayuda' },
      { score: 4, texto: 'Deambula' },
    ],
  },
  {
    campo: 'movilidad',
    label: 'Movilidad',
    opciones: [
      { score: 1, texto: 'Inmóvil' },
      { score: 2, texto: 'Muy limitada' },
      { score: 3, texto: 'Ligeramente limitada' },
      { score: 4, texto: 'Total' },
    ],
  },
  {
    campo: 'incontinencia',
    label: 'Incontinencia',
    opciones: [
      { score: 1, texto: 'Doble incontinencia' },
      { score: 2, texto: 'Incontinencia urinaria' },
      { score: 3, texto: 'Ocasional' },
      { score: 4, texto: 'Ninguna' },
    ],
  },
];

const getInterpretacion = (total: number) => {
  if (total <= 12) return { texto: 'Alto riesgo', color: '#DC2626' };
  if (total <= 14) return { texto: 'Riesgo moderado', color: '#D97706' };
  return { texto: 'Bajo riesgo', color: '#16A34A' };
};

export default function NortonScreen() {
  const router = useRouter();
  const { pacienteId = '', pacienteNombre = '', idEvaluacion = '12_norton' } = useLocalSearchParams<{
    pacienteId: string;
    pacienteNombre: string;
    idEvaluacion: string;
  }>();

  const [nortonScores, setNortonScores] = useState({
    fisico: null as number | null,
    mental: null as number | null,
    actividad: null as number | null,
    movilidad: null as number | null,
    incontinencia: null as number | null,
  });
  const [guardado, setGuardado] = useState(false);

  const allAnswered = Object.values(nortonScores).every(v => v !== null);
  const totalNorton = allAnswered
    ? Object.values(nortonScores).reduce((a, b) => a! + b!, 0)!
    : null;

  const handleGuardar = async () => {
    if (!allAnswered || totalNorton === null) {
      Alert.alert('Incompleto', 'Seleccione un valor para cada criterio.');
      return;
    }
    if (guardado) return;
    const interpretacion = getInterpretacion(totalNorton);
    try {
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: idEvaluacion,
        fecha: new Date().toISOString().split('T')[0],
        puntaje: totalNorton,
        diagnostico: interpretacion.texto
      });
      setGuardado(true);
      Alert.alert(
        'Evaluación guardada',
        `${pacienteNombre ? 'Paciente: ' + pacienteNombre + '\n' : ''}Puntaje: ${totalNorton}/20\n${interpretacion.texto}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Error', 'No se pudo guardar. Verifique su conexión.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Escala de Norton</Text>
      <Text style={styles.subtitulo}>Valoración de riesgo de úlceras por presión</Text>

      {pacienteNombre !== '' && (
        <View style={styles.pacienteBanner}>
          <Text style={styles.pacienteBannerText}>👤 {pacienteNombre}</Text>
        </View>
      )}

      {CRITERIOS_NORTON.map((criterio) => (
        <View key={criterio.campo} style={styles.criterioCard}>
          <Text style={styles.criterioLabel}>{criterio.label}</Text>
          <View style={styles.botonesRow}>
            {criterio.opciones.map(({ score, texto }) => {
              const isSelected = nortonScores[criterio.campo as keyof typeof nortonScores] === score;
              return (
                <Pressable
                  key={score}
                  style={[styles.opcionBtn, isSelected && styles.opcionSelected]}
                  onPress={() =>
                    setNortonScores(prev => ({
                      ...prev,
                      [criterio.campo]: prev[criterio.campo as keyof typeof prev] === score ? null : score,
                    }))
                  }
                >
                  <Text style={[styles.opcionScore, isSelected && styles.opcionScoreSelected]}>{score}</Text>
                  <Text style={[styles.opcionTexto, isSelected && styles.opcionTextoSelected]}>{texto}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.interpretacionCard}>
        <Text style={styles.reglasLabel}>Interpretación del puntaje</Text>
        <Text style={styles.reglasText}>• ≤ 12 puntos: Alto riesgo</Text>
        <Text style={styles.reglasText}>• 13–14 puntos: Riesgo moderado</Text>
        <Text style={styles.reglasText}>• ≥ 15 puntos: Bajo riesgo</Text>
      </View>

      {totalNorton !== null && (
        <View style={[styles.resultBox, { borderColor: getInterpretacion(totalNorton).color }]}>
          <Text style={styles.resultTotal}>{totalNorton} / 20 puntos</Text>
          <Text style={[styles.resultTexto, { color: getInterpretacion(totalNorton).color }]}>
            {getInterpretacion(totalNorton).texto}
          </Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [styles.btnGuardar, guardado && styles.btnGuardado, pressed && { opacity: 0.8 }]}
        onPress={handleGuardar}
        disabled={guardado}
      >
        <Text style={styles.btnGuardarText}>{guardado ? '✓ Evaluación guardada' : 'Guardar evaluación'}</Text>
      </Pressable>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1F2937', marginBottom: 4 },
  subtitulo: { fontSize: 13, textAlign: 'center', color: '#6B7280', marginBottom: 16 },
  pacienteBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  pacienteBannerText: { fontSize: 14, fontWeight: '700', color: '#1E40AF', textAlign: 'center' },

  criterioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  criterioLabel: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  botonesRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  opcionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  opcionSelected: { backgroundColor: '#00cec9', borderColor: '#00cec9' },
  opcionScore: { fontSize: 18, fontWeight: '700', color: '#374151' },
  opcionScoreSelected: { color: '#fff' },
  opcionTexto: { fontSize: 11, color: '#6B7280', textAlign: 'center', marginTop: 4 },
  opcionTextoSelected: { color: '#fff', fontWeight: '600' },

  interpretacionCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  reglasLabel: { fontSize: 13, fontWeight: '700', color: '#0369A1', marginBottom: 8 },
  reglasText: { fontSize: 13, color: '#0369A1', lineHeight: 20 },

  resultBox: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  resultTotal: { fontSize: 26, fontWeight: 'bold', color: '#1F2937' },
  resultTexto: { fontSize: 16, fontWeight: '700', marginTop: 4 },

  btnGuardar: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnGuardado: { backgroundColor: '#10B981' },
  btnGuardarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
