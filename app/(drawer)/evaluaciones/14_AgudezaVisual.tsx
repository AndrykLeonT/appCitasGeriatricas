import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, } from 'react-native-safe-area-context';
//===============================================================================
const Formulario = () => {


    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    const verificacion = () => {
        if (isEnabled) {
            router.push('/(drawer)/evaluaciones/14_Prueba')
        } else {
            alert('Por favor, verifica que la E tenga las dimensiones correctas antes de continuar.')
        }
    }


    const router = useRouter();

    return (
        <SafeAreaProvider>
            <SafeAreaView> {/*Necesario para asegurar que el contenido no se superponga con áreas no seguras del dispositivo*/}
                {/* Aqui va el contenido del formulario */}
                <View style={{ height: 20 }} />

                <Text style={styles.title}> Agudeza Visual </Text>
                <Text style={styles.SegundoTitulo}>Clinica Geriatrica </Text>
                <Text style={styles.textoParrafo}>Usando una regla, verifique el ancho y largo de la E. Para que la prueba sea valida, la E debe medir 2.5 cm de ancho y 2.5 cm de largo. Si la E no tiene estas dimensiones, es posible que los resultados de la prueba no sean precisos. </Text>

                <Text style={styles.textoParrafoVerificacion}>He verificado que la E mide 2.5 cm de ancho y 2.5 cm de largo.</Text>

                <Switch
                    trackColor={{ false: '#767577', true: '#ff81ee' }}
                    thumbColor={isEnabled ? '#f54b7e' : '#f4f3f4'}
                    ios_backgroundColor="#cc23b5"
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                />

                <Image
                    style={{ width: 200, height: 200, alignSelf: 'center', marginTop: 20, marginBottom: 40 }}
                    source={require('@/assets/images/ERight.png')}
                />

                <TouchableOpacity style={styles.Finalizar}
                    onPress={() => verificacion()}
                ><Text style={styles.textoBoton}>Empezar Prueba</Text>
                </TouchableOpacity>


            </SafeAreaView>
        </SafeAreaProvider>
    )
}
const styles = StyleSheet.create({
    title: {
        fontSize: 29,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    SegundoTitulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'purple',
        marginBottom: 20,
        textAlign: 'center',
    },
    textoParrafo: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'justify',
        marginHorizontal: 20,
    }, textoParrafoVerificacion: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'justify',
        marginHorizontal: 20,
        marginRight: 50,
        marginTop: 20,
    },
    textoBoton: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    Finalizar: {
        backgroundColor: 'purple',
        textShadowColor: 'white',
        padding: 10,
        borderRadius: 5,
        paddingBlock: 15,
        marginHorizontal: 15,
        textAlign: 'center',
    },
});

export default Formulario;