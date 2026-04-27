import { useLocalSearchParams, useRouter } from 'expo-router';
import { Gyroscope } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Button,
    ScrollView,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { guardarRegistroEvaluacion } from '../../../services/firebaseEvaluaciones';

const FluenciaVerbalAnimales = () => {
    const TIEMPO_TOTAL = 60;
    const router = useRouter();

    const { pacienteId = "", pacienteNombre = "", idEvaluacion = "02_fluencia_verbal" } = useLocalSearchParams<{
        pacienteId: string;
        pacienteNombre: string;
        idEvaluacion: string;
    }>();

    const [fase, setFase] = useState<'inicio' | 'instrucciones' | 'prueba' | 'resultados'>('inicio');
    const [segundos, setSegundos] = useState(TIEMPO_TOTAL);
    const [texto, setTexto] = useState('');
    const [animales, setAnimales] = useState<string[]>([]);
    const [timerActivo, setTimerActivo] = useState(false);
    const [ignorarMayusculas] = useState(true);
    const [guardado, setGuardado] = useState(false);

    //Temporizador
    useEffect(() => {
        let intervalo: ReturnType<typeof setInterval> | null = null;

        if (timerActivo && segundos > 0) {
            intervalo = setInterval(() => {
                setSegundos((prev) => prev - 1);
            }, 1000);
        } else if (timerActivo && segundos === 0) {
            finalizarPrueba();
        }

        return () => {
            if (intervalo) clearInterval(intervalo);
        };
    }, [timerActivo, segundos]);


    // SENSOR GIROSCOPIO
    const finalizarRef = React.useRef(finalizarPrueba);
    useEffect(() => {
        finalizarRef.current = finalizarPrueba;
    });

    useEffect(() => {
        let subscription: ReturnType<typeof Gyroscope.addListener> | undefined;

        if (fase === 'prueba') {
            subscription = Gyroscope.addListener((data) => {

                const { x, y, z } = data;
                const rotacion = Math.abs(x) + Math.abs(y) + Math.abs(z);

                if (rotacion > 5) {
                    finalizarRef.current();
                }

            });

            Gyroscope.setUpdateInterval(300);
        }

        return () => {
            if (subscription) subscription.remove();
        };
    }, [fase]);

    function iniciarPrueba() {
        setFase('instrucciones');
        setSegundos(TIEMPO_TOTAL);
        setTexto('');
        setAnimales([]);
        setTimerActivo(false); // No empezar el temporizador todavía, hasta dar 'Entendido'
    }

    function finalizarPrueba() {
        setTimerActivo(false);

        let palabras = texto
            .split('\n')
            .map((w) => w.trim())
            .filter((w) => w.length > 1);

        //Eliminar duplicados
        if (ignorarMayusculas) {
            const mapa = new Map<string, string>();
            palabras.forEach((w) => {
                const clave = w.toLowerCase();
                if (!mapa.has(clave)) mapa.set(clave, w);
            });
            palabras = Array.from(mapa.values());
        } else {
            palabras = [...new Set(palabras)];
        }

        setAnimales(palabras);
        setFase('resultados');
    }

    function reiniciar() {
        setTimerActivo(false);
        setFase('inicio');
        setTexto('');
        setAnimales([]);
        setSegundos(TIEMPO_TOTAL);
        setGuardado(false);
    }

    async function guardarResultado() {
        if (guardado) return;
        try {
            await guardarRegistroEvaluacion({
                idPaciente: pacienteId,
                idEvaluacion: idEvaluacion,
                fecha: new Date().toISOString().split('T')[0],
                puntaje: animales.length,
            });
            setGuardado(true);
            Alert.alert(
                'Resultado guardado',
                `Paciente: ${pacienteNombre}\nAnimales válidos: ${animales.length}`,
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch {
            Alert.alert('Error', 'No se pudo guardar el resultado. Verifique su conexión.');
        }
    }

    if (fase === 'inicio') {
        return (
            <View style={styles.container}>
                <Text style={styles.titulo}>Fluidez Verbal - Animales</Text>

                <View style={styles.botonContenedor}>
                    <Button title="Comenzar prueba" onPress={iniciarPrueba} color="#2980b9" />
                </View>

                <View style={styles.botonContenedor}>
                    <Button title="Reiniciar" onPress={reiniciar} color="#7f8c8d" />
                </View>
            </View>
        );
    }

    if (fase === 'instrucciones') {
        return (
            <ScrollView style={styles.container}>
                <Text style={styles.titulo}>Instrucciones</Text>

                <Text style={styles.textoInstruccion}>
                    Quiero que nombre palabras que pertenecen a la categoría "animales".
                </Text>

                <Text style={styles.textoInstruccion}>
                    Piense en cualquier animal que viva en el aire, en el agua, en el bosque... todas las clases de animales.
                </Text>

                <Text style={styles.textoInstruccion}>
                    Diga todos los animales que pueda. Tiene un minuto para hacerlo.
                </Text>

                <Text style={styles.nota}>
                    Se permiten: animales extintos, imaginarios o mágicos.{"\n"}
                    NO se cuentan: repeticiones, nombres propios, variaciones, palabras inválidas.
                </Text>

                <View style={styles.botonContenedor}>
                    <Button
                        title="Entendido → Iniciar"
                        onPress={() => {
                            setFase('prueba');
                            setSegundos(TIEMPO_TOTAL);
                            setTexto('');
                            setAnimales([]);
                            setTimerActivo(true);
                        }}

                        color="#27ae60"
                    />
                </View>
            </ScrollView>
        );
    }

    if (fase === 'prueba') {
        return (
            <View style={styles.container}>
                <Text style={styles.temporizador}>
                    {Math.floor(segundos / 60).toString().padStart(2, '0')}:
                    {(segundos % 60).toString().padStart(2, '0')}
                </Text>

                <Text style={styles.leyendaTemporizador}>Tiempo restante</Text>

                <Text style={{ textAlign: "center", color: "#7f8c8d", marginBottom: 10 }}>
                    Voltee el teléfono para terminar la prueba
                </Text>

                <Text style={styles.instruccionActiva}>
                    ¡Escriba todos los animales que pueda!
                </Text>

                <TextInput
                    style={styles.inputMultilinea}
                    multiline
                    numberOfLines={10}
                    placeholder="Un animal por línea..."
                    value={texto}
                    onChangeText={setTexto}
                    autoFocus={true}
                    textAlignVertical="top"
                />

                <View style={styles.botonContenedor}>
                    <Button title="Terminar ahora" onPress={finalizarPrueba} color="#e74c3c" />
                </View>
            </View>
        );
    }

    if (fase === 'resultados') {
        const secciones = [
            {
                title: 'Animales válidos',
                data: animales,
            },
        ];

        return (
            <View style={styles.container}>
                <Text style={styles.titulo}>Resultados</Text>

                {pacienteNombre !== '' && (
                    <View style={styles.pacienteBanner}>
                        <Text style={styles.pacienteBannerText}>👤 {pacienteNombre}</Text>
                    </View>
                )}

                <View style={styles.cajaResultado}>
                    <Text style={styles.total}>
                        {animales.length} animales válidos
                    </Text>
                    <Text style={styles.subtotal}>
                        (en 60 segundos, sin repeticiones)
                    </Text>
                    <Text style={styles.subtotal}>
                        {animales.length >= 10 ? 'Normal' : 'Deterioro cognitivo sugerido'}
                    </Text>
                </View>

                {animales.length === 0 ? (
                    <Text style={styles.textoVacio}>No se registraron animales válidos</Text>
                ) : (
                    <SectionList
                        sections={secciones}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Text style={styles.item}>• {item}</Text>
                        )}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text style={styles.headerSeccion}>{title}</Text>
                        )}
                        style={styles.lista}
                    />
                )}

                <View style={styles.botonContenedor}>
                    <Button
                        title={guardado ? '✓ Resultado guardado' : 'Guardar resultado'}
                        onPress={guardarResultado}
                        color={guardado ? '#27ae60' : '#8e44ad'}
                        disabled={guardado}
                    />
                </View>

                <View style={styles.botonContenedor}>
                    <Button title="Nueva prueba" onPress={reiniciar} color="#2980b9" />
                </View>

                <Text style={styles.notaFinal}>
                    Consultar tablas normativas según edad y escolaridad.
                </Text>
            </View>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fbfc',
        padding: 20,
    },
    pacienteBanner: {
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    pacienteBannerText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E40AF',
        textAlign: 'center',
    },
    titulo: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 16,
        color: '#2c3e50',
    },
    textoInstruccion: {
        fontSize: 17,
        lineHeight: 26,
        marginVertical: 8,
        color: '#34495e',
    },
    nota: {
        fontSize: 15,
        fontStyle: 'italic',
        color: '#7f8c8d',
        marginVertical: 16,
        padding: 10,
        backgroundColor: '#ecf0f1',
        borderRadius: 8,
    },
    botonContenedor: {
        marginVertical: 10,
        paddingHorizontal: 20,
    },
    temporizador: {
        fontSize: 64,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#c0392b',
        marginTop: 30,
    },
    leyendaTemporizador: {
        fontSize: 16,
        textAlign: 'center',
        color: '#95a5a6',
        marginBottom: 20,
    },
    instruccionActiva: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#27ae60',
        marginBottom: 16,
    },
    inputMultilinea: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#bdc3c7',
        borderRadius: 8,
        padding: 12,
        fontSize: 17,
        minHeight: 160,
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    opcionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 12,
        paddingHorizontal: 8,
    },
    cajaResultado: {
        backgroundColor: '#ecf0f1',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 20,
    },
    total: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    subtotal: {
        fontSize: 15,
        color: '#7f8c8d',
        marginTop: 6,
    },
    lista: {
        flexGrow: 0,
        marginVertical: 10,
    },
    headerSeccion: {
        fontSize: 18,
        fontWeight: 'bold',
        backgroundColor: '#bdc3c7',
        padding: 8,
        color: 'white',
    },
    item: {
        fontSize: 17,
        paddingVertical: 6,
        paddingHorizontal: 12,
        color: '#2c3e50',
    },
    textoVacio: {
        fontSize: 18,
        color: '#e74c3c',
        textAlign: 'center',
        marginVertical: 40,
    },
    notaFinal: {
        fontSize: 14,
        color: '#95a5a6',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default FluenciaVerbalAnimales;
