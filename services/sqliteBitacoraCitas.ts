import * as SQLite from "expo-sqlite";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BitacoraCita {
    id?: number;
    fechaMovimiento: string;
    usuario: string;
    movimiento: string;
    citaId?: string;
    detalles?: string;
}

const dbName = "bitacora_citas.db";

export const initBitacoraDB = async () => {
    try {
        const db = await SQLite.openDatabaseAsync(dbName);
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS Bitacora (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fechaMovimiento TEXT NOT NULL,
                usuario TEXT NOT NULL,
                movimiento TEXT NOT NULL,
                citaId TEXT,
                detalles TEXT
            );
        `);
    } catch (e) {
        console.error("Error al iniciar SQLite de Bitácora:", e);
    }
};

export const registrarMovimientoBitacora = async (
    movimiento: "Creación de cita" | "Re-agenda de cita" | "Eliminación de cita",
    citaId?: string,
    detalles?: string
) => {
    try {
        await initBitacoraDB();
        const prefsJson = await AsyncStorage.getItem('@preferencias_paciente_geriatrico');
        let usuario = "Usuario del Sistema";
        if (prefsJson) {
            const prefs = JSON.parse(prefsJson);
            usuario = prefs.nombre || "Usuario del Sistema";
        }

        const fechaMovimiento = new Date().toISOString();
        const db = await SQLite.openDatabaseAsync(dbName);
        await db.runAsync(
            `INSERT INTO Bitacora (fechaMovimiento, usuario, movimiento, citaId, detalles) VALUES (?, ?, ?, ?, ?)`,
            [fechaMovimiento, usuario, movimiento, citaId || "", detalles || ""]
        );
    } catch (e) {
        console.error("Error al registrar en bitácora:", e);
    }
};

export const getBitacoraMovimientos = async (): Promise<BitacoraCita[]> => {
    try {
        await initBitacoraDB();
        const db = await SQLite.openDatabaseAsync(dbName);
        const allRows = await db.getAllAsync(`SELECT * FROM Bitacora ORDER BY id DESC LIMIT 200;`);
        return allRows as BitacoraCita[];
    } catch (e) {
        console.error("Error obteniendo la bitácora:", e);
        return [];
    }
};
