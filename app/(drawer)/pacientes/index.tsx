import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { deletePatientFromFirebase, Patient, readPatientsFromFirebase } from "../../../services/firebasePatients";

// ─── Helpers para gráficas ────────────────────────────────────────────────────

/** Construye los datos para la curva demográfica (LineChart de edades) */
function buildAgeData(patients: Patient[]) {
    return patients.map((p) => ({
        value: Number(p.edad) || 0,
        label: p.nombre.split(" ")[0], // Solo el primer nombre para no saturar el eje X
        dataPointText: String(p.edad),
    }));
}

/** Agrupa pacientes por rangos de peso y devuelve datos para el AreaChart */
function buildWeightRangeData(patients: Patient[]) {
    const ranges = [
        { label: "<50", min: 0,  max: 49.9  },
        { label: "50-60", min: 50, max: 59.9 },
        { label: "60-70", min: 60, max: 69.9 },
        { label: "70-80", min: 70, max: 79.9 },
        { label: "80+",  min: 80, max: Infinity },
    ];

    return ranges.map((r) => {
        const count = patients.filter((p) => {
            const w = parseFloat(p.peso ?? "0");
            return w >= r.min && w <= r.max;
        }).length;
        return { value: count, label: r.label, dataPointText: String(count) };
    });
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PacientesIndex() {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const data = await readPatientsFromFirebase();
            setPatients(data);
        } catch (error) {
            Alert.alert("Error", "No se pudieron obtener los pacientes. Verifique su conexión.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPatients();
        }, [])
    );

    const handleDelete = (id: string) => {
        Alert.alert(
            "Confirmar eliminación",
            "¿Estás seguro de que deseas eliminar a este paciente?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await deletePatientFromFirebase(id);
                            await fetchPatients();
                        } catch (error) {
                            Alert.alert("Error", "No se pudo eliminar al paciente.");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = (id: string) => {
        router.push({
            pathname: "/(drawer)/pacientes/registroPaciente",
            params: { id },
        });
    };

    // ─── Datos de gráficas ───────────────────────────────────────────────────

    const ageData = buildAgeData(patients);
    const weightData = buildWeightRangeData(patients);

    // ─── Tarjeta de paciente ─────────────────────────────────────────────────

    const renderPatientCard = ({ item }: { item: Patient }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                    <Ionicons name="person-circle" size={50} color="#3B82F6" />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.cardName}>{`${item.nombre} ${item.apellidos}`}</Text>
                    <Text style={styles.cardText}><Text style={styles.bold}>Edad:</Text> {item.edad} años</Text>
                    <Text style={styles.cardText}><Text style={styles.bold}>Teléfono:</Text> {item.telefono}</Text>
                    <Text style={styles.cardText}><Text style={styles.bold}>Tipo de Sangre:</Text> {item.tipoSangre}</Text>
                </View>
            </View>
            <View style={styles.actionsContainer}>
                <Pressable
                    style={({ pressed }) => [styles.actionButton, styles.editButton, pressed && { opacity: 0.7 }]}
                    onPress={() => handleEdit(item.id)}
                >
                    <MaterialIcons name="edit" size={20} color="#fff" />
                    <Text style={styles.actionText}>Editar</Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [styles.actionButton, styles.deleteButton, pressed && { opacity: 0.7 }]}
                    onPress={() => handleDelete(item.id)}
                >
                    <MaterialIcons name="delete" size={20} color="#fff" />
                    <Text style={styles.actionText}>Eliminar</Text>
                </Pressable>
            </View>
        </View>
    );

    // ─── Sección de gráficas ─────────────────────────────────────────────────

    const ChartsSection = () => {
        if (patients.length === 0) return null;

        return (
            <View style={styles.chartsWrapper}>

                {/* ── Gráfica 1: Curva Demográfica de Edades (LineChart) ── */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>📈 Curva Demográfica (Edades)</Text>
                    <Text style={styles.chartSubtitle}>Edad en años por paciente</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <LineChart
                            data={ageData}
                            height={180}
                            spacing={55}
                            initialSpacing={20}
                            endSpacing={20}
                            color="#3B82F6"
                            thickness={3}
                            startFillColor="#93C5FD"
                            endFillColor="#DBEAFE"
                            startOpacity={0.6}
                            endOpacity={0.1}
                            hideDataPoints={false}
                            dataPointsColor="#1D4ED8"
                            dataPointsRadius={5}
                            yAxisThickness={1}
                            xAxisThickness={1}
                            yAxisColor="#E5E7EB"
                            xAxisColor="#E5E7EB"
                            yAxisTextStyle={styles.axisText}
                            xAxisLabelTextStyle={styles.axisTextX}
                            noOfSections={5}
                            maxValue={110}
                            rulesColor="#F3F4F6"
                            rulesType="dashed"
                            showDataPointOnFocus
                            showStripOnFocus
                            stripColor="#3B82F620"
                            stripWidth={2}
                            textShiftY={-10}
                            textShiftX={-5}
                            textFontSize={11}
                            dataPointLabelShiftY={-18}
                            showTextOnFocus={false}
                        />
                    </ScrollView>
                </View>

                {/* ── Gráfica 2: Concentración por Rangos de Peso (AreaChart) ── */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>📊 Concentración por Rangos de Peso</Text>
                    <Text style={styles.chartSubtitle}>Número de pacientes por rango de peso (kg)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <LineChart
                            data={weightData}
                            areaChart
                            curved
                            height={180}
                            spacing={60}
                            initialSpacing={20}
                            endSpacing={20}
                            color="#0F172A"
                            thickness={3}
                            startFillColor="#10B981"
                            endFillColor="#D1FAE5"
                            startOpacity={0.85}
                            endOpacity={0.15}
                            hideDataPoints={false}
                            dataPointsColor="#065F46"
                            dataPointsRadius={5}
                            yAxisThickness={1}
                            xAxisThickness={1}
                            yAxisColor="#E5E7EB"
                            xAxisColor="#E5E7EB"
                            yAxisTextStyle={styles.axisText}
                            xAxisLabelTextStyle={styles.axisTextX}
                            noOfSections={5}
                            rulesColor="#F3F4F6"
                            rulesType="dashed"
                            showDataPointOnFocus
                            showStripOnFocus
                            stripColor="#10B98120"
                            stripWidth={2}
                        />
                    </ScrollView>
                    {/* Leyenda de rangos */}
                    <View style={styles.legend}>
                        {["<50 kg", "50-60 kg", "60-70 kg", "70-80 kg", "80+ kg"].map((label, i) => (
                            <View key={i} style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
                                <Text style={styles.legendText}>{label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

            </View>
        );
    };

    // ─── ListHeaderComponent: header + gráficas ──────────────────────────────

    const ListHeader = () => (
        <View>
            <View style={styles.header}>
                <Text style={styles.titulo}>Dashboard de Pacientes</Text>
            </View>
            <ChartsSection />
            <Text style={styles.sectionLabel}>Listado de Pacientes</Text>
        </View>
    );

    // ─── Render principal ─────────────────────────────────────────────────────

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : patients.length === 0 ? (
                <ScrollView>
                    <ListHeader />
                    <View style={styles.centerContainer}>
                        <Text style={styles.emptyText}>No hay pacientes registrados aún.</Text>
                    </View>
                </ScrollView>
            ) : (
                <FlatList
                    data={patients}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPatientCard}
                    ListHeaderComponent={<ListHeader />}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <Pressable
                style={({ pressed }) => [
                    styles.fab,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                ]}
                onPress={() => router.push("/(drawer)/pacientes/registroPaciente")}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </Pressable>
        </View>
    );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FAFAFA" },
    header: { padding: 20, paddingBottom: 10 },
    titulo: { fontSize: 26, fontWeight: "800", color: "#1F2937", marginTop: 10 },
    centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
    emptyText: { fontSize: 16, color: "#6B7280", textAlign: "center" },
    listContainer: { paddingHorizontal: 16, paddingBottom: 100 },
    sectionLabel: {
        fontSize: 18,
        fontWeight: "700",
        color: "#374151",
        paddingHorizontal: 16,
        paddingBottom: 10,
        paddingTop: 4,
    },

    // ── Cards de paciente ──
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        overflow: "hidden",
    },
    cardContent: {
        flexDirection: "row",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    iconContainer: { justifyContent: "center", marginRight: 15 },
    infoContainer: { flex: 1, justifyContent: "center" },
    cardName: { fontSize: 18, fontWeight: "bold", color: "#1F2937", marginBottom: 5 },
    cardText: { fontSize: 14, color: "#4B5563", marginBottom: 3 },
    bold: { fontWeight: "bold", color: "#374151" },
    actionsContainer: { flexDirection: "row" },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        gap: 8,
    },
    editButton: { backgroundColor: "#3B82F6" },
    deleteButton: { backgroundColor: "#EF4444" },
    actionText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

    // ── FAB ──
    fab: {
        position: "absolute",
        bottom: 30,
        right: 30,
        backgroundColor: "#10B981",
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },

    // ── Gráficas ──
    chartsWrapper: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    chartCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 2,
    },
    chartSubtitle: {
        fontSize: 12,
        color: "#6B7280",
        marginBottom: 14,
    },
    axisText: {
        color: "#9CA3AF",
        fontSize: 11,
    },
    axisTextX: {
        color: "#6B7280",
        fontSize: 10,
        width: 45,
        textAlign: "center",
    },

    // ── Leyenda ──
    legend: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
        gap: 8,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 11,
        color: "#6B7280",
    },
});
