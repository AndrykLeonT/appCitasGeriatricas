import SwitchPrueba from "@/components/ui/20_SwitchPrueba";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Text } from "react-native-web";

function Formulario({ navigation }) {
  const [respuestas, setRespuestas] = useState(Array(50).fill(false));
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [fecha, setFecha] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [cantidades, setCantidades] = useState("");

  // Para el DatePicker (opcional)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
    const dia = currentDate.getDate().toString().padStart(2, "0");
    const mes = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const año = currentDate.getFullYear();
    setFecha(`${dia}/${mes}/${año}`);
  };

  useEffect(() => {
    const cantidadSi = respuestas.filter((r) => r).length;
    const cantidadNo = respuestas.length - cantidadSi;

    setCantidades(`Sí: ${cantidadSi}\nNo: ${cantidadNo}`);
  }, [respuestas]);

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleSubmit = () => {
    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      <TextInput
        style={styles.input}
        placeholder="Nombre Completo"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Fecha"
        value={fecha}
        onFocus={showDatepicker}
        showSoftInputOnFocus={false}
      />
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Síntomas"
        multiline={true}
        numberOfLines={4}
        textAlignVertical="top"
        value={sintomas}
        onChangeText={setSintomas}
      />

      {/* <SwitchPrueba texto={"En su hogar existe espacio suficiente para permitir su libre movilidad"}></SwitchPrueba>
      <SwitchPrueba texto={"De acuerdo a su codición de salud, ¿Su vivienda está adaptada para una persona mayor (superficies lisas, pasillos lo suficientemente ancho para -en su caso- el paso de la silla de ruedas, cocinas diseñadas de manera acorde)?"}></SwitchPrueba>
      <SwitchPrueba texto={"¿Considera que su vivienda es la idonea de a cuerdo a su condicion de salud? SOLO EN CASO DE QUE LA RESPUESTA SEA NO CONTESTAR LAS SIGUIENTES DOS PREGUNTAS"}></SwitchPrueba>
      <SwitchPrueba texto={"El equipamiento para modificar su vivienda está disponible"}></SwitchPrueba>
      <SwitchPrueba texto={"Está usted en posibilidades de cambiar a una vivienda mejor adaptada de acuerdo a su condición de salud"}></SwitchPrueba>
      <SwitchPrueba texto={"Cuando usted sale del hogar, considera que puede realizar su traslado sin problemas"}></SwitchPrueba>
      <SwitchPrueba texto={"El camino para los peatones está libre de obstrucciones"}></SwitchPrueba>
      <SwitchPrueba texto={"En su comunidad, las aceras presentan un correcto mantenimiento"}></SwitchPrueba>
      <SwitchPrueba texto={"En su comunidad, las aceras están libre de obstrucciones?"}></SwitchPrueba>
      <SwitchPrueba texto={"Usted considera que las normas y reglas de transito se respetan"}></SwitchPrueba>
      <SwitchPrueba texto={"Los edificios publicos que usted visita son accesibles"}></SwitchPrueba>
      <SwitchPrueba texto={"Usted realiza actividad fisica en la comunidad y/o en el hogar"}></SwitchPrueba>
      <SwitchPrueba texto={"Usted se encuentra interesado en realizar actividad fisica"}></SwitchPrueba>
      <SwitchPrueba texto={"Considera que su situacion de salud le permite realizar actividad fisica"}></SwitchPrueba>
      <SwitchPrueba texto={"En su comunidad se promueve la actividad fisica. EN CASO DE QUE LA RESPUESTA SEA SI CONTESTAR LAS SIGUIENTES DOS PREGUNTAS"}></SwitchPrueba>
      <SwitchPrueba texto={"Considera que las instalaciones para hacer actividad fisica en su comunidad toman en cuenta las preferencias o necesidades de las personas mayores"}></SwitchPrueba>
      <SwitchPrueba texto={"Considera que su comunidad es segura para realizar actividad fisica"}></SwitchPrueba>
      <SwitchPrueba texto={"Considera que el flujo vehicular en su colonia le permite realizar actividad fisica"}></SwitchPrueba>
      <SwitchPrueba texto={"Tiene usted el tiempo para realizar actividad fisica"}></SwitchPrueba>
      <SwitchPrueba texto={"Sabe usted como iniciar un programa seguro de actividad fisica en casa"}></SwitchPrueba>
      <SwitchPrueba texto={"En caso de que la persona mayor labore, realizar la siguiente pregunta: En su lugar de trabajo se promueve la actividad fisica. SI LA RESPUESTA SI PREGUNTAR LO SIGUIENTE"}></SwitchPrueba>
      <SwitchPrueba texto={"Usted realiza actividad fisica en el trabajo"}></SwitchPrueba>
      <SwitchPrueba texto={"Cuando usted ha acudido a consulta, le han prescito realizar actividad fisica"}></SwitchPrueba>
      <SwitchPrueba texto={"Conoce usted los lugares de encuentro que incluyan a personas mayores en su comunidad (centros recreativos, escuelas, bibliotecas, centros comunitarios, parques o jardines)"}></SwitchPrueba>
      <SwitchPrueba texto={"Los sectores publico y privado realizan actividades de participacion para adultos mayores en su comunidad"}></SwitchPrueba>
      <SwitchPrueba texto={"Usted participa en actividades comunitarias (recreacion, actividades fisicas, sociales o espirituales)"}></SwitchPrueba>
      <SwitchPrueba texto={"Considera que la ubicacion es conveniente para usted"}></SwitchPrueba>
      <SwitchPrueba texto={"Considera que el horario es conveniente para usted"}></SwitchPrueba>
      <SwitchPrueba texto={"La admision para participantes es abierta"}></SwitchPrueba>
      <SwitchPrueba texto={"El precio para participar constituye algun problema para usted"}></SwitchPrueba>
      <SwitchPrueba texto={"Conoce usted la gama de actividades que puede realizar su comunidad"}></SwitchPrueba>
      <SwitchPrueba texto={"Tiene interes en llevarlas a cabo"}></SwitchPrueba>
      <SwitchPrueba texto={"Considera usted que las actividades alientan/estimulan la participacion de personas de diferentes edades"}></SwitchPrueba>
      <SwitchPrueba texto={"Las instalaciones de dichos lugares de encuentro promueven el uso compartido para personas de distintas edades"}></SwitchPrueba>
      <SwitchPrueba texto={"Los lugares de encuentro y las actividades locales promueven el acercamiento e intercambio entre los vecinos"}></SwitchPrueba>
      <SwitchPrueba texto={"El transporte publico es accesible en cuanto a precio"}></SwitchPrueba>
      <SwitchPrueba texto={"Considera que el transporte publico es confiable y frecuente"}></SwitchPrueba>
      <SwitchPrueba texto={"Considera que las rutas de transportes son adecuadas de acuerdo a sus necesidades"}></SwitchPrueba>
      <SwitchPrueba texto={"De acuerdo a su condición de salud, considera que los vehiculos son accesibles"}></SwitchPrueba>
      <SwitchPrueba texto={"Considera que las paradas del transporte son adecuadas"}></SwitchPrueba>
      <SwitchPrueba texto={"Considuera usted que la actidud del conductor al manejar es la correcta"}></SwitchPrueba>
      <SwitchPrueba texto={"Considera usted que los camiones en su comunidad presentan buen estado de conservaciones"}></SwitchPrueba>

      <Text>De acuerdo a las respuestas de manera descriptiva identifique el tipo de barreras de la persona mayor en su entorno</Text>

      <SwitchPrueba texto={"Barreras para la movilidad dentro de su domicilio"}></SwitchPrueba>
      <SwitchPrueba texto={"Barreras para la movilidad fuera de su domicilio"}></SwitchPrueba>
      <SwitchPrueba texto={"Barreras para la movilidad en el transporte"}></SwitchPrueba>
      <TextInput placeholder='Otro:'></TextInput>

      <Text>Barreras para la accesibilidad a dispositivos auxiliares</Text>
      <SwitchPrueba texto={"Presencia de barreras"}></SwitchPrueba>
      <SwitchPrueba texto={"Ausencia de barreras"}></SwitchPrueba>

      <Text>Barreras para la realización de actividades de participación social/recreacion</Text>
      <SwitchPrueba texto={"Presencia de barreras"}></SwitchPrueba>
      <SwitchPrueba texto={"Ausencia de barreras"}></SwitchPrueba> */}

      {[
        "En su hogar existe espacio suficiente para permitir su libre movilidad",
        "De acuerdo a su condición de salud, ¿Su vivienda está adaptada para una persona mayor?",
        "¿Considera que su vivienda es la idónea de acuerdo a su condición de salud?",
        "El equipamiento para modificar su vivienda está disponible",
        "Está usted en posibilidades de cambiar a una vivienda mejor adaptada",
        "Cuando usted sale del hogar, considera que puede realizar su traslado sin problemas",
        "El camino para los peatones está libre de obstrucciones",
        "En su comunidad, las aceras presentan un correcto mantenimiento",
        "En su comunidad, las aceras están libres de obstrucciones",
        "Usted considera que las normas y reglas de tránsito se respetan",
        "Los edificios públicos que usted visita son accesibles",
        "Usted realiza actividad física en la comunidad y/o en el hogar",
        "Usted se encuentra interesado en realizar actividad física",
        "Considera que su situación de salud le permite realizar actividad física",
        "En su comunidad se promueve la actividad física",
        "Considera que las instalaciones para hacer actividad física toman en cuenta a personas mayores",
        "Considera que su comunidad es segura para realizar actividad física",
        "Considera que el flujo vehicular le permite realizar actividad física",
        "Tiene usted el tiempo para realizar actividad física",
        "Sabe usted cómo iniciar un programa seguro de actividad física en casa",
        "En su lugar de trabajo se promueve la actividad física",
        "Usted realiza actividad física en el trabajo",
        "Cuando ha acudido a consulta le han prescrito realizar actividad física",
        "Conoce lugares de encuentro para personas mayores en su comunidad",
        "Los sectores público y privado realizan actividades para adultos mayores",
        "Usted participa en actividades comunitarias",
        "Considera que la ubicación es conveniente",
        "Considera que el horario es conveniente",
        "La admisión para participantes es abierta",
        "El precio para participar constituye un problema",
        "Conoce la gama de actividades de su comunidad",
        "Tiene interés en llevarlas a cabo",
        "Las actividades estimulan la participación de diferentes edades",
        "Las instalaciones promueven el uso compartido",
        "Los lugares de encuentro promueven el intercambio entre vecinos",
        "El transporte público es accesible en precio",
        "El transporte público es confiable y frecuente",
        "Las rutas de transporte son adecuadas",
        "Los vehículos son accesibles según su condición de salud",
        "Las paradas del transporte son adecuadas",
        "La actitud del conductor es correcta",
        "Los camiones presentan buen estado de conservación",
        "Barreras para la movilidad dentro de su domicilio",
        "Barreras para la movilidad fuera de su domicilio",
        "Barreras para la movilidad en el transporte",
        "Presencia de barreras (dispositivos auxiliares)",
        "Ausencia de barreras (dispositivos auxiliares)",
        "Presencia de barreras (participación social)",
        "Ausencia de barreras (participación social)",
      ].map((pregunta, index) => (
        <SwitchPrueba
          key={index}
          texto={pregunta}
          value={respuestas[index]}
          onValueChange={(valor) => {
            const nuevas = [...respuestas];
            nuevas[index] = valor;
            setRespuestas(nuevas);
          }}
        />
      ))}

      <Text>{cantidades}</Text>

      <View style={styles.buttonContainer}>
        <Button title="Enviar" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  contentContainer: {
    alignItems: "stretch",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginVertical: 8,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    marginVertical: 8,
  },
});

export default Formulario;
