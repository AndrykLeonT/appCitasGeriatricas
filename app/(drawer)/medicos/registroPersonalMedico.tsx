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
      cubreUrgencias INTEGER
    );
  `);
  return db;
};

export default function RegistroPersonalMedico() {
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

  const [registros, setRegistros] = useState<any[]>([]);

  useEffect(() => {
    const setup = async () => {
      try {
        const database = await initDB();
        setDb(database);
        await obtenerMedicos(database);
      } catch (error) {
        console.error("Error al inicializar la base de datos", error);
        Alert.alert("Error", "No se pudo conectar a la base de datos.");
      }
    };
    setup();
  }, []);

  const obtenerMedicos = async (database: SQLite.SQLiteDatabase) => {
    try {
      const result = await database.getAllAsync(
        "SELECT * FROM PersonalMedico ORDER BY id DESC;",
      );
      setRegistros(result);
    } catch (error) {
      console.error("Error al obtener médicos", error);
    }
  };

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
  };

  const insertarMedico = async () => {
    if (!db) return;
    try {
      await db.runAsync(
        `INSERT INTO PersonalMedico (
          nombre, apellido1, apellido2, rfc, cedula, carrera, escuela, 
          tituloEspecialidad, escuelaEspecialidad, turno, telefono, cubreUrgencias
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
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
        ],
      );
      Alert.alert("Éxito", "Personal médico guardado correctamente.");
      limpiarFormulario();
      obtenerMedicos(db);
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
          tituloEspecialidad = ?, escuelaEspecialidad = ?, turno = ?, telefono = ?, cubreUrgencias = ?
        WHERE id = ?`,
        [
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
          idEditando,
        ],
      );
      Alert.alert("Éxito", "Datos del médico actualizados correctamente.");
      limpiarFormulario();
      obtenerMedicos(db);
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

  const handleEditar = (medico: any) => {
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
  };

  const eliminarMedico = async (id: number) => {
    if (!db) return;
    try {
      await db.runAsync("DELETE FROM PersonalMedico WHERE id = ?;", [id]);
      Alert.alert("Éxito", "Registro eliminado correctamente.");
      if (id === idEditando) limpiarFormulario();
      obtenerMedicos(db);
    } catch (error) {
      console.error("Error al eliminar médico", error);
      Alert.alert("Error", "No se pudo eliminar el registro.");
    }
  };

  const handleBorrar = (id: number) => {
    Alert.alert("Confirmación", "¿Está seguro de eliminar este registro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: () => eliminarMedico(id),
      },
    ]);
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

          {idEditando && (
            <TouchableOpacity
              style={styles.btnCancelar}
              onPress={limpiarFormulario}
            >
              <Text style={styles.btnCancelarText}>Cancelar Edición</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          <Text style={styles.listaTitle}>
            Médicos Registrados ({registros.length})
          </Text>

          {registros.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay médicos registrados aún.
            </Text>
          ) : (
            registros.map((medico: any) => (
              <View key={medico.id.toString()} style={styles.medicoCard}>
                <View style={styles.medicoInfo}>
                  <Text style={styles.medicoName}>
                    {medico.nombre} {medico.apellido1} {medico.apellido2 || ""}
                  </Text>
                  <Text style={styles.medicoSpec}>
                    {medico.tituloEspecialidad ||
                      medico.carrera ||
                      "Sin especialidad"}
                  </Text>
                  <Text style={styles.medicoDetails}>
                    Turno: {medico.turno} | Urgencias:{" "}
                    {medico.cubreUrgencias ? "Sí" : "No"}
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.btnEdit}
                    onPress={() => handleEditar(medico)}
                  >
                    <Text style={styles.actionText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnDelete}
                    onPress={() => handleBorrar(medico.id)}
                  >
                    <Text style={styles.actionTextDelete}>Borrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

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
  divider: { height: 1, backgroundColor: "#d1d5db", marginVertical: 25 },
  listaTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 15,
  },
  emptyText: {
    color: "#6b7280",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
  medicoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  medicoInfo: { marginBottom: 10 },
  medicoName: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  medicoSpec: {
    fontSize: 14,
    color: "#4f46e5",
    marginTop: 2,
    fontWeight: "500",
  },
  medicoDetails: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 10,
  },
  btnEdit: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  btnDelete: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#fee2e2",
  },
  actionText: { color: "#4b5563", fontWeight: "600", fontSize: 13 },
  actionTextDelete: { color: "#dc2626", fontWeight: "600", fontSize: 13 },
});
