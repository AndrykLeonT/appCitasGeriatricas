import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createTemperaturaCorporal, createFrecuenciaCardiaca } from '../../../services/firebasePatients';
import { createPresionArterial } from '../../../services/sqliteSignosVitales';

export default function RegistroSignosVitales() {
    const router = useRouter();
    const { id, nombre } = useLocalSearchParams<{ id: string; nombre: string }>();

    const [tipoSigno, setTipoSigno] = useState<'temperatura' | 'frecuencia' | 'presion'>('temperatura');
    const [valor, setValor] = useState('');
    
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!id) {
            Alert.alert("Error", "No se ha seleccionado ningún paciente.");
            return;
        }
        if (!valor) {
            Alert.alert("Error", "Debe ingresar un valor.");
            return;
        }

        setLoading(true);
        try {
            const data = {
                pacienteId: id,
                valor,
                fechaHora: new Date().toISOString()
            };

            if (tipoSigno === 'temperatura') {
                await createTemperaturaCorporal(data);
            } else if (tipoSigno === 'frecuencia') {
                await createFrecuenciaCardiaca(data);
            } else {
                await createPresionArterial(data);
            }

            Alert.alert("Éxito", "Registro guardado correctamente.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (e) {
            Alert.alert("Error", "Ocurrió un error al guardar el registro.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.instrucciones}>
                Registre los signos vitales del paciente.
            </Text>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Paciente Seleccionado</Text>
                <View style={styles.input}>
                    <Text style={{ color: id ? '#1F2937' : '#9CA3AF' }}>
                        {nombre ? nombre : 'Sin seleccionar'}
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Tipo de Signo Vital</Text>
                <View style={styles.row}>
                    <Pressable 
                        style={[styles.radioBtn, tipoSigno === 'temperatura' && styles.radioBtnSelected]} 
                        onPress={() => setTipoSigno('temperatura')}
                    >
                        <Text style={tipoSigno === 'temperatura' ? styles.radioBtnTextSelected : styles.radioBtnText}>
                            Temp
                        </Text>
                    </Pressable>
                    <Pressable 
                        style={[styles.radioBtn, tipoSigno === 'frecuencia' && styles.radioBtnSelected]} 
                        onPress={() => setTipoSigno('frecuencia')}
                    >
                        <Text style={tipoSigno === 'frecuencia' ? styles.radioBtnTextSelected : styles.radioBtnText}>
                            F. Cardíaca
                        </Text>
                    </Pressable>
                    <Pressable 
                        style={[styles.radioBtn, tipoSigno === 'presion' && styles.radioBtnSelected]} 
                        onPress={() => setTipoSigno('presion')}
                    >
                        <Text style={tipoSigno === 'presion' ? styles.radioBtnTextSelected : styles.radioBtnText}>
                            P. Arterial
                        </Text>
                    </Pressable>
                </View>

                <Text style={styles.sectionTitle}>Valor</Text>
                <TextInput
                    style={styles.input}
                    placeholder={tipoSigno === 'temperatura' ? 'Ej. 36.5 (°C)' : tipoSigno === 'frecuencia' ? 'Ej. 80 (lpm)' : 'Ej. 120/80 (mmHg)'}
                    value={valor}
                    onChangeText={setValor}
                    keyboardType="numeric"
                />
            </View>

            <Pressable
                style={({ pressed }) => [styles.botonGuardar, { opacity: pressed || loading ? 0.7 : 1 }]}
                onPress={handleSave}
                disabled={loading}
            >
                <Text style={styles.textoGuardar}>{loading ? 'GUARDANDO...' : 'GUARDAR REGISTRO'}</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F3F4F6", padding: 15 },
    instrucciones: {
        backgroundColor: "#DBEAFE",
        padding: 15,
        borderRadius: 8,
        color: "#1E40AF",
        marginBottom: 20,
        fontStyle: "italic",
    },
    card: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        borderRadius: 8,
        elevation: 1,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#374151",
        marginTop: 10,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        paddingBottom: 5,
    },
    input: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 15,
        fontSize: 16,
        color: "#1F2937",
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    radioBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        marginHorizontal: 5,
        backgroundColor: "#F9FAFB",
    },
    radioBtnSelected: {
        borderColor: "#3B82F6",
        backgroundColor: "#DBEAFE",
    },
    radioBtnText: {
        color: "#4B5563",
        fontWeight: "600",
        textAlign: 'center'
    },
    radioBtnTextSelected: {
        color: "#1D4ED8",
        fontWeight: "bold",
        textAlign: 'center'
    },
    botonGuardar: {
        backgroundColor: "#3B82F6",
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    textoGuardar: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalList: {
        marginBottom: 15,
    },
    modalItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalItemText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    modalItemSubtext: {
        fontSize: 12,
        color: '#6B7280',
    },
    modalCloseBtn: {
        backgroundColor: '#EF4444',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCloseText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    }
});
