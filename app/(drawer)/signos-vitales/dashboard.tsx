import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { getTemperaturaPorPaciente, getFrecuenciaCardiacaPorPaciente, SignoVital } from '../../../services/firebasePatients';
import { getPresionArterialPorPaciente, SignoVitalSQLite } from '../../../services/sqliteSignosVitales';
import { LineChart } from 'react-native-gifted-charts';

export default function SignosVitalesDashboard() {
    const { id, nombre } = useLocalSearchParams<{ id: string; nombre: string }>();
    const router = useRouter();

    const [temperaturas, setTemperaturas] = useState<SignoVital[]>([]);
    const [frecuencias, setFrecuencias] = useState<SignoVital[]>([]);
    const [presiones, setPresiones] = useState<SignoVitalSQLite[]>([]);
    const [loading, setLoading] = useState(true);


    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        const [temps, frecs, pres] = await Promise.all([
            getTemperaturaPorPaciente(id),
            getFrecuenciaCardiacaPorPaciente(id),
            getPresionArterialPorPaciente(id)
        ]);
        setTemperaturas(temps);
        setFrecuencias(frecs);
        setPresiones(pres);
        setLoading(false);
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const latestTemp = temperaturas.length > 0 ? temperaturas[temperaturas.length - 1] : null;
    const latestFreq = frecuencias.length > 0 ? frecuencias[frecuencias.length - 1] : null;
    const latestPres = presiones.length > 0 ? presiones[presiones.length - 1] : null;

    // Chart Data functions
    const getChartData = (data: any[]) => {
        return data.map((item) => {
            const date = new Date(item.fechaHora);
            return {
                value: parseFloat(item.valor) || 0,
                label: `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`,
                dataPointText: item.valor
            };
        });
    };

    // Formatter
    const formatDateTime = (iso: string) => {
        const d = new Date(iso);
        return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    // Status checkers
    const getHeartRateStatus = (val: string) => {
        const num = parseFloat(val);
        if (num < 60) return { text: 'Baja', color: '#EF4444' };
        if (num > 100) return { text: 'Alta', color: '#EF4444' };
        return { text: 'Normal', color: '#10B981' };
    };

    const getTempStatus = (val: string) => {
        const num = parseFloat(val);
        if (num < 36.1) return { text: 'Baja', color: '#3B82F6' };
        if (num > 37.2) return { text: 'Alta', color: '#EF4444' };
        return { text: 'Normal', color: '#10B981' };
    };

    const getPresionStatus = (val: string) => {
        const sys = parseFloat(val);
        if (sys < 90) return { text: 'Baja', color: '#3B82F6' };
        if (sys >= 130) return { text: 'Alta', color: '#EF4444' };
        return { text: 'Normal', color: '#10B981' };
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    // Merge history
    const allHistory = [
        ...temperaturas.map(t => ({...t, type: 'Temperatura'})), 
        ...frecuencias.map(f => ({...f, type: 'Frecuencia Cardíaca'})),
        ...presiones.map(p => ({...p, type: 'Presión Arterial', id: String(p.id)}))
    ].sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.headerContainer}>
                <Text style={styles.patientName}>{nombre}</Text>
                <Text style={styles.dashboardSubtitle}>Dashboard de Signos Vitales</Text>
            </View>

            {/* Datos del Paciente Card */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Datos del Paciente:</Text>
                
                <View style={styles.dataRow}>
                    <View style={styles.dataIconText}>
                        <FontAwesome5 name="heartbeat" size={20} color="#EF4444" style={styles.icon} />
                        <Text style={styles.dataLabel}>Frecuencia Cardíaca</Text>
                    </View>
                    <View style={styles.dataValueGroup}>
                        <Text style={[styles.dataValue, { color: '#1F2937' }]}>
                            {latestFreq ? latestFreq.valor : '--'} <Text style={styles.unitText}>BPM</Text>
                        </Text>
                        {latestFreq && (
                            <Text style={[styles.statusBadge, { color: getHeartRateStatus(latestFreq.valor).color }]}>
                                {getHeartRateStatus(latestFreq.valor).text}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.dataRow}>
                    <View style={styles.dataIconText}>
                        <FontAwesome5 name="thermometer-half" size={20} color="#F59E0B" style={styles.icon} />
                        <Text style={styles.dataLabel}>Temperatura</Text>
                    </View>
                    <View style={styles.dataValueGroup}>
                        <Text style={[styles.dataValue, { color: '#F59E0B' }]}>
                            {latestTemp ? latestTemp.valor : '--'} <Text style={styles.unitText}>°C</Text>
                        </Text>
                        {latestTemp && (
                            <Text style={[styles.statusBadge, { color: getTempStatus(latestTemp.valor).color }]}>
                                {getTempStatus(latestTemp.valor).text}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={[styles.dataRow, { borderBottomWidth: 0 }]}>
                    <View style={styles.dataIconText}>
                        <FontAwesome5 name="tint" size={20} color="#8B5CF6" style={styles.icon} />
                        <Text style={styles.dataLabel}>Presión Arterial</Text>
                    </View>
                    <View style={styles.dataValueGroup}>
                        <Text style={[styles.dataValue, { color: '#8B5CF6' }]}>
                            {latestPres ? latestPres.valor : '--'} <Text style={styles.unitText}>mmHg</Text>
                        </Text>
                        {latestPres && (
                            <Text style={[styles.statusBadge, { color: getPresionStatus(latestPres.valor).color }]}>
                                {getPresionStatus(latestPres.valor).text}
                            </Text>
                        )}
                    </View>
                </View>

            </View>

            <Pressable
                style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.8 }]}
                onPress={() => router.push({ pathname: "/(drawer)/signos-vitales", params: { id, nombre } })}
            >
                <Text style={styles.primaryButtonText}>Nueva Medición</Text>
            </Pressable>

            <Text style={styles.subHeader}>Gráficas de Seguimiento</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartsScroll}>
                {/* Frecuencia Tracker */}
                <View style={styles.chartCard}>
                    <Text style={[styles.chartTitle, { color: '#EF4444' }]}>Frecuencia Cardíaca</Text>
                    <Text style={styles.chartUnit}>BPM</Text>
                    {frecuencias.length > 0 ? (
                        <LineChart
                            data={getChartData(frecuencias.slice(-15))}
                            height={120}
                            width={200}
                            spacing={30}
                            color="#EF4444"
                            thickness={2}
                            startFillColor="#FECACA"
                            endFillColor="#FEF2F2"
                            startOpacity={0.9}
                            endOpacity={0.2}
                            dataPointsColor="#B91C1C"
                            yAxisColor="#E5E7EB"
                            xAxisColor="#E5E7EB"
                            rulesColor="#F3F4F6"
                            hideDataPoints={false}
                            yAxisTextStyle={{ fontSize: 10, color: '#6B7280' }}
                            xAxisLabelTextStyle={{ fontSize: 9, color: '#6B7280', width: 40 }}
                            areaChart
                            curved
                            pointerConfig={{
                                pointerStripHeight: 120,
                                pointerStripColor: '#EF4444',
                                pointerStripWidth: 2,
                                pointerColor: '#EF4444',
                                radius: 6,
                                pointerLabelWidth: 80,
                                pointerLabelHeight: 60,
                                activatePointersOnLongPress: true,
                                autoAdjustPointerLabelPosition: true,
                                pointerLabelComponent: (items: any) => {
                                    return (
                                        <View style={{height: 60, width: 80, justifyContent: 'center', backgroundColor: '#374151', borderRadius: 8, padding: 4}}>
                                            <Text style={{color: 'white', fontSize: 10, textAlign:'center'}}>
                                                {items[0].label}
                                            </Text>
                                            <Text style={{fontWeight: 'bold', color: '#FECACA', fontSize: 13, textAlign:'center'}}>
                                                {items[0].value} BPM
                                            </Text>
                                        </View>
                                    );
                                },
                            }}
                        />
                    ) : (
                        <Text style={styles.emptyText}>Sin datos</Text>
                    )}
                </View>

                {/* Temperatura Tracker */}
                <View style={styles.chartCard}>
                    <Text style={[styles.chartTitle, { color: '#F59E0B' }]}>Temperatura</Text>
                    <Text style={styles.chartUnit}>°C</Text>
                    {temperaturas.length > 0 ? (
                        <LineChart
                            data={getChartData(temperaturas.slice(-10))}
                            height={120}
                            width={200}
                            spacing={30}
                            color="#F59E0B"
                            thickness={2}
                            startFillColor="#FDE68A"
                            endFillColor="#FFFBEB"
                            startOpacity={0.9}
                            endOpacity={0.2}
                            dataPointsColor="#D97706"
                            yAxisColor="#E5E7EB"
                            xAxisColor="#E5E7EB"
                            rulesColor="#F3F4F6"
                            hideDataPoints={false}
                            yAxisTextStyle={{ fontSize: 10, color: '#6B7280' }}
                            xAxisLabelTextStyle={{ fontSize: 9, color: '#6B7280', width: 40 }}
                            areaChart
                            curved
                        />
                    ) : (
                        <Text style={styles.emptyText}>Sin datos</Text>
                    )}
                </View>

                {/* Presión Arterial Tracker */}
                <View style={styles.chartCard}>
                    <Text style={[styles.chartTitle, { color: '#8B5CF6' }]}>Presión (Sistólica)</Text>
                    <Text style={styles.chartUnit}>mmHg</Text>
                    {presiones.length > 0 ? (
                        <LineChart
                            data={getChartData(presiones.slice(-10))}
                            height={120}
                            width={200}
                            spacing={30}
                            color="#8B5CF6"
                            thickness={2}
                            startFillColor="#DDD6FE"
                            endFillColor="#F5F3FF"
                            startOpacity={0.9}
                            endOpacity={0.2}
                            dataPointsColor="#6D28D9"
                            yAxisColor="#E5E7EB"
                            xAxisColor="#E5E7EB"
                            rulesColor="#F3F4F6"
                            hideDataPoints={false}
                            yAxisTextStyle={{ fontSize: 10, color: '#6B7280' }}
                            xAxisLabelTextStyle={{ fontSize: 9, color: '#6B7280', width: 40 }}
                            areaChart
                            curved
                        />
                    ) : (
                        <Text style={styles.emptyText}>Sin datos</Text>
                    )}
                </View>
            </ScrollView>

            <Text style={styles.subHeader}>Historial de Mediciones</Text>
            <View style={styles.historyCard}>
                {allHistory.length > 0 ? allHistory.map((item, index) => (
                    <View key={item.id || index} style={[styles.historyRow, index === allHistory.length - 1 && { borderBottomWidth: 0 }]}>
                        <Text style={styles.historyTime}>{formatDateTime(item.fechaHora)}</Text>
                        <Text style={styles.historyValue}>
                            <Text style={{ fontWeight: 'bold', color: item.type === 'Temperatura' ? '#F59E0B' : item.type === 'Presión Arterial' ? '#8B5CF6' : '#EF4444' }}>
                                {item.valor}
                            </Text> {item.type === 'Temperatura' ? '°C' : item.type === 'Presión Arterial' ? 'mmHg' : 'BPM'}
                        </Text>
                    </View>
                )) : (
                    <Text style={styles.emptyText}>No hay mediciones registradas.</Text>
                )}
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#EEF2F6" },
    centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    headerContainer: { padding: 20, paddingTop: 30, paddingBottom: 10 },
    patientName: { fontSize: 22, fontWeight: "800", color: "#1F2937" },
    dashboardSubtitle: { fontSize: 14, color: "#6B7280", marginTop: 2 },
    card: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1E3A8A",
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        paddingBottom: 8,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dataIconText: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: { width: 24, textAlign: 'center', marginRight: 10 },
    dataLabel: { fontSize: 15, fontWeight: '600', color: '#374151' },
    dataValueGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dataValue: { fontSize: 18, fontWeight: 'bold' },
    unitText: { fontSize: 12, fontWeight: 'normal', color: '#6B7280' },
    statusBadge: { fontSize: 12, fontWeight: 'bold' },
    primaryButton: {
        backgroundColor: "#2563EB",
        marginHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
        elevation: 3,
    },
    primaryButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
    subHeader: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1E3A8A",
        marginHorizontal: 16,
        marginBottom: 10,
    },
    chartsScroll: { paddingHorizontal: 16, paddingBottom: 20 },
    chartCard: {
        backgroundColor: "#FFFFFF",
        padding: 12,
        borderRadius: 12,
        marginRight: 12,
        elevation: 2,
        minWidth: 240,
    },
    chartTitle: { fontSize: 14, fontWeight: "bold", textAlign: 'center', marginBottom: 2 },
    chartUnit: { fontSize: 10, color: "#6B7280", textAlign: 'center', marginBottom: 10 },
    emptyText: { color: "#9CA3AF", textAlign: 'center', marginVertical: 20 },
    historyCard: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
    },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    historyTime: { fontSize: 14, color: '#4B5563' },
    historyValue: { fontSize: 14, color: '#1F2937' },
});
