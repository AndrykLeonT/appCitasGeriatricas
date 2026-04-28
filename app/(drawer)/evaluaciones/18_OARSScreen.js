import { Accelerometer } from 'expo-sensors';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';

const INITIAL_STATE = {
  nombre: "",
  edad: "",
  sexo: "",
  fecha: "",
  estadoCivil: "",
  viveEsposo: "",
  viveCon: [],
  personasVive: "",
  visitas: "",
  conocidos: "",
  telefono: "",
  tiempoConOtros: "",
  confianza: "",
  confianzaTexto: "",
  soledad: "",
  frecuenciaFamilia: "",
  ayuda: "",
  tipoCuidado: "",
  cuidadorNombre: "",
  cuidadorRelacion: "",
  convivencia: "",
  evaluador: "",
};

const Checkbox = ({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}
  >
    <View style={{
      width: 20, height: 20, borderWidth: 1, marginRight: 8,
      backgroundColor: selected ? "#2563eb" : "#fff",
    }} />
    <Text>{label}</Text>
  </TouchableOpacity>
);

export default function OARSScreen() {
  const { pacienteId = '', pacienteNombre = '' } = useLocalSearchParams();

  const [form, setForm] = useState(INITIAL_STATE);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const shakeTimeout = useRef(null);

  const setField = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleMulti = (key, value) => {
    setForm(prev => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  };

  const onChangeFecha = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setField("fecha", selectedDate.toLocaleDateString());
  };

  useEffect(() => {
    Accelerometer.setUpdateInterval(300);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const totalForce = Math.sqrt(x * x + y * y + z * z);
      if (totalForce > 1.8) {
        if (!shakeTimeout.current) {
          setForm(INITIAL_STATE);
          setGuardado(false);
          Alert.alert("Formulario reiniciado", "Agitaste el teléfono 📱");
          shakeTimeout.current = setTimeout(() => {
            shakeTimeout.current = null;
          }, 2000);
        }
      }
    });
    return () => subscription.remove();
  }, []);

  const calcularCompletitud = () => {
    let count = 0;
    if (form.sexo) count++;
    if (form.estadoCivil) count++;
    if (form.viveCon.length > 0) count++;
    if (form.personasVive) count++;
    if (form.visitas) count++;
    if (form.conocidos) count++;
    if (form.telefono) count++;
    if (form.tiempoConOtros) count++;
    if (form.confianza) count++;
    if (form.soledad) count++;
    if (form.frecuenciaFamilia) count++;
    if (form.ayuda) count++;
    if (form.convivencia) count++;
    return count;
  };

  const saveToFirebase = async (puntaje) => {
    try {
      await guardarRegistroEvaluacion({
        idPaciente: pacienteId,
        idEvaluacion: '18_oars',
        fecha: new Date().toISOString().split('T')[0],
        puntaje,
      });
      setGuardado(true);
      Alert.alert(
        "Evaluación guardada",
        `${pacienteNombre ? 'Paciente: ' + pacienteNombre + '\n' : ''}Secciones completadas: ${puntaje} / 13`
      );
    } catch {
      Alert.alert("Error", "No se pudo guardar. Verifique su conexión.");
    }
  };

  const handleGuardar = async () => {
    if (guardado) return;
    const puntaje = calcularCompletitud();
    if (puntaje < 13) {
      Alert.alert(
        "Formulario incompleto",
        `Hay ${13 - puntaje} sección(es) sin completar. ¿Desea guardar de todas formas?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Guardar", onPress: () => saveToFirebase(puntaje) },
        ]
      );
      return;
    }
    saveToFirebase(puntaje);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.titulo}>Formulario OARS</Text>
      <Text style={styles.subtitulo}>Recursos sociales</Text>

      {pacienteNombre !== '' && (
        <View style={styles.pacienteBanner}>
          <Text style={styles.pacienteBannerText}>👤 {pacienteNombre}</Text>
        </View>
      )}

      <View style={styles.hintBox}>
        <Text style={styles.hintText}>Agita el teléfono para reiniciar el formulario</Text>
      </View>

      {/* Datos básicos */}
      <Text style={styles.label}>Nombre:</Text>
      <TextInput
        style={styles.input}
        value={form.nombre}
        onChangeText={v => setField("nombre", v)}
      />

      <Text style={styles.label}>Edad:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.edad}
        onChangeText={v => setField("edad", v)}
      />

      <Text style={styles.q}>Sexo:</Text>
      {["Hombre", "Mujer"].map(op => (
        <Checkbox key={op} label={op} selected={form.sexo === op} onPress={() => setField("sexo", op)} />
      ))}

      <Text style={styles.label}>Fecha:</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text>{form.fecha || "Seleccionar fecha"}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onChangeFecha}
          maximumDate={new Date()}
        />
      )}

      {/* 1 */}
      <Text style={styles.q}>1. ¿Su estado civil es?</Text>
      {["Soltero(a)", "Casado(a) o Unión Libre", "Viudo(a)", "Divorciado(a)", "Separado(a)"].map(op => (
        <Checkbox key={op} label={op} selected={form.estadoCivil === op} onPress={() => setField("estadoCivil", op)} />
      ))}

      {/* 2 */}
      {form.estadoCivil === "Casado(a) o Unión Libre" && (
        <>
          <Text style={styles.q}>2. ¿Vive su esposo(a)?</Text>
          {["No", "Sí"].map(op => (
            <Checkbox key={op} label={op} selected={form.viveEsposo === op} onPress={() => setField("viveEsposo", op)} />
          ))}
        </>
      )}

      {/* 3 */}
      <Text style={styles.q}>3. ¿Con quién vive usted?</Text>
      {["Nadie", "Esposo(a)", "Hijos(as)", "Nietos(as)", "Padres", "Hermanos(as)", "Otros familiares", "Amigos(as)", "Cuidadores pagados", "Otros"].map(op => (
        <Checkbox key={op} label={op} selected={form.viveCon.includes(op)} onPress={() => toggleMulti("viveCon", op)} />
      ))}

      {/* 4 */}
      <Text style={styles.q}>4. ¿Con cuántas personas vive?</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.personasVive}
        onChangeText={v => setField("personasVive", v)}
      />

      {/* 5 */}
      <Text style={styles.q}>5. ¿Cuántas veces visitó a familia/amigos?</Text>
      {["Nunca", "Cada seis meses", "Cada tres meses", "Cada mes", "Menos de una vez al mes", "Menos de una vez a la semana", "1-3 veces a la semana", "Más de cuatro veces a la semana"].map(op => (
        <Checkbox key={op} label={op} selected={form.visitas === op} onPress={() => setField("visitas", op)} />
      ))}

      {/* 6 */}
      <Text style={styles.q}>6. ¿A cuántas personas conoce para visitar?</Text>
      {["Ninguna", "Una o dos", "Tres a cuatro", "Cinco o más"].map(op => (
        <Checkbox key={op} label={op} selected={form.conocidos === op} onPress={() => setField("conocidos", op)} />
      ))}

      {/* 7 */}
      <Text style={styles.q}>7. ¿Cuántas veces habló por teléfono?</Text>
      {["Ninguna", "Una vez a la semana", "Dos a seis veces", "Más de seis veces", "Una vez al día"].map(op => (
        <Checkbox key={op} label={op} selected={form.telefono === op} onPress={() => setField("telefono", op)} />
      ))}

      {/* 8 */}
      <Text style={styles.q}>8. ¿Cuántas veces pasó tiempo con alguien?</Text>
      {["Ninguna", "Una vez", "2-6 veces", "Más de seis veces"].map(op => (
        <Checkbox key={op} label={op} selected={form.tiempoConOtros === op} onPress={() => setField("tiempoConOtros", op)} />
      ))}

      {/* 9 */}
      <Text style={styles.q}>9. ¿Tiene alguien en quien confiar?</Text>
      {["No", "Sí"].map(op => (
        <Checkbox key={op} label={op} selected={form.confianza === op} onPress={() => setField("confianza", op)} />
      ))}
      {form.confianza === "Sí" && (
        <TextInput
          style={styles.input}
          placeholder="Especifique"
          value={form.confianzaTexto}
          onChangeText={v => setField("confianzaTexto", v)}
        />
      )}

      {/* 10 */}
      <Text style={styles.q}>10. ¿Se siente solo(a)?</Text>
      {["Casi nunca", "Algunas veces", "A menudo"].map(op => (
        <Checkbox key={op} label={op} selected={form.soledad === op} onPress={() => setField("soledad", op)} />
      ))}

      {/* 11 */}
      <Text style={styles.q}>11. ¿Ve a sus familiares como quisiera?</Text>
      {["Algo triste por la poca frecuencia", "Tan a menudo como quisiera"].map(op => (
        <Checkbox key={op} label={op} selected={form.frecuenciaFamilia === op} onPress={() => setField("frecuenciaFamilia", op)} />
      ))}

      {/* 12 */}
      <Text style={styles.q}>12. ¿Tendría quien le ayudara?</Text>
      {["No", "Sí"].map(op => (
        <Checkbox key={op} label={op} selected={form.ayuda === op} onPress={() => setField("ayuda", op)} />
      ))}
      {form.ayuda === "Sí" && (
        <>
          <Text style={styles.q}>A) ¿Esa persona cuidaría de usted?</Text>
          {["Forma pasajera", "Corto periodo", "Indefinida"].map(op => (
            <Checkbox key={op} label={op} selected={form.tipoCuidado === op} onPress={() => setField("tipoCuidado", op)} />
          ))}
          <Text style={styles.q}>B) ¿Quién sería esa persona?</Text>
          <Text style={styles.label}>Nombre:</Text>
          <TextInput style={styles.input} value={form.cuidadorNombre} onChangeText={v => setField("cuidadorNombre", v)} />
          <Text style={styles.label}>Relación:</Text>
          <TextInput style={styles.input} value={form.cuidadorRelacion} onChangeText={v => setField("cuidadorRelacion", v)} />
        </>
      )}

      {/* 13 */}
      <Text style={styles.q}>13. ¿Cómo considera la convivencia?</Text>
      {["Muy insatisfactoria", "Insatisfactoria", "Satisfactoria", "Muy satisfactoria"].map(op => (
        <Checkbox key={op} label={op} selected={form.convivencia === op} onPress={() => setField("convivencia", op)} />
      ))}

      <Text style={styles.q}>Evaluador:</Text>
      <TextInput style={styles.input} value={form.evaluador} onChangeText={v => setField("evaluador", v)} />

      <View style={styles.completitudBox}>
        <Text style={styles.completitudText}>Secciones completadas: {calcularCompletitud()} / 13</Text>
      </View>

      <Pressable
        style={[styles.btnGuardar, guardado && styles.btnGuardado]}
        onPress={handleGuardar}
        disabled={guardado}
      >
        <Text style={styles.btnText}>{guardado ? '✓ Evaluación guardada' : 'Guardar evaluación'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 4, color: '#1F2937' },
  subtitulo: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  pacienteBanner: {
    backgroundColor: '#EFF6FF', borderRadius: 8, padding: 10,
    marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE',
  },
  pacienteBannerText: { fontSize: 14, fontWeight: '700', color: '#1E40AF', textAlign: 'center' },
  hintBox: {
    backgroundColor: '#FFF3CD', borderRadius: 8, padding: 8,
    marginBottom: 16, borderWidth: 1, borderColor: '#FFC107',
  },
  hintText: { fontSize: 12, color: '#856404', textAlign: 'center' },
  label: { fontSize: 14, color: '#374151', marginTop: 8 },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', padding: 8,
    borderRadius: 6, marginBottom: 10, backgroundColor: '#F9FAFB',
  },
  q: { marginTop: 14, fontWeight: "bold", fontSize: 15, color: '#1F2937' },
  completitudBox: {
    backgroundColor: '#F0F9FF', borderRadius: 8, padding: 12,
    marginTop: 20, marginBottom: 12, borderWidth: 1, borderColor: '#BAE6FD', alignItems: 'center',
  },
  completitudText: { fontSize: 16, fontWeight: 'bold', color: '#0369A1' },
  btnGuardar: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  btnGuardado: { backgroundColor: '#10B981' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
