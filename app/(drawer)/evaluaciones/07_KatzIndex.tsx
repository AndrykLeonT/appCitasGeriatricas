import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

export default function KatzIndex() {
  const router = useRouter();
  const { pacienteId = '', pacienteNombre = '', idEvaluacion = '07_katz' } = useLocalSearchParams<{
    pacienteId: string;
    pacienteNombre: string;
    idEvaluacion: string;
  }>();

  const [answers, setAnswers] = useState<KatzAnswers>({
    bath: null, dress: null, toilet: null,
    transfer: null, continence: null, feeding: null,
  });
  const [guardado, setGuardado] = useState(false);

  const setAnswer = (key: KatzKey, value: 'si' | 'no') => {
    setAnswers(prev => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  const handleGuardar = async () => {
    if (guardado) return;
    const puntaje = Object.values(answers).filter(v => v === 'si').length;
    const interpretacion = puntaje >= 6 ? 'Independiente' : puntaje >= 4 ? 'Dependencia leve' : 'Dependencia severa';
    try {
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: idEvaluacion,
        fecha: new Date().toISOString().split('T')[0],
        puntaje,
        diagnostico: interpretacion
      });
      setGuardado(true);
      Alert.alert(
        'Evaluación guardada',
        `${pacienteNombre ? 'Paciente: ' + pacienteNombre + '\n' : ''}Puntaje: ${puntaje}/6\n${interpretacion}`,
        [{ text: 'OK', onPress: () => router.back() }]
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

      {PREGUNTAS.map((p, i) => (
        <View key={p.key}>
          <Text style={styles.preguntaTitulo}>{p.titulo}</Text>
          <View style={styles.row}>
            <Text style={styles.descripcion}>{p.descripcion}</Text>
            <View style={styles.checkboxRow}>
              <View style={styles.checkboxItem}>
                <Text style={styles.checkLabel}>Sí</Text>
                <BouncyCheckbox
                  isChecked={answers[p.key] === 'si'}
                  onPress={() => setAnswer(p.key, 'si')}
                  fillColor="#3B82F6"
                  size={24}
                />
              </View>
              <View style={styles.checkboxItem}>
                <Text style={styles.checkLabel}>No</Text>
                <BouncyCheckbox
                  isChecked={answers[p.key] === 'no'}
                  onPress={() => setAnswer(p.key, 'no')}
                  fillColor="#EF4444"
                  size={24}
                />
              </View>
            </View>
          </View>
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
