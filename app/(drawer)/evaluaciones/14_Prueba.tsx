import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Image, PanResponder, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

//===============================================================================
let cImagenes: number = 7;
let cAciertos: number = 0;
let cFallos: number = 0;
//===============================================================================
const ImagenRota = ({ imagenActual }: { imagenActual: number }) => {
  const getImagen = () => {
    switch (imagenActual) {
      case 1:
        return require("@/assets/images/ELeft.png");
      case 2:
        return require("@/assets/images/ERight.png");
      case 3:
        return require("@/assets/images/ETop.png");
      case 4:
        return require("@/assets/images/EBottom.png");
      default:
        return require("@/assets/images/ELeft.png");
    }
  };
  return <Image style={styles.imagen} source={getImagen()} />;
};
//===============================================================================

const Prueba = () => {
  //==================== ESTADO Y REFERENCIAS
  const [imagenActual, setImagenActual] = useState(() => {
    return Math.floor(Math.random() * 4) + 1;
  });

  const router = useRouter();
  const params = useLocalSearchParams();

  const imagenActualRef = useRef(imagenActual);

  // Actualizar la referencia cuando cambia imagenActual
  useEffect(() => {
    imagenActualRef.current = imagenActual;
  }, [imagenActual]);

  //==================== FUNCIÓN PARA CAMBIAR IMAGEN
  const cambiarImagen = () => {
    const nuevoNumero = Math.floor(Math.random() * 4) + 1;
    setImagenActual(nuevoNumero);
  };

  //==================== PANRESPONDER
  const PanImagen = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderRelease: (evt, gestureState) => {
        // Verificar si la prueba terminó
        if (cImagenes <= 0) {
          console.log("PRUEBA FINALIZADA");
          console.log(
            "RESULTADOS FINALES - Aciertos:",
            cAciertos,
            "Fallos:",
            cFallos,
          );

          // Enviar los datos a Resultado usando /Resultado (ruta simple)
          router.push({
            pathname: "/(drawer)/evaluaciones/14_Resultado",
            params: {
              aciertos: cAciertos,
              fallos: cFallos,
              total: 7,
              pacienteId: params.pacienteId,
              pacienteNombre: params.pacienteNombre,
              idEvaluacion: params.idEvaluacion
            },
          });

          // Resetear variables para la próxima prueba
          cImagenes = 7;
          cAciertos = 0;
          cFallos = 0;

          return; // Salir de la función
        }

        // Si la prueba no ha terminado, procesar el swipe
        const umbral = 30;
        const dy = Math.abs(gestureState.dy);
        const dx = Math.abs(gestureState.dx);

        // USAR LA REFERENCIA en lugar del estado directo
        const imagenQueSeVe = imagenActualRef.current;

        // Determinar dirección
        if (dy > umbral && dy >= dx) {
          // SWIPE VERTICAL
          if (gestureState.dy < 0) {
            console.log("swipe ARRIBA");
            if (imagenQueSeVe === 3) {
              cAciertos++;
              console.log("ACIERTO");
            } else {
              cFallos++;
              console.log("FALLO");
            }
          } else {
            console.log("swipe ABAJO");
            if (imagenQueSeVe === 4) {
              cAciertos++;
              console.log("ACIERTO");
            } else {
              cFallos++;
              console.log("FALLO");
            }
          }
          cImagenes--;
          cambiarImagen();
        } else if (dx > umbral) {
          // SWIPE HORIZONTAL
          if (gestureState.dx < 0) {
            console.log("swipe IZQUIERDA");
            if (imagenQueSeVe === 1) {
              cAciertos++;
              console.log("ACIERTO");
            } else {
              cFallos++;
              console.log("FALLO");
            }
          } else {
            console.log("swipe DERECHA");
            if (imagenQueSeVe === 2) {
              cAciertos++;
              console.log("ACIERTO");
            } else {
              cFallos++;
              console.log("FALLO");
            }
          }
          cImagenes--;
          cambiarImagen();
        }

        console.log(
          "ESTADISTICA ACTUAL - Aciertos:",
          cAciertos,
          "Fallos:",
          cFallos,
          "Restantes:",
          cImagenes,
        );
      },
    }),
  ).current;

  //==================== RENDER
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.swipeArea} {...PanImagen.panHandlers}>
          <ImagenRota imagenActual={imagenActual} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

//===============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swipeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagen: {
    width: 300,
    height: 300,
  },
});

export default Prueba;
