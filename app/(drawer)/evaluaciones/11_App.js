import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';

const CRITERIOS = [
  {
    key: 'percepcion',
    titulo: '1. Percepción sensoria',
    opciones: [
      { score: 1, texto: 'Completamente limitada: al tener disminuido el nivel de conciencia o estar sedado, el paciente no reacciona ante estímulos dolorosos, quejándose, estremeciéndose o agarrándose, o capacidad limitada de sentir en la mayor parte del cuerpo.' },
      { score: 2, texto: 'Muy limitada: Reacciona solo ante estímulos dolorosos. No puede comunicar su malestar excepto mediante quejidos o agitación, o presenta un déficit sensorial que limita la capacidad de percibir dolor o molestias en más de la mitad del cuerpo.' },
      { score: 3, texto: 'Ligeramente limitada: Reacciona ante órdenes verbales pero no siempre puede comunicar sus molestias o la necesidad de que le cambien de posición, o presenta alguna dificultad sensorial que limita su capacidad para sentir dolor o malestar al menos en una extremidad.' },
      { score: 4, texto: 'Sin limitaciones: Responde a órdenes verbales. No presenta déficit sensorial que pueda limitar su capacidad de expresar o sentir dolor o malestar.' },
    ],
  },
  {
    key: 'humedad',
    titulo: '2. Exposición a la humedad',
    opciones: [
      { score: 1, texto: 'Completamente húmeda: La piel se encuentra constantemente expuesta a la humedad por sudoración, orina. Se detecta humedad cada vez que se mueve o gira al paciente.' },
      { score: 2, texto: 'A menudo húmeda: La piel está a menudo pero no siempre húmeda. La ropa de cama se ha de cambiar al menos una vez cada turno.' },
      { score: 3, texto: 'Ocasionalmente húmeda: La piel está ocasionalmente húmeda, requiriendo un cambio suplementario de ropa de cama aproximadamente una vez al día.' },
      { score: 4, texto: 'Raramente húmeda: La piel está generalmente seca. La ropa de cama se cambia de acuerdo con los intervalos fijados para los cambios de rutina.' },
    ],
  },
  {
    key: 'actividad',
    titulo: '3. Actividad',
    opciones: [
      { score: 1, texto: 'Encamado/a: Paciente constantemente encamado/a.' },
      { score: 2, texto: 'En silla: Paciente que no puede andar o con deambulación muy limitada. No puede sostener su propio peso y necesita ayuda para poder pasar a una silla o a una silla de ruedas.' },
      { score: 3, texto: 'Deambula ocasionalmente: Deambula ocasionalmente con o sin ayuda durante el día pero para distancias muy cortas. Pasa la mayor parte de las horas diurnas en la cama o en silla de ruedas.' },
      { score: 4, texto: 'Deambula frecuentemente: Deambula fuera de la habitación al menos dos horas durante las horas de paseo.' },
    ],
  },
  {
    key: 'movilidad',
    titulo: '4. Movilidad',
    opciones: [
      { score: 1, texto: 'Completamente inmóvil: Sin ayuda no puede realizar ningún cambio en la posición del cuerpo o de alguna extremidad.' },
      { score: 2, texto: 'Muy limitada: Ocasionalmente efectúa ligeros cambios en la posición del cuerpo o de las extremidades, pero no es capaz de hacer cambios frecuentes o significativos por sí solo.' },
      { score: 3, texto: 'Ligeramente limitada: Efectúa con frecuencia ligeros cambios en la posición del cuerpo o de las extremidades por sí solo/a.' },
      { score: 4, texto: 'Sin limitaciones: Efectúa frecuentemente importantes cambios de posición sin ayuda.' },
    ],
  },
  {
    key: 'nutricion',
    titulo: '5. Nutrición',
    opciones: [
      { score: 1, texto: 'Muy pobre: Nunca ingiere una comida completa. Rara vez toma más de un tercio de cualquier alimento que se le ofrezca. Diariamente come dos servicios o menos con aporte proteico. Bebe pocos líquidos. No toma suplementos dietéticos.' },
      { score: 2, texto: 'Probablemente inadecuada: Rara vez come una comida completa y generalmente come solo la mitad de los alimentos ofrecidos. La ingesta proteica incluye solo tres servicios de carne o productos lácteos por día.' },
      { score: 3, texto: 'Adecuada: Toma más de la mitad de la mayoría de las comidas. Come un total de cuatro servicios al día de proteínas. Ocasionalmente puede rehusar una comida pero tomará un suplemento dietético si se le ofrece.' },
      { score: 4, texto: 'Excelente: Ingiere la mayor parte de la comida. Nunca rehúsa una comida. Habitualmente come un total de cuatro o más servicios de carne o productos lácteos. Ocasionalmente come entre horas. No requiere suplementos.' },
    ],
  },
  {
    key: 'roce',
    titulo: '6. Roce y peligro de lesiones',
    opciones: [
      { score: 1, texto: 'Problema: Requiere moderada o máxima asistencia para ser movido. Es imposible levantarlo completamente sin que se produzca deslizamiento entre las sábanas. Frecuentemente se desliza hacia abajo en la cama o la silla.' },
      { score: 2, texto: 'Problema potencial: Se mueve muy débilmente o requiere de mínima asistencia. Durante los movimientos, la piel probablemente roza contra las sábanas u otros objetos. La mayor parte del tiempo mantiene relativamente una buena posición.' },
      { score: 3, texto: 'Sin problema aparente: Se mueve en la cama y en la silla con independencia y tiene suficiente fuerza muscular para levantarse completamente cuando se mueve. En todo momento mantiene una buena posición.' },
      { score: 4, texto: 'Sin limitaciones: Efectúa frecuentemente importantes cambios de posición sin ayuda.' },
    ],
  },
];

const getInterpretacion = (total) => {
  if (total <= 12) return 'Alto riesgo';
  if (total <= 14) return 'Riesgo moderado';
  return 'Bajo riesgo';
};

export default function BradenScreen() {
  const router = useRouter();
  const { pacienteId = '', pacienteNombre = '', idEvaluacion = '11_braden' } = useLocalSearchParams();

  const [scores, setScores] = useState({
    percepcion: null, humedad: null, actividad: null,
    movilidad: null, nutricion: null, roce: null,
  });
  const [guardado, setGuardado] = useState(false);

  const toggleScore = (key, score) => {
    setScores(prev => ({ ...prev, [key]: prev[key] === score ? null : score }));
  };

  const allAnswered = Object.values(scores).every(v => v !== null);
  const total = allAnswered ? Object.values(scores).reduce((a, b) => a + b, 0) : null;

  const handleGuardar = async () => {
    if (!allAnswered) {
      Alert.alert('Incompleto', 'Seleccione un puntaje para cada criterio.');
      return;
    }
    if (guardado) return;
    try {
      const diagnostico = getInterpretacion(total);
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: idEvaluacion,
        fecha: new Date().toISOString().split('T')[0],
        puntaje: total,
        diagnostico: diagnostico
      });
      setGuardado(true);
      Alert.alert(
        'Evaluación guardada',
        `${pacienteNombre ? 'Paciente: ' + pacienteNombre + '\n' : ''}Puntaje: ${total}/24\n${diagnostico}`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Error', 'No se pudo guardar. Verifique su conexión.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Escala de Braden</Text>

      {pacienteNombre !== '' && (
        <View style={styles.pacienteBanner}>
          <Text style={styles.pacienteBannerText}>👤 {pacienteNombre}</Text>
        </View>
      )}

      {CRITERIOS.map((criterio) => (
        <View key={criterio.key} style={styles.criterioCard}>
          <Text style={styles.criterioTitulo}>{criterio.titulo}</Text>
          <View style={styles.opcionesGrid}>
            {criterio.opciones.map(({ score, texto }) => {
              const isSelected = scores[criterio.key] === score;
              return (
                <Pressable
                  key={score}
                  style={({ pressed }) => [
                    styles.opcionBtn,
                    isSelected && styles.opcionSelected,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => toggleScore(criterio.key, score)}
                >
                  <View style={[styles.scoreBadge, isSelected && styles.scoreBadgeSelected]}>
                    <Text style={[styles.scoreNum, isSelected && styles.scoreNumSelected]}>{score}</Text>
                  </View>
                  <Text style={[styles.opcionText, isSelected && styles.opcionTextSelected]}>
                    {texto}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.interpretacionCard}>
        <Text style={styles.label}>Interpretación del puntaje</Text>
        <Text style={styles.reglasText}>• Alto riesgo: puntaje total ≤ 12</Text>
        <Text style={styles.reglasText}>• Riesgo moderado: puntaje total 13–14</Text>
        <Text style={styles.reglasText}>• Bajo riesgo: puntaje total ≥ 15</Text>
      </View>

      <View style={styles.puntajeBox}>
        <Text style={styles.puntajeText}>
          Puntaje total: {total !== null ? `${total} / 24` : '—'}
        </Text>
        {total !== null && (
          <Text style={styles.interpretacionText}>{getInterpretacion(total)}</Text>
        )}
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
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
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

  criterioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  criterioTitulo: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  opcionesGrid: { gap: 8 },
  opcionBtn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#F9FAFB',
    gap: 10,
  },
  opcionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  scoreBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  scoreBadgeSelected: { backgroundColor: '#3B82F6' },
  scoreNum: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  scoreNumSelected: { color: '#fff' },
  opcionText: { flex: 1, fontSize: 13, color: '#4B5563', lineHeight: 18 },
  opcionTextSelected: { color: '#1D4ED8', fontWeight: '500' },

  interpretacionCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  label: { fontSize: 13, fontWeight: '700', color: '#0369A1', marginBottom: 8 },
  reglasText: { fontSize: 13, color: '#0369A1', lineHeight: 20 },

  puntajeBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  puntajeText: { fontSize: 18, fontWeight: '700', color: '#166534' },
  interpretacionText: { fontSize: 14, color: '#15803D', marginTop: 4, fontWeight: '600' },

  btnGuardar: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnGuardado: { backgroundColor: '#10B981' },
  btnGuardarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
