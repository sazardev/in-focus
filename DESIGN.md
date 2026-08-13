# DESIGN.md - In Focus

## 1. Filosofía y Dirección de Arte

La interfaz visual de **In Focus** se define por un enfoque plano y minimalista, priorizando el contenido (las fotografías de Maya y la conversación) sobre la ornamentación. La estructura base calca la anatomía de iOS Messages para generar familiaridad instantánea y una sensación táctil realista, pero sustituye la paleta clínica y fría de Apple por un sistema de colores cálidos y adaptativos inspirados en la extracción tonal de Material Design (Material You).

El objetivo es lograr un balance perfecto: la elegancia estructurada de iOS combinada con la calidez visual de una experiencia narrativa íntima.

---

## 2. Sistema de Color (Material Warmth)

La aplicación no tendrá un modo claro/oscuro estático y tradicional. En su lugar, el jugador elegirá un "Tono Base" al configurar su perfil, o el sistema extraerá colores predominantes de la foto de perfil actual de Maya para generar una paleta armónica.

- **Tonos Base Cálidos (Ejemplos):** Terracota suave, Melocotón, Arena del desierto, Naranja atardecer, Rosa pálido.
- **Fondo de la App (Background):** En lugar de blanco puro (`#FFFFFF`) o negro puro (`#000000`), se utilizarán colores crema muy tenues (ej. `#FDFBF7`) para el modo claro, y grises cálidos profundos (ej. `#1E1C1A`) para el modo oscuro. Esto reduce la fatiga visual.
- **Burbujas del Jugador:** Adoptan el color primario derivado del Tono Base (con texto en contraste dinámico, blanco o marrón oscuro).
- **Burbujas de Maya:** Un gris muy suave con un subtono cálido (ej. `#EFECE8`), manteniendo una apariencia plana sin bordes ni sombras pesadas.

---

## 3. Tipografía

Para mantener la ilusión de un sistema operativo real mientras garantizamos legibilidad en todas las plataformas:

- **Fuente Principal:** Sistema Nativo (San Francisco en macOS/iOS, Segoe UI en Windows, Roboto/Inter en Linux/Android). Esto ancla la app a la realidad del dispositivo del jugador.
- **Pesos Tipográficos:**
- _Regular (400):_ Para el cuerpo de los mensajes.
- _Medium (500) / Semibold (600):_ Para el nombre del contacto en la barra superior y los botones de acción.
- _Tracking (Espaciado):_ Ligeramente ajustado para maximizar la lectura en párrafos largos (cuando Maya envía textos extensos).

---

## 4. Anatomía de la Pantalla Principal (Chat View)

La vista de chat es el núcleo del juego y se divide en tres zonas estrictas, siguiendo el estándar de iOS:

### 4.1. Navigation Bar (Cabecera)

- **Layout:** Fijo en la parte superior, con un efecto de desenfoque translúcido (Acrylic/Glassmorphism muy sutil) para que los mensajes se desvanezcan suavemente al hacer scroll hacia arriba.
- **Elementos:**
- Izquierda: Flecha de retroceso limpia (estilo chevron de iOS) y un contador de mensajes no leídos falso (ej. `< 3`).
- Centro: Avatar circular de Maya. Debajo de su nombre ("Maya 📸"), un indicador de estado dinámico ("En línea", "Escribiendo...", "Tomando fotos...").
- Derecha: Icono de información (i) o icono de "Galería" para acceder a las fotos guardadas.

### 4.2. Área de Mensajes (Canvas)

- **Alineación:** Maya a la izquierda (sin avatar al lado de cada mensaje, solo en el primero de un bloque), Jugador a la derecha.
- **Estilo de Burbuja (Bubble UI):** Bordes altamente redondeados (radius de ~18px a 24px). El último mensaje de un bloque tiene la clásica "cola" o apéndice que apunta hacia el lado correspondiente, imitando a iOS.
- **Integración Multimedia:** Las fotografías enviadas por Maya ocupan el ancho máximo permitido para una burbuja, con bordes redondeados y sin marcos.
- **Timestamps:** Visibles sutilmente entre bloques de conversación o al deslizar la pantalla hacia la izquierda (comportamiento oculto de iOS).

### 4.3. Input Area y Respuesta Automática

- **Caja de Texto (Pill-shape):** Una barra de entrada con forma de píldora en la parte inferior. Incluye un icono de cámara (desactivado/decorativo) a la izquierda y el botón de enviar (flecha hacia arriba dentro de un círculo de color acento) a la derecha.
- **Menú de Opciones:** Cuando el jugador debe responder, el área del teclado asciende desde abajo, presentando las 2 o 3 opciones de respuesta como botones anchos, planos y minimalistas.
- **Respuesta automática (auto-type):** Al elegir una opción, el texto predefinido se "escribe" solo en la píldora (auto-fill letra a letra, en ~1 segundo) y se **envía automáticamente** al terminar. No hay teclado virtual ni pulsaciones del jugador: basta elegir la opción, y el envío se percibe como si el propio jugador hubiera tecleado el mensaje. Esto mantiene la ilusión de mensajería sin fricción ni tecleo manual.

---

## 5. Simulación de Dispositivos (Device Mockup)

Para dar más impacto y reforzar la ilusión de estar dentro de un mensajero real, la aplicación se presenta dentro de un **marco de dispositivo simulado** que se adapta al contexto del jugador:

- **Móvil (portrait):** la app se ve como un teléfono real: ocupa el ancho del viewport, con barra de estado, notch/isla dinámica, esquinas redondeadas y la zona de respuesta anclada abajo.
- **Escritorio / Web (landscape amplio):** la app se enmarca dentro de un **mockup de laptop**: la ventana simula la pantalla de un portátil (bezel sutil) y el chat se centra en el viewport, como si el mensajero corriera en el equipo.
- **Tablet:** la app usa un **marco de tablet**: más ancho que el móvil (~768–1024px) con bezel redondeado; la columna de chat mantiene una proporción cómoda y deja espacio para posibles paneles secundarios.
- **Reglas del marco:** el marco es decorativo y nunca corta contenido interactivo; el scroll y el overscroll se comportan como en el dispositivo real; el mockup escala con la ventana conservando la proporción del dispositivo simulado.

### 5.1. Inicio (Springboard del sistema)

El inicio se ve como el springboard del dispositivo simulado (DESIGN.md §5):
- **Móvil (iOS):** fondo tipo wallpaper cálido, cuadrícula de iconos de app (squircle) y un **dock** inferior con cristal esmerilado (Mensajes, Galería, Ajustes).
- **Tablet (iPad):** springboard con más columnas (6) e iconos más holgados.
- **Escritorio (macOS):** escritorio con **barra de menú** superior (logo + hora en vivo), iconos de app y un dock inferior.
- Los iconos de app funcionales navegan (Mensajes → chat, Galería/Fotos → galería, Ajustes); el resto son apps del sistema decorativas. El badge de Mensajes refleja los no leídos.

---

## 6. Microinteracciones y Animaciones

El diseño plano cobra vida a través del movimiento fluido y las respuestas hápticas (donde el hardware lo permita):

- **Animación de Escribir (Typing Indicator):** La burbuja con los tres puntos suspensivos que saltan rítmicamente. Aparece con un suave "pop" elástico.
- **Entrada de Mensajes:** Los nuevos mensajes de Maya se deslizan desde la parte inferior con una ligera curva de aceleración (ease-out), empujando el historial hacia arriba de forma natural.
- **Tecleo automático (Auto-type):** Al elegir una respuesta, el texto se rellena en la píldora letra a letra (ritmo de tecleo) y el botón de enviar se ilumina justo antes de que el mensaje se mande solo.
- **Apertura de Fotografías:** Tocar una miniatura expande la foto a pantalla completa utilizando una transición compartida (Shared Element Transition), oscureciendo el fondo de manera progresiva.

---

¿Te gustaría que definamos cómo se estructurará la cuadrícula visual para la sección de la "Galería" donde se guardan todas las fotos de Maya?
