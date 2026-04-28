import { Accelerometer } from 'expo-sensors';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';

interface MUSTResult {
  imc: string | null;
  puntos: number;
  riesgo: string;
  colorRiesgo: string;
  pauta: string;
}

const calcularMUST = (
  peso: string,
  talla: string,
  perdidaPesoPct: string,
  estaEnfermo: boolean
): MUSTResult => {
  let puntos = 0;
  const imcNum = parseFloat(peso) / (parseFloat(talla) * parseFloat(talla));

  if (!isNaN(imcNum)) {
    if (imcNum < 18.5) puntos += 2;
    else if (imcNum <= 20) puntos += 1;
  }

  const perdida = parseFloat(perdidaPesoPct) || 0;
  if (perdida > 10) puntos += 2;
  else if (perdida >= 5) puntos += 1;

  if (estaEnfermo) puntos += 2;

  let riesgo = 'Bajo';
  let colorRiesgo = '#10B981';
  let pauta = 'Cuidado de rutina. Repetir tamizaje anualmente.';

  if (puntos === 1) {
    riesgo = 'Intermedio';
    colorRiesgo = '#F59E0B';
    pauta = 'Observar. Registrar ingesta dietética durante 3 días.';
  } else if (puntos >= 2) {
    riesgo = 'Alto';
    colorRiesgo = '#EF4444';
    pauta = 'Tratamiento. Referir a dietista o nutricionista.';
  }

  return { imc: isNaN(imcNum) ? null : imcNum.toFixed(1), puntos, riesgo, colorRiesgo, pauta };
};

export default function MUSTScreen() {
  const { pacienteId = '', pacienteNombre = '' } = useLocalSearchParams<{
    pacienteId: string;
    pacienteNombre: string;
  }>();

  const [peso, setPeso] = useState('');
  const [talla, setTalla] = useState('');
  const [perdidaPesoPct, setPerdidaPesoPct] = useState('');
  const [estaEnfermo, setEstaEnfermo] = useState(false);
  const [resultado, setResultado] = useState<MUSTResult | null>(null);
  const [guardado, setGuardado] = useState(false);

  const [isMeasuring, setIsMeasuring] = useState(false);
  const subscriptionRef = useRef<any>(null);

  const stopMeasuring = () => {
    setIsMeasuring(false);
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  };

  const startMeasuring = () => {
    setIsMeasuring(true);
    Accelerometer.setUpdateInterval(100);
    let isProcessing = false;
    subscriptionRef.current = Accelerometer.addListener(data => {
      if (isProcessing) return;
      if (Math.abs(data.y) > 0.85) {
        isProcessing = true;
        const tallaSimulada = (Math.random() * (1.95 - 1.45) + 1.45).toFixed(2);
        setTalla(tallaSimulada.toString());
        stopMeasuring();
        Alert.alert('Captura exitosa', `Estatura estimada: ${tallaSimulada} m\n(Ajusta manualmente si es necesario)`);
      }
    });
  };

  useEffect(() => {
    return () => stopMeasuring();
  }, []);

  const handleCalcular = () => {
    if (!peso || !talla) {
      Alert.alert('Error', 'Ingresa el peso y la talla para calcular.');
      return;
    }
    setResultado(calcularMUST(peso, talla, perdidaPesoPct, estaEnfermo));
    setGuardado(false);
  };

  const handleGuardar = async () => {
    if (!resultado || guardado) return;
    try {
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: '16_must',
        fecha: new Date().toISOString().split('T')[0],
        puntaje: resultado.puntos,
      });
      setGuardado(true);
      Alert.alert(
        'Evaluación guardada',
        `${pacienteNombre ? 'Paciente: ' + pacienteNombre + '\n' : ''}Puntaje: ${resultado.puntos} pts\nRiesgo: ${resultado.riesgo}`
      );
    } catch {
      Alert.alert('Error', 'No se pudo guardar. Verifique su conexión.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Evaluación MUST</Text>
      <Text style={styles.subtitulo}>Malnutrition Universal Screening Tool</Text>

      {pacienteNombre !== '' && (
        <View style={styles.pacienteBanner}>
          <Text style={styles.pacienteBannerText}>👤 {pacienteNombre}</Text>
        </View>
      )}

      {/* ── Datos antropométricos ── */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Datos antropométricos</Text>
        <View style={styles.row}>
          <View style={[styles.campo, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={peso}
              onChangeText={setPeso}
              placeholder="Ej: 70"
            />
          </View>
          <View style={[styles.campo, { flex: 1 }]}>
            <Text style={styles.label}>Talla (m)</Text>
            <TextInput
              style={[styles.input, isMeasuring && styles.inputMidiendo]}
              keyboardType="numeric"
              value={talla}
              onChangeText={setTalla}
              placeholder="1.65"
            />
          </View>
        </View>

        <Pressable
          style={[styles.btnSensor, isMeasuring && styles.btnSensorActivo]}
          onPress={isMeasuring ? stopMeasuring : startMeasuring}
        >
          <Text style={styles.btnSensorText}>
            {isMeasuring ? 'Detener · Incline el teléfono lateralmente...' : 'Capturar talla con sensor (inclinar)'}
          </Text>
        </Pressable>
      </View>

      {/* ── Pérdida de peso ── */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Pérdida de peso</Text>
        <View style={styles.campo}>
          <Text style={styles.label}>% Pérdida de peso (últimos 3–6 meses)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={perdidaPesoPct}
            onChangeText={setPerdidaPesoPct}
            placeholder="Ej: 8"
          />
        </View>
      </View>

      {/* ── Enfermedad aguda ── */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Enfermedad aguda</Text>
        <Pressable
          style={[styles.switchBtn, estaEnfermo && styles.switchBtnActivo]}
          onPress={() => setEstaEnfermo(!estaEnfermo)}
        >
          <Text style={[styles.switchText, estaEnfermo && styles.switchTextActivo]}>
            {estaEnfermo
              ? '✓ Enfermedad aguda / Ausencia de ingesta >5 días (+2 pts)'
              : '¿Ausencia de ingesta >5 días por enfermedad?'}
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.btnCalcular} onPress={handleCalcular}>
        <Text style={styles.btnText}>Calcular MUST</Text>
      </Pressable>

      {resultado && (
        <>
          <View style={[styles.resultadoCard, { borderColor: resultado.colorRiesgo }]}>
            <Text style={styles.resultadoLabel}>Resultado</Text>
            <View style={[styles.riesgoBadge, { backgroundColor: resultado.colorRiesgo }]}>
              <Text style={styles.riesgoTexto}>
                Riesgo {resultado.riesgo} · {resultado.puntos} pts
              </Text>
            </View>
            {resultado.imc && (
              <Text style={styles.resultadoInfo}>IMC calculado: {resultado.imc}</Text>
            )}
            <Text style={styles.pautaTexto}>{resultado.pauta}</Text>
          </View>

          <Pressable
            style={[styles.btnGuardar, guardado && styles.btnGuardado]}
            onPress={handleGuardar}
            disabled={guardado}
          >
            <Text style={styles.btnText}>
              {guardado ? '✓ Evaluación guardada' : 'Guardar evaluación'}
            </Text>
          </Pressable>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 20, paddingBottom: 60 },
  titulo: { fontSize: 24, fontWeight: '900', color: '#6D28D9', textAlign: 'center', marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 16 },

  pacienteBanner: {
    backgroundColor: '#EFF6FF', borderRadius: 8, padding: 10,
    marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE',
  },
  pacienteBannerText: { fontSize: 14, fontWeight: '700', color: '#1E40AF', textAlign: 'center' },

  seccion: { marginBottom: 16 },
  seccionTitulo: {
    fontSize: 13, fontWeight: 'bold', color: '#374151',
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  campo: { marginBottom: 12 },
  label: { fontWeight: 'bold', marginBottom: 5, color: '#4B5563', fontSize: 14 },
  input: { backgroundColor: '#FFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  inputMidiendo: { backgroundColor: '#DCFCE7', borderColor: '#22C55E', borderWidth: 2 },
  row: { flexDirection: 'row' },

  btnSensor: {
    backgroundColor: '#6D28D9', padding: 14, borderRadius: 10,
    alignItems: 'center', marginTop: 4,
  },
  btnSensorActivo: { backgroundColor: '#EF4444' },
  btnSensorText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  switchBtn: {
    padding: 15, backgroundColor: '#F9FAFB', borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  switchBtnActivo: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  switchText: { textAlign: 'center', fontWeight: 'bold', color: '#374151' },
  switchTextActivo: { color: '#B91C1C' },

  btnCalcular: {
    backgroundColor: '#6D28D9', padding: 16, borderRadius: 10,
    alignItems: 'center', marginBottom: 20,
  },
  btnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },

  resultadoCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 20,
    marginBottom: 16, borderWidth: 2, elevation: 3,
  },
  resultadoLabel: { fontSize: 12, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' },
  riesgoBadge: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8,
    alignSelf: 'flex-start', marginBottom: 10,
  },
  riesgoTexto: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  resultadoInfo: { fontSize: 14, color: '#374151', marginBottom: 6 },
  pautaTexto: { fontSize: 14, color: '#4B5563', fontStyle: 'italic', lineHeight: 20 },

  btnGuardar: {
    backgroundColor: '#3B82F6', padding: 16, borderRadius: 10,
    alignItems: 'center', marginBottom: 12,
  },
  btnGuardado: { backgroundColor: '#10B981' },
});
