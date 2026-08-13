# Scripts de Diálogo (Yarn Spinner)

Los diálogos de **In Focus** viven en archivos `.yarn` usando el dialecto
**Yarn Spinner 3.x**, ejecutado por el paquete `yarn-spinner-runner-ts`.

> ⚠️ El parser **no soporta comentarios** (`//`). Usa este README para documentar.
> ⚠️ Los títulos de nodo son **únicos a nivel global** (prefijo `CapN_`).

## Estructura multi-capítulo

Cada capítulo vive en `scripts/chapters/NN-titulo.yarn` (STORY.md §9). El
loader (`scripts/index.ts`) concatena todos los archivos en orden de nombre
para compilar un único programa Yarn:

```
scripts/
 ├── index.ts              # buildChapterScript() — concatena chapters/*.yarn
 └── chapters/
      ├── 01-el-numero.yarn
      ├── 02-36-fotos.yarn
      └── ...
```

- El primer capítulo contiene el nodo `Start` (punto de entrada) y todos los
  `<<declare>>` de las variables de la historia.
- Cada capítulo termina con `<<set $cap_NN_done = true>>` y
  `<<jump CapNN+1_Intro>>`.
- El último capítulo (`28-finales.yarn`) contiene los finales según el
  balance de ejes.

## Sintaxis soportada

### Nodos

```yarn
title: Cap1_Inicio
tags: #acto1
---
Maya: ¡Hola!
-> Respuesta 1
    Maya: ...
===
```

- `title:` — nombre del nodo (obligatorio, único globalmente).
- `tags:` — metadatos con prefijo `#` (opcional).
- `---` separa cabecera de cuerpo; `===` cierra el nodo.

### Líneas

```yarn
Maya: Texto que dice Maya.
Texto sin personaje (narrador).
```

### Opciones (decisiones del jugador)

```yarn
-> Opción visible al jugador
    <<affinity +2>>
    Maya: Reacción si elige esto
-> Otra opción
    Maya: Reacción alternativa
```

- Las opciones se agrupan automáticamente por bloques contiguos.
- El cuerpo indentado de una opción solo se ejecuta si se elige.
- Opciones con condiciones inline: `-> Pregunta [if $trust >= 20]`.

### Variables y expresiones

```yarn
<<declare $affinity = 0>>                    // declarar (solo una vez, en Start)
<<if $romance >= 70 && $trust >= 70>>
    Maya: ...
<<elseif $affinity >= 70>>
    Maya: ...
<<else>>
    Maya: ...
<<endif>>
```

### Saltos entre nodos

```yarn
<<jump Cap2_Intro>>    // salta al nodo del siguiente capítulo
<<detour Nodo>>        // salta y regresa al final del nodo destino
```

### Bloques `once`

```yarn
<<once>>
    Maya: Esto solo se muestra una vez por partida.
<<endonce>>
```

## Comandos custom (efectos del juego)

| Comando | Efecto |
| --- | --- |
| `<<affinity +N>>` / `<<affinity -N>>` | Aplica delta al eje de afinidad |
| `<<romance +N>>` / `<<romance -N>>` | Aplica delta al eje de romance |
| `<<trust +N>>` / `<<trust -N>>` | Aplica delta al eje de confianza |
| `<<presence online>>` / `<<presence taking-photos>>` / `<<presence offline>>` | Cambia el estado visible de Maya |
| `<<typing true>>` / `<<typing false>>` | Muestra/oculta la burbuja "escribiendo..." |
| `<<photo id>>` | Aparece una foto de Maya en el chat y se guarda en la Galería |
| `<<notify "texto">>` | Notificación push ficticia (si el jugador no está en el chat) |
| `<<chapter "Título">>` | Tarjeta de capítulo + título del día |
| `<<availability "Texto">>` | Estado de disponibilidad de Maya en la nav bar |
| `<<absence>>` | Maya desaparece un momento y vuelve con una ráfaga de fotos |
| `<<fin>>` | Termina el diálogo explícitamente |

> Los deltas se aplican con comandos (`<<affinity>>`, `<<romance>>`,
> `<<trust>>`) — **NUNCA** `<<set $affinity = X>>` directo, para mantener el
> store multieje sincronizado.

## Funciones integradas del runtime

`visited(node)`, `visited_count(node)`, `random()`, `random_range(a,b)`,
`dice(n)`, `min(a,b)`, `max(a,b)`, `round`, `floor`, `ceil`, `inc`, `dec`,
`string(x)`, `number(x)`, `bool(x)`.

## Convenciones de In Focus (STORY.md)

- **Ejes de relación:** `$affinity`, `$romance`, `$trust` (0–100). Los finales
  se deciden en `Cap28_Finales` según su balance.
- **Flags de capítulo:** `$cap_NN_done` (reemplazan `once`/`visited()` para
  que el resume sea fiel).
- **Pronombres:** `<<if $pronouns == "he">>` / `"she"` / `else` para adjetivos
  con género (Maya adapta su lenguaje).
- **Ritmo:** usa `<<typing true/false>>` y `<<presence>>` antes de mensajes
  pesados; termina cada capítulo con un gancho.
- **Fotos:** referencias ids del catálogo en `photos.ts` (STORY.md §8).
- Cada capítulo usa al menos 3 mecánicas (fotos, ausencia, presencia,
  notificación, reacción).

## Variables de la historia (declaradas en `Start`)

`$affinity`, `$romance`, `$trust`, `$mejores_fotos`, `$rollo_revelado`,
`$supo_la_verdad`, `$cap_01_done` … `$cap_28_done`.

## Motor de validación (anti-fugas)

`src/features/dialogue/validate/` escanea los 28 capítulos y detecta fugas de
texto, decisiones, puntos, variables, condiciones y estructura antes de que
lleguen al jugador.

- **Fugas de texto:** personajes que no son Maya, líneas vacías,
  interpolaciones `{var}` sin declarar, líneas duplicadas.
- **Fugas de decisiones:** bloques de 1 o +4 opciones, opciones duplicadas,
  opciones sin cuerpo, opciones sin consecuencias.
- **Fugas de puntos:** deltas no numéricos, `0`, fuera de ±10, dentro de un
  `<<if>>`, o `<<set $eje = …>>` directo (prohibido).
- **Fugas de variables:** uso sin `<<declare>>`, variables declaradas pero
  nunca usadas, variables escritas pero nunca leídas.
- **Fugas de condiciones:** `<<if>>` vacíos, umbrales fuera de 0-100, ramas
  de final inalcanzables (sombreadas por ramas anteriores) y solapes.
- **Fugas de estructura:** saltos a nodos inexistentes, nodos duplicados u
  huérfanos, fotos fuera del catálogo, capítulos sin flag o sin jump al
  siguiente, `<<once>>` (usar `$cap_NN_done`).

Corre con `npm run validate:scripts` o en el suite con `npm test`. La API
está en `validate/index.ts` (`validateChapters()` → `ValidationReport`).

Guía completa de uso y de cómo extender reglas: [`validate/GUIDE.md`](../validate/GUIDE.md).
