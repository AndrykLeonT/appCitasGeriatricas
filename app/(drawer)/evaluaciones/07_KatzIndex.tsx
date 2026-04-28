import { Accelerometer } from 'expo-sensors';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';

type KatzKey = 'bath' | 'dress' | 'toilet' | 'transfer' | 'continence' | 'feeding';
type KatzAnswers = { [key in KatzKey]: 'si' | 'no' | null };

const PREGUNTAS: { key: KatzKey; titulo: string; descripcion: string }[] = [
  {
    key: 'bath',
    titulo: '1) Baño (Esponja, regadera o tina).',
    descripcion:
      'Sí: No recibe asistencia (puede entrar y salir de la tina u otra forma de baño).\n' +
      'Sí: Que reciba asistencia durante el baño en una sola parte del cuerpo (ej. espalda o pierna).\n' +
      'No: Que reciba asistencia durante el baño en más de una parte.',
  },
  {
    key: 'dress',
    titulo: '2) Vestido.',
    descripcion:
      'Sí: Que pueda tomar las prendas y vestirse completamente, sin asistencia.\n' +
      'Sí: Que pueda tomar las prendas y vestirse sin asistencia excepto en abrocharse los zapatos.\n' +
      'No: Que reciba asistencia para tomar las prendas y vestirse.',
  },
  {
    key: 'toilet',
    titulo: '3) Uso del Sanitario.',
    descripcion:
      'Sí: Sin ninguna asistencia (puede utilizar algún objeto de soporte como bastón o silla de ruedas).\n' +
      'Sí: Que reciba asistencia al ir al baño, en limpiarse y que pueda manejar por sí mismo el pañal.\n' +
      'No: Que no vaya al baño por sí mismo/a.',
  },
  {
    key: 'transfer',
    titulo: '4) Transferencias.',
    descripcion:
      'Sí: Que se mueva dentro y fuera de la cama y silla sin ninguna asistencia.\n' +
      'Sí: Que pueda moverse dentro y fuera de la cama y silla con asistencia.\n' +
      'No: Que no pueda salir de la cama.',
  },
  {
    key: 'continence',
    titulo: '5) Continencia.',
    descripcion:
      'Sí: Control total de esfínteres.\n' +
      'Sí: Que tenga accidentes ocasionales que no afectan su vida social.\n' +
      'No: Necesita ayuda para supervisión de control de esfínteres, utiliza sonda o es incontinente.',
  },
  {
    key: 'feeding',
    titulo: '6) Alimentación.',
    descripcion:
      'Sí: Que se alimente por sí solo sin asistencia alguna.\n' +
      'Sí: Que se alimente solo y que tenga asistencia sólo para cortar la carne o untar mantequilla.\n' +
      'No: Que reciba asistencia en la alimentación o que se alimente por vía enteral o parenteral.',
  },
];

const clasificarKatz = (answers: KatzAnswers): string => {
  const independientes = Object.values(answers).filter(v => v === 'si').length;
  const dependientes = Object.values(answers).filter(v => v === 'no').length;
  const { bath, dress, toilet, transfer } = answers;

  if (independientes === 6) return 'A – Independencia en todas las actividades básicas de la vida diaria.';
  if (independientes === 5) return 'B – Independencia en todas las actividades menos en una.';
  if (dependientes === 6) return 'G – Dependiente en las seis actividades básicas de la vida diaria.';
  if (bath === 'no') {
    if (dress === 'no' && toilet === 'no' && transfer === 'no') return 'F – Dependencia en baño, vestido, sanitario y transferencias, más otra actividad.';
    if (dress === 'no' && toilet === 'no') return 'E – Dependencia en baño, vestido y sanitario, más otra actividad.';
    if (dress === 'no') return 'D – Dependencia en baño y vestido, más otra actividad.';
    return 'C – Dependencia en baño, más otra actividad adicional.';
  }
  return 'H – Dependencia en dos o más actividades (no clasifica en C–F).';
};

interface SensorBlockProps {
  onResult: (score: number) => void;
  lastScore: number | null;
  transferValue: 'si' | 'no' | null;
}

function SensorResultBlock({ onResult, lastScore, transferValue }: SensorBlockProps) {
  const [running, setRunning] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const subRef = useRef<any>(null);

  useEffect(() => {
    return () => { subRef.current?.remove(); };
  }, []);

  const iniciarPrueba = () => {
    setRunning(true);
    setAnalyzing(true);
    Accelerometer.setUpdateInterval(100);
    const samples: number[] = [];
    subRef.current = Accelerometer.addListener((data) => {
      const mag = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
      samples.push(mag);
    });

    setTimeout(() => {
      subRef.current?.remove();
      setRunning(false);
      setAnalyzing(false);
      const mean = samples.reduce((a, b) => a + b, 0) / Math.max(samples.length, 1);
      const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(samples.length, 1);
      let peaks = 0;
      for (let i = 1; i < samples.length - 1; i++) {
        if (samples[i] > samples[i - 1] * 1.15 && samples[i] > samples[i + 1] * 1.15 && samples[i] > mean + 0.02) {
          peaks++;
        }
      }
      const score = Math.min(100, Math.round(variance * 1000 + peaks * 10));
      onResult(score);
    }, 7000);
  };

  return (
    <View style={sensorStyles.container}>
      <Text style={sensorStyles.label}>Prueba con sensores del dispositivo</Text>
      <Text style={sensorStyles.hint}>
        El paciente realiza los movimientos de transferencia durante 7 segundos mientras el dispositivo detecta el movimiento.
      </Text>
      <Pressable
        onPress={iniciarPrueba}
        disabled={running}
        style={[sensorStyles.btn, running && sensorStyles.btnRunning]}
      >
        <Text style={sensorStyles.btnText}>{running ? 'Grabando… (7 seg)' : 'Iniciar prueba de transferencia'}</Text>
      </Pressable>
      {analyzing && (
        <View style={sensorStyles.analyzing}>
          <ActivityIndicator color="#6200ee" />
          <Text style={sensorStyles.analyzingText}>Analizando datos…</Text>
        </View>
      )}
      {lastScore !== null && !analyzing && (
        <Text style={sensorStyles.result}>
          Resultado del sensor: {lastScore} pts → Transferencia: {transferValue === 'si' ? 'Sí (independiente)' : 'No (requiere asistencia)'}
        </Text>
      )}
    </View>
  );
}

const sensorStyles = StyleSheet.create({
  container: { marginTop: 10, padding: 12, backgroundColor: '#F5F0FF', borderRadius: 10, borderWidth: 1, borderColor: '#DDD6FE' },
  label: { fontSize: 13, fontWeight: '700', color: '#5B21B6', marginBottom: 4 },
  hint: { fontSize: 12, color: '#6D28D9', marginBottom: 8, lineHeight: 18 },
  btn: { backgroundColor: '#7C3AED', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnRunning: { backgroundColor: '#A78BFA' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  analyzing: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  analyzingText: { color: '#5B21B6', fontSize: 13 },
  result: { marginTop: 8, fontSize: 13, color: '#4C1D95', fontWeight: '600' },
});

export default function KatzIndex() {
  const { pacienteId = '', pacienteNombre = '' } = useLocalSearchParams<{
    pacienteId: string;
    pacienteNombre: string;
  }>();

  const [answers, setAnswers] = useState<KatzAnswers>({
    bath: null, dress: null, toilet: null,
    transfer: null, continence: null, feeding: null,
  });
  const [guardado, setGuardado] = useState(false);
  const [lastSensorScore, setLastSensorScore] = useState<number | null>(null);

  const setAnswer = (key: KatzKey, value: 'si' | 'no') => {
    setAnswers(prev => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  const handleSensorResult = (score: number) => {
    setLastSensorScore(score);
    setAnswers(prev => ({ ...prev, transfer: score > 30 ? 'si' : 'no' }));
  };

  const handleGuardar = async () => {
    if (guardado) return;
    const puntaje = Object.values(answers).filter(v => v === 'si').length;
    const clasificacion = clasificarKatz(answers);
    try {
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: '07_katz',
        fecha: new Date().toISOString().split('T')[0],
        puntaje,
      });
      setGuardado(true);
      Alert.alert(
        'Evaluación guardada',
        `${pacienteNombre ? 'Paciente: ' + pacienteNombre + '\n' : ''}Puntaje: ${puntaje}/6\n\n${clasificacion}`
      );
    } catch {
      Alert.alert('Error', 'No se pudo guardar. Verifique su conexión.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Índice de Katz</Text>

      {pacienteNombre !== '' && (
        <View style={styles.pacienteBanner}>
          <Text style={styles.pacienteBannerText}>👤 {pacienteNombre}</Text>
        </View>
      )}

      <View style={styles.instrucciones}>
        <Text style={styles.instruccionesTexto}>
          Seleccione "Sí" si la persona puede realizar la actividad de forma independiente o con asistencia mínima, y "No" si requiere ayuda completa o no puede realizarla. En la sección de transferencias puede usar los sensores del dispositivo para apoyar la evaluación.
        </Text>
      </View>

      {PREGUNTAS.map((p, i) => (
        <View key={p.key}>
          <Text style={styles.preguntaTitulo}>{p.titulo}</Text>
          <View style={styles.row}>
            <Text style={styles.descripcion}>{p.descripcion}</Text>
            <View style={styles.checkboxRow}>
              <View style={styles.checkboxItem}>
                <Text style={styles.checkLabel}>Sí</Text>
                <BouncyCheckbox
                  useBuiltInState={false}
                  isChecked={answers[p.key] === 'si'}
                  onPress={() => setAnswer(p.key, 'si')}
                  fillColor="#3B82F6"
                  size={24}
                />
              </View>
              <View style={styles.checkboxItem}>
                <Text style={styles.checkLabel}>No</Text>
                <BouncyCheckbox
                  useBuiltInState={false}
                  isChecked={answers[p.key] === 'no'}
                  onPress={() => setAnswer(p.key, 'no')}
                  fillColor="#EF4444"
                  size={24}
                />
              </View>
            </View>
          </View>

          {p.key === 'transfer' && (
            <SensorResultBlock
              onResult={handleSensorResult}
              lastScore={lastSensorScore}
              transferValue={answers.transfer}
            />
          )}

          {i < PREGUNTAS.length - 1 && <View style={styles.separador} />}
        </View>
      ))}

      <View style={styles.puntajeBox}>
        <Text style={styles.puntajeText}>
          Respuestas Sí: {Object.values(answers).filter(v => v === 'si').length} / 6
        </Text>
      </View>

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
  container: { padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#1F2937' },
  pacienteBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  pacienteBannerText: { fontSize: 14, fontWeight: '700', color: '#1E40AF', textAlign: 'center' },
  instrucciones: {
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  instruccionesTexto: { fontSize: 13, color: '#5B21B6', lineHeight: 18 },
  preguntaTitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#1F2937' },
  row: { flexDirection: 'row', alignItems: 'center' },
  descripcion: { fontSize: 14, flex: 1, color: '#4B5563', lineHeight: 20 },
  checkboxRow: { flexDirection: 'row', marginLeft: 10 },
  checkboxItem: { alignItems: 'center', marginLeft: 10, width: 40 },
  checkLabel: { marginBottom: 4, fontSize: 13, color: '#374151' },
  separador: { borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginVertical: 16 },
  puntajeBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  puntajeText: { fontSize: 18, fontWeight: '700', color: '#0369A1' },
  btnGuardar: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  btnGuardado: { backgroundColor: '#10B981' },
  btnGuardarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
