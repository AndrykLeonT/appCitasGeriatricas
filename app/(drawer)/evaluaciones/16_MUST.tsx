import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';

const MUSTScreen = () => {
  const router = useRouter();
  const { pacienteId = '', pacienteNombre = '', idEvaluacion = '16_must' } = useLocalSearchParams<{
    pacienteId: string;
    pacienteNombre: string;
    idEvaluacion: string;
  }>();

  const [guardando, setGuardando] = useState(false);
  const [sintomas, setSintomas] = useState("");
  const [peso, setPeso] = useState("");
  const [talla, setTalla] = useState("");
  const [perdidaPesoPct, setPerdidaPesoPct] = useState("");
  const [estaEnfermo, setEstaEnfermo] = useState(false);

  const calcularMUST = () => {
    let puntos = 0;

    //Puntos por IMC
    const imcNum = parseFloat(peso) / (parseFloat(talla) * parseFloat(talla));
    if (imcNum < 18.5) puntos += 2;
    else if (imcNum <= 20) puntos += 1;

    //Puntos por pérdida de peso
    const perdida = parseFloat(perdidaPesoPct);
    if (perdida > 10) puntos += 2;
    else if (perdida >= 5) puntos += 1;

    //Puntos por enfermedad aguda
    if (estaEnfermo) puntos += 2;

    let riesgo = "Bajo";
    let pauta = "Puede continuar con su estilo de vida con revisión periódica.";

    if (puntos === 1) {
      riesgo = "Intermedio";
      pauta =
        "Se debe estructurar un plan de cuidado nutricional y revaloración.";
    } else if (puntos >= 2) {
      riesgo = "Alto";
      pauta =
        "Llevar a cabo una intervención y acción directa para evitar complicaciones asociadas.";
    }

    return { imc: imcNum.toFixed(1), puntos, riesgo, pauta };
  };

  const handleGuardar = async () => {
    if ([peso, talla, perdidaPesoPct].includes("")) {
      Alert.alert(
        "Error",
        "Por favor, completa los datos de antropometría y pérdida de peso",
      );
      return;
    }

    if (guardando) return;
    setGuardando(true);

    const infoNutricional = calcularMUST();
    const diagnostico = `Riesgo ${infoNutricional.riesgo}. Acción: ${infoNutricional.pauta}`;

    try {
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: idEvaluacion,
        fecha: new Date().toISOString().split('T')[0],
        puntaje: infoNutricional.puntos,
        diagnostico: diagnostico
      });
      Alert.alert(
        "Éxito", 
        "Evaluación guardada correctamente.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "No se pudo guardar la evaluación");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.formContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.formTitle}>Evaluación MUST</Text>
          {pacienteNombre !== '' && (
            <Text style={{fontSize: 16, marginBottom: 20, color: '#4B5563'}}>Paciente: {pacienteNombre}</Text>
          )}

          <View style={styles.seccion}>
            <View style={styles.row}>
              <View style={[styles.campo, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Peso (kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={peso}
                  onChangeText={setPeso}
                />
              </View>
              <View style={[styles.campo, { flex: 1 }]}>
                <Text style={styles.label}>Talla (m)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={talla}
                  placeholder="Ej: 1.65"
                  onChangeText={setTalla}
                />
              </View>
            </View>
            <View style={styles.campo}>
              <Text style={styles.label}>
                % Pérdida de peso (3-6 meses)
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={perdidaPesoPct}
                placeholder="Ej: 0"
                onChangeText={setPerdidaPesoPct}
              />
            </View>

            <Pressable
              style={[
                styles.switchBtn,
                estaEnfermo && styles.switchBtnActive,
              ]}
              onPress={() => setEstaEnfermo(!estaEnfermo)}
            >
              <Text style={styles.switchText}>
                {estaEnfermo
                  ? "✓ Enfermedad Aguda Detectada (+2 pts)"
                  : "¿Ausencia de ingesta >5 días?"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Observaciones / Síntomas</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              value={sintomas}
              onChangeText={setSintomas}
              placeholder="Describa el estado general"
            />
          </View>

          <Pressable style={[styles.btnGuardar, guardando && { opacity: 0.7 }]} onPress={handleGuardar} disabled={guardando}>
            <Text style={styles.buttonText}>{guardando ? "GUARDANDO..." : "GUARDAR EVALUACIÓN"}</Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  formContainer: { flex: 1, paddingHorizontal: 20, backgroundColor: "#FFF" },
  formTitle: {
    fontSize: 28,
    fontWeight: "900",
    marginVertical: 10,
    color: "#6D28D9",
  },
  seccion: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 10,
  },
  campo: { marginBottom: 15 },
  label: { fontWeight: "bold", marginBottom: 5, color: "#4B5563" },
  input: { backgroundColor: "#F3F4F6", padding: 12, borderRadius: 10 },
  row: { flexDirection: "row" },
  switchBtn: {
    padding: 15,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  switchBtnActive: { backgroundColor: "#FEE2E2", borderColor: "#EF4444" },
  switchText: { textAlign: "center", fontWeight: "bold", color: "#374151" },
  btnGuardar: {
    backgroundColor: "#6D28D9",
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  buttonText: { textAlign: "center", color: "#FFF", fontWeight: "900" },
});

export default MUSTScreen;
