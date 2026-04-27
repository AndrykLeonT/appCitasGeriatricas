import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { guardarRegistroEvaluacion } from "../../../services/firebaseEvaluaciones";

const Resultado = () => {
  const router = useRouter();
  // Recibir los parámetros enviados desde Prueba
  const params = useLocalSearchParams();
  const aciertos = params.aciertos ? Number(params.aciertos) : 0;
  const fallos = params.fallos ? Number(params.fallos) : 0;
  const total = params.total ? Number(params.total) : 7;

  // Calcular porcentaje
  const porcentaje = Math.round((aciertos / total) * 100);

  const [guardando, setGuardando] = useState(false);

  const pacienteId = typeof params.pacienteId === 'string' ? params.pacienteId : Array.isArray(params.pacienteId) ? params.pacienteId[0] : '';
  const idEvaluacion = typeof params.idEvaluacion === 'string' ? params.idEvaluacion : Array.isArray(params.idEvaluacion) ? params.idEvaluacion[0] : '14_agudeza_visual';

  const diagnostico = porcentaje >= 100
    ? "Vision normal"
    : porcentaje >= 80
      ? "Discapacidad visual moderada"
      : porcentaje >= 60
        ? "Discapacidad visual grave"
        : "Ceguera";

  const guardarYVolver = async () => {
    if (guardando) return;
    setGuardando(true);
    try {
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: idEvaluacion,
        fecha: new Date().toISOString().split('T')[0],
        puntaje: aciertos, // O porcentaje, dependiendo de la decisión, usaré aciertos por ahora
        diagnostico: diagnostico
      });
      Alert.alert(
        "Éxito", 
        "Evaluación guardada correctamente.",
        [{ text: "OK", onPress: () => router.navigate("/(drawer)/evaluaciones") }]
      );
    } catch {
      Alert.alert("Error", "No se pudo guardar la evaluación");
    } finally {
      setGuardando(false);
    }
  };

  const volverAIntentar = () => {
    router.push({
      pathname: "/(drawer)/evaluaciones/14_Prueba",
      params: { pacienteId, pacienteNombre: params.pacienteNombre, idEvaluacion }
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            Resultados de la Prueba de Agudeza Visual
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {diagnostico}
            </Text>

            <View style={styles.row}>
              <Text style={styles.label}>Aciertos:</Text>
              <Text style={[styles.value, styles.aciertos]}>{aciertos}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Fallos:</Text>
              <Text style={[styles.value, styles.fallos]}>{fallos}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Total:</Text>
              <Text style={[styles.value, styles.total]}>{total}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Porcentaje:</Text>
              <Text style={[styles.value, styles.porcentaje]}>
                {porcentaje}%
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.boton, styles.botonReintentar]}
            onPress={volverAIntentar}
          >
            <Text style={styles.textoBoton}>Intentar de Nuevo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.boton, styles.botonInicio, guardando && { opacity: 0.7 }]}
            onPress={guardarYVolver}
            disabled={guardando}
          >
            <Text style={styles.textoBoton}>{guardando ? "Guardando..." : "Guardar y Volver"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#ab24af",
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 25,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
    color: "#000000",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  label: {
    fontSize: 18,
    color: "#555",
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
  },
  aciertos: {
    color: "#4CAF50",
  },
  fallos: {
    color: "#f44336",
  },
  total: {
    color: "#d15bbd",
  },
  porcentaje: {
    color: "#9C27B0",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 15,
  },
  boton: {
    padding: 15,
    borderRadius: 12,
    width: "100%",
    marginVertical: 8,
  },
  botonReintentar: {
    backgroundColor: "#f321d0",
  },
  botonInicio: {
    backgroundColor: "#9C27B0",
  },
  textoBoton: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default Resultado;
