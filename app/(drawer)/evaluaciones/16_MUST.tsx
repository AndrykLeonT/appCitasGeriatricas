import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const ClinicaApp = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const [paciente, setPaciente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [peso, setPeso] = useState("");
  const [talla, setTalla] = useState("");
  const [perdidaPesoPct, setPerdidaPesoPct] = useState("");
  const [estaEnfermo, setEstaEnfermo] = useState(false);

  const [pacientes, setPacientes] = useState([]);

  const calcularMUST = () => {
    let puntos = 0;

    //Puntos por IMC
    const imcNum = parseFloat(peso) / (parseFloat(talla) * parseFloat(talla));
    if (imcNum < 18.5) puntos += 2;
    else if (imcNum <= 20) puntos += 1;

    //Puntos por pérdida de peso
    const perdida = parseFloat(perdidaPesoPct);
    if (perdida > 10) puntos += 2;
    else if (perdida >= 5) puntos += 1;

    //Puntos por enfermedad aguda
    if (estaEnfermo) puntos += 2;

    let riesgo = "Bajo";
    let pauta = "Puede continuar con su estilo de vida con revisión periódica.";

    if (puntos === 1) {
      riesgo = "Intermedio";
      pauta =
        "Se debe estructurar un plan de cuidado nutricional y revaloración.";
    } else if (puntos >= 2) {
      riesgo = "Alto";
      pauta =
        "Llevar a cabo una intervención y acción directa para evitar complicaciones asociadas.";
    }

    return { imc: imcNum.toFixed(1), puntos, riesgo, pauta };
  };

  const handleGuardar = () => {
    if ([paciente, telefono, email, peso, talla].includes("")) {
      Alert.alert(
        "Error",
        "Por favor, completa los datos del paciente y antropometría",
      );
      return;
    }

    const infoNutricional = calcularMUST();

    const nuevoPaciente = {
      id: Date.now(),
      paciente,
      telefono,
      email,
      sintomas,
      ...infoNutricional,
      fecha: new Date().toLocaleDateString(),
    };

    setPacientes([...pacientes, nuevoPaciente]);
    setModalVisible(false);
    limpiarCampos();
  };

  const limpiarCampos = () => {
    setPaciente("");
    setTelefono("");
    setEmail("");
    setSintomas("");
    setPeso("");
    setTalla("");
    setPerdidaPesoPct("");
    setEstaEnfermo(false);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.subTitle}></Text>
          <Text style={styles.mainTitle}>Clinica Geriatrica</Text>
        </View>

        <Pressable style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>NUEVA CITA Y EVALUACIÓN</Text>
        </Pressable>

        <FlatList
          style={styles.listado}
          data={pacientes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <Text style={styles.tarjetaLabel}>Paciente: {item.paciente}</Text>

              <View
                style={[
                  styles.riesgoBadge,
                  item.riesgo === "Alto"
                    ? styles.riesgoAlto
                    : item.riesgo === "Intermedio"
                      ? styles.riesgoMedio
                      : styles.riesgoBajo,
                ]}
              >
                <Text style={styles.riesgoTexto}>
                  Riesgo {item.riesgo} ({item.puntos} pts)
                </Text>
              </View>

              <Text style={styles.infoTexto}>
                <Text style={styles.negrita}>Tel:</Text> {item.telefono}
              </Text>
              <Text style={styles.infoTexto}>
                <Text style={styles.negrita}>Acción:</Text> {item.pauta}
              </Text>

              {item.sintomas ? (
                <Text style={styles.tarjetaSintomas}>
                  <Text style={styles.negrita}>Síntomas:</Text> {item.sintomas}
                </Text>
              ) : null}

              <Text style={styles.footerTarjeta}>IMC: {item.imc}</Text>
            </View>
          )}
        />

        <Modal animationType="slide" visible={modalVisible}>
          <SafeAreaView style={styles.formContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formTitle}>Registro Clínico</Text>

              <View style={styles.seccion}>
                <Text style={styles.seccionTitulo}>Datos de Contacto</Text>
                <View style={styles.campo}>
                  <Text style={styles.label}>Nombre</Text>
                  <TextInput
                    style={styles.input}
                    value={paciente}
                    onChangeText={setPaciente}
                    placeholder="Ej. Juan Pérez"
                  />
                </View>
                <View style={styles.campo}>
                  <Text style={styles.label}>Teléfono</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="phone-pad"
                    value={telefono}
                    onChangeText={setTelefono}
                  />
                </View>
                <View style={styles.campo}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View style={styles.seccion}>
                <Text style={styles.seccionTitulo}>Evaluación MUST</Text>
                <View style={styles.row}>
                  <View style={[styles.campo, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Peso (kg)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={peso}
                      onChangeText={setPeso}
                    />
                  </View>
                  <View style={[styles.campo, { flex: 1 }]}>
                    <Text style={styles.label}>Talla (m)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={talla}
                      placeholder="1.65"
                      onChangeText={setTalla}
                    />
                  </View>
                </View>
                <View style={styles.campo}>
                  <Text style={styles.label}>
                    % Pérdida de peso (3-6 meses)
                  </Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={perdidaPesoPct}
                    onChangeText={setPerdidaPesoPct}
                  />
                </View>

                <Pressable
                  style={[
                    styles.switchBtn,
                    estaEnfermo && styles.switchBtnActive,
                  ]}
                  onPress={() => setEstaEnfermo(!estaEnfermo)}
                >
                  <Text style={styles.switchText}>
                    {estaEnfermo
                      ? "✓ Enfermedad Aguda Detectada (+2 pts)"
                      : "¿Ausencia de ingesta >5 días?"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.campo}>
                <Text style={styles.label}>Observaciones / Síntomas</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  multiline
                  value={sintomas}
                  onChangeText={setSintomas}
                  placeholder="Describa el estado general"
                />
              </View>

              <Pressable style={styles.btnGuardar} onPress={handleGuardar}>
                <Text style={styles.buttonText}>GUARDAR</Text>
              </Pressable>

              <Pressable
                onPress={() => setModalVisible(false)}
                style={{ marginBottom: 40 }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "#EF4444",
                    fontWeight: "bold",
                  }}
                >
                  CANCELAR
                </Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { marginTop: 20, alignItems: "center" },
  subTitle: { fontSize: 14, color: "#6B7280" },
  mainTitle: { fontSize: 24, fontWeight: "900", color: "#6D28D9" },
  button: {
    backgroundColor: "#6D28D9",
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  buttonText: { textAlign: "center", color: "#FFF", fontWeight: "900" },
  listado: { paddingHorizontal: 20 },
  tarjeta: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 4,
  },
  tarjetaLabel: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  riesgoBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginVertical: 8,
  },
  riesgoTexto: { color: "#FFF", fontWeight: "bold", fontSize: 12 },
  riesgoBajo: { backgroundColor: "#10B981" },
  riesgoMedio: { backgroundColor: "#F59E0B" },
  riesgoAlto: { backgroundColor: "#EF4444" },
  infoTexto: { color: "#4B5563", marginBottom: 3 },
  negrita: { fontWeight: "bold" },
  tarjetaSintomas: { marginTop: 10, color: "#6B7280", fontStyle: "italic" },
  footerTarjeta: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 10,
    textAlign: "right",
  },
  formContainer: { flex: 1, paddingHorizontal: 20, backgroundColor: "#FFF" },
  formTitle: {
    fontSize: 28,
    fontWeight: "900",
    marginVertical: 20,
    color: "#6D28D9",
  },
  seccion: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    pb: 10,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
  },
  campo: { marginBottom: 15 },
  label: { fontWeight: "bold", marginBottom: 5, color: "#4B5563" },
  input: { backgroundColor: "#F3F4F6", padding: 12, borderRadius: 10 },
  row: { flexDirection: "row" },
  switchBtn: {
    padding: 15,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  switchBtnActive: { backgroundColor: "#FEE2E2", borderColor: "#EF4444" },
  switchText: { textAlign: "center", fontWeight: "bold", color: "#374151" },
  btnGuardar: {
    backgroundColor: "#6D28D9",
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
});

export default ClinicaApp;
