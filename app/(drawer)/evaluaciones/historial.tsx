import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    eliminarRegistroEvaluacion,
    leerRegistrosPorPacienteYEvaluacion,
    RegistroEvaluacion,
} from '../../../services/firebaseEvaluaciones';

const formatFecha = (iso: string) => {
    if (!iso) return '-';
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
};

export default function HistorialEvaluacion() {
    const {
        pacienteId = '',
        pacienteNombre = '',
        idEvaluacion = '',
        evaluacionLabel = '',
    } = useLocalSearchParams<{
        pacienteId: string;
        pacienteNombre: string;
        idEvaluacion: string;
        evaluacionLabel: string;
    }>();

    const [records, setRecords] = useState<RegistroEvaluacion[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            leerRegistrosPorPacienteYEvaluacion(pacienteId, idEvaluacion)
                .then(setRecords)
                .catch(() => Alert.alert('Error', 'No se pudo cargar el historial.'))
                .finally(() => setLoading(false));
        }, [pacienteId, idEvaluacion])
    );

    const handleDelete = (record: RegistroEvaluacion) => {
        Alert.alert(
            'Eliminar registro',
            `¿Eliminar el registro del ${formatFecha(record.fecha)} (puntaje: ${record.puntaje})?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await eliminarRegistroEvaluacion(record.id!);
                            setRecords((prev) => prev.filter((r) => r.id !== record.id));
                        } catch {
                            Alert.alert('Error', 'No se pudo eliminar el registro.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* ── Header de info ── */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Ionicons name="person-circle-outline" size={18} color="#1E40AF" />
                    <Text style={styles.infoText}>{pacienteNombre}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="clipboard-outline" size={18} color="#1E40AF" />
                    <Text style={styles.infoText}>{evaluacionLabel}</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
            ) : records.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyText}>No hay registros para esta evaluación</Text>
                </View>
            ) : (
                <>
                    {/* ── Encabezado de tabla ── */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.thCell, { flex: 2 }]}>Fecha</Text>
                        <Text style={[styles.thCell, { flex: 2 }]}>Puntaje</Text>
                        <Text style={[styles.thCell, { flex: 1, textAlign: 'center' }]}>Eliminar</Text>
                    </View>

                    <FlatList
                        data={records}
                        keyExtractor={(item) => item.id!}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item, index }) => (
                            <View style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                                <Text style={[styles.tdCell, { flex: 2 }]}>{formatFecha(item.fecha)}</Text>
                                <Text style={[styles.tdCell, { flex: 2 }]}>{item.puntaje}</Text>
                                <View style={{ flex: 1, alignItems: 'center' }}>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(item)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />

                    <Text style={styles.countText}>
                        {records.length} registro{records.length !== 1 ? 's' : ''}
                    </Text>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    infoCard: {
        backgroundColor: '#EFF6FF',
        borderBottomWidth: 1,
        borderBottomColor: '#BFDBFE',
        paddingHorizontal: 20,
        paddingVertical: 14,
        gap: 6,
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoText: { fontSize: 14, fontWeight: '600', color: '#1E40AF' },

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    emptyText: { fontSize: 15, color: '#9CA3AF', textAlign: 'center' },

    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1E40AF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginTop: 16,
        marginHorizontal: 16,
        borderRadius: 8,
        marginBottom: 2,
    },
    thCell: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },

    listContent: { paddingHorizontal: 16, paddingBottom: 24 },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tableRowAlt: { backgroundColor: '#F8FAFF' },
    tdCell: { fontSize: 14, color: '#374151' },

    countText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'right',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
});
