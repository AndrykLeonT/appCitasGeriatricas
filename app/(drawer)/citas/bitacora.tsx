import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBitacoraMovimientos, BitacoraCita } from '../../../services/sqliteBitacoraCitas';

export default function BitacoraScreen() {
    const [movimientos, setMovimientos] = useState<BitacoraCita[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchBitacora = async () => {
                setLoading(true);
                const data = await getBitacoraMovimientos();
                setMovimientos(data);
                setLoading(false);
            };
            fetchBitacora();
        }, [])
    );

    const renderItem = ({ item }: { item: BitacoraCita }) => {
        const d = new Date(item.fechaMovimiento);
        let iconName = "document-text-outline";
        let iconColor = "#6B7280";

        if (item.movimiento.includes("Creación")) {
            iconName = "add-circle-outline";
            iconColor = "#10B981";
        } else if (item.movimiento.includes("Re-agenda")) {
            iconName = "time-outline";
            iconColor = "#F59E0B";
        } else if (item.movimiento.includes("Eliminación")) {
            iconName = "trash-outline";
            iconColor = "#EF4444";
        }

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <Ionicons name={iconName as any} size={24} color={iconColor} />
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.movimientoTitle}>{item.movimiento}</Text>
                        <Text style={styles.dateText}>{d.toLocaleDateString()} a las {d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.usuarioText}><Text style={{fontWeight: 'bold'}}>Usuario Realizador:</Text> {item.usuario}</Text>
                    {item.detalles ? (
                        <Text style={styles.detallesText}><Text style={{fontWeight: 'bold'}}>Detalles: </Text> {item.detalles}</Text>
                    ) : null}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Cargando bitácora...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Bitácora de Movimientos</Text>
                <Text style={styles.headerSubtitle}>Registro de operaciones realizadas a citas</Text>
            </View>
            <FlatList
                data={movimientos}
                keyExtractor={(item, index) => item.id ? String(item.id) : String(index)}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="documents-outline" size={50} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No hay movimientos registrados.</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F3F4F6" },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: "#6B7280" },
    header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', elevation: 2 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
    headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
    listContainer: { padding: 15, paddingBottom: 40 },
    card: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 10 },
    iconContainer: { marginRight: 15 },
    titleContainer: { flex: 1 },
    movimientoTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
    dateText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    cardBody: {  },
    usuarioText: { fontSize: 14, color: '#374151', marginBottom: 4 },
    detallesText: { fontSize: 14, color: '#4B5563', fontStyle: 'italic' },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#9CA3AF', marginTop: 10, fontStyle: 'italic' }
});
