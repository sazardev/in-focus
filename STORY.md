# STORY.md — In Focus: "El rollo que no debí revelar"

Biblia narrativa de la historia de amor entre el jugador y **Maya**. Esta
historia se escribe como un libro de ~500 páginas: el amor crece lento,
con desconocidos → amistad → altibajos → enamoramiento, en conversaciones
asíncronas que duran semanas de tiempo de juego.

---

## 1. Premisa y gancho

Un fin de semana, en un mercadillo de segunda mano, encuentras una caja de
revelado de fotos. Adentro: un rollo de película sin revelar y una nota
escrita a mano con letra apresurada y un borde garabateado de corazones y
espirales:

> "si encontraste esto, es porque el universo tiene buen ojo.
> (número) — pregúntame por la foto que va dentro"

No puedes resistirte. Revelas el rollo: 36 fotos de una ciudad que no
reconoces, tomadas por alguien con ojo obsesivo. Una sola tiene una persona:
una chica de espaldas frente a un escaparate de neón, riéndose de algo que
está fuera de cuadro.

Le escribes al número. Comienza la historia.

**El misterio del rollo** es el hilo emocional de toda la novela: ¿quién es
esa chica de la foto? ¿Por qué la caja terminó en el mercadillo? La verdad se
revela en el Acto IV y define cuál de los finales es posible.

### Regla de oro del tono

Todo se cuenta a través del chat. No hay narrador omnisciente: solo lo que
Maya escribe, lo que envía (fotos, audios, gifs), los estados de presencia y
lo que el jugador elige decir. La tensión vive en los silencios, los "visto a
las 3:12 a.m." y los mensajes que se borran antes de leerse.

---

## 2. Biblia del personaje: Maya 📸

### Ficha

| Campo | Valor |
| --- | --- |
| Nombre | Maya Contreras |
| Edad | 24 |
| Ocupación | Fotógrafa freelance, a medio camino entre "le va increíble" y "sobrevive con lo justo" |
| Voz | Caótica, hiperactiva, exagerada, con momentos de vulnerabilidad cruda |
| Animal espiritual | Golden retriever con ansiedad de rendimiento |
| Defecto motor | Se va por las ramas; escribe 5 mensajes en vez de 1; borra y reescribe |
| Miedo profundo | No ser lo suficientemente buena; que la gente se vaya al conocerla de verdad |
| Sueño | Una exposición individual; que alguien entienda sus fotos sin que ella las explique |

### Cómo habla (por etapa de relación)

- **Desconocida (Acto I):** aguda, graciosa, llena de "jaja" y emojis, pero
  con paredes. Responde con preguntas en vez de responder. Prueba al jugador:
  quiere saber si es un acosador o alguien genuinamente curioso.
- **Amistad (Acto II):** comparte su día sin filtro, manda fotos de todo,
  arma playlists, inventa apodos. Usa el humor como puente.
- **Altibajos (Acto III):** se quiebra. Sus mensajes se vuelven cortos,
  cortantes, a destiempo. Revela inseguridad e impaciencia consigo misma.
  El silencio es su forma de castigarse.
- **Enamoramiento (Acto IV):** coqueta, torpe, nerviosa. Escribe y borra
  mensajes románticos. Manda audios de madrugada. Da miedo y le encanta.
- **Declaración (Acto V):** valiente cuando ya no puede evitarlo. Deja de
  esconderse detrás del humor.

### Pronombres y lenguaje

Maya adapta el lenguaje según `$pronouns` del jugador (ya soportado por el
engine): "Qué atrevido/a/e" y todos los adjetivos sensibles al género del
jugador. Usar `<<if $pronouns == "he">>` / `"she"` / `else` en cada línea
donde el género importe.

### El jugador

- Sin cara, sin voz fija. El perfil se crea en onboarding (nombre + pronombres).
- Su personalidad se define **por elección de respuesta**, no por declaración.
- Los tres ejes (Afinitad, Romance, Confianza) crecen con lo que **hace**, no
  con lo que dice que es.

---

## 3. Sistema de relación (multieje)

La historia se mide con **tres ejes independientes** (0–100), cada uno con
tiers que cambian el texto y las opciones disponibles:

### 3.1. Afinitad (`$affinity`) — "qué tan bien nos llevamos"

Compañerismo, simpatía, humor compartido. Sube con interés genuino, memoria
de lo que cuenta, apoyo en lo cotidiano.

- 0–19 `stranger` — textos de cortesía y curiosidad.
- 20–49 `friend` — chistes internos, rutina compartida.
- 50–79 `close` — confianza, vulnerabilidad cotidiana.
- 80–100 `partner` — complicidad total, "persona del grupo".

### 3.2. Romance (`$romance`) — "qué tan enamorados"

Tensión, coqueteo, momentos que se quedan en el aire. Sube con riesgo
emocional, atención a lo íntimo, chispas. **Puede caer** en los altibajos.

- 0–19 `cold` — cero señales.
- 20–49 `curious` — coqueteo ligero, bromas con doble sentido.
- 50–79 `spark` — tensión consciente, casi-confesiones, celos.
- 80–100 `love` — enamoramiento declarado o a punto de estarlo.

### 3.3. Confianza (`$trust`) — "qué tan segura se siente contigo"

Lo más difícil de ganar y lo más fácil de perder. Sube con honestidad,
consistencia, estar cuando importa. **Baja con mentiras, ignorar señales,
y con el secreto del rollo.**

- 0–19 `guarded` — no suelta nada real.
- 20–49 `wary` — prueba el terreno.
- 50–79 `open` — cuenta su vida, sus miedos.
- 80–100 `safe` — te confía lo que no le dice a nadie.

### Reglas de diseño

- **Los altibajos bajan romance pero pueden subir confianza**: una pelea
  honesta que termina en reconciliación fortalece el vínculo aunque duela.
- **Los finales dependen del balance, no de un solo eje.** Nadie "gana" solo
  por acumular romance; abandonar confianza en el Acto IV lleva al final frío.
- Cada opción aplica deltas pequeños (±2 a ±10). 500 páginas = muchas
  decisiones; el acumulado decide, no una sola.

---

## 4. Arco narrativo: 5 actos, 28 capítulos

Cada capítulo = un bloque de conversación asíncrona con un beat emocional
central, fotos y entre 3 y 8 decisiones. Los capítulos se escriben en Yarn
(`src/features/dialogue/scripts/chapters/NN-titulo.yarn`).

### Acto I — Desconocidos (Capítulos 1–5)

| Cap | Título | Beat central | Ejes que mueve |
| --- | --- | --- | --- |
| 1 | El número en la nota | Primer mensaje. Maya desconfía: ¿quién eres?, ¿cómo conseguiste su número? | affinity, trust (frágil) |
| 2 | 36 fotos | El rollo revelado. Ella se entera y se intriga: quiere ver qué hay en el rollo. | affinity, trust |
| 3 | La chica del neón | La foto de la persona. Maya se pone rara, se ríe, lo esquiva. Fin: "no es asunto tuyo quién es". | romance (semilla), trust |
| 4 | Primera noche | Madrugada, conversación real, apodos, primer "jaja" verdadero. | affinity, romance |
| 5 | Aparece y desaparece | Maya se va 2 días (ausencia). El jugador siente el hueco. Vuelve con una ráfaga. | trust, affinity |

### Acto II — Amistad (Capítulos 6–11)

| Cap | Título | Beat central | Ejes que mueve |
| --- | --- | --- | --- |
| 6 | Rutina | El "buenos días" se vuelve hábito. Fotos del día. | affinity |
| 7 | Sesión en la azotea | Maya invita (virtualmente) a una sesión; manda fotos detrás de cámaras. | affinity, romance |
| 8 | Playlist | Comparte música; descubre que el jugador recuerda sus canciones. | affinity, romance |
| 9 | El primer malentendido | Una broma sale mal. Pelea chiquita. Se arregla con honestidad. | trust (+ si honesto), affinity (- si frío) |
| 10 | Su cuarto | Primera foto personal: su cuarto, su caos, sus proyectos. | trust |
| 11 | Insomnio | Conversación de 3 a.m.: lo que Maya quiere ser cuando no tiene miedo. | trust, romance |

### Acto III — Altibajos (Capítulos 12–18)

| Cap | Título | Beat central | Ejes que mueve |
| --- | --- | --- | --- |
| 12 | Silencio | Maya desaparece 3 días sin aviso (ausencia larga). | trust (-), affinity (-) |
| 13 | La crisis | Vuelve rota: perdió una oportunidad grande, se siente fraude. | trust (+), romance |
| 14 | La discusión | Pelea real: ella dice "no entiendes lo que es esto"; el jugador puede ser cruel o quedarse. | trust (decision), romance (- fuerte) |
| 15 | Distancia | Frío prolongado. Mensajes cortantes. El jugador decide si insistir o respetar. | trust, affinity |
| 16 | Reconciliación | Un mensaje honesto de madrugada. Se reconstruye. | trust (+), romance |
| 17 | El borde | Casi algo. Maya se asusta y se retira. "Lo siento, no debería." | romance (decision fuerte) |
| 18 | El proyecto | Maya pide ayuda real con su exposición. El jugador entra a su vida creativa. | affinity, trust, romance |

### Acto IV — Enamoramiento (Capítulos 19–24)

| Cap | Título | Beat central | Ejes que mueve |
| --- | --- | --- | --- |
| 19 | Casi | Noche de vulnerabilidad mutua. Ambos saben que hay algo. | romance |
| 20 | Celos | Maya pregunta por "esa persona" de la foto; el jugador pregunta por el ex de Maya. | romance, trust |
| 21 | El plan | Maya propone verse en persona. Realidad: da miedo. | romance, trust |
| 22 | El sueño | Planean el futuro a medias. La tensión se vuelve esperanza. | romance |
| 23 | La caída | La verdad del rollo: la chica del neón era una relación que Maya dejó atrás. El rollo fue un regalo que ella "no quiso". | trust (- grande), romance (-) |
| 24 | Verdad | Maya confiesa el origen del rollo y por qué lo tiró. El jugador decide cómo recibe la verdad. | trust (decision enorme), romance |

### Acto V — Declaración (Capítulos 25–28)

| Cap | Título | Beat central | Ejes que mueve |
| --- | --- | --- | --- |
| 25 | La invitación | Maya invita al jugador a la inauguración de su exposición. | todos |
| 26 | El encuentro | Se ven por primera vez (narrado en el chat: antes, durante, después). | todos |
| 27 | La declaración | La confesión. El jugador dice cómo se siente. | romance (pico), trust |
| 28 | Finales | Según el balance, desenlace (ver §5). | — |

---

## 5. Finales (según balance de ejes)

| Final | Requisitos | Desenlace |
| --- | --- | --- |
| **Brindis a medianoche** | romance ≥ 70, trust ≥ 70 | Relación real. La exposición inaugura con una foto dedicada al jugador. El rollo cuelga enmarcado en la pared. |
| **Mi mejor amiga** | affinity ≥ 70, romance < 60, trust ≥ 60 | Amistad profunda y duradera. Maya se muda, pero el chat no se apaga: "no dejaría de escribirte ni de pedo". |
| **La que casi fue** | romance 40–69, trust < 60 | Se ven, hay chispa, pero el timing no es. Quedan en "algún día". Silencio largo... y un mensaje un año después. |
| **Sin despedida** | affinity < 40 o trust < 30 al final | La conversación se apaga gradualmente. El último mensaje de Maya queda en "enviado", sin leer. Los mensajes se espacian hasta detenerse. |
| **Reencuentro** (oculto) | romance ≥ 50, trust < 30 al final del Acto IV, y elección de "darlo todo en el Acto V" | Se pierden, años después el número sigue vivo y ella responde. |

Los finales se determinan con `<<if>>` sobre las variables `$affinity`,
`$romance`, `$trust` al final del Capítulo 28 (nodo `Finales`).

> ⚠️ Orden de evaluación: las condiciones deben ir de la más restrictiva a la
> más general para evitar solapamientos. El orden correcto es: Brindis
> (rom≥70 ∧ trust≥70) → Reencuentro (rom≥50 ∧ trust<30) → Mi mejor amiga
> (aff≥70 ∧ rom<60 ∧ trust≥60) → La que casi fue (rom 40-69 ∧ trust<60) →
> Sin despedida (aff<40 ∨ trust<30) → El destino (else).

---

## 6. Mecánicas narrativas por capítulo

Cada capítulo debe usar al menos 3 de estas mecánicas:

1. **Ráfaga de fotos** (`<<photo id>>` + `<<presence taking-photos>>`).
2. **Ausencia** (`<<absence>>`): silencio de minutos (Acto I) a "días"
   simulados con el reloj de juego (Acto III).
3. **Escribiendo...** (`<<typing true/false>>`): pausas antes de los mensajes
   pesados.
4. **Estados de conexión** (`<<presence online/offline/taking-photos>>`):
   "En línea", "Desconectada", "Tomando fotos...".
5. **Notificación push** (`<<notify "texto">>`): mensaje de Maya que llega
   como notificación si el jugador está en el home, no en el chat.
6. **Fotografía clave**: 1–2 fotos por capítulo que se coleccionan en la
   Galería (coleccionables de progreso).
7. **GIF/emojis**: no requieren comando, van inline en el texto de Maya.

### Ritmo de escritura

- Maya manda **párrafos cortos**: 1–3 oraciones por mensaje, con humor y
  emoción. Longitud media de línea: 60–120 caracteres.
- Nunca dos mensajes seguidos sin presencia de "escribiendo..." o silencio.
- Cada capítulo termina con un **gancho**: pregunta sin respuesta, "visto",
  o una foto que lo cambia todo.

---

## 7. Variables de la historia

Declaradas una vez en el nodo `_setup` (primer archivo del Acto I):

```yarn
<<declare $affinity = 0>>
<<declare $romance = 0>>
<<declare $trust = 0>>
<<declare $mejores_fotos = 0>>
<<declare $rollo_revelado = false>>
<<declare $cap_01_done = false>> ... <<declare $cap_28_done = false>>
<<declare $supo_la_verdad = false>>
```

- `$cap_NN_done` = flags explícitos (reemplazan `once`/`visited()` para que el
  resume sea fiel).
- `$mejores_fotos` = contador de apreciación del trabajo de Maya (gate de la
  rama del Acto I → Acto II).

---

## 8. Catálogo de fotos (se amplía en código)

Seeds `picsum` en `PHOTO_CATALOG` (placeholder hasta integrar assets reales
vía Rust). Cada capítulo referencia ids con nombres semánticos:

`atardecer`, `neon`, `luz`, `mapa`, `azotea`, `playlist`, `cuarto`, `caos`,
`pelicula`, `rollo`, `autoescudo`, `exposicion`, `ventana`, `lluvia`,
`calle_vacia`, `escalera`, `sombra`, `selfie_timida`, `selfie_atrevida`,
`flor`, `mercadillo`, `audios`, `noche`, `desayuno`, `gato`, `ciudad_3am`,
`plano`, `escaparate`, `brindis`, `enmarcada`.

---

## 9. Convenciones de escritura Yarn (resumen)

- Un archivo por capítulo: `scripts/chapters/01-el-numero.yarn` ... `28-finales.yarn`.
- Nodos nombrados `Cap1_*`, `Cap2_*`, ... únicos a nivel global.
- `<<jump CapN_Titulo>>` para encadenar capítulos.
- Aplicar deltas con `<<affinity>>`, `<<romance>>`, `<<trust>>` (comandos del
  engine) — NUNCA `<<set $affinity = X>>` directo.
- `<<if $pronouns == "he">>` para adjetivos con género.
- Terminar cada capítulo en un nodo `CapN_fin` con el gancho y el jump al
  siguiente (o `<<fin>>` en `Finales`).
- Cero comentarios en `.yarn` (el parser no los soporta): todo se documenta
  en este archivo y en el README del script.
- **Condiciones compuestas**: `yarn-spinner-runner-ts` tenía un bug de
  precedencia (evaluaba comparaciones antes que `&&`/`||`). El engine lo
  parchea en `src/features/dialogue/evaluator-patch.ts` — las condiciones
  con `&&`/`||` funcionan correctamente (verificado por tests).

---

## 10. Referencia cruzada con los docs de diseño

- **DESIGN.md** define la UI: burbujas, tipografía, tonos cálidos. La historia
  no añade pantallas nuevas salvo la tarjeta de capítulo (Fase 3).
- **SPEC.md** define mecánicas: teclado falso, reacciones, ausencias,
  notificaciones, múltiples finales. La historia las usa todas; el eje único
  de afinidad se **reemplaza** por el sistema multieje (actualizar SPEC §5).
- **STACK.md** define la arquitectura: la historia es datos (`yarn`), no
  lógica; el motor Rust solo persiste.
