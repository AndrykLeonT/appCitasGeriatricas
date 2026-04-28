import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';

const getResultado = (total: number) => {
  if (total >= 3) return { estado: 'FRÁGIL', color: '#FFEBEE' };
  if (total >= 1) return { estado: 'PRE-FRÁGIL', color: '#FFF3E0' };
  return { estado: 'ROBUSTO', color: '#E8F5E9' };
};

interface OptionButtonProps {
  label: string;
  score: number;
  currentScore: number;
  onSelect: (s: number) => void;
}

const OptionButton = ({ label, score, currentScore, onSelect }: OptionButtonProps) => (
  <TouchableOpacity
    style={[styles.option, currentScore === score && styles.optionSelected]}
    onPress={() => onSelect(score)}
  >
    <Text style={[styles.optionText, currentScore === score && styles.optionTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

export default function FrailApp() {
  const { pacienteId = '', pacienteNombre = '' } = useLocalSearchParams<{
    pacienteId: string;
    pacienteNombre: string;
  }>();

  const [acc, setAcc] = useState({ x: 0, y: 0, z: 0 });
  const [gyro, setGyro] = useState({ x: 0, y: 0, z: 0 });
  const [mag, setMag] = useState({ x: 0, y: 0, z: 0 });

  const [f, setF] = useState<number>(-1);
  const [r, setR] = useState<number>(-1);
  const [a, setA] = useState<number>(-1);
  const [il, setIl] = useState<number>(-1);
  const [l, setL] = useState<number>(-1);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    Accelerometer.setUpdateInterval(500);
    const subs = [
      Accelerometer.addListener(setAcc),
      Gyroscope.addListener(setGyro),
      Magnetometer.addListener(setMag),
    ];
    return () => subs.forEach(s => s.remove());
  }, []);

  const allAnswered = f >= 0 && r >= 0 && a >= 0 && il >= 0 && l >= 0;
  const total = allAnswered ? f + r + a + il + l : null;

  const handleGuardar = async () => {
    if (!allAnswered || total === null) {
      Alert.alert('Incompleto', 'Por favor responda todas las preguntas antes de guardar.');
      return;
    }
    if (guardado) return;
    const resultado = getResultado(total);
    try {
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: '10_frail',
        fecha: new Date().toISOString().split('T')[0],
        puntaje: total,
      });
      setGuardado(true);
      Alert.alert(
        'Evaluación guardada',
        `${pacienteNombre ? 'Paciente: ' + pacienteNombre + '\n' : ''}Puntaje: ${total}/5\n${resultado.estado}`
      );
    } catch {
      Alert.alert('Error', 'No se pudo guardar. Verifique su conexión.');
    }
  };

  const renderQuestion = (
    title: string,
    description: string,
    scoreVar: number,
    setScoreVar: (s: number) => void
  ) => (
    <View style={styles.card}>
      <Text style={styles.questionTitle}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.row}>
        <OptionButton label="Sí (1 pt)" score={1} currentScore={scoreVar} onSelect={setScoreVar} />
        <OptionButton label="No (0 pts)" score={0} currentScore={scoreVar} onSelect={setScoreVar} />
      </View>
    </View>
  );

  const resultado = total !== null ? getResultado(total) : null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Cuestionario FRAIL</Text>
      <Text style={styles.subHeader}>Detección de fragilidad</Text>

      {pacienteNombre !== '' && (
        <View style={styles.pacienteBanner}>
          <Text style={styles.pacienteBannerText}>👤 {pacienteNombre}</Text>
        </View>
      )}

      {/* ── Monitoreo de sensores ── */}
      <Text style={styles.sectionHeader}>Monitoreo de sensores</Text>

      <View style={styles.sensorCard}>
        <Text style={styles.sensorTitle}>Acelerómetro (caídas)</Text>
        <Text style={styles.sensorText}>X: {acc.x.toFixed(2)}  Y: {acc.y.toFixed(2)}  Z: {acc.z.toFixed(2)}</Text>
      </View>

      <View style={styles.sensorCard}>
        <Text style={styles.sensorTitle}>Giroscopio (rotación)</Text>
        <Text style={styles.sensorText}>X: {gyro.x.toFixed(2)}  Y: {gyro.y.toFixed(2)}  Z: {gyro.z.toFixed(2)}</Text>
      </View>

      <View style={styles.sensorCard}>
        <Text style={styles.sensorTitle}>Magnetómetro</Text>
        <Text style={styles.sensorText}>Magnitud: {Math.sqrt(mag.x ** 2 + mag.y ** 2 + mag.z ** 2).toFixed(2)} µT</Text>
      </View>

      <View style={styles.separator} />

      {/* ── Preguntas FRAIL ── */}
      {renderQuestion('F – Fatiga', '¿Se siente cansado la mayor parte del tiempo?', f, setF)}
      {renderQuestion('R – Resistencia', '¿Tiene dificultad para subir 10 escalones sin descansar?', r, setR)}
      {renderQuestion('A – Aeróbico', '¿Tiene dificultad para caminar 100 metros?', a, setA)}
      {renderQuestion('I – Illness', '¿Tiene más de 5 enfermedades crónicas?', il, setIl)}
      {renderQuestion('L – Loss of weight', '¿Perdió más del 5% de su peso en los últimos 6 meses?', l, setL)}

      {resultado && (
        <View style={[styles.resultCard, { backgroundColor: resultado.color }]}>
          <Text style={styles.resultLabel}>Puntaje: {total} / 5</Text>
          <Text style={styles.resultStatus}>Estado: {resultado.estado}</Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [styles.saveButton, guardado && styles.saveButtonGuardado, pressed && { opacity: 0.8 }]}
        onPress={handleGuardar}
        disabled={guardado}
      >
        <Text style={styles.saveButtonText}>{guardado ? '✓ Evaluación guardada' : 'Guardar evaluación'}</Text>
      </Pressable>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5', padding: 15 },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1F2937', marginBottom: 4 },
  subHeader: { fontSize: 14, textAlign: 'center', color: '#6B7280', marginBottom: 16 },
  pacienteBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  pacienteBannerText: { fontSize: 14, fontWeight: '700', color: '#1E40AF', textAlign: 'center' },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#374151' },
  sensorCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 10, elevation: 2 },
  sensorTitle: { fontSize: 14, fontWeight: 'bold', color: '#6200ee', marginBottom: 4 },
  sensorText: { fontSize: 13, color: '#374151' },
  separator: { height: 1, backgroundColor: '#D1D5DB', marginVertical: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  questionTitle: { fontSize: 17, fontWeight: 'bold', color: '#6200ee', marginBottom: 4 },
  description: { fontSize: 14, color: '#444', marginBottom: 10, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  option: {
    flex: 0.48,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  optionSelected: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
  optionText: { color: '#6B7280', fontWeight: 'bold' },
  optionTextSelected: { color: '#fff' },
  resultCard: { padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  resultLabel: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  resultStatus: { fontSize: 16, marginTop: 4, fontWeight: 'bold', color: '#1F2937' },
  saveButton: { backgroundColor: '#6200ee', padding: 16, borderRadius: 10, alignItems: 'center' },
  saveButtonGuardado: { backgroundColor: '#10B981' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
