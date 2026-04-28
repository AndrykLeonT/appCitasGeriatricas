import { Accelerometer } from 'expo-sensors';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';

type LawtonKey = 'tel' | 'trans' | 'med' | 'fin' | 'comp';
type LawtonAnswers = { [key in LawtonKey]: 'si' | 'no' | null };

const PREGUNTAS: { key: LawtonKey; titulo: string; descripcion: string }[] = [
  {
    key: 'tel',
    titulo: '1) Capacidad para usar teléfono',
    descripcion:
      'Sí: Lo opera por iniciativa propia, lo marca sin problemas.\n' +
      'Sí: Marca sólo unos cuantos números bien conocidos.\n' +
      'Sí: Contesta el teléfono pero no llama.\n' +
      'No: No usa el teléfono.',
  },
  {
    key: 'trans',
    titulo: '2) Transporte',
    descripcion:
      'Sí: Se transporta solo/a.\n' +
      'Sí: Se transporta solo/a, únicamente en taxi pero no puede usar otros recursos.\n' +
      'Sí: Viaja en transporte colectivo acompañado.\n' +
      'No: Viaja en taxi o auto acompañado.\n' +
      'No: No sale.',
  },
  {
    key: 'med',
    titulo: '3) Medicación',
    descripcion:
      'Sí: Es capaz de tomarla a su hora y dosis correctas.\n' +
      'Sí: Se hace responsable sólo si le preparan por adelantado.\n' +
      'No: Es incapaz de hacerse cargo.',
  },
  {
    key: 'fin',
    titulo: '4) Finanzas',
    descripcion:
      'Sí: Maneja sus asuntos independientemente.\n' +
      'No: Sólo puede manejar lo necesario para pequeñas compras.\n' +
      'No: Es incapaz de manejar dinero.',
  },
  {
    key: 'comp',
    titulo: '5) Compras',
    descripcion:
      'Sí: Vigila sus necesidades independientemente.\n' +
      'Sí: Hace independientemente sólo pequeñas compras.\n' +
      'No: Necesita compañía para cualquier compra.\n' +
      'No: Incapaz de cualquier compra.',
  },
];

const getResultado = (puntaje: number) => {
  if (puntaje === 5) return { texto: 'Independencia total', descripcion: 'El paciente realiza todas las actividades instrumentales de forma autónoma.' };
  if (puntaje === 4) return { texto: 'Dependencia leve', descripcion: 'El paciente presenta dificultad en una actividad instrumental.' };
  if (puntaje >= 2) return { texto: 'Dependencia moderada', descripcion: 'El paciente presenta dificultades en varias actividades instrumentales y requiere apoyo parcial.' };
  return { texto: 'Dependencia severa', descripcion: 'El paciente presenta una dependencia importante en las actividades instrumentales de la vida diaria.' };
};

export default function Lawton() {
  const { pacienteId = '', pacienteNombre = '' } = useLocalSearchParams<{
    pacienteId: string;
    pacienteNombre: string;
  }>();

  const [answers, setAnswers] = useState<LawtonAnswers>({
    tel: null, trans: null, med: null, fin: null, comp: null,
  });
  const [guardado, setGuardado] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const shakeStartRef = useRef<number | null>(null);

  useEffect(() => {
    Accelerometer.setUpdateInterval(200);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const moving = Math.abs(x) > 1.2 || Math.abs(y) > 1.2 || Math.abs(z) > 1.2;
      if (moving) {
        if (shakeStartRef.current === null) {
          shakeStartRef.current = Date.now();
        } else if (Date.now() - shakeStartRef.current >= 5000) {
          shakeStartRef.current = null;
          setAnswers({ tel: null, trans: null, med: null, fin: null, comp: null });
          setGuardado(false);
          setResetKey(k => k + 1);
          Alert.alert('Campos limpiados', 'Se detectó movimiento sostenido por 5 segundos.');
        }
      } else {
        shakeStartRef.current = null;
      }
    });
    return () => subscription.remove();
  }, []);

  const setAnswer = (key: LawtonKey, value: 'si' | 'no') => {
    setAnswers(prev => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  const puntaje = Object.values(answers).filter(v => v === 'si').length;
  const totalRespondidas = Object.values(answers).filter(v => v !== null).length;
  const todasRespondidas = totalRespondidas === 5;

  const handleGuardar = async () => {
    if (guardado) return;
    const resultado = getResultado(puntaje);
    try {
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: '08_lawton',
        fecha: new Date().toISOString().split('T')[0],
        puntaje,
      });
      setGuardado(true);
      Alert.alert(
        'Evaluación guardada',
        `${pacienteNombre ? 'Paciente: ' + pacienteNombre + '\n' : ''}Puntaje: ${puntaje}/5\n${resultado.texto}`
      );
    } catch {
      Alert.alert('Error', 'No se pudo guardar. Verifique su conexión.');
    }
  };

  const resultado = todasRespondidas ? getResultado(puntaje) : null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Índice de Lawton</Text>

      {pacienteNombre !== '' && (
        <View style={styles.pacienteBanner}>
          <Text style={styles.pacienteBannerText}>👤 {pacienteNombre}</Text>
        </View>
      )}

      <View style={styles.instrucciones}>
        <Text style={styles.instruccionesTitulo}>Instrucciones</Text>
        <Text style={styles.instruccionesTexto}>
          Evalúe la capacidad del paciente en cada área marcando "Sí" si lo realiza de forma independiente o "No" si requiere ayuda o no puede hacerlo.{'\n\n'}
          Mueva el dispositivo durante 5 segundos para limpiar las respuestas.
        </Text>
      </View>

      {PREGUNTAS.map((p, i) => (
        <View key={p.key}>
          <Text style={styles.preguntaTitulo}>{p.titulo}</Text>
          <View style={styles.row}>
            <Text style={styles.parrafo}>{p.descripcion}</Text>
            <View style={styles.checkboxRow}>
              <View style={styles.checkboxItem}>
                <Text style={styles.checkLabel}>Sí</Text>
                <BouncyCheckbox
                  key={`${p.key}-si-${resetKey}`}
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
                  key={`${p.key}-no-${resetKey}`}
                  useBuiltInState={false}
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

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Puntuación</Text>
        <Text style={styles.scoreValue}>{puntaje} / 5</Text>
        <Text style={styles.scoreSubtext}>{totalRespondidas} de 5 preguntas respondidas</Text>
      </View>

      {resultado && (
        <View style={styles.resultadoContainer}>
          <Text style={styles.resultadoLabel}>Resultado</Text>
          <Text style={styles.resultadoTexto}>{resultado.texto}</Text>
          <Text style={styles.resultadoDescripcion}>{resultado.descripcion}</Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [styles.btnGuardar, guardado && styles.btnGuardado, pressed && { opacity: 0.8 }]}
        onPress={handleGuardar}
        disabled={guardado}
      >
        <Text style={styles.btnGuardarText}>{guardado ? '✓ Evaluación guardada' : 'Guardar evaluación'}</Text>
      </Pressable>
      <View style={{ height: 40 }} />
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
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  instruccionesTitulo: { fontSize: 15, fontWeight: 'bold', marginBottom: 4, color: '#1F2937' },
  instruccionesTexto: { fontSize: 14, color: '#374151', lineHeight: 20 },
  preguntaTitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#1F2937' },
  row: { flexDirection: 'row', alignItems: 'center' },
  parrafo: { fontSize: 14, flex: 1, color: '#4B5563', lineHeight: 20 },
  checkboxRow: { flexDirection: 'row', marginLeft: 10 },
  checkboxItem: { alignItems: 'center', marginLeft: 10, width: 40 },
  checkLabel: { marginBottom: 4, fontSize: 13, color: '#374151' },
  separador: { borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginVertical: 16 },
  scoreContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  scoreLabel: { fontSize: 14, color: '#374151', marginBottom: 4 },
  scoreValue: { fontSize: 36, fontWeight: 'bold', color: '#1F2937' },
  scoreSubtext: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  resultadoContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  resultadoLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  resultadoTexto: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 6 },
  resultadoDescripcion: { fontSize: 14, color: '#374151', lineHeight: 20 },
  btnGuardar: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnGuardado: { backgroundColor: '#10B981' },
  btnGuardarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
