import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LineChart } from "react-native-gifted-charts";
import * as SQLite from "expo-sqlite";

import { readCitasFromFirebase, Cita } from "../../../services/firebaseCitas";
import { readPatientsFromFirebase, Patient } from "../../../services/firebasePatients";

export default function CitasIndex() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'lista' | 'grafica'>('lista');

    // Data States
    const [citas, setCitas] = useState<Cita[]>([]);
    const [pacientes, setPacientes] = useState<Patient[]>([]);
    const [medicos, setMedicos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // List Tab States
    const [filterStatus, setFilterStatus] = useState<string>('todas');

    // Chart Tab States
    const [maxY, setMaxY] = useState<number>(10);
    const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [densidadMode, setDensidadMode] = useState<'todas' | 'paciente' | 'medico'>('todas');
    const [entityId, setEntityId] = useState<string>('');

    const fetchData = async () => {
        setLoading(true);
        try {
            let medicosData = [];
            try {
                const db = await SQLite.openDatabaseAsync("medicos.db");
                const res = await db.getAllAsync("SELECT * FROM PersonalMedico ORDER BY id DESC;");
                medicosData = res as any[];
            } catch (e) {
                console.warn("Tabla PersonalMedico no ha sido inicializada", e);
            }

            const [citasData, pacientesData] = await Promise.all([
                readCitasFromFirebase(),
                readPatientsFromFirebase()
            ]);
            
            setCitas(citasData);
            setPacientes(pacientesData);
            setMedicos(medicosData);
        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'agendado': return '#3B82F6';
            case 'en curso': return '#F59E0B';
            case 'concluida': return '#10B981';
            default: return '#6B7280';
        }
    };

    const renderLista = () => {
        return (
            <>
                <View style={styles.grid}>
                    <View style={styles.accionesRow}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.tarjeta,
                                styles.tarjetaMedia,
                                { opacity: pressed ? 0.7 : 1 },
                            ]}
                            onPress={() => router.push("/(drawer)/citas/crear-cita")}
                        >
                            <FontAwesome name="calendar-plus-o" size={36} color="#60A5FA" />
                            <Text style={styles.tarjetaTitulo}>Nueva Cita</Text>
                            <Text style={styles.tarjetaDesc}>Agendar cita en el sistema</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [
                                styles.tarjeta,
                                styles.tarjetaMedia,
                                { opacity: pressed ? 0.7 : 1 },
                            ]}
                            onPress={() => router.push("/(drawer)/citas/bitacora")}
                        >
                            <FontAwesome name="book" size={36} color="#8B5CF6" />
                            <Text style={styles.tarjetaTitulo}>Bitácora</Text>
                            <Text style={styles.tarjetaDesc}>Historial de citas registradas</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.dashboardHeader}>
                    <Text style={styles.dashboardTitle}>Dashboard de Citas</Text>
                    <View style={styles.filterContainer}>
                        {['todas', 'agendado', 'en curso', 'concluida'].map(f => (
                            <Pressable 
                                key={f} 
                                style={[styles.filterBtn, filterStatus === f && styles.filterBtnActive]}
                                onPress={() => setFilterStatus(f)}
                            >
                                <Text style={[styles.filterText, filterStatus === f && styles.filterTextActive]}>
                                    {f.toUpperCase()}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                    </View>
                ) : citas.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={50} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No hay citas pendientes.</Text>
                    </View>
                ) : (
                    (filterStatus === 'todas' ? citas : citas.filter(c => c.status === filterStatus)).map((cita) => {
                        const citaDate = new Date(cita.fecha);
                        return (
                            <Pressable 
                                key={cita.id} 
                                onPress={() => router.push({ pathname: "/(drawer)/citas/ver-cita", params: { citaData: JSON.stringify(cita) } })}
                                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                            >
                                <View style={styles.citaCard}>
                                    <View style={styles.citaHeader}>
                                        <Text style={styles.citaDate}>
                                            {citaDate.toLocaleDateString()} - {citaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(cita.status) }]}>
                                            <Text style={styles.statusText}>{cita.status.toUpperCase()}</Text>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.citaBody}>
                                        <Text style={styles.citaLabel}>Paciente</Text>
                                        <Text style={styles.citaName}>{cita.pacienteNombre}</Text>

                                        <Text style={[styles.citaLabel, { marginTop: 8 }]}>Médico</Text>
                                        <Text style={styles.citaName}>{cita.medicoNombre}</Text>
                                    </View>

                                    <View style={styles.citaFooter}>
                                        <Text style={styles.duracionText}>
                                            <Ionicons name="time-outline" size={14} color="#6B7280" /> {cita.duracion} min
                                        </Text>
                                        {cita.primeraCita && (
                                            <Text style={styles.primeraCitaBadge}>Primera Cita</Text>
                                        )}
                                    </View>
                                </View>
                            </Pressable>
                        );
                    })
                )}
            </>
        );
    };

    const renderGrafica = () => {
        // Algorithm variables
        const groupedByDay: { [dateStr: string]: number } = {};
        
        let filteredCitas = citas;
        
        // 1. Filter by Mode (Entity)
        if (densidadMode === 'paciente' && entityId) {
            filteredCitas = filteredCitas.filter(c => c.pacienteId === entityId);
        } else if (densidadMode === 'medico' && entityId) {
            filteredCitas = filteredCitas.filter(c => String(c.medicoId) === entityId);
        }

        // 2. Filter by Dates and Group Day by Day
        // Truncate times for raw logic
        const startRaw = new Date(startDate); startRaw.setHours(0,0,0,0);
        const endRaw = new Date(endDate); endRaw.setHours(23,59,59,999);

        filteredCitas.forEach(cita => {
            const d = new Date(cita.fecha);
            if (d.getTime() >= startRaw.getTime() && d.getTime() <= endRaw.getTime()) {
                const dayStr = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
                groupedByDay[dayStr] = (groupedByDay[dayStr] || 0) + 1;
            }
        });

        // 3. To maintain line continuity, generate days array from start to end (limiting to max span for safety)
        const dayDifference = Math.floor((endRaw.getTime() - startRaw.getTime()) / (1000 * 60 * 60 * 24));
        const limitedDiff = dayDifference > 60 ? 60 : dayDifference; // Protect plotting limits

        const chartPoints = [];
        let peakDensity = 0;

        for (let i = 0; i <= limitedDiff; i++) {
            const curDate = new Date(startRaw);
            curDate.setDate(curDate.getDate() + i);
            const dayStr = `${curDate.getFullYear()}-${(curDate.getMonth()+1).toString().padStart(2,'0')}-${curDate.getDate().toString().padStart(2,'0')}`;
            const shortStr = `${curDate.getDate()}/${curDate.getMonth()+1}`;
            
            const count = groupedByDay[dayStr] || 0;
            if (count > peakDensity) peakDensity = count;

            chartPoints.push({
                value: count,
                label: shortStr,
                dataPointText: String(count)
            });
        }

        // Status Logic
        const percentage = maxY > 0 ? (peakDensity / maxY) * 100 : 0;
        let densityStatus = "Relajado";
        let densityColor = "#10B981"; // Green
        let densityIcon = "leaf";

        if (percentage >= 30 && percentage <= 60) {
            densityStatus = "Ocupado";
            densityColor = "#F59E0B"; // Yellow
            densityIcon = "speedometer-outline";
        } else if (percentage > 60) {
            densityStatus = "Saturado";
            densityColor = "#EF4444"; // Red
            densityIcon = "warning";
        }

        return (
            <View>
                <View style={styles.controlsCard}>
                    <Text style={styles.sectionHeading}>Parámetros de Gráfica</Text>
                    
                    <Text style={styles.label}>Valor Máximo (Y):</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={maxY}
                            onValueChange={(val) => setMaxY(Number(val))}
                            style={styles.picker}
                        >
                            <Picker.Item label="5 citas (Diarias)" value={5} />
                            <Picker.Item label="10 citas (Diarias)" value={10} />
                            <Picker.Item label="20 citas (Diarias)" value={20} />
                            <Picker.Item label="50 citas (Diarias)" value={50} />
                        </Picker>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, paddingRight: 5 }}>
                            <Text style={styles.label}>Fecha Inicial:</Text>
                            <Pressable style={styles.datePickerBtn} onPress={() => setShowStartPicker(true)}>
                                <Text style={styles.datePickerText}>{startDate.toLocaleDateString()}</Text>
                            </Pressable>
                            {showStartPicker && (
                                <DateTimePicker
                                    value={startDate}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowStartPicker(Platform.OS === 'ios');
                                        if (selectedDate) setStartDate(selectedDate);
                                    }}
                                />
                            )}
                        </View>
                        <View style={{ flex: 1, paddingLeft: 5 }}>
                            <Text style={styles.label}>Fecha Final:</Text>
                            <Pressable style={styles.datePickerBtn} onPress={() => setShowEndPicker(true)}>
                                <Text style={styles.datePickerText}>{endDate.toLocaleDateString()}</Text>
                            </Pressable>
                            {showEndPicker && (
                                <DateTimePicker
                                    value={endDate}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowEndPicker(Platform.OS === 'ios');
                                        if (selectedDate) setEndDate(selectedDate);
                                    }}
                                />
                            )}
                        </View>
                    </View>

                    <Text style={styles.label}>Tipo de Filtro:</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={densidadMode}
                            onValueChange={(val) => {
                                setDensidadMode(val);
                                setEntityId('');
                            }}
                            style={styles.picker}
                        >
                            <Picker.Item label="Todas las citas" value="todas" />
                            <Picker.Item label="Por Paciente" value="paciente" />
                            <Picker.Item label="Por Médico" value="medico" />
                        </Picker>
                    </View>

                    {densidadMode === 'paciente' && (
                        <>
                            <Text style={styles.label}>Seleccionar Paciente:</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={entityId}
                                    onValueChange={(val) => setEntityId(val)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Seleccione un paciente..." value="" />
                                    {pacientes.map(p => (
                                        <Picker.Item key={p.id} label={`${p.nombre} ${p.apellidos}`} value={p.id} />
                                    ))}
                                </Picker>
                            </View>
                        </>
                    )}

                    {densidadMode === 'medico' && (
                        <>
                            <Text style={styles.label}>Seleccionar Médico:</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={entityId}
                                    onValueChange={(val) => setEntityId(String(val))}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Seleccione un médico..." value="" />
                                    {medicos.map(m => (
                                        <Picker.Item key={m.id} label={`Dr. ${m.nombre} ${m.apellido1}`} value={String(m.id)} />
                                    ))}
                                </Picker>
                            </View>
                        </>
                    )}
                </View>

                {/* Density Status Indicator */}
                <View style={[styles.densityCard, { borderTopWidth: 4, borderTopColor: densityColor }]}>
                    <Text style={styles.densityLabel}>Estado Actual de Densidad del Rango:</Text>
                    <View style={styles.densityRow}>
                        <Ionicons name={densityIcon as any} size={28} color={densityColor} style={{ marginRight: 10 }} />
                        <Text style={[styles.densityTextStatus, { color: densityColor }]}>{densityStatus.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.densitySummary}>
                        Pico Máximo Registrado: {peakDensity} citas ({(percentage).toFixed(1)}% de {maxY})
                    </Text>
                </View>

                {/* Main Graph Component */}
                <View style={styles.graphContainer}>
                    <Text style={styles.sectionHeading}>Citas por Día</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ paddingTop: 20 }}>
                        <LineChart
                            data={chartPoints}
                            height={220}
                            maxValue={maxY}
                            spacing={50}
                            initialSpacing={20}
                            color="#3B82F6"
                            thickness={3}
                            startFillColor="rgba(59, 130, 246, 0.3)"
                            endFillColor="rgba(59, 130, 246, 0.05)"
                            startOpacity={0.9}
                            endOpacity={0.2}
                            dataPointsColor="#2563EB"
                            dataPointsRadius={4}
                            yAxisColor="#E5E7EB"
                            xAxisColor="#E5E7EB"
                            yAxisTextStyle={{ color: '#6B7280', fontSize: 11 }}
                            xAxisLabelTextStyle={{ color: '#9CA3AF', fontSize: 10, width: 45, textAlign: 'center' }}
                            areaChart
                            curved
                        />
                        </View>
                    </ScrollView>
                </View>
                <View style={{ height: 40 }}/>
            </View>
        );
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.tabBar}>
                    <Pressable 
                        style={[styles.tabBtn, activeTab === 'lista' && styles.tabBtnActive]}
                        onPress={() => setActiveTab('lista')}
                    >
                        <MaterialIcons name="list-alt" size={20} color={activeTab === 'lista' ? "#2563EB" : "#6B7280"} style={{ marginRight: 6 }}/>
                        <Text style={[styles.tabText, activeTab === 'lista' && styles.tabTextActive]}>Mis Citas</Text>
                    </Pressable>
                    <Pressable 
                        style={[styles.tabBtn, activeTab === 'grafica' && styles.tabBtnActive]}
                        onPress={() => setActiveTab('grafica')}
                    >
                        <MaterialIcons name="insights" size={20} color={activeTab === 'grafica' ? "#2563EB" : "#6B7280"} style={{ marginRight: 6 }}/>
                        <Text style={[styles.tabText, activeTab === 'grafica' && styles.tabTextActive]}>Densidad</Text>
                    </Pressable>
                </View>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {activeTab === 'lista' ? renderLista() : renderGrafica()}
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F3F4F6" },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 2,
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabBtnActive: {
        borderBottomColor: '#2563EB',
    },
    tabText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#6B7280'
    },
    tabTextActive: {
        color: '#2563EB'
    },
    scrollContainer: { flexGrow: 1, padding: 20, paddingBottom: 60 },
    titulo: {
        fontSize: 26,
        fontWeight: "800",
        color: "#1F2937",
        marginBottom: 20,
        marginTop: 10,
    },
    grid: { flexDirection: "column", gap: 20, marginBottom: 30 },
    accionesRow: { flexDirection: "row", gap: 12 },
    tarjetaMedia: { flex: 1, padding: 18 },
    tarjeta: {
        backgroundColor: "#fff",
        padding: 25,
        borderRadius: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    tarjetaTitulo: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#374151",
        marginTop: 15,
        marginBottom: 5,
    },
    tarjetaDesc: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
    },
    dashboardHeader: {
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB"
    },
    dashboardTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1F2937",
        marginBottom: 10
    },
    filterContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 5,
    },
    filterBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    filterBtnActive: {
        backgroundColor: "#E0E7FF",
        borderColor: "#6366F1",
    },
    filterText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6B7280",
    },
    filterTextActive: {
        color: "#4F46E5",
    },
    centerContainer: {
        padding: 40,
        alignItems: "center",
        justifyContent: "center"
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderStyle: "dashed"
    },
    emptyText: {
        marginTop: 10,
        fontSize: 15,
        color: "#9CA3AF",
        fontStyle: "italic"
    },
    citaCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    citaHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    citaDate: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1F2937",
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        color: "#FFF",
        fontSize: 11,
        fontWeight: "bold",
    },
    citaBody: {
        marginBottom: 12,
    },
    citaLabel: {
        fontSize: 12,
        color: "#6B7280",
        fontWeight: "600",
        marginBottom: 2,
    },
    citaName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
    },
    citaFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 5,
    },
    duracionText: {
        fontSize: 13,
        color: "#6B7280",
        fontWeight: "500",
    },
    primeraCitaBadge: {
        fontSize: 11,
        color: "#8B5CF6",
        backgroundColor: "#EDE9FE",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        fontWeight: "bold",
        overflow: "hidden",
    },
    // Chart Styles
    controlsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 2
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 5,
        marginTop: 10,
    },
    pickerWrapper: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
        color: '#1F2937',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    datePickerBtn: {
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        alignItems: 'center'
    },
    datePickerText: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '500'
    },
    densityCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5
    },
    densityLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
        marginBottom: 5
    },
    densityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5
    },
    densityTextStatus: {
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: 1
    },
    densitySummary: {
        marginTop: 10,
        fontSize: 15,
        color: '#4B5563',
        fontStyle: 'italic'
    },
    graphContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 2
    }
});
