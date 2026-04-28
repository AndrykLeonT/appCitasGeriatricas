import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';

interface RadioButtonProps {
  label: string;
  value: number;
  selectedValue: number;
  onSelect: (val: number) => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({ label, value, selectedValue, onSelect }) => (
  <TouchableOpacity
    style={[styles.radioItem, selectedValue === value && styles.radioSelected]}
    onPress={() => onSelect(selectedValue === value ? -1 : value)}
  >
    <Text style={selectedValue === value ? styles.radioTextSelected : styles.radioText}>{label}</Text>
  </TouchableOpacity>
);

const getInterpretacion = (total: number) => {
  if (total <= 6) return 'Alto riesgo de fragilidad';
  if (total <= 9) return 'Capacidad física reducida';
  return 'Desempeño normal';
};

export default function SPPBScreen() {
  const { pacienteId = '', pacienteNombre = '' } = useLocalSearchParams<{
    pacienteId: string;
    pacienteNombre: string;
  }>();

  const [puntosEquilibrio, setPuntosEquilibrio] = useState<number>(-1);
  const [puntosMarcha, setPuntosMarcha] = useState<number>(-1);
  const [puntosSilla, setPuntosSilla] = useState<number>(-1);
  const [guardado, setGuardado] = useState(false);

  const allAnswered = puntosEquilibrio >= 0 && puntosMarcha >= 0 && puntosSilla >= 0;
  const total = allAnswered ? puntosEquilibrio + puntosMarcha + puntosSilla : null;

  const handleGuardar = async () => {
    if (!allAnswered || total === null) {
      Alert.alert('Incompleto', 'Por favor seleccione una opción en cada sección.');
      return;
    }
    if (guardado) return;
    try {
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: '09_sppb',
        fecha: new Date().toISOString().split('T')[0],
        puntaje: total,
      });
      setGuardado(true);
      Alert.alert(
        'Evaluación guardada',
        `${pacienteNombre ? 'Paciente: ' + pacienteNombre + '\n' : ''}Puntaje: ${total}/12\n${getInterpretacion(total)}`
      );
    } catch {
      Alert.alert('Error', 'No se pudo guardar. Verifique su conexión.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Batería de Desempeño Físico (SPPB)</Text>

      {pacienteNombre !== '' && (
        <View style={styles.pacienteBanner}>
          <Text style={styles.pacienteBannerText}>👤 {pacienteNombre}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>1. Pruebas de Equilibrio</Text>
        <RadioButton label="No pudo / < 10 seg (0 pts)" value={0} selectedValue={puntosEquilibrio} onSelect={setPuntosEquilibrio} />
        <RadioButton label="Pies juntos y semitándem (2 pts)" value={2} selectedValue={puntosEquilibrio} onSelect={setPuntosEquilibrio} />
        <RadioButton label="Completó todas las posiciones (4 pts)" value={4} selectedValue={puntosEquilibrio} onSelect={setPuntosEquilibrio} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>2. Velocidad de la Marcha (4m)</Text>
        <RadioButton label="Más de 8.7 seg (1 pt)" value={1} selectedValue={puntosMarcha} onSelect={setPuntosMarcha} />
        <RadioButton label="4.82 – 6.20 seg (3 pts)" value={3} selectedValue={puntosMarcha} onSelect={setPuntosMarcha} />
        <RadioButton label="Menos de 4.82 seg (4 pts)" value={4} selectedValue={puntosMarcha} onSelect={setPuntosMarcha} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>3. Levantarse de la silla (5 veces)</Text>
        <RadioButton label="No pudo / > 60 seg (0 pts)" value={0} selectedValue={puntosSilla} onSelect={setPuntosSilla} />
        <RadioButton label="13.7 – 16.6 seg (2 pts)" value={2} selectedValue={puntosSilla} onSelect={setPuntosSilla} />
        <RadioButton label="Menos de 11.1 seg (4 pts)" value={4} selectedValue={puntosSilla} onSelect={setPuntosSilla} />
      </View>

      {total !== null && (
        <View style={[styles.resultCard, total <= 9 ? styles.alertLow : styles.alertHigh]}>
          <Text style={styles.resultText}>Puntaje Total: {total} / 12</Text>
          <Text style={styles.interpretacion}>{getInterpretacion(total)}</Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [styles.button, guardado && styles.buttonGuardado, pressed && { opacity: 0.8 }]}
        onPress={handleGuardar}
        disabled={guardado}
      >
        <Text style={styles.buttonText}>{guardado ? '✓ Evaluación guardada' : 'Guardar evaluación'}</Text>
      </Pressable>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: '#1F2937' },
  pacienteBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  pacienteBannerText: { fontSize: 14, fontWeight: '700', color: '#1E40AF', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#6200ee', marginBottom: 10 },
  radioItem: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginVertical: 4 },
  radioSelected: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
  radioText: { color: '#444' },
  radioTextSelected: { color: '#fff', fontWeight: 'bold' },
  resultCard: { padding: 20, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  alertLow: { backgroundColor: '#ffebee' },
  alertHigh: { backgroundColor: '#e8f5e9' },
  resultText: { fontSize: 20, fontWeight: 'bold' },
  interpretacion: { fontSize: 14, marginTop: 5, fontWeight: 'bold' },
  button: { backgroundColor: '#6200ee', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center' },
  buttonGuardado: { backgroundColor: '#10B981' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
