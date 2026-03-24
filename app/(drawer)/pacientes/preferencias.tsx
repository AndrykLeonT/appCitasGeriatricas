import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Switch,
  TouchableOpacity,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../context/ThemeContext';

interface PreferenciasPaciente {
  nombre: string;
  tamanoTexto: string;
  modoOscuro: boolean;
  recordatorios: boolean;
}

export default function PreferenciasScreen(): React.JSX.Element {
  const { isDarkMode, updateTheme } = useTheme();
  const [nombre, setNombre] = useState<string>('');
  const [tamanoTexto, setTamanoTexto] = useState<string>('Mediano');
  const [modoOscuro, setModoOscuro] = useState<boolean>(false);
  const [recordatorios, setRecordatorios] = useState<boolean>(false);
  const [preferenciasGuardadas, setPreferenciasGuardadas] =
    useState<PreferenciasPaciente | null>(null);

  const STORAGE_KEY = '@preferencias_paciente_geriatrico';

  useEffect(() => {
    obtenerPreferencias();
  }, []);

  const limpiarCampos = (): void => {
    setNombre('');
    setTamanoTexto('Mediano');
    setModoOscuro(false);
    setRecordatorios(false);
  };

  const guardarPreferencias = async (): Promise<void> => {
    if (!nombre.trim()) {
      if (Platform.OS === 'web') alert('Campo requerido: Debes capturar el nombre del paciente.');
      else Alert.alert('Campo requerido', 'Debes capturar el nombre del paciente.');
      return;
    }
    const preferencias: PreferenciasPaciente = {
      nombre,
      tamanoTexto,
      modoOscuro,
      recordatorios,
    };
    try {
      const preferenciasJSON = JSON.stringify(preferencias);
      await AsyncStorage.setItem(STORAGE_KEY, preferenciasJSON);
      await updateTheme();
      setPreferenciasGuardadas(preferencias);
      limpiarCampos();
      if (Platform.OS === 'web') alert('Éxito: Preferencias guardadas correctamente.');
      else Alert.alert('Éxito', 'Preferencias guardadas correctamente.');
    } catch (error) {
      if (Platform.OS === 'web') alert('Error: No fue posible guardar las preferencias.');
      else Alert.alert('Error', 'No fue posible guardar las preferencias.');
      console.error(error);
    }
  };

  const obtenerPreferencias = async (): Promise<void> => {
    try {
      const preferenciasJSON = await AsyncStorage.getItem(STORAGE_KEY);
      if (preferenciasJSON !== null) {
        try {
          const preferencias: PreferenciasPaciente = JSON.parse(preferenciasJSON);
          setPreferenciasGuardadas(preferencias);
          setNombre(preferencias.nombre || '');
          setTamanoTexto(preferencias.tamanoTexto || 'Mediano');
          setModoOscuro(preferencias.modoOscuro || false);
          setRecordatorios(preferencias.recordatorios || false);
        } catch (parseError) {
          console.error("Error parsing preferences. They might be corrupted.", parseError);
        }
      }
    } catch (error) {
      if (Platform.OS === 'web') alert('Error: No fue posible recuperar las preferencias.');
      else Alert.alert('Error', 'No fue posible recuperar las preferencias.');
      console.error(error);
    }
  };

  const actualizarPreferencias = async (): Promise<void> => {
    try {
      const existeRegistro = await AsyncStorage.getItem(STORAGE_KEY);
      if (existeRegistro === null) {
        if (Platform.OS === 'web') alert('Sin datos: No hay preferencias guardadas para actualizar.');
        else Alert.alert('Sin datos', 'No hay preferencias guardadas para actualizar.');
        return;
      }
      if (!nombre.trim()) {
        if (Platform.OS === 'web') alert('Campo requerido: Debes capturar el nombre del paciente.');
        else Alert.alert('Campo requerido', 'Debes capturar el nombre del paciente.');
        return;
      }
      const preferenciasActualizadas: PreferenciasPaciente = {
        nombre,
        tamanoTexto,
        modoOscuro,
        recordatorios,
      };
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(preferenciasActualizadas)
      );
      await updateTheme();
      setPreferenciasGuardadas(preferenciasActualizadas);
      limpiarCampos();
      if (Platform.OS === 'web') alert('Éxito: Preferencias actualizadas correctamente.');
      else Alert.alert('Éxito', 'Preferencias actualizadas correctamente.');
    } catch (error) {
      if (Platform.OS === 'web') alert('Error: No fue posible actualizar las preferencias.');
      else Alert.alert('Error', 'No fue posible actualizar las preferencias.');
      console.error(error);
    }
  };

  const eliminarPreferencias = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setPreferenciasGuardadas(null);
      limpiarCampos();
      if (Platform.OS === 'web') alert('Éxito: Preferencias eliminadas correctamente.');
      else Alert.alert('Éxito', 'Preferencias eliminadas correctamente.');
    } catch (error) {
      if (Platform.OS === 'web') alert('Error: No fue posible eliminar las preferencias.');
      else Alert.alert('Error', 'No fue posible eliminar las preferencias.');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode && darkStyles.container]}>
      <Text style={[styles.titulo, isDarkMode && darkStyles.textoC]}>Preferencias del paciente geriátrico</Text>
      <Text style={[styles.label, isDarkMode && darkStyles.textoC]}>Nombre del paciente</Text>
      <TextInput
        style={[styles.input, isDarkMode && darkStyles.inputC]}
        placeholder="Escribe el nombre"
        placeholderTextColor={isDarkMode ? "#9CA3AF" : "#999"}
        value={nombre}
        onChangeText={setNombre}
      />
      <Text style={styles.label}>Tamaño de texto</Text>
      <View style={styles.opciones}>
        <TouchableOpacity
          style={[styles.opcion, isDarkMode && darkStyles.opcionC, tamanoTexto === 'Pequeño' && styles.opcionSeleccionada]}
          onPress={() => setTamanoTexto('Pequeño')}
        >
          <Text style={[isDarkMode && darkStyles.textoC, tamanoTexto === 'Pequeño' && styles.textoOpcionSeleccionada]}>Pequeño</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.opcion, isDarkMode && darkStyles.opcionC, tamanoTexto === 'Mediano' && styles.opcionSeleccionada]}
          onPress={() => setTamanoTexto('Mediano')}
        >
          <Text style={[isDarkMode && darkStyles.textoC, tamanoTexto === 'Mediano' && styles.textoOpcionSeleccionada]}>Mediano</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.opcion, isDarkMode && darkStyles.opcionC, tamanoTexto === 'Grande' && styles.opcionSeleccionada]}
          onPress={() => setTamanoTexto('Grande')}
        >
          <Text style={[isDarkMode && darkStyles.textoC, tamanoTexto === 'Grande' && styles.textoOpcionSeleccionada]}>Grande</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.seleccion, isDarkMode && darkStyles.textoC]}>Seleccionado: {tamanoTexto}</Text>
      <View style={styles.switchContainer}>
        <Text style={isDarkMode && darkStyles.textoC}>Modo oscuro</Text>
        <Switch value={modoOscuro} onValueChange={setModoOscuro} />
      </View>
      <View style={styles.switchContainer}>
        <Text style={isDarkMode && darkStyles.textoC}>Activar recordatorios</Text>
        <Switch value={recordatorios} onValueChange={setRecordatorios} />
      </View>
      <View style={styles.boton}>
        <Button title="Guardar preferencias" onPress={guardarPreferencias} />
      </View>
      <View style={styles.boton}>
        <Button title="Obtener preferencias" onPress={obtenerPreferencias} />
      </View>
      <View style={styles.boton}>
        <Button title="Actualizar preferencias" onPress={actualizarPreferencias} />
      </View>
      <View style={styles.boton}>
        <Button title="Eliminar preferencias" onPress={eliminarPreferencias} />
      </View>
      <View style={[styles.resultado, isDarkMode && darkStyles.resultadoC]}>
        <Text style={[styles.subtitulo, isDarkMode && darkStyles.textoC]}>Preferencias almacenadas</Text>
        {preferenciasGuardadas ? (
          <>
            <Text style={[styles.texto, isDarkMode && darkStyles.textoC]}>
              Nombre: {preferenciasGuardadas.nombre}
            </Text>
            <Text style={[styles.texto, isDarkMode && darkStyles.textoC]}>
              Tamaño de texto: {preferenciasGuardadas.tamanoTexto}
            </Text>
            <Text style={[styles.texto, isDarkMode && darkStyles.textoC]}>
              Modo oscuro: {preferenciasGuardadas.modoOscuro ? 'Sí' : 'No'}
            </Text>
            <Text style={[styles.texto, isDarkMode && darkStyles.textoC]}>
              Recordatorios: {preferenciasGuardadas.recordatorios ? 'Sí' : 'No'}
            </Text>
          </>
        ) : (
          <Text style={[styles.texto, isDarkMode && darkStyles.textoC]}>No hay preferencias guardadas.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 10,
  },
  opciones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  opcion: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  opcionSeleccionada: {
    backgroundColor: '#60A5FA',
    borderColor: '#60A5FA',
  },
  textoOpcionSeleccionada: {
    color: '#fff',
    fontWeight: 'bold',
  },
  seleccion: {
    marginTop: 10,
    fontSize: 15,
  },
  switchContainer: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boton: {
    marginTop: 12,
  },
  resultado: {
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  texto: {
    fontSize: 16,
    marginBottom: 5,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
  },
  textoC: {
    color: '#F3F4F6',
  },
  inputC: {
    borderColor: '#4B5563',
    color: '#FFF',
    backgroundColor: '#1F2937',
  },
  opcionC: {
    borderColor: '#4B5563',
    backgroundColor: '#1F2937',
  },
  resultadoC: {
    borderColor: '#4B5563',
    backgroundColor: '#1F2937',
  },
});
