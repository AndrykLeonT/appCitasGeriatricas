import React from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const FormularioGeriatrico = () => {
  const guardarDatos = () => {
    if (contador >= 4) {
      alert(
        "El paciente tuvo una puntuacion de: " +
          contador +
          " por lo tanto tiene una alta probabilidad de sarcopenia",
      );
    } else {
      alert(
        "El paciente tuvo una puntuacion de: " +
          contador +
          " por lo tanto tiene una baja probabillidad de sarcopenia",
      );
    }
  };

  let contador = 0;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <Text style={styles.titulo}>
            Selecciona el boton en caso que sea respuesta negativa
          </Text>

          <Text>¿Tiene fuerza?</Text>
          <Button title="No" onPress={() => contador++} />

          <Text>¿Ocupa asistencia para caminar?</Text>
          <Button title="No" onPress={() => contador++} />

          <Text>¿Le cuesta levantarse de una silla?</Text>
          <Button title="No" onPress={() => contador++} />

          <Text>¿Le cuesta subir escaleras?</Text>
          <Button title="No" onPress={() => contador++} />

          <Text>¿A tenido caidas?</Text>
          <Button title="No" onPress={() => contador++} />
          <View style={styles.boton}>
            <Button title="Guardar" onPress={guardarDatos} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titulo: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "bold",
  },
  subtitulo: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  textArea: {
    height: 80,
  },
  boton: {
    marginTop: 20,
  },
});

export default FormularioGeriatrico;