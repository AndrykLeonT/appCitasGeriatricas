import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
export default function HomeScreen() {
  // --- ESTADOS FORMULARIO PRINCIPAL ---
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [esUrgente, setEsUrgente] = useState(false);
  // --- ESTADOS ESCALA DE NORTON ---
  const [modalNorton, setModalNorton] = useState(false);
  const [nortonScores, setNortonScores] = useState({
    fisico: 4,
    mental: 4,
    actividad: 4,
    movilidad: 4,
    incontinencia: 4,
  });
  const [totalNorton, setTotalNorton] = useState(20);
  // Calcular total de Norton automáticamente
  useEffect(() => {
    const { fisico, mental, actividad, movilidad, incontinencia } =
      nortonScores;
    setTotalNorton(fisico + mental + actividad + movilidad + incontinencia);
  }, [nortonScores]);
  const obtenerRiesgo = () => {
    if (totalNorton <= 12) return { nivel: "ALTO", color: "#ff4757" };
    if (totalNorton <= 16) return { nivel: "MODERADO", color: "#ffa502" };
    return { nivel: "MÍNIMO", color: "#2ed573" };
  };
  const enviarFormulario = () => {
    if (!nombre || !telefono || !email) {
      Alert.alert("Error", "Por favor llena los campos principales.");
      return;
    }
    Alert.alert(
      "Registro Exitoso",
      `Paciente: ${nombre}\nEscala Norton: ${totalNorton} pts
(${obtenerRiesgo().nivel})`,
    );
  };
  // Componente interno para las filas de selección de la escala
  const SelectorNorton = ({
    label,
    valor,
    campo,
  }: {
    label: string;
    valor: number;
    campo: string;
  }) => (
    <View style={styles.nortonRow}>
      <Text style={styles.nortonLabel}>{label}</Text>
      <View style={styles.nortonButtons}>
        {[1, 2, 3, 4].map((num) => (
          <TouchableOpacity
            key={num}
            style={[styles.nortonBtn, valor === num && styles.nortonBtnActive]}
            onPress={() => setNortonScores({ ...nortonScores, [campo]: num })}
          >
            <Text style={valor === num ? styles.txtWhite : styles.txtBlack}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
  return (
    <ScrollView style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={styles.tituloPrincipal}>ADMINISTRADOR DE CITAS</Text>
        <Text style={styles.clinicaGeriatrica}>Clínica Geriátrica</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Nombre del Paciente:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          onChangeText={setNombre}
        />
        <Text style={styles.label}>Nombre de Contacto:</Text>
        <TextInput
          style={styles.input}
          placeholder="Familiar responsable"
          onChangeText={setContacto}
        />
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
          onChangeText={setEmail}
        />
        <Text style={styles.label}>Teléfono:</Text>
        <TextInput
          style={styles.input}
          placeholder="6641234567"
          keyboardType="phone-pad"
          onChangeText={setTelefono}
        />
        <Text style={styles.label}>Fecha de Cita:</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          onChangeText={setFecha}
        />
        <Text style={styles.label}>Síntomas:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describa síntomas..."
          multiline={true}
          onChangeText={setSintomas}
        />
        <Text style={styles.seccionTitulo}>Próximas Evaluaciones:</Text>
        <View style={styles.categoriasGrid}>
          <View style={styles.categoriaItem}>
            <MaterialCommunityIcons name="brain" size={24} color="#6c5ce7" />
            <Text style={[styles.categoriaTexto, { color: "#6c5ce7" }]}>
              Cognitivo
            </Text>
          </View>
          <View style={styles.categoriaItem}>
            <MaterialCommunityIcons
              name="heart-pulse"
              size={24}
              color="#ff7675"
            />
            <Text style={[styles.categoriaTexto, { color: "#ff7675" }]}>
              Afectivo
            </Text>
          </View>
          {/* BOTÓN FUNCIONAMIENTO - ESCALA NORTON */}
          <TouchableOpacity
            style={styles.categoriaItem}
            onPress={() => setModalNorton(true)}
          >
            <MaterialCommunityIcons name="walk" size={24} color="#00cec9" />
            <Text style={[styles.categoriaTexto, { color: "#00cec9" }]}>
              Funcionamiento
            </Text>
          </TouchableOpacity>
          <View style={styles.categoriaItem}>
            <MaterialCommunityIcons
              name="food-apple"
              size={24}
              color="#fab1a0"
            />
            <Text style={[styles.categoriaTexto, { color: "#fab1a0" }]}>
              Nutricional
            </Text>
          </View>
          <View style={styles.categoriaItem}>
            <MaterialCommunityIcons
              name="home-group"
              size={24}
              color="#55efc4"
            />
            <Text style={[styles.categoriaTexto, { color: "#55efc4" }]}>
              Entorno
            </Text>
          </View>
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.label}>¿Es una urgencia?</Text>
          <Switch
            value={esUrgente}
            onValueChange={setEsUrgente}
            trackColor={{ false: "#767577", true: "#6c5ce7" }}
          />
        </View>
        <TouchableOpacity style={styles.botonEnviar} onPress={enviarFormulario}>
          <Text style={styles.botonTexto}>REGISTRAR PACIENTE</Text>
        </TouchableOpacity>
      </View>
      {/* --- MODAL ESCALA DE NORTON --- */}
      <Modal visible={modalNorton} animationType="slide">
        <ScrollView style={styles.modalContent}>
          <Text style={styles.nortonTitle}>Escala de Norton</Text>
          <Text style={styles.nortonSub}>Valoración de riesgo de úlceras</Text>
          <View
            style={[
              styles.nortonResult,
              { borderColor: obtenerRiesgo().color },
            ]}
          >
            <Text style={styles.nortonTotal}>{totalNorton} Puntos</Text>
            <Text style={{ color: obtenerRiesgo().color, fontWeight: "bold" }}>
              RIESGO
              {obtenerRiesgo().nivel}
            </Text>
          </View>
          <SelectorNorton
            label="Estado Físico"
            valor={nortonScores.fisico}
            campo="fisico"
          />
          <SelectorNorton
            label="Estado Mental"
            valor={nortonScores.mental}
            campo="mental"
          />
          <SelectorNorton
            label="Actividad"
            valor={nortonScores.actividad}
            campo="actividad"
          />
          <SelectorNorton
            label="Movilidad"
            valor={nortonScores.movilidad}
            campo="movilidad"
          />
          <SelectorNorton
            label="Incontinencia"
            valor={nortonScores.incontinencia}
            campo="incontinencia"
          />
          <TouchableOpacity
            style={styles.btnCerrar}
            onPress={() => setModalNorton(false)}
          >
            <Text style={styles.btnCerrarTexto}>GUARDAR Y CERRAR</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  // ... (tus estilos anteriores se mantienen iguales)
  mainContainer: { flex: 1, backgroundColor: "#f1f2f6", padding: 20 },
  header: { marginTop: 60, marginBottom: 20, alignItems: "center" },
  tituloPrincipal: { fontSize: 20, fontWeight: "400", color: "#2f3542" },
  clinicaGeriatrica: { fontSize: 24, fontWeight: "bold", color: "#6c5ce7" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    elevation: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#57606f",
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#2f3542",
  },
  textArea: { height: 70, textAlignVertical: "top" },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 15,
    textAlign: "center",
  },
  categoriasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  categoriaItem: { alignItems: "center", width: "30%", marginBottom: 15 },
  categoriaTexto: { fontSize: 10, fontWeight: "bold", marginTop: 5 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  botonEnviar: {
    backgroundColor: "#6c5ce7",
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
  },
  botonTexto: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  // --- NUEVOS ESTILOS NORTON ---
  modalContent: { flex: 1, padding: 30, backgroundColor: "#fff" },
  nortonTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  nortonSub: {
    textAlign: "center",
    color: "#00cec9",
    marginBottom: 20,
    fontWeight: "600",
  },
  nortonResult: {
    padding: 20,
    borderWidth: 2,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  nortonTotal: { fontSize: 30, fontWeight: "bold" },
  nortonRow: { marginBottom: 20 },
  nortonLabel: { fontWeight: "bold", marginBottom: 10 },
  nortonButtons: { flexDirection: "row", justifyContent: "space-between" },
  nortonBtn: {
    backgroundColor: "#f1f2f6",
    padding: 10,
    borderRadius: 8,
    width: "22%",
    alignItems: "center",
  },
  nortonBtnActive: { backgroundColor: "#00cec9" },
  txtWhite: { color: "white", fontWeight: "bold" },
  txtBlack: { color: "black" },
  btnCerrar: {
    backgroundColor: "#2f3542",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 50,
  },
  btnCerrarTexto: { color: "white", textAlign: "center", fontWeight: "bold" },
});
