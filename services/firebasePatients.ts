import { initializeApp } from "firebase/app";
import { child, get, getDatabase, push, ref, remove, set, update } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyD_jsVshuAyx2ObSSslZFmrL91HYynPyfw",
    authDomain: "citas-geriatricas.firebaseapp.com",
    projectId: "citas-geriatricas",
    storageBucket: "citas-geriatricas.firebasestorage.app",
    messagingSenderId: "131107427459",
    appId: "1:131107427459:web:3acd14a0dea0f8339c77b6"
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

export const createPatientInFirebase = async (patient: Omit<Patient, 'id'>): Promise<Patient> => {
    try {
        const newListRef = push(ref(db, PATIENTS_PATH));
        await set(newListRef, patient);
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
                const data = childSnapshot.val();
                patients.push({
                    id: childSnapshot.key,
                    ...data
                });
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
        await update(patientRef, patientData);
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
