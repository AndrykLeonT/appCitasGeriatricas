import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';

type LawtonKey = 'tel' | 'trans' | 'med' | 'fin' | 'comp' | 'coc' | 'hogar' | 'lav';
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
  {
    key: 'coc',
    titulo: '6) Cocina',
    descripcion:
      'Sí: Planea, prepara y sirve los alimentos correctamente.\n' +
      'No: Prepara los alimentos sólo si se le provee lo necesario.\n' +
      'No: Calienta, sirve y prepara pero no lleva una dieta adecuada.\n' +
      'No: Necesita que le preparen los alimentos.',
  },
  {
    key: 'hogar',
    titulo: '7) Cuidado del hogar',
    descripcion:
      'Sí: Mantiene la casa solo o con ayuda mínima.\n' +
      'Sí: Efectúa diariamente trabajo ligero eficientemente.\n' +
      'Sí: Efectúa diariamente trabajo ligero sin eficiencia.\n' +
      'No: Necesita ayuda en todas las actividades.\n' +
      'No: No participa.',
  },
  {
    key: 'lav',
    titulo: '8) Lavandería',
    descripcion:
      'Sí: Se ocupa de su ropa independientemente.\n' +
      'Sí: Lava sólo pequeñas cosas.\n' +
      'No: Todos se lo tienen que lavar.',
  },
];

export default function Lawton() {
  const { pacienteId = '', pacienteNombre = '' } = useLocalSearchParams<{
    pacienteId: string;
    pacienteNombre: string;
  }>();

  const [answers, setAnswers] = useState<LawtonAnswers>({
    tel: null, trans: null, med: null, fin: null,
    comp: null, coc: null, hogar: null, lav: null,
  });
  const [guardado, setGuardado] = useState(false);

  const setAnswer = (key: LawtonKey, value: 'si' | 'no') => {
    setAnswers(prev => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  const handleGuardar = async () => {
    if (guardado) return;
    const puntaje = Object.values(answers).filter(v => v === 'si').length;
    const interpretacion =
      puntaje >= 7 ? 'Independiente' :
      puntaje >= 5 ? 'Dependencia leve' :
      puntaje >= 3 ? 'Dependencia moderada' : 'Dependencia severa';
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
        `${pacienteNombre ? 'Paciente: ' + pacienteNombre + '\n' : ''}Puntaje: ${puntaje}/8\n${interpretacion}`
      );
    } catch {
      Alert.alert('Error', 'No se pudo guardar. Verifique su conexión.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Índice de Lawton</Text>

      {pacienteNombre !== '' && (
        <View style={styles.pacienteBanner}>
          <Text style={styles.pacienteBannerText}>👤 {pacienteNombre}</Text>
        </View>
      )}

      {PREGUNTAS.map((p, i) => (
        <View key={p.key}>
          <Text style={styles.preguntaTitulo}>{p.titulo}</Text>
          <View style={styles.row}>
            <Text style={styles.parrafo}>{p.descripcion}</Text>
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
          Respuestas Sí: {Object.values(answers).filter(v => v === 'si').length} / 8
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
  parrafo: { fontSize: 14, flex: 1, color: '#4B5563', lineHeight: 20 },
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
