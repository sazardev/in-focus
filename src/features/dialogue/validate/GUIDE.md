# Guía del motor de validación de scripts (anti-fugas)

El motor escanea los capítulos `.yarn` de **In Focus** y detecta fugas de
**texto, decisiones, puntos, variables, condiciones y estructura** antes de
que lleguen al jugador. Vive en `src/features/dialogue/validate/`.

---

## 1. Cómo se ejecuta

| Comando | Qué hace |
| --- | --- |
| `npm run validate:scripts` | Solo el gate sobre los capítulos reales |
| `npm test` | Todo el suite (incluye el gate) |

El gate falla (salida ≠ 0) si hay **errores**. Los **warnings** se reportan
pero no bloquean.

```bash
npm run validate:scripts
# ...
#   0 errores, 4 warnings — SCRIPTS VÁLIDOS
```

Los 4 warnings actuales son **solapes intencionales de condiciones** en
`Cap28_Finales` (ver §4.5): las ramas de los finales usan umbrales que se
solapan por diseño y el orden (de más a menos restrictivo) es lo que decide.
El gate los espera como confirmación de que la cadena sigue viva.

---

## 2. Cómo se lee un reporte

Cada hallazgo tiene esta forma:

```ts
interface ValidationIssue {
  rule: string;        // "points:invalid-delta"
  severity: "error" | "warning";
  file: string;        // "07-sesion-azotea.yarn"
  line: number | null; // 1-based; null si es global
  node: string | null; // nodo Yarn implicado (p. ej. "Cap28_Finales")
  message: string;     // explica qué fuga y cómo arreglarla
}
```

El reporte agrega:

```ts
interface ValidationReport {
  issues: ValidationIssue[];
  errors: number;
  warnings: number;
  ok: boolean; // true si errors === 0
}
```

Para verlo en consola:

```ts
import { validateChapters, formatReport } from "@/features/dialogue/validate";
console.log(formatReport(validateChapters()));
```

---

## 3. API pública

```ts
// Valida fuentes arbitrarias (tests, fragmentos, tu propio .yarn):
validateSources(sources: SourceFile[]): ValidationReport;

// Valida los 28 capítulos reales (scripts/chapters):
validateChapters(): ValidationReport;

// Imprime un reporte como tabla legible:
formatReport(report: ValidationReport): string;
```

`SourceFile` es `{ file: string; source: string }`.

```ts
import { validateSources } from "@/features/dialogue/validate";

const report = validateSources([
  { file: "prueba.yarn", source: "title: Start\n---\nMaya: hola\n===\n" },
]);

if (!report.ok) {
  for (const issue of report.issues) {
    console.error(`${issue.severity} ${issue.file}:${issue.line} ${issue.message}`);
  }
}
```

---

## 4. Qué valida cada regla

### 4.1. Fugas de texto (`text:*`)

| Regla | Severidad | Detecta |
| --- | --- | --- |
| `text:empty-line` | error | `Maya:` sin texto (línea vacía) |
| `text:unknown-speaker` | error | Personaje que no es `Maya` (ni narrador) |
| `text:unresolved-interpolation` | error | `{var}` sin `<<declare>>` ni inyectada (`player_name`, `pronouns`) |
| `text:duplicate-line` | warning | Línea larga de Maya repetida en el mismo nodo |

### 4.2. Fugas de decisiones (`decisions:*`)

| Regla | Severidad | Detecta |
| --- | --- | --- |
| `decisions:single-option` | warning | Bloque con una sola opción (SPEC §4.1: 2-3) |
| `decisions:too-many-options` | warning | Bloque con más de 4 opciones |
| `decisions:duplicate-option` | error | Dos opciones idénticas en el mismo bloque |
| `decisions:empty-option` | error | Opción sin cuerpo (al elegirla no pasa nada) |
| `decisions:no-consequence` | warning | Opción sin deltas ni efectos |

### 4.3. Fugas de puntos (`points:*`)

| Regla | Severidad | Detecta |
| --- | --- | --- |
| `points:invalid-delta` | error | `<<affinity>>` sin `±N` numérico |
| `points:zero-delta` | warning | `<<romance 0>>` (no cambia nada) |
| `points:delta-overflow` | warning | `|delta| > 10` (STORY.md §3: ±2 a ±10) |
| `points:direct-set-axis` | error | `<<set $affinity = 50>>` — prohibido, usar `<<affinity +N>>` |
| `points:in-condition` | warning | Delta dentro de un `<<if>>` (puntos que nadie eligió) |

### 4.4. Fugas de variables (`variables:*`)

| Regla | Severidad | Detecta |
| --- | --- | --- |
| `variables:undeclared` | error | Uso de `$var` sin `<<declare>>` ni runtime |
| `variables:declared-unused` | warning | Declarada pero nunca leída ni escrita |
| `variables:set-never-read` | warning | Escrita pero nunca leída |

### 4.5. Fugas de condiciones (`conditions:*`)

| Regla | Severidad | Detecta |
| --- | --- | --- |
| `conditions:empty` | error | `<<if>>` / `<<elseif>>` sin expresión |
| `conditions:threshold-out-of-range` | warning | Comparación de un eje fuera de 0-100 |
| `conditions:shadowed-branch` | error | Rama inalcanzable (ya cubierta por ramas anteriores) |
| `conditions:overlapping-branches` | warning | Dos ramas con regiones que se solapan (el orden decide) |

El análisis de sombra/solape es **por intervalos** sobre
`$affinity`/`$romance`/`$trust` (0-100). Solo se ejecuta cuando la cadena de
ramas usa exclusivamente los tres ejes; si hay otra variable, se descarta
silenciosamente para no dar conclusiones insanas.

### 4.6. Fugas estructurales (`structure:*`)

| Regla | Severidad | Detecta |
| --- | --- | --- |
| `structure:parse-error` | error | El archivo o el programa global no parsea/compila |
| `structure:duplicate-node` | error | Título de nodo repetido (deben ser únicos) |
| `structure:broken-jump` | error | `<<jump X>>` / `<<detour X>>` a un nodo inexistente |
| `structure:unreachable-node` | warning | Nodo nunca referenciado (historia huérfana) |
| `structure:invalid-photo` | error | `<<photo id>>` que no existe en `photos.ts` |
| `structure:once-block` | warning | `<<once>>` — usar `$cap_NN_done` (STORY.md §7) |
| `structure:missing-end-flag` | warning | Capítulo NN no setea `$cap_NN_done` |
| `structure:missing-next-jump` | error | Capítulo NN no salta a `Cap(NN+1)_…` |
| `structure:missing-fin` | warning | Capítulo 28 no termina con `<<fin>>` |

---

## 5. Convenciones que el motor exige (y que tus scripts deben cumplir)

```yarn
title: Cap7_Intro
---
<<chapter "Sesión en la azotea">>
<<presence online>>
Maya: Hola {player_name}
<<typing true>>
-> Opción con puntos        # 2-3 opciones por bloque, con cuerpo y deltas
    <<affinity +3>>
    <<trust +2>>
    Maya: Reacción
-> Opción alternativa
    <<affinity -2>>
    Maya: Otra reacción
<<typing false>>
<<presence offline>>
<<set $cap_07_done = true>>
<<jump Cap8_Intro>>
===
```

- **Ejes:** aplicar con `<<affinity +N>>`, `<<romance ±N>>`, `<<trust ±N>>` — nunca `<<set $eje>>`.
- **Deltas:** entre ±2 y ±10, atados a opciones del jugador, nunca dentro de un `<<if>>`.
- **Decisiones:** 2-3 opciones por bloque, sin texto duplicado, cada una con cuerpo y consecuencias.
- **Variables:** declarar en `Start`, usar `$cap_NN_done` en vez de `<<once>>`.
- **Condiciones:** solo ejes con umbrales 0-100; en cadenas de finales, ordenar las ramas más específicas primero (una rama sombreada por las anteriores es un error).
- **Fotos:** ids del catálogo `PHOTO_CATALOG` (`photos.ts`).
- **Cierre:** cada capítulo setea su flag y salta al siguiente; el 28 termina con `<<fin>>`.

---

## 6. Cómo añadir una regla nueva

1. Añade el id al union `RuleId` en `types.ts`.
2. Si es **por archivo**: crea una función `lintX(lexed, issues)` en
   `rules.ts` y llámala desde `lintLexedFile`. El `lexer` ya te da líneas y
   tokens (deltas, opciones, ifs, declaraciones, lecturas…).
3. Si es **global** (nodos, jumps, variables, ramas): añade una función en
   `structure.ts` y llámala desde `lintGlobal`.
4. Añade un caso en `engine.test.ts` con un script de prueba que dispare la
   regla y uno limpio que no la dispare.

Ejemplo mínimo de regla por archivo:

```ts
function lintX(lexed: LexedFile, issues: ValidationIssue[]): void {
  for (const delta of lexed.deltas) {
    if (delta.axis === "romance" && delta.delta > 0) {
      issue(issues, "points:delta-overflow", "warning", lexed.file,
        delta.line, "Romance positivo en un capítulo de altibajos");
    }
  }
}
```

---

## 7. Preguntas frecuentes

**¿Por qué un hallazgo es `warning` y no `error`?**
Los `warning`s son decisiones de diseño o consecuencias aditivas (opción
forzada, delta grande, variable muerta, rama solapada). Los `error`s rompen
el juego: no parsea, salta a un nodo que no existe, una opción no hace nada,
un delta es inválido, o un final nunca se alcanza.

**Veo muchos warnings en los finales (solapes). ¿Qué hago?**
Reordena las ramas de más específica a más general. El motor marca como
`error` solo la rama **inalcanzable** (contenida por completo en otra); los
solapes son avisos de que el orden decide en silencio.

**¿Puedo validar un solo capítulo?**
Sí:

```ts
import { validateSources } from "@/features/dialogue/validate";
import { loadChapterSources } from "@/features/dialogue/scripts";

const capitulo7 = loadChapterSources().find((c) => c.file.startsWith("07-"))!;
console.log(formatReport(validateSources([{ file: capitulo7.file, source: capitulo7.source }])));
```
