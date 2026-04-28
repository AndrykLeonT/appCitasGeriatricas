# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start Expo dev server (scan QR with Expo Go or simulator)
npm run android    # Start targeting Android emulator
npm run ios        # Start targeting iOS simulator
npm run web        # Start targeting web browser
npm run lint       # Run ESLint via expo lint
```

There are no automated tests in this project.

## Architecture Overview

**citasGeriatricas** is a React Native / Expo (SDK 54) app for managing geriatric patient appointments and clinical evaluations. It uses `expo-router` for file-based routing.

### Navigation structure

```
app/
  _layout.tsx              ← Root: wraps in ThemeProvider + GestureHandlerRootView, shows 2.5s splash
  (drawer)/
    _layout.tsx            ← Drawer navigator (Inicio, Citas, Pacientes, Médicos, Evaluaciones)
    index.tsx              ← Home screen (quick-access grid)
    citas/                 ← Appointments (create, view, reschedule, audit log)
    pacientes/             ← Patient CRUD + preferences screen
    medicos/               ← Doctor CRUD
    evaluaciones/          ← 20 geriatric evaluation instruments (see below)
    signos-vitales/        ← Vital signs entry + dashboard charts
```

Each section folder has a `_layout.tsx` that wraps its screens in a nested `Stack` navigator.

### Services layer

All external I/O goes through `services/`:

| File | Backend | Purpose |
|---|---|---|
| `firebasePatients.ts` | Firebase Realtime DB | Patient CRUD, vital-sign write/read (temperatura, frecuencia) |
| `firebaseCitas.ts` | Firebase Realtime DB | Appointment CRUD + status transitions |
| `firebaseEvaluaciones.ts` | Firebase Realtime DB | Save and query evaluation results |
| `sqliteBitacoraCitas.ts` | SQLite (device) | Local audit log for appointment events |
| `sqliteSignosVitales.ts` | SQLite (device) | Local vital-signs storage |

Firebase is initialized once in `firebasePatients.ts` and the `db` export is re-used by the other Firebase service files.

Patient records are stored in a nested structure (`datosPersonales`, `datosContacto`, `datosMedicos`) in Firebase but flattened to the `Patient` interface when read. Both formats are handled by `buildNestedPatient` / `nestedToFlat` helpers.

### Geriatric evaluations

`app/(drawer)/evaluaciones/` holds 20 numbered evaluation instruments (01–20), each a self-contained screen. The entry point (`index.tsx`) lets the user pick a patient and evaluation type, then pushes to the correct screen via:

```ts
router.push({
  pathname: `/(drawer)/evaluaciones/${selectedEvaluacion}`,
  params: { pacienteId, pacienteNombre },
});
```

Each evaluation screen reads `pacienteId` / `pacienteNombre` from `useLocalSearchParams()`, collects answers, computes a score, and calls `guardarRegistroEvaluacion()`. The `idEvaluacion` string used for persistence is defined in the `EVALUACIONES` array in `index.tsx` (e.g., `"07_katz"`).

### Theme system

`context/ThemeContext.tsx` exposes `isDarkMode` and `updateTheme`. The dark-mode setting is stored under the AsyncStorage key `@preferencias_paciente_geriatrico` alongside the user's name and text-size preference.

Screens that support dark mode declare two `StyleSheet` objects (light and dark) inline and merge them conditionally:
```tsx
const { isDarkMode } = useTheme();
<View style={[styles.container, isDarkMode && darkStyles.container]} />
```

Call `updateTheme()` after saving preferences so the theme refreshes immediately.

### Key conventions

- Route navigation uses `useRouter()` from `expo-router`; screen parameters use `useLocalSearchParams()`.
- Data refreshes on screen focus use `useFocusEffect` + `useCallback`.
- The user's display name shown in the drawer header is loaded from AsyncStorage on every focus via `HeaderUserName` in `(drawer)/_layout.tsx`.
- Styles are always declared via `StyleSheet.create` at the bottom of each file, never inline objects in JSX (except for conditional merges).
