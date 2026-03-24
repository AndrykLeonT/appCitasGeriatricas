import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";

type KatzAnswers = {
  bath: "si" | "no" | null;
  dress: "si" | "no" | null;
  toilet: "si" | "no" | null;
  transfer: "si" | "no" | null;
  continence: "si" | "no" | null;
  feeding: "si" | "no" | null;
};

export default function KatzIndex() {
  const router = useRouter();
  const [answers, setAnswers] = useState<KatzAnswers>({
    bath: null,
    dress: null,
    toilet: null,
    transfer: null,
    continence: null,
    feeding: null,
  });
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: "#fff",
      }}
    >
      <Text
        style={{
          fontFamily: "Signika_700Bold",
          fontSize: 22,
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Indice de Katz
      </Text>

      {/* First Question */}
      <View>
        <Text style={{ fontFamily: "Signika_700Bold", fontSize: 18 }}>
          1) Baño (Esponja, regadera o tina).
        </Text>
        <View
          style={{
            flexDirection: "row",
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 5,
          }}
        >
          <View style={{ flex: 3, paddingRight: 10 }}>
            <Text style={{ fontFamily: "Signika_400Regular" }}>
              Sí: No recibe asistencia (puede entra y salir de la tina u otra
              forma de baño).{"\n"}
              Sí: Que reciba asistencia durante el baño en una sola parte del
              cuerpo (ej. espalda o pierna).{"\n"}
              No: Que reciba asistencia durante el baño en más de una parte.
            </Text>
          </View>
          <View
            style={{
              width: 100,
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Text style={{ marginBottom: 4, marginRight: 14 }}>Sí</Text>
              <BouncyCheckbox
                isChecked={answers.bath === "si"}
                onPress={() => setAnswers((prev) => ({ ...prev, bath: "si" }))}
              />
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ marginBottom: 4, marginRight: 14 }}>No</Text>
              <BouncyCheckbox
                isChecked={answers.bath === "no"}
                onPress={() => setAnswers((prev) => ({ ...prev, bath: "no" }))}
              />
            </View>
          </View>
        </View>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: "#ccc",
          marginVertical: 15,
        }}
      />

      {/* Second Question*/}
      <View>
        <Text style={{ fontFamily: "Signika_700Bold", fontSize: 18 }}>
          2) Vestido.
        </Text>
        <View
          style={{
            flexDirection: "row",
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 5,
          }}
        >
          <View style={{ flex: 3 }}>
            <Text style={{ fontFamily: "Signika_400Regular" }}>
              Sí: Que pueda tomar las prendas y vestirse completamente, sin
              asistencia.{"\n"}
              Sí: Que pueda tomar las prendas y vestirse sis asistencia excepto
              en abrocharse los zapatos.{"\n"}
              No: Que reciba asistencia para tomar las prendas y vestirse.
            </Text>
          </View>
          <View
            style={{
              width: 100,
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Text style={{ marginBottom: 4, marginRight: 14 }}>Sí</Text>
              <BouncyCheckbox
                isChecked={answers.dress === "si"}
                onPress={() => setAnswers((prev) => ({ ...prev, dress: "si" }))}
              />
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ marginBottom: 4, marginRight: 14 }}>No</Text>
              <BouncyCheckbox
                isChecked={answers.dress === "no"}
                onPress={() => setAnswers((prev) => ({ ...prev, dress: "no" }))}
              />
            </View>
          </View>
        </View>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: "#ccc",
          marginVertical: 15,
        }}
      />

      {/* Third Question*/}
      <View>
        <Text style={{ fontFamily: "Signika_700Bold", fontSize: 18 }}>
          3) Uso del Sanitario.
        </Text>
        <View
          style={{
            flexDirection: "row",
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 5,
          }}
        >
          <View style={{ flex: 3 }}>
            <Text style={{ fontFamily: "Signika_400Regular" }}>
              Sí: Sin ninguna asistencia (puede utilizar algún objeto de soporte
              como bastón o silla de ruedas y/o que pueda arreglar su ropa o el
              uso de pañal i cómodo).{"\n"}
              Sí: Que reciba asistencia al ir al baño, en limpiarse y que pueda
              manejar por si mismo/a el pañal o cómodo vaciándolo{"\n"}
              No: Que no vaya al baño por si mismo/a.
            </Text>
          </View>
          <View
            style={{
              width: 100,
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Text style={{ marginBottom: 4, marginRight: 14 }}>Sí</Text>
              <BouncyCheckbox
                isChecked={answers.toilet === "si"}
                onPress={() =>
                  setAnswers((prev) => ({ ...prev, toilet: "si" }))
                }
              />
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ marginBottom: 4, marginRight: 14 }}>No</Text>
              <BouncyCheckbox
                isChecked={answers.toilet === "no"}
                onPress={() =>
                  setAnswers((prev) => ({ ...prev, toilet: "no" }))
                }
              />
            </View>
          </View>
        </View>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: "#ccc",
          marginVertical: 15,
        }}
      />

      {/* Fourth Question*/}
      <View>
        <Text style={{ fontFamily: "Signika_700Bold", fontSize: 18 }}>
          4) Transferencias.
        </Text>
        <View
          style={{
            flexDirection: "row",
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 5,
          }}
        >
          <View style={{ flex: 3 }}>
            <Text style={{ fontFamily: "Signika_400Regular" }}>
              Sí: Que se mueva dentro y fuera de la cama y silla sin ninguna
              asistencia (puede estar utilizando un auxiliar de la marcha u
              objeto de soporte).{"\n"}
              Sí: Que pueva moverse dentro y fuera de la cama y silla con
              asistencia.{"\n"}
              No: Que no pueda salir de la cama.
            </Text>
          </View>
          <View
            style={{
              width: 100,
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Text style={{ marginBottom: 4, marginRight: 14 }}>Sí</Text>
              <BouncyCheckbox
                isChecked={answers.transfer === "si"}
                onPress={() =>
                  setAnswers((prev) => ({ ...prev, transfer: "si" }))
                }
              />
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ marginBottom: 4, marginRight: 14 }}>No</Text>
              <BouncyCheckbox
                isChecked={answers.transfer === "no"}
                onPress={() =>
                  setAnswers((prev) => ({ ...prev, transfer: "no" }))
                }
              />
            </View>
          </View>
        </View>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: "#ccc",
          marginVertical: 15,
        }}
      />

      {/* Fifth Question*/}
      <View>
        <Text style={{ fontFamily: "Signika_700Bold", fontSize: 18 }}>
          5) Continencia.
        </Text>
        <View
          style={{
            flexDirection: "row",
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 5,
          }}
        >
          <View style={{ flex: 3 }}>
            <Text style={{ fontFamily: "Signika_400Regular" }}>
              Sí: Control total de esfínteres.{"\n"}
              Sí: Que tenga accidentes ocasionales que no afectan su vida
              social.{"\n"}
              No: Necesita ayuda para supervición de control de esfínteres,
              utiliza sonda o es incontinente.
            </Text>
          </View>
          <View
            style={{
              width: 100,
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Text style={{ marginBottom: 4, marginRight: 14 }}>Sí</Text>
              <BouncyCheckbox
                isChecked={answers.continence === "si"}
                onPress={() =>
                  setAnswers((prev) => ({ ...prev, continence: "si" }))
                }
              />
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ marginBottom: 4, marginRight: 14 }}>No</Text>
              <BouncyCheckbox
                isChecked={answers.continence === "no"}
                onPress={() =>
                  setAnswers((prev) => ({ ...prev, continence: "no" }))
                }
              />
            </View>
          </View>
        </View>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: "#ccc",
          marginVertical: 15,
        }}
      />

      {/* Sixth Question*/}
      <View>
        <Text style={{ fontFamily: "Signika_700Bold", fontSize: 18 }}>
          6) Alimentación.
        </Text>
        <View
          style={{
            flexDirection: "row",
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 5,
          }}
        >
          <View style={{ flex: 3 }}>
            <Text style={{ fontFamily: "Signika_400Regular" }}>
              Sí: Que se alimente por si solo sin asistencia alguna.{"\n"}
              Sí: Que se alimente solo y que tenga asistencia sólo para cortar
              la carne o untar mantequilla.{"\n"}
              No: Que reciba asistencia en la alimentación o que se alimente
              parcial o totalmente por vía enteral o parenteral.
            </Text>
          </View>
          <View
            style={{
              width: 100,
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Text style={{ marginBottom: 4, marginRight: 14 }}>Sí</Text>
              <BouncyCheckbox
                isChecked={answers.feeding === "si"}
                onPress={() =>
                  setAnswers((prev) => ({ ...prev, feeding: "si" }))
                }
              />
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ marginBottom: 4, marginRight: 14 }}>No</Text>
              <BouncyCheckbox
                isChecked={answers.feeding === "no"}
                onPress={() =>
                  setAnswers((prev) => ({ ...prev, feeding: "no" }))
                }
              />
            </View>
          </View>
        </View>
      </View>

      <Pressable
        onPress={() => router.replace("/")}
        style={{
          backgroundColor: "#e1a9ff",
          padding: 15,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <Text
          style={{
            fontFamily: "Signika_700Bold",
            textAlign: "center",
            fontSize: 16,
          }}
        >
          Guardar Prueba
        </Text>
      </Pressable>
    </ScrollView>
  );
}
