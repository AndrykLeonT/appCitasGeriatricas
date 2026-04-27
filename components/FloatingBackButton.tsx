import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

export default function FloatingBackButton() {
    const router = useRouter();
    const pathname = usePathname();
    const { isDarkMode } = useTheme();

    // Rutas principales donde NO debe aparecer el botón de atrás
    const mainPaths = ['/', '/citas', '/pacientes', '/medicos', '/evaluaciones', '/signos-vitales'];
    
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
    const isMainScreen = mainPaths.includes(normalizedPath);

    if (isMainScreen || !router.canGoBack()) return null;

    return (
        <View style={styles.container}>
            <Pressable 
                style={[styles.button, { backgroundColor: isDarkMode ? '#374151' : '#FFFFFF' }]}
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 15,
        left: 15,
        zIndex: 9999,
    },
    button: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    }
});
