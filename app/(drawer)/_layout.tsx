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
      <Drawer.Screen
        name="citas/index"
        options={{ title: "Mis Citas", drawerLabel: "Citas" }}
      />
      <Drawer.Screen
        name="citas/bitacora"
        options={{ title: "Bitácora", drawerLabel: "Bitácora de Citas" }}
      />
      <Drawer.Screen
        name="citas/crear-cita"
        options={{ drawerItemStyle: { display: "none" }, title: "Crear Cita" }}
      />
      <Drawer.Screen
        name="pacientes/index"
        options={{ title: "Pacientes", drawerLabel: "Pacientes" }}
      />
      <Drawer.Screen
        name="medicos/index"
        options={{ title: "Médicos", drawerLabel: "Médicos" }}
      />
      <Drawer.Screen
        name="medicos/registroPersonalMedico"
        options={{ drawerItemStyle: { display: "none" }, title: "Registro Médico" }}
      />
      <Drawer.Screen
        name="pacientes/registroPaciente"
        options={{ drawerItemStyle: { display: "none" }, title: "Registro Paciente" }}
      />
      <Drawer.Screen
        name="evaluaciones/index"
        options={{ title: "Evaluaciones", drawerLabel: "Menú Evaluaciones" }}
      />
      <Drawer.Screen
        name="signos-vitales/index"
        options={{ drawerItemStyle: { display: "none" }, title: "Signos Vitales" }}
      />
      <Drawer.Screen
        name="signos-vitales/dashboard"
        options={{ drawerItemStyle: { display: "none" }, title: "Dashboard Signos" }}
      />
      {/* Evaluaciones */}
      <Drawer.Screen
        name="evaluaciones/01_miniCog"
        options={{ title: "Mini-Cog ™", drawerLabel: "01. Mini-Cog ™" }}
      />
      <Drawer.Screen
        name="evaluaciones/02_fluenciaVerbalSemantica"
        options={{ title: "Fluencia verbal semántica", drawerLabel: "02. Fluencia verbal semántica" }}
      />
      <Drawer.Screen
        name="evaluaciones/03_minimental"
        options={{ title: "Mini-Mental", drawerLabel: "03. Mini-Mental" }}
      />
      <Drawer.Screen
        name="evaluaciones/04_evaluacionMoCa"
        options={{ title: "MoCA©", drawerLabel: "04. MoCA©" }}
      />
      <Drawer.Screen
        name="evaluaciones/05_formulario"
        options={{ title: "GDS-15", drawerLabel: "05. GDS-15" }}
      />
      <Drawer.Screen
        name="evaluaciones/06_CESD7Test6"
        options={{ title: "CESD-7 ítems", drawerLabel: "06. CESD-7 ítems" }}
      />
      <Drawer.Screen
        name="evaluaciones/07_KatzIndex"
        options={{ title: "Índice de Katz", drawerLabel: "07. Índice de Katz" }}
      />
      <Drawer.Screen
        name="evaluaciones/08_Lawton"
        options={{ title: "Índice de Lawton", drawerLabel: "08. Índice de Lawton" }}
      />
      <Drawer.Screen
        name="evaluaciones/11_App"
        options={{ title: "Escala Braden", drawerLabel: "11. Escala Braden" }}
      />
      <Drawer.Screen
        name="evaluaciones/12_prueba"
        options={{ title: "Escala Norton", drawerLabel: "12. Escala Norton" }}
      />
      <Drawer.Screen
        name="evaluaciones/14_AgudezaVisual"
        options={{ title: "Visión", drawerLabel: "14. Visión" }}
      />
      <Drawer.Screen
        name="evaluaciones/14_Prueba"
        options={{ drawerItemStyle: { display: "none" } }} // Nested
      />
      <Drawer.Screen
        name="evaluaciones/14_Resultado"
        options={{ drawerItemStyle: { display: "none" } }} // Nested
      />
      <Drawer.Screen
        name="evaluaciones/15_MNA-SF"
        options={{ title: "MNA-SF", drawerLabel: "15. MNA-SF" }}
      />
      <Drawer.Screen
        name="evaluaciones/16_MUST"
        options={{ title: "MUST", drawerLabel: "16. MUST" }}
      />
      <Drawer.Screen
        name="evaluaciones/17_SARC-F"
        options={{ title: "SARC-F", drawerLabel: "17. SARC-F" }}
      />
      <Drawer.Screen
        name="evaluaciones/18_OARSScreen"
        options={{ title: "OARS", drawerLabel: "18. OARS" }}
      />
      <Drawer.Screen
        name="evaluaciones/19_EscalaMaltrato"
        options={{ title: "Escala geriátrica de maltrato", drawerLabel: "19. Escala geriátrica de maltrato" }}
      />
      <Drawer.Screen
        name="evaluaciones/20_Formulario"
        options={{ title: "Movilidad en el entorno", drawerLabel: "20. Movilidad en el entorno" }}
      />
    </Drawer>
  );
}
