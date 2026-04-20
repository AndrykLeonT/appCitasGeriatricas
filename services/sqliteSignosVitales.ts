import * as SQLite from "expo-sqlite";

export interface SignoVitalSQLite {
    id?: number;
    pacienteId: string;
    valor: string;
    fechaHora: string;
}

let dbCache: SQLite.SQLiteDatabase | null = null;

export const initSignosDB = async () => {
    if (dbCache) return dbCache;
    const db = await SQLite.openDatabaseAsync("signos_vitales.db");
    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS PresionArterial (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pacienteId TEXT NOT NULL,
          valor TEXT NOT NULL,
          fechaHora TEXT NOT NULL
        );
    `);
    dbCache = db;
    return db;
};

export const createPresionArterial = async (data: Omit<SignoVitalSQLite, 'id'>) => {
    try {
        const db = await initSignosDB();
        await db.runAsync(
            `INSERT INTO PresionArterial (pacienteId, valor, fechaHora) VALUES (?, ?, ?)`,
            [data.pacienteId, data.valor, data.fechaHora]
        );
    } catch (e) {
        console.error("Error saving Presion Arterial in SQLite: ", e);
        throw e;
    }
};

export const getPresionArterialPorPaciente = async (pacienteId: string): Promise<SignoVitalSQLite[]> => {
    try {
        const db = await initSignosDB();
        const data = await db.getAllAsync<SignoVitalSQLite>(
            `SELECT * FROM PresionArterial WHERE pacienteId = ? ORDER BY fechaHora ASC`,
            [pacienteId]
        );
        return data;
    } catch (e) {
        console.error("Error fetching Presion Arterial from SQLite: ", e);
        return [];
    }
};
