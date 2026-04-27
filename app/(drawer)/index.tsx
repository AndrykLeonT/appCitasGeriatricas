import { useFocusEffect, useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import React, { useState, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { leerUltimasEvaluaciones, RegistroEvaluacion } from "../../services/firebaseEvaluaciones";
import { readPatientsFromFirebase } from "../../services/firebasePatients";

export default function HomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [recentEvals, setRecentEvals] = useState<(RegistroEvaluacion & { nombrePaciente?: string })[]>([]);
  const [loadingEvals, setLoadingEvals] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchRecentData = async () => {
        setLoadingEvals(true);
        try {
          const [evals, patients] = await Promise.all([
            leerUltimasEvaluaciones(3), // Get top 3 most recent
            readPatientsFromFirebase()
          ]);
          
          if (!isActive) return;

          // Map patient names
          const mappedEvals = evals.map(ev => {
            const pac = patients.find(p => p.id === ev.idPaciente);
            const nombrePaciente = pac ? `${pac.nombre} ${pac.apellidos}`.trim() : "Paciente Desconocido";
            return { ...ev, nombrePaciente };
          });

          setRecentEvals(mappedEvals);
        } catch (e) {
          console.error("Error fetching recent data:", e);
        } finally {
          if (isActive) setLoadingEvals(false);
        }
      };

      fetchRecentData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <ScrollView
      style={[styles.scrollContainer, isDarkMode && darkStyles.scrollContainer]}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.titulo, isDarkMode && darkStyles.textoPrincipal]}>Administrador de Citas</Text>

      {/* ÚLTIMAS EVALUACIONES */}
      <Text style={[styles.subtitulo, isDarkMode && darkStyles.textoSecundario, { marginTop: 0 }]}>Evaluaciones Recientes</Text>

      {loadingEvals ? (
        <ActivityIndicator size="small" color="#60A5FA" style={{ marginVertical: 20 }} />
      ) : recentEvals.length > 0 ? (
        recentEvals.map((ev) => (
          <View key={ev.id} style={[styles.tarjetaResultado, isDarkMode && darkStyles.tarjetaO]}>
            <Text style={[styles.resultadoTitulo, isDarkMode && darkStyles.textoSecundario]}>{ev.nombrePaciente}</Text>
            <Text style={{ fontSize: 13, color: isDarkMode ? "#9CA3AF" : "#6B7280", marginBottom: 8 }}>
              Prueba ID: {ev.idEvaluacion} • {ev.fecha}
            </Text>
            <Text style={styles.resultadoTexto}>
              Puntaje: {ev.puntaje}
            </Text>
            <Text
              style={[
                styles.diagnostico,
                { color: (typeof ev.puntaje === 'number' && ev.puntaje >= 5) || (ev.diagnostico && ev.diagnostico.toLowerCase().includes("riesgo")) ? "#EF4444" : "#10B981" },
              ]}
            >
              {ev.diagnostico || "Evaluación Completada"}
            </Text>
          </View>
        ))
      ) : (
        <View style={[styles.tarjetaAviso, isDarkMode && darkStyles.tarjetaO]}>
          <Text style={[styles.textoVacio, isDarkMode && darkStyles.textoSecundario]}>No hay evaluaciones recientes.</Text>
        </View>
      )}

      {/* ACCESOS RÁPIDOS */}
      <Text style={[styles.subtitulo, isDarkMode && darkStyles.textoSecundario]}>Accesos Rápidos</Text>

      <View style={styles.gridBotones}>
        <Pressable
          style={({ pressed }) => [
            styles.botonPrincipal,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => router.push("/(drawer)/citas")}
        >
          <Text style={styles.textoBoton}>Citas</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.botonPrincipal,
            { opacity: pressed ? 0.7 : 1, backgroundColor: "#10B981" },
          ]}
          onPress={() => router.push("/(drawer)/pacientes")}
        >
          <Text style={styles.textoBoton}>Pacientes</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.botonPrincipal,
            { opacity: pressed ? 0.7 : 1, backgroundColor: "#8B5CF6" },
          ]}
          onPress={() => router.push("/(drawer)/evaluaciones")}
        >
          <Text style={styles.textoBoton}>Evaluaciones</Text>
        </Pressable>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: "#FAFAFA" },
  container: {
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 20,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B5563",
    alignSelf: "flex-start",
    marginTop: 25,
    marginBottom: 15,
  },

  gridBotones: { flexDirection: "row", gap: 10, width: "100%" },
  botonPrincipal: {
    backgroundColor: "#60A5FA",
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  botonSecundario: {
    backgroundColor: "#E5E7EB",
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  botonPrueba: {
    backgroundColor: "#3B82F6",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  textoBoton: { color: "#FFFFFF", fontWeight: "bold", fontSize: 15 },
  textoBotonOscuro: { color: "#374151", fontWeight: "bold", fontSize: 15 },

  tarjetaAviso: {
    width: "100%",
    padding: 15,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  textoVacio: { fontSize: 14, color: "#6B7280", fontStyle: "italic" },

  tarjetaResultado: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#60A5FA",
  },
  resultadoTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 5,
  },
  resultadoTexto: {
    fontSize: 20,
    fontWeight: "700",
    color: "#60A5FA",
    marginBottom: 5,
  },
  diagnostico: { fontSize: 15, fontWeight: "bold" },
});

const darkStyles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: "#111827",
  },
  textoPrincipal: {
    color: "#F9FAFB",
  },
  textoSecundario: {
    color: "#D1D5DB",
  },
  tarjetaO: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
    borderWidth: 1,
  },
});
