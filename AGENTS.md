# AGENTS.md - In Focus

Memoria de contexto para agentes de IA en este proyecto.

## Estado del proyecto

Aplicación **Tauri v2 + React 19 + TypeScript ~7 + Vite 7** (novela visual de
mensajería). Stack exacto en `package.json` y `src-tauri/Cargo.toml`.

Docs de referencia: `STACK.md` (arquitectura), `DESIGN.md` (arte/UI),
`SPEC.md` (gameplay), `STORY.md` (biblia, 28 capítulos).
Para **escribir capítulos `.yarn`**: `src/features/dialogue/scripts/README.md`.
Para el **motor anti-fugas**: `src/features/dialogue/validate/GUIDE.md`.

## Comandos (verificación)

- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — `tsc && vite build` (el typecheck corre dentro del build)
- `npm test` — `vitest run` (todo el suite)
- `npm run test:watch` — `vitest` (modo watch)
- `npm run validate:scripts` — **gate anti-fugas** (solo `scripts-gate.test.ts`)
- `npm run lint` / `lint:fix` / `format` — Biome
- Rust (en `src-tauri`): `cargo test` / `cargo clippy --all-targets -- -D warnings` / `cargo fmt --check`

Biome: indentación **tabs**, comillas dobles, semicolons, trailing commas all,
`lineWidth: 100`, organiza imports automáticamente. VCS habilitado → respeta
`.gitignore`. `vite.config.ts` usa `vitest/config` (config de test dentro).

⚠️ **Estado actual: `npm test` y `npm run validate:scripts` FALLAN de forma
conocida** (4 tests rojos, ver abajo). No es un fallo casual del entorno.

## Estructura FSD

`src/app` (screens/bootstrap), `src/entities`, `src/features`
(profile, chat, fake-typing, gallery, affinity, relationship, dialogue,
game-clock, notifications, absence), `src/shared` (ui, theme, persistence,
hooks, sound). Alias `@` → `src`. `src-tauri/` → Rust (IPC + persistencia).

## Reloj de juego y contador de la expo

`game-clock` avanza `day`/`hour` en tiempo real acelerado (1 día de juego ≈ 3
min). El **contador a la exposición** (`ExpoCountdown`) se activa cuando el
efecto `<<chapter>>` recibe el título "El plan" (cap. 21): fija `expoDay =
day + 3` en el store del reloj y deriva los días restantes; se oculta al
pasar el evento. No se persiste (consistente con el reloj, que tampoco).

## Sonido del juego (`src/shared/sound/`)

Sonidos sintetizados con **Web Audio API** (sin assets binarios; funcionan en
navegador y en el webview de Tauri). `playNotification`, `playTyping`,
`playSend`, `playPhoto` se enganchan en los stores (push, `setMayaTyping`
false→true, `confirmSend`, `addPhoto`). Preferencia persistida en
localStorage (`in-focus:sound`) con toggle en Ajustes. No suenan durante el
resume determinista (los efectos están guardados por `replaying`).

## Diálogos `.yarn` (gotchas)

- 28 capítulos en `scripts/chapters/NN-titulo.yarn`. El loader
  (`scripts/index.ts`) los concatena con `import.meta.glob` **eager en orden
  de nombre** → un capítulo nuevo debe seguir el prefijo `NN-` y los títulos
  de nodo son **únicos a nivel global** (`CapN_...`).
- El parser **no soporta comentarios** (`//`); documentar en el README.
- `Start` + todos los `<<declare>>` viven en el capítulo 01.
- Cada capítulo cierra con `<<set $cap_NN_done = true>>` + `<<jump Cap(NN+1)_...>>`;
  el 28 (`28-finales.yarn`) decide los finales y termina con `<<fin>>`.
- Deltas solo vía comandos `<<affinity/romance/trust ±N>>` — **nunca**
  `<<set $eje = X>>`. Comandos custom: presence, typing, photo, notify,
  chapter, availability, absence, fin (ver README). Fotos: ids de
  `PHOTO_CATALOG` en `photos.ts`.

## Motor anti-fugas (`src/features/dialogue/validate/`)

Gate = `npm run validate:scripts`. API en `index.ts`: `validateChapters()`,
`validateSources(sources)` (para un solo capítulo o scripts de prueba),
`formatReport()`. Reglas por archivo en `rules.ts`; globales en `structure.ts`,
`conditions.ts`, `feasibility.ts`, `runner.ts`, `story.ts`.

- `feasibility.ts` calcula el conjunto alcanzable de `(affinity, romance,
  trust)` (clamped 0-100) y emite `conditions:final-infeasible` si un final
  de `Cap28_Finales` exige un balance que ningún recorrido produce.
- `story.ts` añade reglas narrativas (`story:*`: min-mechanics,
  average-line-length, line-too-long, pronouns-unused, unused-photo).
- Para añadir una regla: id en `types.ts` `RuleId` → función en `rules.ts`
  (por archivo) o `structure.ts` (global) → caso en `engine.test.ts`.
- `GUIDE.md` está **ligeramente desactualizado**: no documenta `feasibility.ts`
  ni las reglas `story:*`.

## Estado de tests (17 archivos, 101 tests)

**TODOS PASAN (101/101)** — incluye el gate anti-fugas
(`validate/scripts-gate.test.ts`), el engine (`validate/engine.test.ts`) y los
tests de historia. Los 2 fallos históricos de `engine.test.ts` se corrigieron:
- *un script limpio no produce hallazgos*: el fixture ahora es un mini-capítulo
  con 3 mecánicas y ritmo 60-120; además `lintPronouns`/`lintUnusedPhotos`
  (reglas de catálogo) solo corren sobre el set real de capítulos.
- *detecta nodos duplicados/orfanos*: el grafo de `runner.ts` (`buildGraph`)
  ahora atribuye cada `<<jump>>` a su nodo (el lexer registra `node` en
  `JumpToken`), así detecta huérfanos en archivos con varios nodos.

El **gate anti-fugas** pasa: los 3 `conditions:final-infeasible` de
`28-finales.yarn` se corrigieron al expandir la historia con opciones
desacopladas por eje (romance-sin-trust, amistad aff+trust) en los Actos IV-V,
de modo que los **5 finales son alcanzables** (~17k balances probados). El
reporte completo queda en **0 errores y solo los 4 warnings intencionales de
solape de `Cap28_Finales`** (GUIDE §4.5). Antes de tocar capítulos corre
`npm run validate:scripts`; cambiar deltas/condiciones puede dejar finales
inalcanzables de nuevo.

## Historia (estado tras la expansión)

- 28 capítulos expandidos a **~2,850 líneas** (~1.35x el original; el `merge`
  de mensajes cortos alineó el ritmo con STORY.md §6 sin perder contenido).
- **Fuego romántico en el Acto IV-V (caps 19-27)**: los capítulos del clímax
  (Casi, Celos, El plan, El sueño, La caída, Verdad, La invitación, El
  encuentro, La declaración) suben la tensión romántica: casi-besos, deseo,
  confesiones atrevidas y el primer contacto físico, en tono sugerente (nada
  explícito). Si se amplían, mantener ese registro.
- Regla de balance para no romper el gate: en Acto IV-V cada grupo de
  opciones debe incluir una opción **con trust** (romance+trust para el
  final romántico), una **trust-0** (romance-sin-trust para Reencuentro) y
  una **romance-0** (aff+trust para "Mi mejor amiga").
- Tolerancia a emojis: las reglas de ritmo (`story:line-too-long`,
  `story:average-line-length`) cuentan **code points** (un emoji = 1), no
  unidades UTF-16.

## Apps de colección (Historia, Notas, Calendario)

- **App "Historia"** (`src/app/screens/history.tsx`): **recopilado en tiempo
  real** — stats (capítulos, decisiones, fotos), **Cómo vamos** (barras de
  Afinidad/Romance/Confianza vivas desde `useRelationshipStore` + tier y "tip"
  derivado), **Resumen del momento** (párrafo autogenerado con capítulo actual
  y progreso), lista de 28 capítulos con estado (completado/en curso/bloqueado)
  que se expanden a la entrada de diario, y **Tus decisiones, por capítulo**
  (agrupadas desde `choiceLog`). Icono libro púrpura en home/dock; ventana en
  escritorio.
- **`choiceLog`** (en `dialogue/store.ts`): decisiones con texto
  (`DialogueChoice { id, chapter, option }`), persistidas en localStorage
  `in-focus:choices`. `confirmSend` las registra (nº de capítulo desde
  `currentNode` + texto de la opción); `reset()` las borra. Se separa de
  `choiceHistory` (índices, para resume determinista).
- **Notas**: 3 pestañas — **Diario** (28 entradas completas en
  `features/diary/data.ts`: `recap` de lo que se habló, `text` reflexión y
  `note` marginalia; la UI añade **Tus decisiones** del capítulo desde
  `choiceLog` y la **frase de Maya** de `quotes.ts` vía
  `DiaryEntryCard`), **Frases** (frases icónicas de Maya, una por
  capítulo, en `features/diary/quotes.ts`) y **Notas** libres persistidas.
  Desbloqueo por capítulo vía `isDiaryUnlocked` (cap. 1, capítulo actual o
  `$cap_NN_done`). Al añadir frases al catálogo: mantener 28 entradas en orden
  (lo verifica `data.test.ts`).
- **Calendario**: mes navegable (‹/›), hoy resaltado, fin de semana atenuado y
  pie con eventos de la historia: **capítulo actual** (título del cap. desde
  `DIARY`) y **cuenta atrás de la expo** si `expoDay` está fijado en
  `game-clock` (días restantes según `day`).

## Iconos de app y wallpaper

- **Iconos de app** (`src/app/os/app-icons.tsx`): `AppGlyph`/`AppKind` — tile
  "squircle" con gradiente + glifo del banco real **lucide-react** (Mensajes =
  `MessageCircle` verde, Fotos = `Flower2` azul, Notas = `StickyNote` sobre
  papel amarillo, Calendario = `CalendarDays` rojo, etc.). Se usan en
  `home.tsx` (springboard + dock + miniaturas minimizadas). Para cambiar un
  icono: editar `SPEC` en `app-icons.tsx`. **No usar las viejas clases
  `app-icon__glyph--{kind}`** (eliminadas).
- **Wallpaper**: `public/wallpapers/sierra.jpg` (2560×1600, descargado).
  Aplicado como fondo del `.desktop` y `.springboard` con overlay oscuro;
  etiquetas de apps en blanco con sombra para contraste. Si se reemplaza,
  mantener la misma ruta o actualizar el CSS.

## Tauri / persistencia

- IPC: solo `save_state` / `load_state` (`commands.rs`, `lib.rs`). Guardado en
  el app data dir. `SaveState` (`models.rs`, camelCase): profile, affinity,
  romance, trust, script_variables, choice_history (resume determinista),
  messages, current_node, chapter_title, gallery_photos.
- Un comando IPC nuevo exige registrarlo en el `invoke_handler` de `lib.rs` **y**
  (si es para el frontend) en `capabilities/default.json` (hoy solo
  `core:default` + `opener:default` + `notification:default`).
- **App "cerrada" sigue viva (bandeja)**: `lib.rs` intercepta el cierre de la
  ventana (`WindowEvent::CloseRequested`) y la oculta en vez de salir; hay
  bandeja (`tray-icon`) con "Mostrar In Focus" / "Salir" (flag `QUITTING`).
  Requiere `tauri = { features = ["tray-icon"] }` en Cargo.toml.
- **Notificaciones nativas**: `tauri-plugin-notification` (npm + cargo). El
  store de notificaciones dispara `sendSystemNotification` (`shared/notify.ts`)
  en cada push; llegan aunque la ventana esté oculta. Requiere el permiso
  `notification:default` en capabilities.
- Front: `shared/persistence` usa `invoke` con fallback a localStorage vía
  `isTauri` (el juego también corre en navegador). Toasts de usabilidad:
  `shared/toast` (`push` + `ToastStack` en App).

## PUERTO 5174 (CRÍTICO)

- `npm run tauri dev` arranca en el **5174** (antes 1420, que ocupa `aura`).
  Verifica antes: `ss -ltnp | grep 5174`. **NO matar procesos ajenos.**
- `tauri.conf.json` tiene `devUrl` estático (`http://localhost:5174`) y
  `beforeDevCommand: npm run dev`. El CLI de Tauri lee `devUrl` antes de
  `beforeDevCommand`, así que `strictPort: false` en Vite NO basta.
- `vite.config.ts` usa `port: 5174, strictPort: true`. El `hmr.port: 1421` es
  solo para `TAURI_DEV_HOST` (dispositivos remotos) — no choca con el server.
- **PLAN de tolerancia de puertos — NO IMPLEMENTADO** (no existe `scripts/`).
  Idea: overlay de config vía `tauri dev --config <overlay>` (el CLI mergea
  JSON/JSON5/TOML) + wrapper que detecte puerto libre antes de delegar.

## Git

- Un solo commit (`e85c08f`, rama `main`). Remoto: `origin` →
  `https://github.com/sazardev/in-focus.git`. ⚠️ **NO hacer commit sin
  instrucción explícita.**
