import React from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";

export default function Lawton() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>1) Capacidad para usar teléfono</Text>
      <View style={styles.row}>
        <Text style={styles.parrafo}>
          Sí: Lo opera por iniciativa propia, lo marca sin problemas.{"\n"}
          Sí: Marca sólo unos cuantos números bien conocidos.{"\n"}
          Sí: Contesta el teléfono pero no llama.{"\n"}
          No: No usa el teléfono.
        </Text>
        <View style={styles.checkboxRow}>
          <View style={styles.checkboxItem}>
            <Text>Sí</Text>
            <BouncyCheckbox onPress={(isChecked: boolean) => {}} />
          </View>
          <View style={styles.checkboxItem}>
            <Text>No</Text>
            <BouncyCheckbox onPress={(isChecked: boolean) => {}} />
          </View>
        </View>
      </View>
      <View style={styles.separador} />

      <Text style={styles.titulo}>2) Transporte</Text>
      <View style={styles.row}>
        <Text style={styles.parrafo}>
          Sí: Se transporta solo/a.{"\n"}
          Sí: Se transporta solo/a, únicamente en taxi pero no puede usar otros
          recursos.{"\n"}
          Sí: Viaja en transporte colectivo acompañado.{"\n"}
          No: Viaja en taxi o auto acompañado.{"\n"}
          No: No sale.
        </Text>
        <View style={styles.checkboxRow}>
          <View style={styles.checkboxItem}>
            <Text>Sí</Text>
            <BouncyCheckbox onPress={(isChecked: boolean) => {}} />
          </View>
          <View style={styles.checkboxItem}>
            <Text>No</Text>
            <BouncyCheckbox onPress={(isChecked: boolean) => {}} />
          </View>
        </View>
      </View>
      <View style={styles.separador} />

      <Text style={styles.titulo}>3) Medicación</Text>
      <View style={styles.row}>
        <Text style={styles.parrafo}>
          Sí: Es capaz de tomarla a su hora y dosis correctas.{"\n"}
          Sí: Se hace responsable sólo si le preparan por adelantado.{"\n"}
          No: Es incapaz de hacerse cargo.
        </Text>
        <View style={styles.checkboxRow}>
          <View style={styles.checkboxItem}>
            <Text>Sí</Text>
            <BouncyCheckbox onPress={(isChecked: boolean) => {}} />
          </View>
          <View style={styles.checkboxItem}>
            <Text>No</Text>
            <BouncyCheckbox onPress={(isChecked: boolean) => {}} />
          </View>
        </View>
      </View>
      <View style={styles.separador} />

      <Text style={styles.titulo}>4) Finanzas</Text>
      <View style={styles.row}>
        <Text style={styles.parrafo}>
          Sí: Maneja sus asuntos independientemente.{"\n"}
          No: Sólo puede manejar lo necesario para pequeñas compras.{"\n"}
          No: Es incapaz de manejar dinero.
        </Text>
        <View style={styles.checkboxRow}>
          <View style={styles.checkboxItem}>
            <Text>Sí</Text>
            <BouncyCheckbox onPress={(isChecked: boolean) => {}} />
          </View>
          <View style={styles.checkboxItem}>
            <Text>No</Text>
            <BouncyCheckbox onPress={(isChecked: boolean) => {}} />
          </View>
        </View>
      </View>
      <View style={styles.separador} />

      <Text style={styles.titulo}>5) Compras</Text>
      <View style={styles.row}>
        <Text style={styles.parrafo}>
          Sí: Vigila sus necesidades independientemente.{"\n"}
          Sí: Hace independientemente sólo pequeñas compras.{"\n"}
          No: Necesita compañía para cualquier compra.{"\n"}
          No: Incapaz de cualquier compra.
        </Text>
        <View style={styles.checkboxRow}>
          <View style={styles.checkboxItem}>
            <Text>Sí</Text>
            <BouncyCheckbox onPress={(isChecked: boolean) => {}} />
          </View>
          <View style={styles.checkboxItem}>
            <Text>No</Text>
            <BouncyCheckbox onPress={(isChecked: boolean) => {}} />
          </View>
        </View>
      </View>
      <View style={styles.separador} />

      <Text style={styles.titulo}>6) Cocina</Text>
      <View style={styles.row}>
        <Text style={styles.parrafo}>
          Sí: Planea, prepara y sirve los alimentos correctamente.{"\n"}
          No: Prepara los alimentos sólo si se le provee lo necesario.{"\n"}
          No: Calienta, sirve y prepara pero no lleva una dieta adecuada.{"\n"}
          No: Necesita que le preparen los alimentos.
        </Text>
        <View style={styles.checkboxRow}>
          <View style={styles.checkboxItem}>
            <Text>Sí</Text>
            <BouncyCheckbox onPress={(isChecked: boolean) => {}} />
          </View>
          <View style={styles.checkboxItem}>
            <Text>No</Text>
            <BouncyCheckbox onPress={(isChecked: boolean) => {}} />
          </View>
        </View>
      </View>
      <View style={styles.separador} />

      <Text style={styles.titulo}>7) Cuidado del hogar</Text>
      <View style={styles.row}>
        <Text style={styles.parrafo}>
          Sí: Mantiene la casa solo o con ayuda mínima.{"\n"}
          Sí: Efectúa diariamente trabajo ligero eficientemente.{"\n"}
          Sí: Efectúa diariamente trabajo ligero sin eficiencia.{"\n"}
          No: Necesita ayuda en todas las actividades.{"\n"}
          No: No participa.
        </Text>
        <View style={styles.checkboxRow}>
          <View style={styles.checkboxItem}>
            <Text>Sí</Text>
            <BouncyCheckbox onPress={(isChecked: boolean) => {}} />
          </View>
          <View style={styles.checkboxItem}>
            <Text>No</Text>
            <BouncyCheckbox onPress={(isChecked: boolean) => {}} />
          </View>
        </View>
      </View>
      <View style={styles.separador} />

      <Text style={styles.titulo}>8) Lavandería</Text>
      <View style={styles.row}>
        <Text style={styles.parrafo}>
          Sí: Se ocupa de su ropa independientemente.{"\n"}
          Sí: Lava sólo pequeñas cosas.{"\n"}
          No: Todos se lo tienen que lavar.
        </Text>
        <View style={styles.checkboxRow}>
          <View style={styles.checkboxItem}>
            <Text>Sí</Text>
            <BouncyCheckbox onPress={(isChecked: boolean) => {}} />
          </View>
          <View style={styles.checkboxItem}>
            <Text>No</Text>
            <BouncyCheckbox onPress={(isChecked: boolean) => {}} />
          </View>
        </View>
      </View>
      <Button title="Regresar" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  parrafo: {
    fontSize: 16,
    flex: 1,
    flexWrap: "wrap",
  },
  checkboxRow: {
    flexDirection: "row",
    alignSelf: "center",
    marginLeft: 10,
  },
  checkboxItem: {
    alignItems: "center",
    marginLeft: 10,
    width: 40,
  },
  separador: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginVertical: 15,
  },
});
