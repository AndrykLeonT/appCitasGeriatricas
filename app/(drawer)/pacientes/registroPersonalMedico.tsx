import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RegistroPersonalMedico() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [turno, setTurno] = useState("Matutino");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [area, setArea] = useState("");
  const [isActivo, setIsActivo] = useState(true);

  const [registros, setRegistros] = useState([
    {
      id: "1",
      nombre: "Dra. Ana López García",
      especialidad: "Medicina Interna",
      turno: "Matutino",
    },
    {
      id: "2",
      nombre: "Dr. Carlos Ramirez",
      especialidad: "Cardiología",
      turno: "Vespertino",
    },
    {
      id: "3",
      nombre: "Enf. Laura Pérez",
      especialidad: "Pediatría",
      turno: "Nocturno",
    },
  ]);

  const handleGuardar = () => {
    if (!nombre.trim() || !especialidad.trim()) {
      Alert.alert(
        "Error",
        "El nombre y la especialidad son obligatorios para guardar.",
      );
      return;
    }
    const nuevoRegistro = {
      id: Date.now().toString(),
      nombre,
      especialidad,
      turno,
    };
    setRegistros([nuevoRegistro, ...registros]);
    setNombre("");
    setCedula("");
    setEspecialidad("");
    setTelefono("");
    setCorreo("");
    setArea("");
    setIsActivo(true);
    setTurno("Matutino");
    Alert.alert("Éxito", "Personal médico guardado localmente.");
  };

  const handleBorrarTodo = () => {
    Alert.alert(
      "Confirmación",
      "¿Está seguro de borrar todos los registros almacenados?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: () => setRegistros([]),
        },
      ],
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollContent}>
          <Text style={styles.title}>
            Registro de Personal Médico{" "}
            <Text style={styles.titleLocal}>(Local)</Text>
          </Text>
          <Text style={styles.subtitle}>
            Guardados localmente: {registros.length}
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Dra. Ana López García"
              placeholderTextColor="#9ca3af"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Cédula profesional</Text>
            <TextInput
              style={styles.input}
              placeholder="1234567"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={cedula}
              onChangeText={setCedula}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Especialidad</Text>
            <TextInput
              style={styles.input}
              placeholder="Medicina Interna"
              placeholderTextColor="#9ca3af"
              value={especialidad}
              onChangeText={setEspecialidad}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Turno</Text>
            <View style={styles.tabsContainer}>
              {["Matutino", "Vespertino", "Nocturno"].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.tabButton,
                    turno === t && styles.tabButtonActive,
                    t === "Vespertino" && {
                      borderLeftWidth: 1,
                      borderRightWidth: 1,
                      borderColor: "#d1d5db",
                    },
                  ]}
                  onPress={() => setTurno(t)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      turno === t && styles.tabTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Teléfono (10 dígitos)</Text>
            <TextInput
              style={styles.input}
              placeholder="6121234567"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={telefono}
              onChangeText={setTelefono}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Correo</Text>
            <TextInput
              style={styles.input}
              placeholder="ana.lopez@hospital.mx"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={correo}
              onChangeText={setCorreo}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Área / Servicio</Text>
              <Switch
                value={isActivo}
                onValueChange={setIsActivo}
                trackColor={{ false: "#767577", true: "#4db871" }}
                thumbColor={"#ffffff"}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Urgencias"
              placeholderTextColor="#9ca3af"
              value={area}
              onChangeText={setArea}
            />
          </View>

          <TouchableOpacity style={styles.btnGuardar} onPress={handleGuardar}>
            <Text style={styles.btnGuardarText}>Guardar (Local)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnBorrar} onPress={handleBorrarTodo}>
            <Text style={styles.btnBorrarText}>Borrar todo (práctica)</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollContent: { padding: 25 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
    marginTop: 10,
  },
  titleLocal: { color: "#6b7280", fontWeight: "normal" },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 25 },
  formGroup: { marginBottom: 15 },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  tabsContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  tabButtonActive: { backgroundColor: "#4db871" },
  tabText: { fontSize: 14, color: "#374151", fontWeight: "500" },
  tabTextActive: { color: "#ffffff", fontWeight: "bold" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  btnGuardar: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  btnGuardarText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  btnBorrar: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  btnBorrarText: { color: "#374151", fontSize: 16, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 10 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 15,
    marginTop: 10,
  },
  registroItem: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 8,
    lineHeight: 20,
  },
  boldText: { fontWeight: "bold", color: "#1f2937" },
});
