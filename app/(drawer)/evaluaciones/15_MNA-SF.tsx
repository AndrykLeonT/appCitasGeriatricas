import React, { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Option {
  id: string;
  label: string;
  value: number;
}

interface Question {
  id: string;
  question: string;
  options: Option[];
}

const quizData: Question[] = [
  {
    id: 'p1',
    question: '1. ¿Ha comido menos por falta de apetito, problemas digestivos, dificultades de masticación o deglución en los últimos 3 meses?',
    options: [
      { id: '1a', label: 'Ha comido mucho menos', value: 0 },
      { id: '1b', label: 'Ha comido menos', value: 1 },
      { id: '1c', label: 'Igual o mucho más', value: 2 },
    ],
  },
  {
    id: 'p2',
    question: '2. ¿Ha tenido pérdida reciente de peso en los últimos tres meses?',
    options: [
      { id: '2a', label: 'Pérdida mayor a 3 kilos', value: 0 },
      { id: '2b', label: 'No lo sabe', value: 1 },
      { id: '2c', label: 'Pérdida de peso entre 1 y 3 kilos', value: 2 },
      { id: '2d', label: 'No ha perdido peso', value: 3 },
    ],
  },
  {
    id: 'p3',
    question: '3. Movilidad (¿Cómo se desplaza habitualmente?)',
    options: [
      { id: '3a', label: 'De la cama al sillón', value: 0 },
      { id: '3b', label: 'Autonomía en el interior del domicilio', value: 1 },
      { id: '3c', label: 'Sale del domicilio / Sale a la calle', value: 2 },
    ],
  },
  {
    id: 'p4',
    question: '4. ¿Ha tenido una enfermedad aguda o estrés psicológico en los últimos tres meses?',
    options: [
      { id: '4a', label: 'Sí', value: 0 },
      { id: '4b', label: 'No', value: 2 },
    ],
  },
  {
    id: 'p5',
    question: '5. Problemas neuropsicológicos:',
    options: [
      { id: '5a', label: 'Demencia o depresión grave', value: 0 },
      { id: '5b', label: 'Demencia moderada', value: 1 },
      { id: '5c', label: 'Sin problemas psicológicos', value: 2 },
    ],
  },
  {
    id: 'p6',
    question: '6. Índice de Masa Corporal (IMC):',
    options: [
      { id: '6a', label: 'Menor a 19', value: 0 },
      { id: '6b', label: 'Entre 19 y menos de 21', value: 1 },
      { id: '6c', label: 'Entre 21 y menos de 23', value: 2 },
      { id: '6d', label: 'Mayor o igual a 23', value: 3 },
    ],
  },
];


const QuizApp = () => {
  const router = useRouter();
  const { pacienteId = '', pacienteNombre = '', idEvaluacion = '15_mna_sf' } = useLocalSearchParams<{
    pacienteId: string;
    pacienteNombre: string;
    idEvaluacion: string;
  }>();
  
  const [guardando, setGuardando] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [peso, setPeso] = useState('');
  const [estatura, setEstatura] = useState('');

  const imcCalculado = useMemo(() => {
    const p = parseFloat(peso);
    const e = parseFloat(estatura);
    if (p > 0 && e > 0) return (p / (e * e)).toFixed(2);
    return null;
  }, [peso, estatura]);

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const calculateTotal = async () => {
    if (guardando) return;
    setGuardando(true);
    let total = 0;
    Object.keys(answers).forEach((qId) => {
      const question = quizData.find((q) => q.id === qId);
      const option = question?.options.find((o) => o.id === answers[qId]);
      if (option) total += option.value;
    });

    let diagnostico = total >= 12 ? "Estado nutricional normal" : total >= 8 ? "Riesgo de malnutrición" : "Malnutrición";
    
    try {
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: idEvaluacion,
        fecha: new Date().toISOString().split('T')[0],
        puntaje: total,
        diagnostico: diagnostico
      });
      Alert.alert(
        "Resultado MNA", 
        `Puntaje: ${total} pts.\n${diagnostico}`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "No se pudo guardar la evaluación.");
    } finally {
      setGuardando(false);
    }
  };

  const isFinished = Object.keys(answers).length === quizData.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Evaluación MNA</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {quizData.map((item, index) => (
          <View key={item.id}>
            
            {/* INSERTAR CALCULADORA ANTES DE LA PREGUNTA 6 (Índice 5) */}
            {index === 5 && (
              <View style={styles.imcCalculatorCard}>
                <Text style={styles.imcTitle}>Calcular el IMC</Text>
                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.labelInput}>Peso (kg)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: 70"
                      keyboardType="numeric"
                      value={peso}
                      onChangeText={setPeso}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.labelInput}>Estatura (m)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: 1.75"
                      keyboardType="numeric"
                      value={estatura}
                      onChangeText={setEstatura}
                    />
                  </View>
                </View>
                {imcCalculado && (
                  <View style={styles.resultBadge}>
                    <Text style={styles.resultText}>IMC Resultado: {imcCalculado}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{item.question}</Text>
              <View style={styles.optionsContainer}>
                {item.options.map((option) => {
                  const isSelected = answers[item.id] === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => handleSelect(item.id, option.id)}
                      style={[styles.optionButton, isSelected && styles.optionSelected]}
                    >
                      <Text style={[styles.optionLabel, isSelected && styles.textSelected]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitBtn, (!isFinished || guardando) && styles.submitBtnDisabled]}
          onPress={calculateTotal}
          disabled={!isFinished || guardando}
        >
          <Text style={styles.submitBtnText}>{guardando ? "Guardando..." : "Ver Resultado Final"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#CCC' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E' },
  scrollContent: { padding: 16 },
  questionCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 20 },
  questionText: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  optionsContainer: { gap: 8 },
  optionButton: { padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#E5E5EA' },
  optionSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  optionLabel: { fontSize: 15 },
  textSelected: { color: '#FFF', fontWeight: 'bold' },
  
  // Estilos de la Calculadora
  imcCalculatorCard: {
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BDD7FF',
  },
  imcTitle: { fontSize: 16, fontWeight: 'bold', color: '#1967D2', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputGroup: { width: '45%' },
  labelInput: { fontSize: 12, color: '#5F6368', marginBottom: 4 },
  input: { backgroundColor: '#FFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DADCE0' },
  resultBadge: { marginTop: 12, backgroundColor: '#1967D2', padding: 8, borderRadius: 6, alignItems: 'center' },
  resultText: { color: '#FFF', fontWeight: 'bold' },
  
  submitBtn: { backgroundColor: '#34C759', padding: 18, borderRadius: 12, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#A2A2A2' },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default QuizApp;