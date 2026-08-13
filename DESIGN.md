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

### 4.3. Input Area y Teclado Falso

- **Caja de Texto (Pill-shape):** Una barra de entrada con forma de píldora en la parte inferior. Incluye un icono de cámara (desactivado/decorativo) a la izquierda y el botón de enviar (flecha hacia arriba dentro de un círculo de color acento) a la derecha.
- **Menú de Opciones:** Cuando el jugador debe responder, el área del teclado asciende desde abajo, presentando las 2 o 3 opciones de respuesta como botones anchos, planos y minimalistas.
- **Teclado Virtual (Fake Typing View):** Al seleccionar una opción, los botones desaparecen y el teclado virtual (una réplica limpia y minimalista del teclado de iOS sin caracteres visualmente recargados) sube a la pantalla. El texto predefinido comienza a llenarse en la caja de la píldora conforme el jugador presiona el teclado.

---

## 5. Microinteracciones y Animaciones

El diseño plano cobra vida a través del movimiento fluido y las respuestas hápticas (donde el hardware lo permita):

- **Animación de Escribir (Typing Indicator):** La burbuja con los tres puntos suspensivos que saltan rítmicamente. Aparece con un suave "pop" elástico.
- **Entrada de Mensajes:** Los nuevos mensajes de Maya se deslizan desde la parte inferior con una ligera curva de aceleración (ease-out), empujando el historial hacia arriba de forma natural.
- **Feedback del Teclado Falso:** Cada toque en el teclado virtual ilumina sutilmente la tecla presionada (estado _active_ de CSS) para dar una retroalimentación visual al jugador de que su acción se está registrando.
- **Apertura de Fotografías:** Tocar una miniatura expande la foto a pantalla completa utilizando una transición compartida (Shared Element Transition), oscureciendo el fondo de manera progresiva.

---

¿Te gustaría que definamos cómo se estructurará la cuadrícula visual para la sección de la "Galería" donde se guardan todas las fotos de Maya?
