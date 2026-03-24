import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from "react-native";

export default function EscalaMaltrato({ setScreen }) {
    const preguntas = [
    "¿Le han golpeado?",
    "¿Le han dado puñetazos o patadas?",
    "¿Le han empujado o jalado el pelo?",
    "¿Le han aventado algún objeto?",
    "¿Le han agredido con cuchillo o navaja?",
    "¿Le han humillado o burlado?",
    "¿Le han tratado con indiferencia?",
    "¿Le han aislado de su familia?",
    "¿Le han hecho sentir miedo?",
    "¿No han respetado sus decisiones?",
    "¿Le han prohibido salir o visitas?",
    "¿Le han dejado sin ropa o calzado?",
    "¿Le han dejado sin medicamentos?",
    "¿Le han negado protección?",
    "¿Le han negado acceso a su casa?",
    "¿Alguien maneja su dinero sin permiso?",
    "¿Le han quitado dinero?",
    "¿Le han tomado bienes sin permiso?",
    "¿Le han vendido propiedad sin consentimiento?",
    "¿Lo han presionado para firmar documentos?",
    "¿Le han exigido relaciones sexuales?",
    "¿Le han tocado sin consentimiento?",
    ];

    const [respuestas, setRespuestas] = useState({});

    const seleccionar = (preguntaIndex, columna, valor) => {
    setRespuestas({
        ...respuestas,
        [preguntaIndex]: {
        ...respuestas[preguntaIndex],
        [columna]: valor,
        },
    });
    };

    const calcularTotal = () => {
    let total = 0;
    Object.values(respuestas).forEach((r) => {
        if (r?.A === 1) total++;
    });
    return total;
    };

    const columnasA = [
    { label: "No", value: 0 },
    { label: "Sí", value: 1 },
    ];

const columnasB = [
    { label: "1 vez", value: 1 },
    { label: "2-3 veces", value: 2 },
    { label: "Muchas", value: 3 },
];

const columnasC = [
    { label: "≤1 año", value: 1 },
    { label: ">1 año", value: 2 },
];

const columnasE = [
    { label: "H", value: 1 },
    { label: "M", value: 2 },
];

return (
    <ScrollView horizontal>
    <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Escala Geriátrica de Maltrato</Text>

        {/* Encabezado */}
        <View style={styles.headerRow}>
        <Text style={styles.headerPregunta}>Pregunta</Text>
        <Text style={styles.header}>A</Text>
        <Text style={styles.header}>B</Text>
        <Text style={styles.header}>C</Text>
        <Text style={styles.header}>D</Text>
        <Text style={styles.header}>E</Text>
        </View>

        {preguntas.map((pregunta, index) => (
        <View key={index} style={styles.row}>
            <Text style={styles.pregunta}>
            {index + 1}. {pregunta}
            </Text>

            {/* A */}
            <View style={styles.col}>
            {columnasA.map((op, i) => (
                <TouchableOpacity
                key={i}
                style={[
                    styles.option,
                    respuestas[index]?.A === op.value && styles.selected,
                ]}
                onPress={() => seleccionar(index, "A", op.value)}
                >
                <Text>{op.label}</Text>
                </TouchableOpacity>
            ))}
            </View>

            {/* B */}
            <View style={styles.col}>
            {columnasB.map((op, i) => (
                <TouchableOpacity
                key={i}
                style={[
                    styles.option,
                    respuestas[index]?.B === op.value && styles.selected,
                ]}
                onPress={() => seleccionar(index, "B", op.value)}
                >
                <Text>{op.label}</Text>
                </TouchableOpacity>
            ))}
            </View>

            {/* C */}
            <View style={styles.col}>
            {columnasC.map((op, i) => (
                <TouchableOpacity
                key={i}
                style={[
                    styles.option,
                    respuestas[index]?.C === op.value && styles.selected,
                ]}
                onPress={() => seleccionar(index, "C", op.value)}
                >
                <Text>{op.label}</Text>
                </TouchableOpacity>
            ))}
            </View>

            {/* D - Parentesco editable */}
            <View style={styles.col}>
            <TextInput
                style={styles.inputParentesco}
                placeholder="Parentesco"
                value={respuestas[index]?.D || ""}
                onChangeText={(text) =>
                seleccionar(index, "D", text)
                }
            />
            </View>

            {/* E */}
            <View style={styles.col}>
            {columnasE.map((op, i) => (
                <TouchableOpacity
                key={i}
                style={[
                    styles.option,
                    respuestas[index]?.E === op.value && styles.selected,
                ]}
                onPress={() => seleccionar(index, "E", op.value)}
                >
                <Text>{op.label}</Text>
                </TouchableOpacity>
            ))}
            </View>
        </View>
        ))}

        <Text style={styles.total}>
        Total (A = Sí): {calcularTotal()} / 22
        </Text>

        <TouchableOpacity
        style={styles.button}
        onPress={() => setScreen("Resumen")}
        >
        <Text style={styles.buttonText}>
            Finalizar Evaluación
        </Text>
        </TouchableOpacity>
    </ScrollView>
    </ScrollView>
);
}

const styles = StyleSheet.create({
container: {
    padding: 20,
},
title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
},
headerRow: {
    flexDirection: "row",
    marginBottom: 10,
},
headerPregunta: {
    width: 250,
    fontWeight: "bold",
},
header: {
    width: 120,
    fontWeight: "bold",
    textAlign: "center",
},
row: {
    flexDirection: "row",
    marginBottom: 15,
},
pregunta: {
    width: 250,
},
col: {
    width: 120,
    alignItems: "center",
},
option: {
    padding: 6,
    marginVertical: 2,
    backgroundColor: "#eee",
    borderRadius: 5,
    width: 100,
    alignItems: "center",
},
selected: {
    backgroundColor: "#90caf9",
},
inputParentesco: {
    backgroundColor: "#f2f2f2",
    borderRadius: 5,
    padding: 6,
    width: 100,
    fontSize: 12,
},
total: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
},
button: {
    backgroundColor: "#1565C0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
},
buttonText: {
    color: "white",
    fontWeight: "bold",
},
});
