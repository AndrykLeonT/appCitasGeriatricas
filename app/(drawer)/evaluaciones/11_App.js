import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { Button, DataTable } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const BRADEN_TABLE = [
  {
    criterio: 'Percepción sensoria',
    p1: '1. Completamente limitada: al tener disminuido el nivel de conciercia o estar sedado, el paciente no reacciona ante estimulos dolorosos, quejandose, estremeciendose o agarrandose o capacidad limitada de sentir en la mayor parte del cuerpo',
    p2: '2. Muy limitada: Reacciona solo ante estimulos dolorosos. No puede comunicar su malestar execpto mediante quejidos o agitacion o presenta un deficit sensorial que limita la capacidad de percibir dolor o molestias en mas de la mitad del cuerpo',
    p3: '3. Ligeramente limitada : Reacciona ante ordenes vertebrales pero no siempre puede comunicar sus molestias o la necesidad de que le cambien de posicion o presenta alguna dificultad sensorial que limita su capacidad para sentir dolor o malestar al menos en una de las extremidades.',
    p4: '4 Sin limitaciones: Responde a ordenes verbales. No presenta deficit sensorial que pueda limitar su capacidad de expresar o sentir dolor o malestar',
    riesgo: '1-2 Con riesgo, 3-4 Sin riesgo'
  },
  {
    criterio: 'Exposición a la humedad',
    p1: '1. Completamente humeda: La piel se encuentra constantemente expuesta a la humedad por sudoracion, orina. Se detecta humedad cada vez que se mueve o gira el pacienta.',
    p2: '2. A menudo humeda: La piel esta a menudo pero no siempre humeda. La ropa de cama se ha de cambiar al menos una vez cada turno.',
    p3: '3. Ocasionalmente humeda: La piel esta ocasionalmente humeda requiriendo un cambio suplementario de ropa de cama aproximadamente una vez al dia.',
    p4: '4. Raramente humeda: La piel esta generalmente seca. La ropa de cama se cambia de acuerdo con los intervalos fijados para los cambios de rutina.',
    riesgo: '1-2 Con riesgo, 3-4 Sin riesgo'
  },
  {
    criterio: 'Actividad',
    p1: '1. Encmado/a: Paciente constantemente encamado/a.',
    p2: '2. En silla: Paciente que no puede andar o con deambulacion muy limitada. No puede sostener su propio peso y necesita ayuda para poder pasar a una silla o a una silla de ruedas.',
    p3: '3. Deambula ocasionalmente: Deambula ocasionalmente con o sin ayuda durante el dia pero para distancias muy cortas. Pasa la mayor parte de las horas diurnas en la cama o en silla de ruedas.',
    p4: '4. Deambula frecuentemente: Deambula fuera de la habitacion al menos dos horas durante las horas de paseo.',
    riesgo: '1-2 Con riesgo, 3-4 Sin riesgo'
  },
  {
    criterio: 'Movilidad',
    p1: '1. Completamente inmovil: Sin ayuda no puede realizar ningun cambio en la posicion del cuerpo o de alguna extremidad.',
    p2: '2. Muy limitada: Ocasionalmente efectua ligeros cambios en la posicion del cuerpo o de las extremidades, pero no es capaz de hacer cambios frecuentes o significativos por si solo.',
    p3: '3. Ligeramente limitada: Efectua con frecuencia ligeros cambios en la posicion del cuerpo o de las extremidades por si solo/a.',
    p4: '4. Sin limitaciones: Efectua frecuentemente importantes cambios de posicion sin ayuda',
    riesgo: '1-2 Con riesgo, 3-4 Sin riesgo'
  },
  {
    criterio: 'Nutrición',
    p1: '1. Muy pobre: Nunca ingiere una comida completa. Rara vez toma mas de un tercio de cualquier alimento que se le ofrezca. Diariamente come dos servicios o menos con aporte proteico (carne o productos lacteos). Bebe pocos liquidos. No toma suplementos dieteticos liquidos. Esta en ayunas y/o en dieta liquida o sueros mas de cinco dias.',
    p2: '2. Probablemente inadecuada: Rara vez come una comida completa y generalmente come solo la mitad de los alimentos que se le ofrecen. La ingesta proteica incluye solo tres servicios de carne o productos lacteos por un dia. Ocasionalmente toma un suplemento dietetico. Recibe menos de la cantidad optima de una dieta liquida o por sonda nasograstrica.',
    p3: '3. Adecuada: Toma mas de la mitad de la mayoria de las comidas. Come un total de cuatro servicios al dia de proteinas (carne o productos lacteos). Ocasionalmente puede rehusar una comida pero tomara un suplemento dietetico si se le ofrece. Recibe nutricion por sonda nasograstica o por via parental cubriendo la mayoria de sus necesidades.',
    p4: '4. Excelente: Ingiere la mayor parte de la comida. Nunca rehusa una comida. Habitualmente come un total de cuatro o mas servicios de carne o productos lacteos. Ocasionalmente come entre horas. No requiere suplementos dieteticos',
    riesgo: '1-2 Con riesgo, 3-4 Sin riesgo'
  },
  {
    criterio: 'Roce de peligro de lesiones',
    p1: '1. Problema: requiere moderada o máxima asistencia para ser movido. Es imposible levantarlo/a completamente sin que se produzca un deslizamiento entre las sábanas. Frecuentemente se desliza hacia abajo en la cama o la silla, requiriendo de frecuentes reposicionamientos con máxima ayuda. La existencia de espasticidad, contracturas o agitación producen un roce casi constante.',
    p2: '2. Probablemente inadecuada Se mueve muy débilmente o requiere de mínima asistencia. Durante los movimientos, la piel probablemente roza contra parte de las sábanas, silla, sistemas de sujeción u otros objetos. La mayor parte del tiempo mantiene relativamente una buena posición en la silla o en la cama, aunque en ocasiones puede resbalar hacia abajo.',
    p3: '3. Adecuada Se mueve en la cama y en la silla con independencia y tiene suficiente fuerza muscular para levantarse completamente cuando se mueve. En todo momento mantiene una buena posición en la cama o la silla.',
    p4: '4. Sin limitaciones Efectúa frecuentemente importantes cambios de posición sin ayuda.',
    riesgo: '1-2 Con riesgo, 3-4 Sin riesgo'
  },

];

const BoldAndBeautiful = () => {
  const [sexo, setSexo] = useState('Hombre');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView>

          <Text style={styles.title}>Escala de Braden</Text>

          <ScrollView horizontal>
            <DataTable style={{ minWidth: 900 }}>
              <DataTable.Header>
                <DataTable.Title style={styles.colCriterio}>Criterios</DataTable.Title>
                <DataTable.Title style={styles.colPuntaje}>1</DataTable.Title>
                <DataTable.Title style={styles.colPuntaje}>2</DataTable.Title>
                <DataTable.Title style={styles.colPuntaje}>3</DataTable.Title>
                <DataTable.Title style={styles.colPuntaje}>4</DataTable.Title>
                <DataTable.Title style={styles.colRiesgo}>Puntuación</DataTable.Title>
              </DataTable.Header>

              {BRADEN_TABLE.map((row, index) => (
                <DataTable.Row key={index} style={styles.dynamicRow}>
                  <DataTable.Cell style={styles.colCriterio}>
                    <Text style={{ fontWeight: 'bold' }}>{row.criterio}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.colPuntaje}>
                    <Text style={styles.cellText}>{row.p1}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.colPuntaje}>
                    <Text style={styles.cellText}>{row.p2}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.colPuntaje}>
                    <Text style={styles.cellText}>{row.p3}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.colPuntaje}>
                    <Text style={styles.cellText}>{row.p4}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.colRiesgo}>
                    <Text style={styles.cellText}>{row.riesgo}</Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </ScrollView>
          <Text style={styles.label}>Interpretacion del puntaje</Text>
          <Text style={styles.label}>{"-Alto riesgo: puntuacion Total < 12"}</Text>
          <Text style={styles.label}>{"-Riesgo medio: puntuacion Total  13-14"}</Text>
          <Text style={styles.label}>{"-Bajo riesgo: puntuacion Total 15-16 si es menor de 75 años o de 15-16 si es mayor o igual a 75 años"}</Text>
          <TextInput style={styles.input} placeholder="Total de puntos" />
          <Button
            icon="content-save"
            mode="contained"
            onPress={() => console.log('Botón presionado')}
            style={styles.button}
          >Guardar Resultados</Button>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    marginVertical: 6,
    padding: 10,
    borderRadius: 5,
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dynamicRow: {
    height: 'auto',
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  cellText: {
    fontSize: 12,
    flexShrink: 1,
  },
  colCriterio: {
    width: 150,
    justifyContent: 'flex-start',
  },
  colPuntaje: {
    width: 180,
    paddingHorizontal: 5,
    justifyContent: 'flex-start',
  },
  colRiesgo: {
    width: 100,
    justifyContent: 'flex-start',
  },
});

export default BoldAndBeautiful;