import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';

interface Option { id: string; label: string; value: number; }
interface Question { id: string; question: string; options: Option[]; }

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
  const { pacienteId = '', pacienteNombre = '' } = useLocalSearchParams<{
    pacienteId: string;
    pacienteNombre: string;
  }>();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [peso, setPeso] = useState('');
  const [estatura, setEstatura] = useState('');
  const [guardado, setGuardado] = useState(false);

  const [nivelPerturbacion, setNivelPerturbacion] = useState(0);
  const [alertaRoja, setAlertaRoja] = useState(false);
  const [magData, setMagData] = useState({ x: 0, y: 0, z: 0 });
  const historialMovimiento = useRef<number[]>([]);
  const isAlertVisible = useRef(false);

  const imcCalculado = useMemo(() => {
    const p = parseFloat(peso);
    const e = parseFloat(estatura);
    if (p > 0 && e > 0) return (p / (e * e)).toFixed(2);
    return null;
  }, [peso, estatura]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    Gyroscope.setUpdateInterval(100);
    Magnetometer.setUpdateInterval(100);

    const confirmarReinicio = () => {
      if (isAlertVisible.current) return;
      isAlertVisible.current = true;
      Alert.alert(
        'Reinicio rápido detectado',
        '¿Deseas borrar todas las respuestas y el IMC actual?',
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => { isAlertVisible.current = false; } },
          {
            text: 'Sí, reiniciar test', style: 'destructive', onPress: () => {
              setAnswers({});
              setPeso('');
              setEstatura('');
              setGuardado(false);
              isAlertVisible.current = false;
            },
          },
        ],
        { cancelable: false }
      );
    };

    const accSub = Accelerometer.addListener(data => {
      const gForce = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
      let movimientoReal = Math.abs(gForce - 1.0);
      if (movimientoReal < 0.11) movimientoReal = 0;

      historialMovimiento.current.push(movimientoReal);
      const suma = historialMovimiento.current.reduce((a, b) => a + b, 0);
      const media = suma / historialMovimiento.current.length;
      setNivelPerturbacion(media);
      if (media > 0.55) confirmarReinicio();
      setAlertaRoja(media > 0.15);
    });

    const gyroSub = Gyroscope.addListener(() => {});
    const magSub = Magnetometer.addListener(d => setMagData(d));

    const intervaloLimpieza = setInterval(() => {
      historialMovimiento.current = [];
      setNivelPerturbacion(0);
      setAlertaRoja(false);
    }, 5000);

    return () => {
      accSub.remove();
      gyroSub.remove();
      magSub.remove();
      clearInterval(intervaloLimpieza);
    };
  }, []);

  const heading = (() => {
    let h = Math.atan2(magData.x, magData.y) * (180 / Math.PI);
    if (h < 0) h += 360;
    return Math.round(h);
  })();

  const getDireccionCardinal = (a: number) => {
    if (a >= 337.5 || a < 22.5) return 'Norte (N)';
    if (a < 67.5) return 'Noreste (NE)';
    if (a < 112.5) return 'Este (E)';
    if (a < 157.5) return 'Sureste (SE)';
    if (a < 202.5) return 'Sur (S)';
    if (a < 247.5) return 'Suroeste (SO)';
    if (a < 292.5) return 'Oeste (O)';
    return 'Noroeste (NO)';
  };

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const calculateTotal = () => {
    let total = 0;
    quizData.forEach(q => {
      const opt = q.options.find(o => o.id === answers[q.id]);
      if (opt) total += opt.value;
    });
    return total;
  };

  const handleGuardar = async () => {
    if (guardado) return;
    const total = calculateTotal();
    try {
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: '15_mna_sf',
        fecha: new Date().toISOString().split('T')[0],
        puntaje: total,
      });
      setGuardado(true);
      const diagnostico = total >= 12
        ? 'Estado nutricional normal'
        : total >= 8 ? 'Riesgo de malnutrición' : 'Malnutrición';
      Alert.alert(
        'Evaluación guardada',
        `${pacienteNombre ? 'Paciente: ' + pacienteNombre + '\n' : ''}Puntaje: ${total} pts.\n${diagnostico}`
      );
    } catch {
      Alert.alert('Error', 'No se pudo guardar. Verifique su conexión.');
    }
  };

  const isFinished = Object.keys(answers).length === quizData.length;
  const total = isFinished ? calculateTotal() : null;
  const diagnostico = total !== null
    ? (total >= 12 ? 'Estado nutricional normal' : total >= 8 ? 'Riesgo de malnutrición' : 'Malnutrición')
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Evaluación MNA-SF</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {pacienteNombre !== '' && (
          <View style={styles.pacienteBanner}>
            <Text style={styles.pacienteBannerText}>👤 {pacienteNombre}</Text>
          </View>
        )}

        {/* ── Sensores ── */}
        <View style={styles.sensorCard}>
          <Text style={styles.sensorTitle}>Sensores activos</Text>
          <View style={styles.sensorRow}>
            <View style={[styles.sensorBox, alertaRoja && styles.sensorBoxDanger]}>
              <Text style={[styles.sensorLabel, alertaRoja && styles.textDanger]}>Perturbación</Text>
              <Text style={[styles.sensorValue, alertaRoja && styles.textDanger]}>
                {(nivelPerturbacion * 100).toFixed(1)}%
              </Text>
              <Text style={styles.sensorSub}>{alertaRoja ? '¡Movimiento constante!' : 'Estable'}</Text>
            </View>
            <View style={styles.sensorBox}>
              <Text style={styles.sensorLabel}>Brújula</Text>
              <Text style={styles.sensorValue}>{heading}°</Text>
              <Text style={styles.sensorSub}>{getDireccionCardinal(heading)}</Text>
            </View>
          </View>
          <Text style={styles.hint}>Agita el teléfono para reiniciar el test</Text>
        </View>

        {/* ── Cuestionario ── */}
        {quizData.map((item, index) => (
          <View key={item.id}>
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
                {item.options.map(option => {
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

        {total !== null && (
          <View style={styles.resultCard}>
            <Text style={styles.resultCardTitle}>Puntaje: {total} / 14</Text>
            <Text style={styles.resultCardDiag}>{diagnostico}</Text>
          </View>
        )}

        <Pressable
          style={[styles.submitBtn, (!isFinished || guardado) && styles.submitBtnDisabled]}
          onPress={handleGuardar}
          disabled={!isFinished || guardado}
        >
          <Text style={styles.submitBtnText}>
            {guardado ? '✓ Evaluación guardada' : 'Guardar evaluación'}
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#CCC' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E' },
  scrollContent: { padding: 16, paddingBottom: 40 },

  pacienteBanner: {
    backgroundColor: '#EFF6FF', borderRadius: 8, padding: 10,
    marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE',
  },
  pacienteBannerText: { fontSize: 14, fontWeight: '700', color: '#1E40AF', textAlign: 'center' },

  sensorCard: {
    backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20,
    elevation: 3, borderWidth: 1, borderColor: '#E5E5EA',
  },
  sensorTitle: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
  sensorRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sensorBox: {
    width: '48%', backgroundColor: '#f8f9fa', padding: 10,
    borderRadius: 8, borderWidth: 1, borderColor: '#eee',
  },
  sensorBoxDanger: { borderColor: '#ff4d4d', backgroundColor: '#ffe6e6' },
  sensorLabel: { fontSize: 12, color: '#7f8c8d', fontWeight: '600' },
  sensorValue: { fontSize: 15, color: '#2980b9', fontWeight: 'bold' },
  sensorSub: { fontSize: 10, color: '#95a5a6' },
  textDanger: { color: '#cc0000' },
  hint: { fontSize: 11, color: '#e67e22', marginTop: 10, fontStyle: 'italic', textAlign: 'center' },

  questionCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 20 },
  questionText: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  optionsContainer: { gap: 8 },
  optionButton: { padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#E5E5EA' },
  optionSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  optionLabel: { fontSize: 15 },
  textSelected: { color: '#FFF', fontWeight: 'bold' },

  imcCalculatorCard: {
    backgroundColor: '#E8F0FE', borderRadius: 12, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: '#BDD7FF',
  },
  imcTitle: { fontSize: 16, fontWeight: 'bold', color: '#1967D2', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputGroup: { width: '45%' },
  labelInput: { fontSize: 12, color: '#5F6368', marginBottom: 4 },
  input: { backgroundColor: '#FFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DADCE0' },
  resultBadge: { marginTop: 12, backgroundColor: '#1967D2', padding: 8, borderRadius: 6, alignItems: 'center' },
  resultText: { color: '#FFF', fontWeight: 'bold' },

  resultCard: {
    backgroundColor: '#F0FDF4', borderRadius: 12, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#BBF7D0', alignItems: 'center',
  },
  resultCardTitle: { fontSize: 20, fontWeight: 'bold', color: '#166534' },
  resultCardDiag: { fontSize: 15, color: '#374151', marginTop: 4 },

  submitBtn: { backgroundColor: '#34C759', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 30 },
  submitBtnDisabled: { backgroundColor: '#A2A2A2' },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default QuizApp;
