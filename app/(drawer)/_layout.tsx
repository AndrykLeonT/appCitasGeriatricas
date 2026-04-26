import { Drawer } from "expo-router/drawer";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from "../../context/ThemeContext";

function HeaderUserName() {
  const [nombre, setNombre] = useState<string>('');

  useFocusEffect(
    useCallback(() => {
      const loadPrefs = async () => {
        try {
          const prefsJson = await AsyncStorage.getItem('@preferencias_paciente_geriatrico');
          if (prefsJson) {
            const prefs = JSON.parse(prefsJson);
            setNombre(prefs.nombre || '');
          } else {
            setNombre('');
          }
        } catch (e) {
          console.error(e);
        }
      };
      loadPrefs();
    }, [])
  );

  if (!nombre) return null;

  return (
    <View style={{ marginRight: 15, justifyContent: 'center' }}>
      <Text style={{ 
        fontFamily: 'serif',
        fontSize: 15, 
        color: '#fff',
        fontStyle: 'italic',
        fontWeight: '500'
      }}>
        {nombre}
      </Text>
    </View>
  );
}

export default function Layout() {
  const { isDarkMode } = useTheme();

  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: isDarkMode ? "#1F2937" : "#60A5FA" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        drawerActiveTintColor: isDarkMode ? "#60A5FA" : "#3B82F6",
        drawerInactiveTintColor: isDarkMode ? "#D1D5DB" : "#374151",
        drawerStyle: { backgroundColor: isDarkMode ? "#111827" : "#fff" },
        headerRight: () => <HeaderUserName />,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{ title: "Inicio", drawerLabel: "Inicio" }}
      />
      {/* Cada sección usa un Stack anidado para navegación correcta con el botón atrás */}
      <Drawer.Screen
        name="citas"
        options={{ title: "Mis Citas", drawerLabel: "Citas" }}
      />
      <Drawer.Screen
        name="pacientes"
        options={{ title: "Pacientes", drawerLabel: "Pacientes" }}
      />
      <Drawer.Screen
        name="medicos"
        options={{ title: "Médicos", drawerLabel: "Médicos" }}
      />
      <Drawer.Screen
        name="evaluaciones"
        options={{ title: "Evaluaciones", drawerLabel: "Evaluaciones" }}
      />
      <Drawer.Screen
        name="signos-vitales/index"
        options={{ drawerItemStyle: { display: "none" }, title: "Signos Vitales" }}
      />
      <Drawer.Screen
        name="signos-vitales/dashboard"
        options={{ drawerItemStyle: { display: "none" }, title: "Dashboard Signos" }}
      />
    </Drawer>
  );
}
