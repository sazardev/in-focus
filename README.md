# In Focus

Novela visual de mensajería multiplataforma (Tauri + React 19 + TypeScript).

## Stack

- **Frontend:** React 19, TypeScript, Vite, Zustand
- **Backend/Core:** Rust (Tauri v2)
- **Calidad:** Biome, Vitest + React Testing Library, Clippy + Rustfmt

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Dev server (Vite) |
| `npm run tauri dev` | App de escritorio en desarrollo |
| `npm test` | Tests unitarios (Vitest) |
| `npm run validate:scripts` | Motor anti-fugas de los scripts `.yarn` |
| `npm run lint` | Lint + format check (Biome) |
| `npm run typecheck` | TypeScript estricto |
| `npm run build` | Build de producción |

## Estructura (Feature-Sliced Design)

```
src/
 ├── app/               # Bootstrap, navegación de pantallas y providers
 ├── entities/          # Modelos de dominio (User, Message, MayaState)
 ├── features/          # profile, chat, fake-typing, gallery, affinity, dialogue, notifications
 ├── shared/            # UI atómica, hooks, estilos, tema
 └── tauri (src-tauri)  # Rust: comandos IPC, persistencia
```

## Gameplay implementado (SPEC.md + STORY.md)

- **Perfil:** onboarding con nombre, pronombres (Él/Ella/Neutro) y tono base,
  persistido. Maya usa tu nombre y adapta su lenguaje según la elección.
- **Historia larga (28 capítulos):** novela de amor en 5 actos según
  `STORY.md` ("El rollo que no debí revelar"). Desconocidos → amistad →
  altibajos → enamoramiento → finales. Scripts en
  `src/features/dialogue/scripts/chapters/`.
- **Relación multieje:** `affinity` (compañerismo), `romance` y `trust`
  (confianza), cada uno con tiers. Los finales dependen del balance
  (`src/features/relationship/`).
- **Diálogos:** Yarn Spinner (`scripts/chapters/*.yarn`) con decisiones,
  comandos custom (`affinity/romance/trust`, `photo`, `notify`, `chapter`,
  `availability`, `absence`) y ramas.
- **Motor anti-fugas** (`src/features/dialogue/validate/`): valida los
  capítulos y detecta fugas de texto, decisiones, puntos, variables,
  condiciones y estructura (`npm run validate:scripts`).
- **Resume determinista:** la partida guarda el historial de elecciones y se
  reanuda reproduciendo el diálogo hasta el punto exacto (sin duplicar mensajes).
- **Teclado falso:** al elegir respuesta, el teclado iOS aparece y cada tecla
  rellena el mensaje predefinido letra a letra; el botón enviar se ilumina al completar.
- **Reloj de juego:** días/horas de juego con modo acelerado (1 día de juego ≈
  unos minutos reales) y tarjeta de capítulo en el chat.
- **Confirmaciones de lectura:** ticks iMessage (entregado/leído) y contador
  de no leídos `< N` en la nav bar.
- **Reacciones a fotos:** presión larga sobre una foto → Me gusta / Me encanta.
- **Eventos de ausencia:** Maya "desaparece" y vuelve con una ráfaga de fotos.
- **Galería:** las fotos de Maya se coleccionan automáticamente (grid + fullscreen).
- **Notificaciones:** push ficticias con badge al salir del chat.
- **Tema:** 5 tonos base cálidos + claro/oscuro (DESIGN.md).
- **Persistencia:** guardado del progreso vía IPC de Rust (Tauri) con fallback
  a localStorage en navegador.

## Diálogos (Yarn Spinner)

La narrativa vive en archivos `.yarn` (`src/features/dialogue/scripts/chapters/`)
ejecutados por `yarn-spinner-runner-ts`. El engine (`DialogueEngine`) traduce
los resultados del runner a frames del chat y aplica efectos (afinidad,
romance, confianza, presencia, fotos, typing, notificaciones, ausencia) vía
comandos custom. El loader (`scripts/index.ts`) concatena los capítulos en un
solo programa Yarn.

## Documentación

- `STORY.md` — biblia narrativa de la historia de amor (premisa, personajes,
  actos, finales, convenciones de escritura)
- `STACK.md` — stack tecnológico y arquitectura
- `SPEC.md` — reglas de negocio y gameplay
- `DESIGN.md` — dirección de arte y UI

