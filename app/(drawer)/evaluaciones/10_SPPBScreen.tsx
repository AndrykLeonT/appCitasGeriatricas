import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';

interface RadioButtonProps {
  label: string;
  value: number;
  selectedValue: number;
  onSelect: (val: number) => void;
}

export default function SPPBScreen() {
  const router = useRouter();
  const { pacienteId = '', pacienteNombre = '', idEvaluacion = '10_sppb' } = useLocalSearchParams<{
    pacienteId: string;
    pacienteNombre: string;
    idEvaluacion: string;
  }>();

  const [guardando, setGuardando] = useState(false);
  const [puntosEquilibrio, setPuntosEquilibrio] = useState<number>(0);
  const [puntosMarcha, setPuntosMarcha] = useState<number>(0);
  const [puntosSilla, setPuntosSilla] = useState<number>(0);

  const total = puntosEquilibrio + puntosMarcha + puntosSilla;

  const RadioButton: React.FC<RadioButtonProps> = ({ label, value, selectedValue, onSelect }) => (
    <TouchableOpacity 
      style={[styles.radioItem, selectedValue === value && styles.radioSelected]} 
      onPress={() => onSelect(value)}
    >
      <Text style={selectedValue === value ? styles.radioTextSelected : styles.radioText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Batería de Desempeño Físico (SPPB)</Text>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>1. Pruebas de Equilibrio</Text>
        <RadioButton label="No pudo / < 10 seg (0 pts)" value={0} selectedValue={puntosEquilibrio} onSelect={setPuntosEquilibrio} />
        <RadioButton label="Pies juntos y semitándem (2 pts)" value={2} selectedValue={puntosEquilibrio} onSelect={setPuntosEquilibrio} />
        <RadioButton label="Completó todas las posiciones (4 pts)" value={4} selectedValue={puntosEquilibrio} onSelect={setPuntosEquilibrio} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>2. Velocidad de la Marcha (4m)</Text>
        <RadioButton label="Más de 8.7 seg (1 pt)" value={1} selectedValue={puntosMarcha} onSelect={setPuntosMarcha} />
        <RadioButton label="4.82 - 6.20 seg (3 pts)" value={3} selectedValue={puntosMarcha} onSelect={setPuntosMarcha} />
        <RadioButton label="Menos de 4.82 seg (4 pts)" value={4} selectedValue={puntosMarcha} onSelect={setPuntosMarcha} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>3. Levantarse de la silla (5 veces)</Text>
        <RadioButton label="No pudo / > 60 seg (0 pts)" value={0} selectedValue={puntosSilla} onSelect={setPuntosSilla} />
        <RadioButton label="13.7 - 16.6 seg (2 pts)" value={2} selectedValue={puntosSilla} onSelect={setPuntosSilla} />
        <RadioButton label="Menos de 11.1 seg (4 pts)" value={4} selectedValue={puntosSilla} onSelect={setPuntosSilla} />
      </View>

      <View style={[styles.resultCard, total <= 9 ? styles.alertLow : styles.alertHigh]}>
        <Text style={styles.resultText}>Puntaje Total: {total} / 12</Text>
        <Text style={styles.interpretacion}>
          {total <= 9 ? "ALTO RIESGO DE FRAGILIDAD" : "DESEMPEÑO NORMAL"}
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, guardando && { opacity: 0.7 }]} 
        onPress={async () => {
          if (guardando) return;
          setGuardando(true);
          const estado = total <= 9 ? "ALTO RIESGO DE FRAGILIDAD" : "DESEMPEÑO NORMAL";
          try {
            await guardarRegistroEvaluacion({
              idPaciente: pacienteId,
              idEvaluacion: idEvaluacion,
              fecha: new Date().toISOString().split('T')[0],
              puntaje: total,
              diagnostico: estado
            });
            Alert.alert(
              "Éxito", 
              "Evaluación guardada.",
              [{ text: "OK", onPress: () => router.back() }]
            );
          } catch {
            Alert.alert("Error", "No se pudo guardar la evaluación");
          } finally {
            setGuardando(false);
          }
        }}
        disabled={guardando}
      >
        <Text style={styles.buttonText}>{guardando ? "Guardando..." : "Guardar Evaluación"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, marginTop: 15 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#6200ee', marginBottom: 10 },
  radioItem: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginVertical: 4 },
  radioSelected: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
  radioText: { color: '#444' },
  radioTextSelected: { color: '#fff', fontWeight: 'bold' },
  resultCard: { padding: 20, borderRadius: 10, alignItems: 'center' },
  alertLow: { backgroundColor: '#ffebee' },
  alertHigh: { backgroundColor: '#e8f5e9' },
  resultText: { fontSize: 20, fontWeight: 'bold' },
  interpretacion: { fontSize: 14, marginTop: 5, fontWeight: 'bold' },
  button: { backgroundColor: '#6200ee', padding: 15, borderRadius: 10, marginVertical: 30, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
