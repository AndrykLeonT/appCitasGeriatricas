import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BarChart, PieChart } from "react-native-gifted-charts";

// ─── DB Init ──────────────────────────────────────────────────────────────────

const initDB = async () => {
    const db = await SQLite.openDatabaseAsync("medicos.db");
    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS PersonalMedico (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          apellido1 TEXT NOT NULL,
          apellido2 TEXT,
          rfc TEXT,
          cedula TEXT,
          carrera TEXT,
          escuela TEXT,
          tituloEspecialidad TEXT,
          escuelaEspecialidad TEXT,
          turno TEXT,
          telefono TEXT,
          cubreUrgencias INTEGER,
          sexo TEXT
        );
    `);

    try {
        await db.execAsync(`ALTER TABLE PersonalMedico ADD COLUMN sexo TEXT;`);
    } catch (e) {
    }

    return db;
};


/** Pie chart: distribución por sexo */
function buildSexoPieData(medicos: any[]) {
    const counts: Record<string, number> = { Masculino: 0, Femenino: 0, "N/E": 0 };
    medicos.forEach((m) => {
        const s = (m.sexo || "").trim();
        if (s === "M" || s === "Masculino" || s === "masculino") counts["Masculino"]++;
        else if (s === "F" || s === "Femenino" || s === "femenino") counts["Femenino"]++;
        else counts["N/E"]++;
    });
    const palette = ["#3B82F6", "#EC4899", "#9CA3AF"];
    return Object.entries(counts)
        .filter(([, v]) => v > 0)
        .map(([label, value], i) => ({
            value,
            color: palette[i % palette.length],
            text: `${value}`,
            label,
        }));
}

/** Bar chart: médicos por turno */
function buildTurnoBarData(medicos: any[]) {
    const turnos = ["Matutino", "Vespertino", "Nocturno"];
    const colors = ["#F59E0B", "#8B5CF6", "#1E40AF"];
    return turnos.map((t, i) => ({
        value: medicos.filter((m) => (m.turno || "") === t).length,
        label: t.substring(0, 3),
        frontColor: colors[i],
        topLabelComponent: () => (
            <Text style={{ fontSize: 11, color: "#374151", fontWeight: "700", marginBottom: 4 }}>
                {medicos.filter((m) => (m.turno || "") === t).length}
            </Text>
        ),
    }));
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function MedicosIndex() {
    const router = useRouter();
    const [medicos, setMedicos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMedicos = async () => {
        setLoading(true);
        try {
            const db = await initDB();
            const data = await db.getAllAsync("SELECT * FROM PersonalMedico ORDER BY id DESC;");
            setMedicos(data as any[]);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudieron obtener los médicos. Verifique su base de datos.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchMedicos();
        }, [])
    );

    const eliminarMedico = async (id: number) => {
        try {
            setLoading(true);
            const db = await SQLite.openDatabaseAsync("medicos.db");
            await db.runAsync("DELETE FROM PersonalMedico WHERE id = ?;", [id]);
            Alert.alert("Éxito", "Registro eliminado correctamente.");
            await fetchMedicos();
        } catch (error) {
            console.error("Error al eliminar médico", error);
            Alert.alert("Error", "No se pudo eliminar el registro.");
            setLoading(false);
        }
    };

    const handleBorrar = (id: number) => {
        Alert.alert("Confirmación", "¿Está seguro de eliminar este registro?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Borrar", style: "destructive", onPress: () => eliminarMedico(id) },
        ]);
    };

    const handleEditar = (medico: any) => {
        router.push({
            pathname: "/(drawer)/medicos/registroPersonalMedico",
            params: { medicoData: JSON.stringify(medico) },
        });
    };

    const handleVerDetalle = (medico: any) => {
        router.push({
            pathname: "/(drawer)/medicos/verMedico",
            params: { medicoData: JSON.stringify(medico) },
        });
    };

    // ─── Datos de gráficas ───────────────────────────────────────────────────

    const pieData = buildSexoPieData(medicos);
    const barData = buildTurnoBarData(medicos);

    // ─── Sección de gráficas ─────────────────────────────────────────────────

    const ChartsSection = () => {
        if (medicos.length === 0) return null;
        return (
            <View style={styles.chartsWrapper}>

                {/* ── Gráfica 1: Pie — Distribución por Sexo ── */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}> Distribución por Sexo</Text>
                    <Text style={styles.chartSubtitle}>Proporción de médicos hombres / mujeres</Text>
                    <View style={styles.pieRow}>
                        <PieChart
                            data={pieData.length > 0 ? pieData : [{ value: 1, color: "#E5E7EB", text: "" }]}
                            donut
                            radius={80}
                            innerRadius={48}
                            showText
                            textColor="#fff"
                            textSize={13}
                            fontWeight="700"
                            centerLabelComponent={() => (
                                <View style={{ alignItems: "center" }}>
                                    <Text style={{ fontSize: 22, fontWeight: "800", color: "#1F2937" }}>
                                        {medicos.length}
                                    </Text>
                                    <Text style={{ fontSize: 10, color: "#6B7280" }}>total</Text>
                                </View>
                            )}
                        />
                        <View style={styles.pieLegend}>
                            {pieData.length > 0 ? pieData.map((item, i) => (
                                <View key={i} style={styles.pieLegendItem}>
                                    <View style={[styles.pieDot, { backgroundColor: item.color }]} />
                                    <View>
                                        <Text style={styles.pieLegendLabel}>{item.label}</Text>
                                        <Text style={styles.pieLegendValue}>{item.value} médico(s)</Text>
                                    </View>
                                </View>
                            )) : (
                                <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                                    Agrega el campo {"\n"}de sexo al registro.
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* ── Gráfica 2: Barras — Médicos por Turno ── */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}> Personal por Turno</Text>
                    <Text style={styles.chartSubtitle}>Cantidad de médicos en cada turno</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <BarChart
                            data={barData}
                            height={160}
                            barWidth={52}
                            spacing={28}
                            initialSpacing={20}
                            endSpacing={20}
                            roundedTop
                            yAxisThickness={1}
                            xAxisThickness={1}
                            yAxisColor="#E5E7EB"
                            xAxisColor="#E5E7EB"
                            yAxisTextStyle={styles.axisText}
                            xAxisLabelTextStyle={styles.axisTextX}
                            noOfSections={4}
                            rulesColor="#F3F4F6"
                            rulesType="dashed"
                            isAnimated
                        />
                    </ScrollView>
                    <View style={styles.barLegend}>
                        {[
                            { label: "Matutino", color: "#F59E0B" },
                            { label: "Vespertino", color: "#8B5CF6" },
                            { label: "Nocturno", color: "#1E40AF" },
                        ].map((item, i) => (
                            <View key={i} style={styles.pieLegendItem}>
                                <View style={[styles.pieDot, { backgroundColor: item.color }]} />
                                <Text style={styles.pieLegendLabel}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

            </View>
        );
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollContent}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.titulo}>Dashboard de Médicos</Text>
                    </View>

                    {loading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#10B981" />
                        </View>
                    ) : (
                        <>
                            <ChartsSection />

                            <Text style={styles.listaTitle}>
                                Médicos Registrados ({medicos.length})
                            </Text>

                            {medicos.length === 0 ? (
                                <Text style={styles.emptyText}>
                                    No hay médicos registrados aún.
                                </Text>
                            ) : (
                                medicos.map((medico: any) => (
                                    <View key={medico.id.toString()} style={styles.medicoCard}>
                                        <Pressable
                                            style={({ pressed }) => [styles.medicoInfo, pressed && { backgroundColor: "#F0FDF4" }]}
                                            onPress={() => handleVerDetalle(medico)}
                                        >
                                            <View style={styles.medicoInfoRow}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.medicoName}>
                                                        {medico.nombre} {medico.apellido1} {medico.apellido2 || ""}
                                                    </Text>
                                                    <Text style={styles.medicoSpec}>
                                                        {medico.tituloEspecialidad || medico.carrera || "Sin especialidad"}
                                                    </Text>
                                                    <Text style={styles.medicoDetails}>
                                                        Turno: {medico.turno} | Urgencias:{" "}
                                                        {medico.cubreUrgencias ? "Sí" : "No"}
                                                    </Text>
                                                    <Text style={styles.medicoDetails}>
                                                        Teléfono: {medico.telefono || "N/A"}
                                                    </Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={{ alignSelf: "center" }} />
                                            </View>
                                        </Pressable>
                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity
                                                style={styles.btnEdit}
                                                onPress={() => handleEditar(medico)}
                                            >
                                                <Text style={styles.actionText}>Editar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.btnDelete}
                                                onPress={() => handleBorrar(medico.id)}
                                            >
                                                <Text style={styles.actionTextDelete}>Borrar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            )}
                        </>
                    )}
                </ScrollView>

                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => router.push("/(drawer)/medicos/registroPersonalMedico")}
                >
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6" },
    header: { padding: 20, paddingBottom: 10, backgroundColor: "#f3f4f6" },
    titulo: { fontSize: 26, fontWeight: "800", color: "#1F2937", marginTop: 10 },
    centerContainer: { justifyContent: "center", alignItems: "center", padding: 40 },
    scrollContent: { flex: 1 },
    scrollContainer: { paddingBottom: 100 },

    listaTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 15,
        marginTop: 5,
        paddingHorizontal: 20,
    },
    emptyText: {
        color: "#6b7280",
        fontStyle: "italic",
        textAlign: "center",
        marginTop: 20,
        paddingHorizontal: 20,
    },
    medicoCard: {
        backgroundColor: "#ffffff",
        borderRadius: 8,
        padding: 15,
        marginBottom: 12,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    medicoInfo: { marginBottom: 10 },
    medicoInfoRow: { flexDirection: "row", alignItems: "center" },
    medicoName: { fontSize: 18, fontWeight: "bold", color: "#111827" },
    medicoSpec: { fontSize: 15, color: "#10B981", marginTop: 4, fontWeight: "600" },
    medicoDetails: { fontSize: 13, color: "#6b7280", marginTop: 4 },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
        paddingTop: 10,
    },
    btnEdit: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: "#f3f4f6",
        marginRight: 10,
    },
    btnDelete: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: "#fee2e2",
    },
    actionText: { color: "#4b5563", fontWeight: "700", fontSize: 13 },
    actionTextDelete: { color: "#dc2626", fontWeight: "700", fontSize: 13 },
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
    chartsWrapper: { paddingHorizontal: 16, paddingBottom: 8 },
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
    chartTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginBottom: 2 },
    chartSubtitle: { fontSize: 12, color: "#6B7280", marginBottom: 14 },
    axisText: { color: "#9CA3AF", fontSize: 11 },
    axisTextX: { color: "#6B7280", fontSize: 11, fontWeight: "600" },
    pieRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingRight: 8,
    },
    pieLegend: { flex: 1, paddingLeft: 20, gap: 12 },
    pieLegendItem: { flexDirection: "row", alignItems: "center", gap: 10 },
    pieDot: { width: 12, height: 12, borderRadius: 6 },
    pieLegendLabel: { fontSize: 13, fontWeight: "700", color: "#1F2937" },
    pieLegendValue: { fontSize: 11, color: "#6B7280" },
    barLegend: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
        marginTop: 10,
        flexWrap: "wrap",
    },
});
