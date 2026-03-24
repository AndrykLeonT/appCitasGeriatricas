import { useRouter } from "expo-router";
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

export default function CrearCitaScreen() {
  const router = useRouter();

  // Manejamos los 20 datos en un solo estado para mantener el código limpio
  const [formData, setFormData] = useState({
    paciente: "",
    contacto: "",
    email: "",
    telefono: "",
    fecha: "",
    sintomas: "",
    edad: "",
    genero: "",
    tipoSangre: "",
    alergias: "",
    peso: "",
    estatura: "",
    presion: "",
    temperatura: "",
    medicamentos: "",
    enfermedades: "",
    direccion: "",
    ocupacion: "",
    estadoCivil: "",
    notas: "",
  });

  const actualizarCampo = (campo: string, valor: string) => {
    setFormData({ ...formData, [campo]: valor });
  };

  const registrarCita = () => {
    // Aquí podrías validar que los campos obligatorios no estén vacíos
    if (!formData.paciente || !formData.fecha) {
      Alert.alert(
        "Datos incompletos",
        "Por favor ingrese al menos el nombre y la fecha.",
      );
      return;
    }

    Alert.alert("Éxito", "La cita ha sido registrada correctamente.", [
      { text: "Aceptar", onPress: () => router.push("/") },
    ]);
  };

  // Función auxiliar para renderizar los inputs rápidamente
  const renderInput = (
    clave: keyof typeof formData,
    etiqueta: string,
    multiline = false,
  ) => (
    <View style={styles.inputContainer} key={clave}>
      <Text style={styles.label}>{etiqueta}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={`Ingrese ${etiqueta.toLowerCase()}`}
        value={formData[clave]}
        onChangeText={(texto) => actualizarCampo(clave, texto)}
        multiline={multiline}
        keyboardType={
          clave === "email"
            ? "email-address"
            : clave === "telefono" ||
                clave === "edad" ||
                clave === "peso" ||
                clave === "estatura"
              ? "numeric"
              : "default"
        }
      />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.instrucciones}>
        Complete los datos básicos del paciente para agendar una nueva cita.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Datos Personales y Contacto</Text>
        {renderInput("paciente", "Nombre del paciente")}
        {renderInput("fecha", "Fecha de la cita (DD/MM/AAAA)")}
        {renderInput("telefono", "Teléfono")}
        {renderInput("email", "Correo Electrónico")}
        {renderInput("contacto", "Contacto de emergencia")}
        {renderInput("direccion", "Dirección completa")}
        {renderInput("edad", "Edad")}
        {renderInput("genero", "Género")}
        {renderInput("estadoCivil", "Estado Civil")}
        {renderInput("ocupacion", "Ocupación")}

        <Text style={styles.sectionTitle}>Datos Médicos y Síntomas</Text>
        {renderInput("tipoSangre", "Tipo de Sangre")}
        {renderInput("peso", "Peso (kg)")}
        {renderInput("estatura", "Estatura (m)")}
        {renderInput("presion", "Presión Arterial (ej. 120/80)")}
        {renderInput("temperatura", "Temperatura (°C)")}
        {renderInput("alergias", "Alergias conocidas")}
        {renderInput("enfermedades", "Enfermedades crónicas")}
        {renderInput("medicamentos", "Medicamentos actuales")}
        {renderInput("sintomas", "Síntomas principales", true)}
        {renderInput("notas", "Notas adicionales / Motivo de consulta", true)}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.botonGuardar,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={registrarCita}
      >
        <Text style={styles.textoGuardar}>CREAR CITA</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 15 },
  instrucciones: {
    backgroundColor: "#DBEAFE",
    padding: 15,
    borderRadius: 8,
    color: "#1E40AF",
    marginBottom: 20,
    fontStyle: "italic",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 8,
    elevation: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 5,
  },
  inputContainer: { marginBottom: 15 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1F2937",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  botonGuardar: {
    backgroundColor: "#3B82F6",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  textoGuardar: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
});
