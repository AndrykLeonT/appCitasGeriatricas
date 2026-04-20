import { child, get, push, ref, set, update, remove } from 'firebase/database';
import { db } from './firebasePatients';

export interface Cita {
    id: string;
    pacienteId: string;
    pacienteNombre: string;
    medicoId: number;
    medicoNombre: string;
    fecha: string;
    primeraCita: boolean;
    duracion: number;
    motivo: string;
    status: 'agendado' | 'en curso' | 'concluida';
    observaciones?: string;
}

const CITAS_PATH = 'citas';

export const createCitaInFirebase = async (citaData: Omit<Cita, 'id'>): Promise<Cita> => {
    try {
        const newListRef = push(ref(db, CITAS_PATH));
        await set(newListRef, citaData);
        return { ...citaData, id: newListRef.key! };
    } catch (e) {
        console.error("Error adding cita: ", e);
        throw e;
    }
};

export const readCitasFromFirebase = async (): Promise<Cita[]> => {
    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, CITAS_PATH));
        const citas: Cita[] = [];

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                citas.push({
                    id: childSnapshot.key,
                    ...data
                });
            });
        }
        return citas.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    } catch (e) {
        console.error("Error reading citas: ", e);
        return [];
    }
};

export const updateCitaStatusInFirebase = async (id: string, status: Cita['status']): Promise<void> => {
    try {
        const citaRef = ref(db, `${CITAS_PATH}/${id}`);
        await update(citaRef, { status });
    } catch (e) {
        console.error("Error updating cita status: ", e);
        throw e;
    }
};

export const updateCitaInFirebase = async (id: string, citaData: Partial<Cita>): Promise<void> => {
    try {
        const citaRef = ref(db, `${CITAS_PATH}/${id}`);
        await update(citaRef, citaData);
    } catch (e) {
        console.error("Error updating cita: ", e);
        throw e;
    }
};

export const deleteCitaFromFirebase = async (id: string): Promise<void> => {
    try {
        const citaRef = ref(db, `${CITAS_PATH}/${id}`);
        await remove(citaRef);
    } catch (e) {
        console.error("Error deleting cita: ", e);
        throw e;
    }
};
