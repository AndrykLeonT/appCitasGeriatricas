import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { guardarRegistroEvaluacion } from "../../../services/firebaseEvaluaciones";

const SarcFScreen = () => {
  const router = useRouter();
  const { pacienteId = '', pacienteNombre = '', idEvaluacion = '17_sarc_f' } = useLocalSearchParams<{
    pacienteId: string;
    pacienteNombre: string;
    idEvaluacion: string;
  }>();

  const [guardando, setGuardando] = useState(false);
  const [answers, setAnswers] = useState({ q1: null, q2: null, q3: null, q4: null, q5: null });

  const questions = [
    {
      id: "q1",
      title: "1. Fuerza",
      desc: "¿Qué tanta dificultad tiene para levantar y transportar 10 libras (4.5 kg)?",
      options: [{ label: "Ninguna", val: 0 }, { label: "Alguna", val: 1 }, { label: "Mucha o incapaz", val: 2 }],
    },
    {
      id: "q2",
      title: "2. Asistencia para caminar",
      desc: "¿Qué tanta dificultad tiene para caminar a través de un cuarto?",
      options: [{ label: "Ninguna", val: 0 }, { label: "Alguna", val: 1 }, { label: "Mucha, requiere asistencia", val: 2 }],
    },
    {
      id: "q3",
      title: "3. Levantarse de una silla",
      desc: "¿Qué tanta dificultad tiene para levantarse de una silla o cama?",
      options: [{ label: "Ninguna", val: 0 }, { label: "Alguna", val: 1 }, { label: "Mucha o incapaz sin ayuda", val: 2 }],
    },
    {
      id: "q4",
      title: "4. Subir escaleras",
      desc: "¿Qué tanta dificultad tiene para subir un tramo de 10 escalones?",
      options: [{ label: "Ninguna", val: 0 }, { label: "Alguna", val: 1 }, { label: "Mucha o incapaz", val: 2 }],
    },
    {
      id: "q5",
      title: "5. Caídas",
      desc: "¿Cuántas veces se ha caído en el último año?",
      options: [{ label: "Ninguna", val: 0 }, { label: "1 a 3 caídas", val: 1 }, { label: "4 o más caídas", val: 2 }],
    },
  ];

  const handleSelect = (qId: string, val: number) => {
    setAnswers({ ...answers, [qId]: val });
  };

  const handleGuardar = async () => {
    const values = Object.values(answers);
    if (values.includes(null)) {
      Alert.alert("Incompleto", "Por favor responda todas las preguntas.");
      return;
    }

    if (guardando) return;
    setGuardando(true);

    const total = values.reduce((a: any, b: any) => a + b, 0);
    const diagnostico = total >= 4 ? "Probable Sarcopenia" : "Baja probabilidad de Sarcopenia";

    try {
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: idEvaluacion,
        fecha: new Date().toISOString().split("T")[0],
        puntaje: total,
        diagnostico: diagnostico,
      });
      Alert.alert(
        "Evaluación Guardada",
        `Puntuación: ${total}\n${diagnostico}`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "No se pudo guardar la evaluación.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.titulo}>Cuestionario SARC-F</Text>
          {pacienteNombre !== '' && (
            <Text style={styles.pacienteTexto}>Paciente: {pacienteNombre}</Text>
          )}

          {questions.map((q) => (
            <View key={q.id} style={styles.card}>
              <Text style={styles.preguntaTitulo}>{q.title}</Text>
              <Text style={styles.preguntaDesc}>{q.desc}</Text>
              <View style={styles.opcionesRow}>
                {q.options.map((opt) => {
                  const isSelected = answers[q.id as keyof typeof answers] === opt.val;
                  return (
                    <Pressable
                      key={opt.label}
                      style={[styles.opcionBtn, isSelected && styles.opcionSelected]}
                      onPress={() => handleSelect(q.id, opt.val)}
                    >
                      <Text style={[styles.opcionTexto, isSelected && styles.textoSelected]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          <Pressable style={[styles.btnGuardar, guardando && { opacity: 0.7 }]} onPress={handleGuardar} disabled={guardando}>
            <Text style={styles.btnTexto}>{guardando ? "GUARDANDO..." : "GUARDAR EVALUACIÓN"}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scroll: { padding: 16 },
  titulo: { fontSize: 24, textAlign: "center", marginBottom: 10, fontWeight: "bold", color: "#1F2937" },
  pacienteTexto: { fontSize: 16, textAlign: "center", marginBottom: 20, color: "#4B5563" },
  card: { backgroundColor: "#FFF", padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  preguntaTitulo: { fontSize: 16, fontWeight: "bold", color: "#374151", marginBottom: 4 },
  preguntaDesc: { fontSize: 14, color: "#6B7280", marginBottom: 12 },
  opcionesRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  opcionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#D1D5DB", alignItems: "center", backgroundColor: "#F3F4F6" },
  opcionSelected: { backgroundColor: "#6366F1", borderColor: "#6366F1" },
  opcionTexto: { fontSize: 12, color: "#4B5563", textAlign: "center", fontWeight: "600" },
  textoSelected: { color: "#FFF" },
  btnGuardar: { backgroundColor: "#4F46E5", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 10, marginBottom: 30 },
  btnTexto: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});

export default SarcFScreen;