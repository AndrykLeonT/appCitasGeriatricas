import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from "expo-router";
import React, { useCallback, useState } from 'react';
import {
  Alert, Pressable,
  ScrollView,
  StyleSheet, Text, View
} from 'react-native';

const CESD7Test = () => {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState(new Array(7).fill(null));

  useFocusEffect(
    useCallback(() => {
      setRespuestas(new Array(7).fill(null));
    }, [])
  );

  const preguntas = [
    { id: 0, texto: "1. ¿Sentía como si no pudiera quitarse la tristeza?", tipo: 'normal' },
    { id: 1, texto: "2. ¿Le costaba concentrarse en lo que estaba haciendo?", tipo: 'normal' },
    { id: 2, texto: "3. ¿Se sintió deprimido/a?", tipo: 'normal' },
    { id: 3, texto: "4. ¿Le parecía que todo lo que hacía era un esfuerzo?", tipo: 'normal' },
    { id: 4, texto: "5. ¿No durmió bien?", tipo: 'normal' },
    { id: 5, texto: "6. ¿Disfrutó de la vida?", tipo: 'invertido' },
    { id: 6, texto: "7. ¿Se sintió triste?", tipo: 'normal' },
  ];

  const opciones = [
    { label: 'Rara vez', val: 0, valInv: 3 },
    { label: 'Pocas veces', val: 1, valInv: 2 },
    { label: 'Frecuente', val: 2, valInv: 1 },
    { label: 'Siempre', val: 3, valInv: 0 },
  ];

  const seleccionarOpcion = (preguntaIdx: number, puntos: number) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaIdx] = puntos;
    setRespuestas(nuevasRespuestas);
  };

  const calcularResultado = () => {
    if (respuestas.includes(null)) {
      Alert.alert("Atención", "Por favor responde todas las preguntas.");
      return;
    }

    const puntajeTotal = respuestas.reduce((a, b) => a + b, 0);
    const interpretacion = puntajeTotal < 5 ? "Normal" : "Síntomas significativos";

    Alert.alert(
      "Resultado",
      `Puntaje: ${puntajeTotal} puntos\n${interpretacion}`,
      [{
        text: "FINALIZAR",
        onPress: () => router.replace({
          pathname: "/",
          params: { puntaje: puntajeTotal, diagnostico: interpretacion }
        })
      }]
    );
  };

  return (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>Evaluación CESD-7</Text>
      {preguntas.map((item, index) => (
        <View key={item.id} style={styles.cardPregunta}>
          <Text style={styles.preguntaText}>{item.texto}</Text>
          <View style={styles.opcionesContainer}>
            {opciones.map((opt) => {
              const valorAsignado = item.tipo === 'normal' ? opt.val : opt.valInv;
              const esSeleccionado = respuestas[index] === valorAsignado;

              return (
                <Pressable
                  key={opt.label}
                  style={({ pressed }) => [
                    styles.opcionBtn,
                    esSeleccionado && styles.opcionSelected,
                    pressed && { opacity: 0.7 }
                  ]}
                  onPress={() => seleccionarOpcion(index, valorAsignado)}
                >
                  <Text style={[styles.opcionTxt, esSeleccionado && styles.opcionTxtSelected]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && { backgroundColor: '#5B21B6' }
        ]}
        onPress={calcularResultado}
      >
        <Text style={styles.buttonText}>CALCULAR</Text>
      </Pressable>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default CESD7Test;

const styles = StyleSheet.create({
  formContainer: { flex: 1, padding: 20, backgroundColor: '#FFF' },
  formTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 25, color: '#111827' },
  cardPregunta: { marginBottom: 30 },
  preguntaText: { fontSize: 17, color: '#374151', marginBottom: 15 },
  opcionesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  opcionBtn: {
    borderColor: '#E5E7EB',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20
  },
  opcionSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED'
  },
  opcionTxt: { color: '#6B7280', fontSize: 13 },
  opcionTxtSelected: { color: '#FFF', fontWeight: '600' },
  primaryButton: {
    backgroundColor: '#7C3AED',
    padding: 18,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center'
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});