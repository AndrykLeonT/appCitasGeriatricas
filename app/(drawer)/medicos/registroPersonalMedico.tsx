import { useLocalSearchParams, useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";
import React, { useEffect, useState } from "react";
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

// SQLite Database Setup
const initDB = async () => {
  const db = await SQLite.openDatabaseAsync("medicos.db");
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS PersonalMedico (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido1 TEXT NOT NULL,
      apellido2 TEXT,
      rfc TEXT,
      cedula TEXT,
      carrera TEXT,
      escuela TEXT,
      tituloEspecialidad TEXT,
      escuelaEspecialidad TEXT,
      turno TEXT,
      telefono TEXT,
      cubreUrgencias INTEGER,
      sexo TEXT
    );
  `);

  try {
    // Si la tabla ya fue creada pero NO tiene la columna sexo, la agregamos:
    await db.execAsync(`ALTER TABLE PersonalMedico ADD COLUMN sexo TEXT;`);
  } catch (e) {
    // La columna ya existe
  }

  return db;
};

export default function RegistroPersonalMedico() {
  const router = useRouter();
  const { medicoData } = useLocalSearchParams();

  // DB State
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  // Form State
  const [idEditando, setIdEditando] = useState<number | null>(null);

  const [nombre, setNombre] = useState("");
  const [apellido1, setApellido1] = useState("");
  const [apellido2, setApellido2] = useState("");
  const [rfc, setRfc] = useState("");
  const [cedula, setCedula] = useState("");
  const [carrera, setCarrera] = useState("");
  const [escuela, setEscuela] = useState("");
  const [tituloEspecialidad, setTituloEspecialidad] = useState("");
  const [escuelaEspecialidad, setEscuelaEspecialidad] = useState("");
  const [turno, setTurno] = useState("Matutino");
  const [telefono, setTelefono] = useState("");
  const [cubreUrgencias, setCubreUrgencias] = useState(false);
  const [sexo, setSexo] = useState("M");

  useEffect(() => {
    const setup = async () => {
      try {
        const database = await initDB();
        setDb(database);
      } catch (error) {
        console.error("Error al inicializar la base de datos", error);
        Alert.alert("Error", "No se pudo conectar a la base de datos.");
      }
    };
    setup();
  }, []);

  useEffect(() => {
    if (medicoData) {
      try {
        const medico = JSON.parse(medicoData as string);
        setIdEditando(medico.id);
        setNombre(medico.nombre || "");
        setApellido1(medico.apellido1 || "");
        setApellido2(medico.apellido2 || "");
        setRfc(medico.rfc || "");
        setCedula(medico.cedula || "");
        setCarrera(medico.carrera || "");
        setEscuela(medico.escuela || "");
        setTituloEspecialidad(medico.tituloEspecialidad || "");
        setEscuelaEspecialidad(medico.escuelaEspecialidad || "");
        setTurno(medico.turno || "Matutino");
        setTelefono(medico.telefono || "");
        setCubreUrgencias(medico.cubreUrgencias === 1);
        setSexo(medico.sexo || "M");
      } catch (e) {
        console.error("Error parsing medicoData", e);
      }
    }
  }, [medicoData]);

  const limpiarFormulario = () => {
    setIdEditando(null);
    setNombre("");
    setApellido1("");
    setApellido2("");
    setRfc("");
    setCedula("");
    setCarrera("");
    setEscuela("");
    setTituloEspecialidad("");
    setEscuelaEspecialidad("");
    setTurno("Matutino");
    setTelefono("");
    setCubreUrgencias(false);
    setSexo("M");
  };

  const insertarMedico = async () => {
    if (!db) return;
    try {
      await db.runAsync(
        `INSERT INTO PersonalMedico (
          nombre, apellido1, apellido2, rfc, cedula, carrera, escuela, 
          tituloEspecialidad, escuelaEspecialidad, turno, telefono, cubreUrgencias, sexo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        nombre,
        apellido1,
        apellido2,
        rfc,
        cedula,
        carrera,
        escuela,
        tituloEspecialidad,
        escuelaEspecialidad,
        turno,
        telefono,
        cubreUrgencias ? 1 : 0,
        sexo
      );
      Alert.alert("Éxito", "Personal médico guardado correctamente.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error al insertar médico", error);
      Alert.alert("Error", "No se pudo guardar el registro.");
    }
  };

  const actualizarMedico = async () => {
    if (!db || idEditando === null) return;
    try {
      await db.runAsync(
        `UPDATE PersonalMedico SET 
          nombre = ?, apellido1 = ?, apellido2 = ?, rfc = ?, cedula = ?, carrera = ?, escuela = ?, 
          tituloEspecialidad = ?, escuelaEspecialidad = ?, turno = ?, telefono = ?, cubreUrgencias = ?, sexo = ?
        WHERE id = ?`,
        nombre,
        apellido1,
        apellido2,
        rfc,
        cedula,
        carrera,
        escuela,
        tituloEspecialidad,
        escuelaEspecialidad,
        turno,
        telefono,
        cubreUrgencias ? 1 : 0,
        sexo,
        idEditando
      );
      Alert.alert("Éxito", "Datos del médico actualizados correctamente.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error al actualizar médico", error);
      Alert.alert("Error", "No se pudo actualizar el registro.");
    }
  };

  const handleGuardar = () => {
    if (!nombre.trim() || !apellido1.trim() || !carrera.trim()) {
      Alert.alert(
        "Error",
        "El nombre, primer apellido y carrera son obligatorios para guardar.",
      );
      return;
    }

    if (idEditando) {
      actualizarMedico();
    } else {
      insertarMedico();
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollContent}>
          <Text style={styles.title}>
            Registro de Personal Médico{" "}
            <Text style={styles.titleLocal}>(SQLite)</Text>
          </Text>

          {/* Identidad */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Identidad</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre(s)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ana"
              placeholderTextColor="#9ca3af"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 5 }]}>
              <Text style={styles.label}>Primer Apellido</Text>
              <TextInput
                style={styles.input}
                placeholder="López"
                placeholderTextColor="#9ca3af"
                value={apellido1}
                onChangeText={setApellido1}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 5 }]}>
              <Text style={styles.label}>Segundo Apellido</Text>
              <TextInput
                style={styles.input}
                placeholder="García"
                placeholderTextColor="#9ca3af"
                value={apellido2}
                onChangeText={setApellido2}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Sexo</Text>
            <View style={styles.tabsContainer}>
              {[
                { label: "Masculino", value: "M" },
                { label: "Femenino", value: "F" },
              ].map((op) => (
                <TouchableOpacity
                  key={op.value}
                  style={[
                    styles.tabButton,
                    sexo === op.value && styles.tabButtonActive,
                    op.value === "F" && {
                      borderLeftWidth: 1,
                      borderColor: "#d1d5db",
                    },
                  ]}
                  onPress={() => setSexo(op.value)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      sexo === op.value && styles.tabTextActive,
                    ]}
                  >
                    {op.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>RFC</Text>
            <TextInput
              style={styles.input}
              placeholder="LOGA800101XYZ"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
              value={rfc}
              onChangeText={setRfc}
            />
          </View>

          {/* Profesión */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profesión</Text>
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
            <Text style={styles.label}>Carrera</Text>
            <TextInput
              style={styles.input}
              placeholder="Médico Cirujano"
              placeholderTextColor="#9ca3af"
              value={carrera}
              onChangeText={setCarrera}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Escuela</Text>
            <TextInput
              style={styles.input}
              placeholder="UNAM"
              placeholderTextColor="#9ca3af"
              value={escuela}
              onChangeText={setEscuela}
            />
          </View>

          {/* Especialidad */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Especialidad (Opcional)</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Título de Especialidad</Text>
            <TextInput
              style={styles.input}
              placeholder="Medicina Interna"
              placeholderTextColor="#9ca3af"
              value={tituloEspecialidad}
              onChangeText={setTituloEspecialidad}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Escuela</Text>
            <TextInput
              style={styles.input}
              placeholder="Hospital General"
              placeholderTextColor="#9ca3af"
              value={escuelaEspecialidad}
              onChangeText={setEscuelaEspecialidad}
            />
          </View>

          {/* Datos Operativos */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Operatividad y Contacto</Text>
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

          <View style={styles.switchRow}>
            <Text style={styles.label}>¿Puede cubrir Urgencias?</Text>
            <Switch
              value={cubreUrgencias}
              onValueChange={setCubreUrgencias}
              trackColor={{ false: "#767577", true: "#4db871" }}
              thumbColor={"#ffffff"}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.btnGuardar,
              idEditando ? styles.btnActualizar : null,
            ]}
            onPress={handleGuardar}
          >
            <Text style={styles.btnGuardarText}>
              {idEditando ? "Actualizar Registro" : "Guardar Registro"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnCancelar}
            onPress={() => router.back()}
          >
            <Text style={styles.btnCancelarText}>Volver / Cancelar</Text>
          </TouchableOpacity>

          {/* Espacio adicional al final */}
          <View style={{ height: 50 }} />
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
  sectionHeader: {
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4b5563",
  },
  formGroup: { marginBottom: 15 },
  row: { flexDirection: "row", justifyContent: "space-between" },
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
    marginBottom: 20,
    marginTop: 5,
  },
  btnGuardar: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  btnActualizar: {
    backgroundColor: "#0284c7",
  },
  btnGuardarText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  btnCancelar: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  btnCancelarText: { color: "#4b5563", fontSize: 15, fontWeight: "600" },
});
