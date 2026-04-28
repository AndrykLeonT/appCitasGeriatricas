import { Gyroscope } from 'expo-sensors';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';

const PREGUNTAS = [
  "¿Le han golpeado?",
  "¿Le han dado puñetazos o patadas?",
  "¿Le han empujado o jalado el pelo?",
  "¿Le han aventado algún objeto?",
  "¿Le han agredido con cuchillo o navaja?",
  "¿Le han humillado o burlado?",
  "¿Le han tratado con indiferencia?",
  "¿Le han aislado de su familia?",
  "¿Le han hecho sentir miedo?",
  "¿No han respetado sus decisiones?",
  "¿Le han prohibido salir o visitas?",
  "¿Le han dejado sin ropa o calzado?",
  "¿Le han dejado sin medicamentos?",
  "¿Le han negado protección?",
  "¿Le han negado acceso a su casa?",
  "¿Alguien maneja su dinero sin permiso?",
  "¿Le han quitado dinero?",
  "¿Le han tomado bienes sin permiso?",
  "¿Le han vendido propiedad sin consentimiento?",
  "¿Lo han presionado para firmar documentos?",
  "¿Le han exigido relaciones sexuales?",
  "¿Le han tocado sin consentimiento?",
];

const COLS_A = [{ label: "No", value: 0 }, { label: "Sí", value: 1 }];
const COLS_B = [{ label: "1 vez", value: 1 }, { label: "2-3 veces", value: 2 }, { label: "Muchas", value: 3 }];
const COLS_C = [{ label: "≤1 año", value: 1 }, { label: ">1 año", value: 2 }];
const COLS_E = [{ label: "H", value: 1 }, { label: "M", value: 2 }];

const interpretarResultado = (total) => {
  if (total === 0) return "Sin indicios de maltrato.";
  if (total <= 3) return "Riesgo bajo de maltrato.";
  if (total <= 8) return "Riesgo moderado de maltrato.";
  return "Riesgo alto de maltrato. Se recomienda evaluación profesional.";
};

export default function EscalaMaltrato() {
  const { pacienteId = '', pacienteNombre = '' } = useLocalSearchParams();

  const [respuestas, setRespuestas] = useState({});
  const [guardado, setGuardado] = useState(false);
  const shakeTimeout = useRef(null);

  const seleccionar = (preguntaIndex, columna, valor) => {
    setRespuestas(prev => {
      let nuevaRespuesta = { ...prev[preguntaIndex], [columna]: valor };
      if (columna === "A" && valor === 0) {
        nuevaRespuesta = { A: 0 };
      }
      return { ...prev, [preguntaIndex]: nuevaRespuesta };
    });
  };

  const calcularTotal = () => {
    let total = 0;
    Object.values(respuestas).forEach(r => { if (r?.A === 1) total++; });
    return total;
  };

  useEffect(() => {
    Gyroscope.setUpdateInterval(300);
    const subscription = Gyroscope.addListener(data => {
      const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
      if (magnitude > 5) {
        if (!shakeTimeout.current) {
          setRespuestas({});
          setGuardado(false);
          Alert.alert("Movimiento detectado", "La escala se reinició por movimiento fuerte.");
          shakeTimeout.current = setTimeout(() => {
            shakeTimeout.current = null;
          }, 2000);
        }
      }
    });
    return () => subscription.remove();
  }, []);

  const handleGuardar = async () => {
    if (guardado) return;
    if (Object.keys(respuestas).length !== PREGUNTAS.length) {
      Alert.alert("Incompleto", "Debe responder la columna A de todas las preguntas.");
      return;
    }
    const total = calcularTotal();
    try {
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: '19_maltrato',
        fecha: new Date().toISOString().split('T')[0],
        puntaje: total,
      });
      setGuardado(true);
      Alert.alert(
        "Evaluación guardada",
        `${pacienteNombre ? 'Paciente: ' + pacienteNombre + '\n' : ''}Total (A=Sí): ${total} / ${PREGUNTAS.length}\n\n${interpretarResultado(total)}`
      );
    } catch {
      Alert.alert("Error", "No se pudo guardar. Verifique su conexión.");
    }
  };

  const total = calcularTotal();

  return (
    <ScrollView horizontal>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Escala Geriátrica de Maltrato</Text>

        {pacienteNombre !== '' && (
          <View style={styles.pacienteBanner}>
            <Text style={styles.pacienteBannerText}>👤 {pacienteNombre}</Text>
          </View>
        )}

        <View style={styles.instruccionesBox}>
          <Text style={styles.instruccionesTitulo}>Instrucciones</Text>
          <Text style={styles.instruccionesText}>A: Indique si la situación ocurrió (Sí o No).</Text>
          <Text style={styles.instruccionesText}>B: Si ocurrió, indique cuántas veces.</Text>
          <Text style={styles.instruccionesText}>C: Desde cuándo ocurre.</Text>
          <Text style={styles.instruccionesText}>D: Parentesco del agresor.</Text>
          <Text style={styles.instruccionesText}>E: Sexo del agresor (H=Hombre, M=Mujer).</Text>
          <Text style={styles.instruccionesHint}>Agita el teléfono fuertemente para reiniciar.</Text>
        </View>

        {/* Encabezado */}
        <View style={styles.headerRow}>
          <Text style={styles.headerPregunta}>Pregunta</Text>
          <Text style={styles.header}>A</Text>
          <Text style={styles.header}>B</Text>
          <Text style={styles.header}>C</Text>
          <Text style={styles.header}>D</Text>
          <Text style={styles.header}>E</Text>
        </View>

        {PREGUNTAS.map((pregunta, index) => {
          const bloqueado = respuestas[index]?.A === 0;
          return (
            <View key={index} style={styles.row}>
              <Text style={styles.pregunta}>{index + 1}. {pregunta}</Text>

              {/* A */}
              <View style={styles.col}>
                {COLS_A.map((op, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.option, respuestas[index]?.A === op.value && styles.selected]}
                    onPress={() => seleccionar(index, "A", op.value)}
                  >
                    <Text>{op.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* B */}
              <View style={styles.col}>
                {COLS_B.map((op, i) => (
                  <TouchableOpacity
                    key={i}
                    disabled={bloqueado}
                    style={[styles.option, bloqueado && styles.disabled, respuestas[index]?.B === op.value && styles.selected]}
                    onPress={() => seleccionar(index, "B", op.value)}
                  >
                    <Text>{op.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* C */}
              <View style={styles.col}>
                {COLS_C.map((op, i) => (
                  <TouchableOpacity
                    key={i}
                    disabled={bloqueado}
                    style={[styles.option, bloqueado && styles.disabled, respuestas[index]?.C === op.value && styles.selected]}
                    onPress={() => seleccionar(index, "C", op.value)}
                  >
                    <Text>{op.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* D */}
              <View style={styles.col}>
                <TextInput
                  style={[styles.inputParentesco, bloqueado && styles.disabled]}
                  editable={!bloqueado}
                  placeholder="Parentesco"
                  value={respuestas[index]?.D || ""}
                  onChangeText={text => seleccionar(index, "D", text)}
                />
              </View>

              {/* E */}
              <View style={styles.col}>
                {COLS_E.map((op, i) => (
                  <TouchableOpacity
                    key={i}
                    disabled={bloqueado}
                    style={[styles.option, bloqueado && styles.disabled, respuestas[index]?.E === op.value && styles.selected]}
                    onPress={() => seleccionar(index, "E", op.value)}
                  >
                    <Text>{op.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        <Text style={styles.total}>Total (A = Sí): {total} / {PREGUNTAS.length}</Text>
        {total > 0 && (
          <Text style={styles.interpretacion}>{interpretarResultado(total)}</Text>
        )}

        <Pressable
          style={[styles.button, guardado && styles.buttonGuardado]}
          onPress={handleGuardar}
          disabled={guardado}
        >
          <Text style={styles.buttonText}>{guardado ? '✓ Evaluación guardada' : 'Finalizar y guardar'}</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: '#1F2937' },
  pacienteBanner: {
    backgroundColor: '#EFF6FF', borderRadius: 8, padding: 10,
    marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE',
  },
  pacienteBannerText: { fontSize: 14, fontWeight: '700', color: '#1E40AF', textAlign: 'center' },
  instruccionesBox: { backgroundColor: '#fff3cd', padding: 15, borderRadius: 8, marginBottom: 20 },
  instruccionesTitulo: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  instruccionesText: { fontSize: 14, marginBottom: 4 },
  instruccionesHint: { fontSize: 12, color: '#856404', marginTop: 8, fontStyle: 'italic' },
  headerRow: { flexDirection: "row", marginBottom: 10 },
  headerPregunta: { width: 250, fontWeight: "bold" },
  header: { width: 120, fontWeight: "bold", textAlign: "center" },
  row: { flexDirection: "row", marginBottom: 15 },
  pregunta: { width: 250 },
  col: { width: 120, alignItems: "center" },
  option: {
    padding: 6, marginVertical: 2, backgroundColor: "#eee",
    borderRadius: 5, width: 100, alignItems: "center",
  },
  selected: { backgroundColor: "#90caf9" },
  disabled: { backgroundColor: "#d3d3d3" },
  inputParentesco: { backgroundColor: "#f2f2f2", borderRadius: 5, padding: 6, width: 100, fontSize: 12 },
  total: { fontSize: 18, fontWeight: "bold", marginTop: 20 },
  interpretacion: { fontSize: 15, color: '#374151', marginTop: 8, marginBottom: 4 },
  button: { backgroundColor: "#1565C0", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 20 },
  buttonGuardado: { backgroundColor: '#10B981' },
  buttonText: { color: "white", fontWeight: "bold" },
});
