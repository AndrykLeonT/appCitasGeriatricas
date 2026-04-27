import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default function FrailApp() {
  const router = useRouter();
  const { pacienteId = '', idEvaluacion = '09_frail' } = useLocalSearchParams<{
    pacienteId: string;
    idEvaluacion: string;
  }>();
  const [guardando, setGuardando] = useState(false);


  // --- ESTADOS DEL CUESTIONARIO ---
  const [f, setF] = useState<number | null>(null);
  const [r, setR] = useState<number | null>(null);
  const [a, setA] = useState<number | null>(null);
  const [i, setI] = useState<number | null>(null);
  const [l, setL] = useState<number | null>(null);

  const total = (f || 0) + (r || 0) + (a || 0) + (i || 0) + (l || 0);
  const estaCompleto = f !== null && r !== null && a !== null && i !== null && l !== null;

  const borrarRespuestas = () => {
    setF(null);
    setR(null);
    setA(null);
    setI(null);
    setL(null);
  };

  // --- EFECTO DE SENSORES ---
  useEffect(() => {
    Accelerometer.setUpdateInterval(500);
    const sub = Accelerometer.addListener(data => {
      const { x, y, z } = data;
      const magnitude = Math.sqrt(x*x + y*y + z*z);
      // Detect shake for both G units (1G gravity) and m/s^2 units (9.8 gravity)
      if ((magnitude > 2.5 && magnitude < 8.0) || magnitude > 20.0) {
        borrarRespuestas();
      }
    });
    return () => sub.remove();
  }, []);

  // --- COMPONENTES AUXILIARES ---
  const OptionButton = ({ label, score, currentScore, onSelect }: { label: string, score: number, currentScore: number | null, onSelect: (s: number) => void }) => (
    <TouchableOpacity 
      style={[styles.option, currentScore === score && styles.optionSelected]} 
      onPress={() => onSelect(score)}
    >
      <Text style={[styles.optionText, currentScore === score && styles.optionTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderQuestion = (title: string, description: string, scoreVar: number | null, setScoreVar: (s: number) => void) => (
    <View style={styles.card}>
      <Text style={styles.questionTitle}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.row}>
        <OptionButton label="Sí (1 pt)" score={1} currentScore={scoreVar} onSelect={setScoreVar} />
        <OptionButton label="No (0 pts)" score={0} currentScore={scoreVar} onSelect={setScoreVar} />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* SECCIÓN FRAIL */}
      <Text style={styles.header}>Cuestionario FRAIL</Text>
      <Text style={styles.subHeader}>Detección de fragilidad (Guía INGER)</Text>

      {renderQuestion("F - Fatiga", "¿Se siente cansado la mayor parte del tiempo?", f, setF)}
      {renderQuestion("R - Resistencia", "¿Dificultad para subir 10 escalones?", r, setR)}
      {renderQuestion("A - Aeróbico", "¿Dificultad para caminar 100 metros?", a, setA)}
      {renderQuestion("I - Illness", "¿Tiene más de 5 enfermedades crónicas?", i, setI)}
      {renderQuestion("L - Loss", "¿Perdió >5% de peso en 6 meses?", l, setL)}

      <View style={[styles.resultCard, total >= 3 ? styles.fragil : total >= 1 ? styles.prefragil : styles.sano]}>
        <Text style={styles.resultLabel}>Puntaje: {total} / 5</Text>
        <Text style={styles.resultStatus}>
          {total >= 3 ? "ESTADO: FRÁGIL" : total >= 1 ? "ESTADO: PRE-FRÁGIL" : "ESTADO: ROBUSTO"}
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, (!estaCompleto || guardando) && { opacity: 0.7 }]} 
        onPress={async () => {
          if (!estaCompleto) {
            Alert.alert("Incompleto", "Por favor responda todas las preguntas antes de guardar.");
            return;
          }
          if (guardando) return;
          setGuardando(true);
          const estado = total >= 3 ? "FRÁGIL" : total >= 1 ? "PRE-FRÁGIL" : "ROBUSTO";
          try {
            await guardarRegistroEvaluacion({
              idPaciente: pacienteId,
              idEvaluacion: idEvaluacion,
              fecha: new Date().toISOString().split('T')[0],
              puntaje: total,
              diagnostico: estado
            });
            Alert.alert(
              "Guardado", 
              "Evaluación registrada.",
              [{ text: "OK", onPress: () => router.back() }]
            );
          } catch {
            Alert.alert("Error", "No se pudo guardar la evaluación");
          } finally {
            setGuardando(false);
          }
        }}
        disabled={!estaCompleto || guardando}
      >
        <Text style={styles.saveButtonText}>{guardando ? "Guardando..." : "Guardar Evaluación"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 15 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
  subHeader: { fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 20 },
  
  // Estilos de tarjetas de sensores
  sensorCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  sensorTitle: { fontSize: 16, fontWeight: 'bold', color: '#6200ee', marginBottom: 5 },
  
  // Estilos de cuestionario
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12 },
  questionTitle: { fontSize: 17, fontWeight: 'bold', color: '#6200ee' },
  description: { fontSize: 14, color: '#444', marginVertical: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  option: { flex: 0.48, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  optionSelected: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
  optionText: { color: '#666', fontWeight: 'bold' },
  optionTextSelected: { color: '#fff' },
  
  // Resultados
  resultCard: { padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  sano: { backgroundColor: '#e8f5e9' },
  prefragil: { backgroundColor: '#fff3e0' },
  fragil: { backgroundColor: '#ffebee' },
  resultLabel: { fontSize: 18, fontWeight: 'bold' },
  resultStatus: { fontSize: 16, marginTop: 4, fontWeight: 'bold' },
  
  // Botones y decoraciones
  saveButton: { backgroundColor: '#6200ee', padding: 16, borderRadius: 10, marginTop: 10, marginBottom: 40, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  separator: { height: 1, backgroundColor: '#ccc', marginVertical: 25 },
});
