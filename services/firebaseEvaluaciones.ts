import { child, get, push, ref, set } from 'firebase/database';
import { db } from './firebasePatients';

export interface RegistroEvaluacion {
    id?: string;
    idPaciente: string;
    idEvaluacion: string;
    fecha: string;   // "YYYY-MM-DD"
    puntaje: number;
}

export const guardarRegistroEvaluacion = async (
    record: Omit<RegistroEvaluacion, 'id'>
): Promise<RegistroEvaluacion> => {
    try {
        const newRef = push(ref(db, 'registroEvaluaciones'));
        await set(newRef, record);
        return { ...record, id: newRef.key! };
    } catch (e) {
        console.error('Error saving evaluation record:', e);
        throw e;
    }
};

export const leerRegistrosPorPaciente = async (
    idPaciente: string
): Promise<RegistroEvaluacion[]> => {
    try {
        const snapshot = await get(child(ref(db), 'registroEvaluaciones'));
        const records: RegistroEvaluacion[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((snap) => {
                const data = snap.val();
                if (data.idPaciente === idPaciente) {
                    records.push({ id: snap.key!, ...data });
                }
            });
        }
        return records.sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
    } catch (e) {
        console.error('Error reading evaluation records:', e);
        return [];
    }
};
