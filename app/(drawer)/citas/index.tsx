import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import CustomPicker from "../../../components/CustomPicker";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LineChart } from "react-native-gifted-charts";
import * as SQLite from "expo-sqlite";
import { LinearGradient } from "expo-linear-gradient";

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

    const getStatusColor = (status: string): readonly [string, string, ...string[]] => {
        switch (status) {
            case 'agendado': return ['#4F46E5', '#818CF8'];
            case 'en curso': return ['#D97706', '#FBBF24'];
            case 'concluida': return ['#059669', '#34D399'];
            default: return ['#4B5563', '#9CA3AF'];
        }
    };

    const renderLista = () => {
        return (
            <>
                <View style={styles.grid}>
                    <View style={styles.accionesRow}>
                        <Pressable
                            style={({ pressed }) => [styles.tarjetaPressable, { opacity: pressed ? 0.8 : 1 }]}
                            onPress={() => router.push("/(drawer)/citas/crear-cita")}
                        >
                            <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.tarjetaGradient}>
                                <View style={styles.iconCircleWrapper}>
                                    <FontAwesome name="calendar-plus-o" size={28} color="#FFFFFF" />
                                </View>
                                <Text style={styles.tarjetaTituloWhite}>Nueva Cita</Text>
                                <Text style={styles.tarjetaDescWhite}>Agendar cita en el sistema</Text>
                            </LinearGradient>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [styles.tarjetaPressable, { opacity: pressed ? 0.8 : 1 }]}
                            onPress={() => router.push("/(drawer)/citas/bitacora")}
                        >
                            <LinearGradient colors={['#10B981', '#34D399']} style={styles.tarjetaGradient}>
                                <View style={styles.iconCircleWrapper}>
                                    <FontAwesome name="book" size={28} color="#FFFFFF" />
                                </View>
                                <Text style={styles.tarjetaTituloWhite}>Bitácora</Text>
                                <Text style={styles.tarjetaDescWhite}>Historial de citas</Text>
                            </LinearGradient>
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
                        <ActivityIndicator size="large" color="#4F46E5" />
                    </View>
                ) : citas.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={60} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No hay citas pendientes.</Text>
                    </View>
                ) : (
                    (filterStatus === 'todas' ? citas : citas.filter(c => c.status === filterStatus)).map((cita) => {
                        const citaDate = new Date(cita.fecha);
                        return (
                            <Pressable 
                                key={cita.id} 
                                onPress={() => router.push({ pathname: "/(drawer)/citas/ver-cita", params: { citaData: JSON.stringify(cita) } })}
                                style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                            >
                                <View style={styles.citaCard}>
                                    <View style={styles.citaHeader}>
                                        <View style={styles.dateBadge}>
                                            <Text style={styles.dateDay}>{citaDate.getDate().toString().padStart(2, '0')}</Text>
                                            <Text style={styles.dateMonth}>{citaDate.toLocaleString('es', { month: 'short' }).toUpperCase()}</Text>
                                        </View>
                                        <View style={styles.headerRight}>
                                            <Text style={styles.citaTime}>
                                                <Ionicons name="time-outline" size={14} /> {citaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                            <LinearGradient 
                                                colors={getStatusColor(cita.status)} 
                                                style={styles.statusGradientBadge}
                                                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                            >
                                                <Text style={styles.statusText}>{cita.status.toUpperCase()}</Text>
                                            </LinearGradient>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.citaBody}>
                                        <View style={styles.infoBlock}>
                                            <Text style={styles.citaLabel}>PACIENTE</Text>
                                            <Text style={styles.citaName}>{cita.pacienteNombre}</Text>
                                        </View>
                                        <View style={styles.infoBlock}>
                                            <Text style={styles.citaLabel}>MÉDICO</Text>
                                            <Text style={styles.citaName}>{cita.medicoNombre}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.citaFooter}>
                                        <Text style={styles.duracionText}>
                                            <Ionicons name="hourglass-outline" size={14} color="#6B7280" /> {cita.duracion} min
                                        </Text>
                                        {cita.primeraCita && (
                                            <View style={styles.primeraCitaWrapper}>
                                                <Text style={styles.primeraCitaBadge}>Primera Cita</Text>
                                            </View>
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
        const groupedByDay: { [dateStr: string]: number } = {};
        let filteredCitas = citas;
        
        if (densidadMode === 'paciente' && entityId) {
            filteredCitas = filteredCitas.filter(c => c.pacienteId === entityId);
        } else if (densidadMode === 'medico' && entityId) {
            filteredCitas = filteredCitas.filter(c => String(c.medicoId) === entityId);
        }

        const startRaw = new Date(startDate); startRaw.setHours(0,0,0,0);
        const endRaw = new Date(endDate); endRaw.setHours(23,59,59,999);

        filteredCitas.forEach(cita => {
            const d = new Date(cita.fecha);
            if (d.getTime() >= startRaw.getTime() && d.getTime() <= endRaw.getTime()) {
                const dayStr = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
                groupedByDay[dayStr] = (groupedByDay[dayStr] || 0) + 1;
            }
        });

        const dayDifference = Math.floor((endRaw.getTime() - startRaw.getTime()) / (1000 * 60 * 60 * 24));
        const limitedDiff = dayDifference > 60 ? 60 : dayDifference; 

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

        const percentage = maxY > 0 ? (peakDensity / maxY) * 100 : 0;
        let densityStatus = "Relajado";
        let densityColor: readonly [string, string, ...string[]] = ['#10B981', '#34D399'];
        let densityIcon = "leaf";

        if (percentage >= 30 && percentage <= 60) {
            densityStatus = "Ocupado";
            densityColor = ['#F59E0B', '#FCD34D'];
            densityIcon = "speedometer-outline";
        } else if (percentage > 60) {
            densityStatus = "Saturado";
            densityColor = ['#EF4444', '#FCA5A5'];
            densityIcon = "warning";
        }

        return (
            <View>
                <View style={styles.controlsCard}>
                    <Text style={styles.sectionHeading}>Filtros y Parámetros</Text>
                    
                    <Text style={styles.label}>Valor Máximo (Y):</Text>
                    <View style={styles.pickerWrapper}>
                        <CustomPicker selectedValue={maxY} onValueChange={(val) => setMaxY(Number(val))} style={styles.picker}>
                            <Picker.Item label="5 citas (Diarias)" value={5} />
                            <Picker.Item label="10 citas (Diarias)" value={10} />
                            <Picker.Item label="20 citas (Diarias)" value={20} />
                            <Picker.Item label="50 citas (Diarias)" value={50} />
                        </CustomPicker>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={styles.label}>Fecha Inicial:</Text>
                            <Pressable style={styles.datePickerBtn} onPress={() => setShowStartPicker(true)}>
                                <Ionicons name="calendar" size={16} color="#6B7280" style={{marginRight: 6}}/>
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
                        <View style={{ flex: 1, paddingLeft: 8 }}>
                            <Text style={styles.label}>Fecha Final:</Text>
                            <Pressable style={styles.datePickerBtn} onPress={() => setShowEndPicker(true)}>
                                <Ionicons name="calendar" size={16} color="#6B7280" style={{marginRight: 6}}/>
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

                    <Text style={styles.label}>Modo de Densidad:</Text>
                    <View style={styles.pickerWrapper}>
                        <CustomPicker
                            selectedValue={densidadMode}
                            onValueChange={(val) => {
                                setDensidadMode(val);
                                setEntityId('');
                            }}
                            style={styles.picker}
                        >
                            <Picker.Item label="Global (Todas las citas)" value="todas" />
                            <Picker.Item label="Por Paciente" value="paciente" />
                            <Picker.Item label="Por Médico" value="medico" />
                        </CustomPicker>
                    </View>

                    {densidadMode === 'paciente' && (
                        <View style={{marginTop: 10}}>
                            <Text style={styles.label}>Seleccionar Paciente:</Text>
                            <View style={styles.pickerWrapper}>
                                <CustomPicker selectedValue={entityId} onValueChange={(val) => setEntityId(val)} style={styles.picker}>
                                    <Picker.Item label="Seleccione un paciente..." value="" />
                                    {pacientes.map(p => (
                                        <Picker.Item key={p.id} label={`${p.nombre} ${p.apellidos}`} value={p.id} />
                                    ))}
                                </CustomPicker>
                            </View>
                        </View>
                    )}

                    {densidadMode === 'medico' && (
                        <View style={{marginTop: 10}}>
                            <Text style={styles.label}>Seleccionar Médico:</Text>
                            <View style={styles.pickerWrapper}>
                                <CustomPicker selectedValue={entityId} onValueChange={(val) => setEntityId(String(val))} style={styles.picker}>
                                    <Picker.Item label="Seleccione un médico..." value="" />
                                    {medicos.map(m => (
                                        <Picker.Item key={m.id} label={`Dr. ${m.nombre} ${m.apellido1}`} value={String(m.id)} />
                                    ))}
                                </CustomPicker>
                            </View>
                        </View>
                    )}
                </View>

                <LinearGradient colors={densityColor} style={styles.densityGradientCard} start={{x:0, y:0}} end={{x:1, y:1}}>
                    <View style={styles.densityOverlay}>
                        <Text style={styles.densityLabelWhite}>Carga de Trabajo del Rango:</Text>
                        <View style={styles.densityRow}>
                            <Ionicons name={densityIcon as any} size={32} color="#FFF" style={{ marginRight: 12 }} />
                            <Text style={styles.densityTextStatusWhite}>{densityStatus.toUpperCase()}</Text>
                        </View>
                        <View style={styles.densityPill}>
                            <Text style={styles.densitySummaryWhite}>
                                Pico Máximo: {peakDensity} citas ({(percentage).toFixed(1)}%)
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.graphContainer}>
                    <Text style={styles.graphHeading}>Tendencia de Citas</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ paddingTop: 20 }}>
                        <LineChart
                            data={chartPoints}
                            height={220}
                            maxValue={maxY}
                            spacing={55}
                            initialSpacing={20}
                            color="#6366F1"
                            thickness={4}
                            startFillColor="rgba(99, 102, 241, 0.4)"
                            endFillColor="rgba(99, 102, 241, 0.01)"
                            startOpacity={0.9}
                            endOpacity={0.1}
                            dataPointsColor="#4F46E5"
                            dataPointsRadius={5}
                            yAxisColor="transparent"
                            xAxisColor="#E2E8F0"
                            yAxisTextStyle={{ color: '#94A3B8', fontSize: 11, fontWeight: '600' }}
                            xAxisLabelTextStyle={{ color: '#64748B', fontSize: 11, width: 45, textAlign: 'center', fontWeight: '500' }}
                            areaChart
                            curved
                            hideRules
                            isAnimated
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
                <View style={styles.tabContainer}>
                    <Pressable 
                        style={[styles.tabBtn, activeTab === 'lista' && styles.tabBtnActive]}
                        onPress={() => setActiveTab('lista')}
                    >
                        <MaterialIcons name="list-alt" size={22} color={activeTab === 'lista' ? "#4F46E5" : "#94A3B8"} style={{ marginRight: 8 }}/>
                        <Text style={[styles.tabText, activeTab === 'lista' && styles.tabTextActive]}>Mis Citas</Text>
                    </Pressable>
                    <Pressable 
                        style={[styles.tabBtn, activeTab === 'grafica' && styles.tabBtnActive]}
                        onPress={() => setActiveTab('grafica')}
                    >
                        <MaterialIcons name="insights" size={22} color={activeTab === 'grafica' ? "#4F46E5" : "#94A3B8"} style={{ marginRight: 8 }}/>
                        <Text style={[styles.tabText, activeTab === 'grafica' && styles.tabTextActive]}>Métricas</Text>
                    </Pressable>
                </View>
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
                    {activeTab === 'lista' ? renderLista() : renderGrafica()}
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
        zIndex: 10,
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabBtnActive: {
        borderBottomColor: '#4F46E5',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 0.5,
    },
    tabTextActive: {
        color: '#4F46E5'
    },
    scrollContainer: { flexGrow: 1, padding: 20, paddingBottom: 60 },
    grid: { flexDirection: "column", gap: 20, marginBottom: 25 },
    accionesRow: { flexDirection: "row", gap: 15 },
    tarjetaPressable: { flex: 1, borderRadius: 20, overflow: 'hidden', elevation: 8, shadowColor: '#4F46E5', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: {width:0, height: 5} },
    tarjetaGradient: {
        padding: 22,
        alignItems: "center",
        justifyContent: "center",
        height: 160,
    },
    iconCircleWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    tarjetaTituloWhite: {
        fontSize: 17,
        fontWeight: "800",
        color: "#FFFFFF",
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    tarjetaDescWhite: {
        fontSize: 12,
        color: "rgba(255,255,255,0.8)",
        textAlign: "center",
        fontWeight: "500",
    },
    dashboardHeader: {
        flexDirection: 'column',
        marginBottom: 20,
    },
    dashboardTitle: {
        fontSize: 24,
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    filterContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    filterBtnActive: {
        backgroundColor: "#EEF2FF",
        borderColor: "#818CF8",
    },
    filterText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#64748B",
        letterSpacing: 0.5,
    },
    filterTextActive: {
        color: "#4F46E5",
    },
    centerContainer: { padding: 40, alignItems: "center", justifyContent: "center" },
    emptyContainer: {
        padding: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderStyle: "dashed",
        marginTop: 10,
    },
    emptyText: { marginTop: 15, fontSize: 16, color: "#94A3B8", fontWeight: '600' },
    
    // Cita Card Styles
    citaCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        marginBottom: 18,
        shadowColor: "#0F172A",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden',
    },
    citaHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        backgroundColor: '#F8FAFC',
    },
    dateBadge: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: 54,
        height: 54,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    dateDay: { fontSize: 20, fontWeight: '900', color: '#0F172A', lineHeight: 22 },
    dateMonth: { fontSize: 11, fontWeight: '700', color: '#6366F1' },
    headerRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 6,
    },
    citaTime: {
        fontSize: 14,
        fontWeight: "700",
        color: "#475569",
    },
    statusGradientBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
    },
    statusText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    citaBody: {
        padding: 16,
        flexDirection: 'row',
        gap: 15,
    },
    infoBlock: {
        flex: 1,
    },
    citaLabel: {
        fontSize: 11,
        color: "#94A3B8",
        fontWeight: "800",
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    citaName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
    },
    citaFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    duracionText: {
        fontSize: 13,
        color: "#64748B",
        fontWeight: "600",
    },
    primeraCitaWrapper: {
        backgroundColor: '#F5F3FF',
        borderWidth: 1,
        borderColor: '#DDD6FE',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    primeraCitaBadge: {
        fontSize: 11,
        color: "#7C3AED",
        fontWeight: "800",
        letterSpacing: 0.5,
    },

    // Chart Styles
    controlsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 16,
        letterSpacing: 0.2,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 8,
        marginTop: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    pickerWrapper: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        height: 50,
        justifyContent: "center",
    },
    picker: {
        width: '100%',
        color: '#1E293B',
        backgroundColor: "transparent",
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    datePickerBtn: {
        flexDirection: 'row',
        padding: 14,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    datePickerText: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '600'
    },
    densityGradientCard: {
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: {width: 0, height: 6},
        elevation: 6,
        overflow: 'hidden',
    },
    densityOverlay: {
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    densityLabelWhite: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '700',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    densityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4
    },
    densityTextStatusWhite: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1
    },
    densityPill: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 12,
    },
    densitySummaryWhite: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    graphContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        paddingTop: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    graphHeading: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 10,
    }
});
