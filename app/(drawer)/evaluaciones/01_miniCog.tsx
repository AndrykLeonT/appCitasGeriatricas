import { useLocalSearchParams, useRouter } from "expo-router";
import { Accelerometer } from "expo-sensors";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { guardarRegistroEvaluacion } from "../../../services/firebaseEvaluaciones";

type AttemptKey = "palabra1" | "palabra2" | "palabra3" | "dibujoReloj";
type Attempts = {
  [key in AttemptKey]: boolean;
};
const MiniCogScreen = () => {
  const router = useRouter();
  const { pacienteId = "", pacienteNombre = "", idEvaluacion = "" } = useLocalSearchParams<{
    pacienteId: string;
    pacienteNombre: string;
    idEvaluacion: string;
  }>();

  const [palabra1, setPalabra1] = useState("");
  const [palabra2, setPalabra2] = useState("");
  const [palabra3, setPalabra3] = useState("");
  const [dibujo, setDibujo] = useState("");
  const [resultado, setResultado] = useState("");

  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const subscription = Accelerometer.addListener((accelerometerData) => {
      setData(accelerometerData);
    });
    Accelerometer.setUpdateInterval(1000);
    return () => subscription.remove();
  }, []);

  const [attempts, setAttempts] = useState<Attempts>({
    palabra1: false,
    palabra2: false,
    palabra3: false,
    dibujoReloj: false,
  });

  const toggleAttempt = (key: AttemptKey) => {
    setAttempts((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const calcularPuntos = () => {
    let puntos = 0;
    if (attempts.palabra1) puntos += 1;
    if (attempts.palabra2) puntos += 1;
    if (attempts.palabra3) puntos += 1;
    if (attempts.dibujoReloj) puntos += 2;
    return puntos;
  };

  const handleEnviar = async () => {
    const puntos = calcularPuntos();
    try {
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: idEvaluacion || "01_mini_cog",
        fecha: new Date().toISOString().split("T")[0],
        puntaje: puntos,
      });
      const interpretacion = puntos <= 2 ? "Riesgo de demencia" : "Sin riesgo significativo";
      setResultado(`Puntaje: ${puntos}/5 — Guardado`);
      Alert.alert(
        "Evaluación guardada",
        `Paciente: ${pacienteNombre}\nPuntaje: ${puntos}/5\nInterpretación: ${interpretacion}`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "No se pudo guardar la evaluación. Verifique su conexión.");
    }
  };

  const handleGuardarDibujo = () => {
    setResultado("Dibujo guardado");
    Alert.alert("Resultado", "Dibujo guardado correctamente");
  };

  const handleAbrirCamara = () => {
    setResultado("Camara abierta");
    Alert.alert("Resultado", "Camara abierta correctamente");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.titulo}>Mini-Cog</Text>
          {pacienteNombre !== "" && (
            <View style={styles.pacienteBanner}>
              <Text style={styles.pacienteBannerText}>👤 {pacienteNombre}</Text>
            </View>
          )}
          <Text style={styles.subtitulo}>
            Diga 3 palabras y dibuje un reloj
          </Text>

          <Text style={styles.label}>Palabra 1:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese la palabra 1"
            value={palabra1}
            onChangeText={setPalabra1}
          />

          <Text style={styles.label}>Palabra 2:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese la palabra 2"
            value={palabra2}
            onChangeText={setPalabra2}
          />

          <Text style={styles.label}>Palabra 3:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese la palabra 3"
            value={palabra3}
            onChangeText={setPalabra3}
          />

          <View style={styles.buttonRow}>
            <View style={styles.halfButton}>
              <Button
                title="Abrir Camara"
                onPress={handleAbrirCamara}
                color="#2196F3"
              />
            </View>
            <View style={styles.halfButton}>
              <Button
                title="Guardar Dibujo"
                onPress={handleGuardarDibujo}
                color="#2196F3"
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Evaluación (Positivo)</Text>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Intento 1</Text>
            <Switch
              value={attempts.palabra1}
              onValueChange={() => toggleAttempt("palabra1")}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Intento 2</Text>
            <Switch
              value={attempts.palabra2}
              onValueChange={() => toggleAttempt("palabra2")}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Intento 3</Text>
            <Switch
              value={attempts.palabra3}
              onValueChange={() => toggleAttempt("palabra3")}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Dibujo de Reloj</Text>
            <Switch
              value={attempts.dibujoReloj}
              onValueChange={() => toggleAttempt("dibujoReloj")}
            />
          </View>

          <Text style={styles.points}>Puntos Totales: {calcularPuntos()}</Text>

          <Text style={styles.sensorText}>
            Acelerómetro: x: {x.toFixed(2)} y: {y.toFixed(2)} z: {z.toFixed(2)}
          </Text>

          {resultado !== "" && <Text style={styles.result}>{resultado}</Text>}

          <View style={styles.mainButtonContainer}>
            <Button
              title="Enviar Evaluación"
              onPress={handleEnviar}
              color="#841584"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "purple",
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  pacienteBanner: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  pacienteBannerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E40AF",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "purple",
    marginTop: 20,
    marginBottom: 15,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  halfButton: {
    flex: 0.48,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 16,
  },
  points: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
    color: "#333",
  },
  result: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
    marginBottom: 15,
    textAlign: "center",
  },
  sensorText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
  },
  mainButtonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
});

export default MiniCogScreen;
