import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
// Asegúrate de que esta ruta sea la correcta tras mover el archivo fuera de .expo
import { FormFieldProps } from "./Types";

export const FormField: React.FC<FormFieldProps> = ({
  label,
  placeholder,
  error,
  style,
  ...props
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  return (
    /* Cambiamos <div> por <View> y aplicamos el estilo desde StyleSheet */
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { fontSize: isMobile ? 14 : 15 },
          error ? styles.inputError : null,
          style,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#999"
        // Solución al error de tipos: Solo se aplica en Android
        {...(Platform.OS === "android" ? { includeFontPadding: false } : {})}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    /* IMPORTANTE: flex: 1 aquí hace que si pones 3 FormFields en una fila,
       cada uno ocupe exactamente un tercio del ancho.
    */
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600", // Un poco menos que bold para que se vea moderno
    marginBottom: 8,
    color: "#1A1A1A",
  },
  input: {
    height: 40,
    backgroundColor: "#F1F3F5",
    borderRadius: 10, // Bordes un poco más redondeados como en tu captura
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E9ECEF", // Un borde gris muy sutil
  },
  inputError: {
    borderColor: "#FF4D4D",
    backgroundColor: "#FFF5F5", // Un fondo rojizo ligero cuando hay error
  },
  errorText: {
    color: "#FF4D4D",
    fontSize: 11,
    marginTop: 5,
    fontWeight: "500",
  },
});
