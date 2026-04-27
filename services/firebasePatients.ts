import { initializeApp } from "firebase/app";
import { child, get, getDatabase, push, ref, remove, set, update, query, orderByChild, equalTo } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyANYOT0zNXZ5kiLG_jE5MNHp48-weO-zug",
    authDomain: "evaluacion-c57c4.firebaseapp.com",
    databaseURL: "https://evaluacion-c57c4-default-rtdb.firebaseio.com",
    projectId: "evaluacion-c57c4",
    storageBucket: "evaluacion-c57c4.firebasestorage.app",
    messagingSenderId: "122284539196",
    appId: "1:122284539196:web:5281d3cff6be364d833239",
    measurementId: "G-HZ14ZY7L41"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export interface Patient {
    id: string;
    nombre: string;
    apellidos: string;
    edad: string;
    sexo: string;
    fechaNacimiento: string;
    estadoCivil: string;
    ocupacion: string;
    escolaridad: string;
    telefono: string;
    correo: string;
    direccion: string;
    contactoEmergencia: string;
    telefonoEmergencia: string;
    tipoSangre: string;
    alergias: string;
    enfermedadesCronicas: string;
    cirugiasPrevias: string;
    medicamentosActuales: string;
    peso: string;
    talla: string;
}

const PATIENTS_PATH = 'patients';

// Transforms flat form data into the nested Firebase structure
const buildNestedPatient = (p: Omit<Patient, 'id'>) => ({
    datosPersonales: {
        nombres: p.nombre,
        apellidos: p.apellidos,
        edad: p.edad,
        sexo: p.sexo,
        fechaNacimiento: p.fechaNacimiento,
        estadoCivil: p.estadoCivil,
        ocupacion: p.ocupacion,
        escolaridad: p.escolaridad,
    },
    datosContacto: {
        telefono: p.telefono,
        correoElectronico: p.correo,
        direccionCompleta: p.direccion,
        contactoEmergencia: p.contactoEmergencia,
        telefonoEmergencia: p.telefonoEmergencia,
    },
    datosMedicos: {
        tipoDeSangre: p.tipoSangre,
        alergias: p.alergias,
        enfermedadesCronicas: p.enfermedadesCronicas,
        cirugiasPrevias: p.cirugiasPrevias,
        medicamentosActuales: p.medicamentosActuales,
        peso: p.peso,
        talla: p.talla,
    },
});

// Transforms nested Firebase data back to a flat Patient object
const nestedToFlat = (key: string, data: any): Patient => {
    if (data.datosPersonales) {
        return {
            id: key,
            nombre: data.datosPersonales.nombres ?? '',
            apellidos: data.datosPersonales.apellidos ?? '',
            edad: String(data.datosPersonales.edad ?? ''),
            sexo: data.datosPersonales.sexo ?? '',
            fechaNacimiento: data.datosPersonales.fechaNacimiento ?? '',
            estadoCivil: data.datosPersonales.estadoCivil ?? '',
            ocupacion: data.datosPersonales.ocupacion ?? '',
            escolaridad: data.datosPersonales.escolaridad ?? '',
            telefono: data.datosContacto?.telefono ?? '',
            correo: data.datosContacto?.correoElectronico ?? '',
            direccion: data.datosContacto?.direccionCompleta ?? '',
            contactoEmergencia: data.datosContacto?.contactoEmergencia ?? '',
            telefonoEmergencia: data.datosContacto?.telefonoEmergencia ?? '',
            tipoSangre: data.datosMedicos?.tipoDeSangre ?? '',
            alergias: data.datosMedicos?.alergias ?? '',
            enfermedadesCronicas: data.datosMedicos?.enfermedadesCronicas ?? '',
            cirugiasPrevias: data.datosMedicos?.cirugiasPrevias ?? '',
            medicamentosActuales: data.datosMedicos?.medicamentosActuales ?? '',
            peso: String(data.datosMedicos?.peso ?? ''),
            talla: String(data.datosMedicos?.talla ?? ''),
        };
    }
    // Legacy flat record — return as-is
    return { id: key, ...data };
};

export const createPatientInFirebase = async (patient: Omit<Patient, 'id'>): Promise<Patient> => {
    try {
        const newListRef = push(ref(db, PATIENTS_PATH));
        await set(newListRef, { creadoEn: Date.now(), ...buildNestedPatient(patient) });
        return { ...patient, id: newListRef.key! };
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

export const readPatientsFromFirebase = async (): Promise<Patient[]> => {
    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, PATIENTS_PATH));
        const patients: Patient[] = [];

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                patients.push(nestedToFlat(childSnapshot.key!, childSnapshot.val()));
            });
        }
        return patients;
    } catch (e) {
        console.error("Error reading documents: ", e);
        return [];
    }
};

export const updatePatientInFirebase = async (id: string, patientData: Omit<Patient, 'id'>): Promise<void> => {
    try {
        const patientRef = ref(db, `${PATIENTS_PATH}/${id}`);
        await update(patientRef, buildNestedPatient(patientData));
    } catch (e) {
        console.error("Error updating document: ", e);
        throw e;
    }
};

export const deletePatientFromFirebase = async (id: string): Promise<void> => {
    try {
        const patientRef = ref(db, `${PATIENTS_PATH}/${id}`);
        await remove(patientRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw e;
    }
};

export interface SignoVital {
    id?: string;
    fechaHora: string;
    valor: string;
    pacienteId: string;
}

export const createTemperaturaCorporal = async (data: Omit<SignoVital, 'id'>): Promise<SignoVital> => {
    try {
        const newListRef = push(ref(db, 'temperaturaCorporal'));
        await set(newListRef, data);
        return { ...data, id: newListRef.key! };
    } catch (e) {
        console.error("Error adding temperatura corporal: ", e);
        throw e;
    }
};

export const createFrecuenciaCardiaca = async (data: Omit<SignoVital, 'id'>): Promise<SignoVital> => {
    try {
        const newListRef = push(ref(db, 'frecuenciaCardiaca'));
        await set(newListRef, data);
        return { ...data, id: newListRef.key! };
    } catch (e) {
        console.error("Error adding frecuencia cardiaca: ", e);
        throw e;
    }
};

export const getTemperaturaPorPaciente = async (pacienteId: string): Promise<SignoVital[]> => {
    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, 'temperaturaCorporal'));
        const data: SignoVital[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const val = childSnapshot.val();
                if (val.pacienteId === pacienteId) {
                    data.push({ id: childSnapshot.key, ...val });
                }
            });
        }
        return data.sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
    } catch (e) {
        console.error("Error fetching temperatura: ", e);
        return [];
    }
};

export const getFrecuenciaCardiacaPorPaciente = async (pacienteId: string): Promise<SignoVital[]> => {
    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, 'frecuenciaCardiaca'));
        const data: SignoVital[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const val = childSnapshot.val();
                if (val.pacienteId === pacienteId) {
                    data.push({ id: childSnapshot.key, ...val });
                }
            });
        }
        return data.sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
    } catch (e) {
        console.error("Error fetching frecuencia: ", e);
        return [];
    }
};
