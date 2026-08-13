# SPEC.md - In Focus

## 1. Visión General del Juego

**In Focus** es una novela visual inmersiva que simula una aplicación de mensajería estilo iOS. El jugador interactúa exclusivamente a través de una interfaz de chat en su dispositivo con un único personaje principal: **Maya**. Maya es una fotógrafa hiperactiva, exageradamente extrovertida y caótica que constantemente comparte su visión del mundo enviando fotografías de su día a día. El juego se centra en la construcción de una relación (amistad o romance) a través de la intimidad digital, conversaciones asíncronas y el intercambio de multimedia.

## 2. Inspiración y Estética

- **Estética:** Interfaz de usuario limpia, minimalista y familiar, calcada de aplicaciones de mensajería nativas (burbujas de chat azules/grises, confirmaciones de lectura, estado de "escribiendo...").
- **Inspiración de Gameplay:** Juegos como _Mystic Messenger_ (por la intimidad del chat en tiempo real), _Emily is Away_ (por la narrativa de decisiones por texto) y mecánicas de "hacker type" (donde presionar cualquier tecla autocompleta el texto deseado).
- **Tono:** Cálido, humorístico, ligeramente caótico, pero con momentos de vulnerabilidad emocional profunda a medida que la relación avanza.

## 3. Reglas de Negocio y Configuración Inicial

- **Creación de Perfil:** Al iniciar una nueva partida, el jugador debe configurar su perfil dentro de la app ficticia.
- Ingreso de Nombre (o apodo).
- Selección de género/pronombres (Él, Ella, Neutro). _Nota: Maya adaptará su lenguaje y coqueteos basándose en esta configuración para mayor inmersión._

- **Flujo de Tiempo:** El juego simula el paso del tiempo. Los mensajes pueden tener pausas intencionales para simular que Maya está ocupada, tomando fotos o durmiendo, generando expectativa en el jugador.

## 4. Mecánicas de Jugabilidad (Core Gameplay Loop)

### 4.1. Sistema de Respuestas Múltiples

- Cuando es el turno del jugador de hablar, la interfaz de chat se pausa y despliega de 2 a 3 opciones de respuesta en la parte inferior de la pantalla.
- Cada opción representa una "actitud" diferente (ej. Sarcástico, Cariñoso, Desinteresado, Curioso).
- La elección del jugador define la ruta de la conversación y afecta el medidor de afinidad oculto de Maya.

### 4.2. La Mecánica del Teclado Falso (Fake Typing)

- Una vez que el jugador selecciona una de las opciones de respuesta, el mensaje **no se envía inmediatamente**.
- Aparece en pantalla un teclado virtual estilo móvil.
- **Interacción:** El jugador debe "teclear" para escribir el mensaje. Sin embargo, no importa qué tecla física presione o dónde toque en el teclado virtual; el sistema rellenará automáticamente la caja de texto con el mensaje de la opción predefinida, letra por letra.
- **Objetivo:** Generar la satisfacción kinestésica y la inmersión de estar escribiendo realmente la respuesta, simulando la acción de chatear sin la frustración de equivocarse de letras.
- Una vez que el texto predefinido se completa, el botón de "Enviar" se ilumina y el jugador debe presionarlo para mandar el mensaje.

### 4.3. Sistema de Fotografías y Galería

- Maya envía fotografías constantemente (comida, paisajes desenfocados, selfies, animales callejeros, luces de neón).
- Las fotos aparecen en el chat como miniaturas que el jugador puede tocar para ver en pantalla completa.
- **App de Galería Integrada:** El juego incluye una pestaña secundaria (fuera del chat, pero dentro de la "app") que funciona como una Galería donde se guardan automáticamente todas las fotos que Maya ha enviado, funcionando como un sistema de coleccionables del progreso del juego.

### 4.4. Dinámica de Estados y Notificaciones

- **Burbuja de "Escribiendo...":** Maya no responde instantáneamente. El juego calcula un tiempo de respuesta basado en la longitud de su texto para mostrar los tres puntos suspensivos, dándole vida al personaje.
- **Estados de Conexión:** Maya puede aparecer "En línea", "Desconectada" o "Tomando fotos...".
- **Notificaciones In-Game:** Si el jugador sale a la pantalla principal del juego (el menú de la app), recibirá "notificaciones push" ficticias cuando Maya mande un mensaje nuevo.

## 5. Variaciones y Consecuencias (Branching System)

- **Sistema de Relación Multieje:** Las respuestas del jugador suman o restan
  puntos en tres ejes independientes (ver `STORY.md §3`):
  - **Afinitad** (`affinity`): compañerismo y humor compartido.
  - **Romance** (`romance`): tensión y enamoramiento. Puede caer en los altibajos.
  - **Confianza** (`trust`): lo más difícil de ganar y de perder. Baja con
    mentiras y con el secreto del rollo.
- _Alta Afinitad + Romance:_ Maya envía fotos más personales (selfies, su
  cuarto, proyectos en los que está atascada) y la narrativa se vuelve romántica.
- _Baja Afinitad / Amistad:_ Maya mantiene un tono de "bro" o colega, enviando
  fotos más genéricas y manteniendo una distancia emocional segura.

- **Reacciones Dinámicas a las Fotos:** En ciertas fotos clave, el jugador tiene
  la opción de dar un "Me gusta" o "Me encanta" estilo iMessage (presión larga
  sobre la foto) en lugar de responder con texto, lo cual desencadena una
  reacción específica de Maya.
- **Eventos de Ausencia:** Si el jugador elige respuestas que animan a Maya a
  enfocarse en una sesión de fotos importante, ella podría desaparecer del chat
  durante horas del tiempo de juego, regresando más tarde con una ráfaga masiva
  de mensajes emocionados y la foto final.
- **Tiempo Asíncrono:** la historia fluye en días de juego (modo acelerado en
  demo/QA; tiempo real en producción). Maya duerme, hace fotos y se conecta en
  horarios; las notificaciones push avisan cuando llega un mensaje fuera del chat.
- **Múltiples Finales:** dependiendo del balance de los tres ejes al final de la
  historia, el juego concluye en diferentes escenarios (cita real, amistad a
  distancia, la que casi fue, desaparición gradual, o reencuentro años después).
  Ver `STORY.md §5`.
