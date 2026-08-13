# STACK.md - In Focus

## 1. Visión General del Stack Tecnológico

**In Focus** utilizará una arquitectura híbrida de alto rendimiento, combinando un frontend reactivo y fuertemente tipado con un backend de sistema seguro y eficiente. La aplicación está diseñada para ser 100% multiplataforma, abarcando sistemas de escritorio, móviles y web bajo una misma base de código.

- **Frontend:** React 19 + TypeScript 7
- **Backend & Core:** Rust (a través del framework Tauri)
- **Empaquetador/Build Tool:** Vite
- **Target de Plataformas:** Android, iOS, Windows, Linux, macOS y Web (PWA/SPA).

---

## 2. Tecnologías Core y Responsabilidades

### 2.1. Frontend (Capa de Presentación)

- **React 19:** Utilizado para la renderización de la interfaz de usuario. Se aprovecharán las transiciones concurrentes y el nuevo compilador (React Compiler) para garantizar que la interfaz de chat (que renderizará cientos de mensajes) se mantenga a 60/120fps sin bloqueos en el hilo principal.
- **TypeScript 7:** Tipado estricto en toda la aplicación. Se utilizarán tipos avanzados para asegurar que los payloads de mensajes, las opciones de respuesta y los estados del juego estén validados en tiempo de compilación.
- **Gestor de Estado:** Zustand o Context API nativo de React 19. Al ser un flujo de datos predecible (mensajes entrantes y salientes), se priorizará un estado global ligero y modular.

### 2.2. Backend & Interfaz del Sistema (Tauri + Rust)

- **Tauri v2:** El motor principal para la distribución multiplataforma. Permite compilar binarios nativos para Windows y Linux, y aplicaciones nativas para Android e iOS, compartiendo el mismo frontend web.
- **Rust:** Encargado de la lógica pesada, seguridad y persistencia de datos.
- **Sistema de Guardado (Save States):** Escritura y lectura eficiente del progreso del jugador (afinidad, historial de chat) en el sistema de archivos local de forma asíncrona.
- **Gestión de Assets:** Carga diferida (lazy loading) de las fotografías de Maya desde el sistema de archivos para no saturar la memoria RAM del dispositivo.
- **IPC (Inter-Process Communication):** Comunicación segura entre React y Rust usando el sistema de comandos de Tauri.

---

## 3. Arquitectura del Proyecto (Escalabilidad y Modularidad)

### 3.1. Diseño Atómico (Atomic Design)

La UI se dividirá estrictamente bajo la metodología de Diseño Atómico para garantizar la reutilización de componentes y facilitar el testing:

- **Átomos:** Botones, Iconos, Avatares, Cajas de texto, Burbujas de chat individuales, Teclas del teclado virtual.
- **Moléculas:** Bloque de mensaje (Burbuja + Hora de envío + Confirmación de lectura), Fila del teclado virtual, Notificación push.
- **Organismos:** Lista de chat completa (scroll virtual), Teclado virtual completo, Galería de fotos, Menú de opciones de respuesta.
- **Plantillas:** Layout de la pantalla de chat, Layout de la pantalla de galería.
- **Páginas:** Pantalla principal del juego, Pantalla de configuración, Pantalla de la aplicación de mensajería.

### 3.2. Estructura de Directorios (Feature-Sliced Design)

El código se organizará por funcionalidades (features) en lugar de por tipos de archivos, asegurando alta cohesión y bajo acoplamiento:

```text
src/
 ├── app/               # Configuración global, providers y enrutamiento
 ├── entities/          # Tipos de TypeScript 7 y modelos de dominio (User, Message, MayaState)
 ├── features/          # Lógica de negocio encapsulada
 │    ├── chat/         # Renderizado de mensajes, auto-scroll, historiales
 │    ├── fake-typing/  # Lógica del teclado falso, captura de pulsaciones, auto-fill
 │    ├── gallery/      # Visualizador de imágenes, grilla de fotos
 │    └── affinity/     # Calculadora de puntaje y toma de decisiones
 ├── shared/            # Componentes atómicos de UI, hooks utilitarios, estilos
 └── tauri/             # (Carpeta src-tauri) Código en Rust, comandos IPC, configuración de build

```

---

## 4. Aseguramiento de Calidad (Tooling, Linter y Formatter)

Para mantener un código limpio, seguro y testeable en un entorno multiplataforma:

### 4.1. Analizadores y Linters

- **Frontend (TS/React):**
- **Biome (o ESLint + Prettier):** Formateo ultrarrápido y análisis estático de código. Reglas estrictas para evitar `any`, forzar el manejo de errores y garantizar dependencias correctas en hooks de React.
- **TypeScript Analyzer:** Configurado en modo `strict: true`, con comprobación exhaustiva de nulos (`strictNullChecks`).

- **Backend (Rust):**
- **Clippy:** Linter oficial de Rust para capturar antipatrones, cuellos de botella de rendimiento y código no idiomático.
- **Rustfmt:** Formateador estándar de Rust.

### 4.2. Estrategia de Testing (Testeable por diseño)

La arquitectura modular permite un aislamiento perfecto para pruebas:

- **Unit Testing (Vitest):** Pruebas puras para funciones de lógica de negocio (ej. cálculo de tiempo de respuesta de Maya, lógica de inserción de texto del _fake-typing_).
- **Component Testing (React Testing Library):** Verificación de renderizado de Organismos y Moléculas aisladas (ej. verificar que el botón de enviar se desactiva si el texto no está completo).
- **Integration & E2E (Playwright / Tauri WebDriver):** Pruebas de flujo completo de usuario simulando clics en la UI y verificando la persistencia de datos a través de los comandos de Rust.

---

## 5. Seguridad y Eficiencia

### 5.1. Seguridad

- **Aislamiento de IPC:** El frontend web no tiene acceso directo al sistema. Toda interacción (guardar progreso, cargar fotos de alta resolución) se hace a través de comandos IPC estrictamente tipados y validados por Rust.
- **Sandboxing:** Aprovechamiento del entorno seguro de Tauri; la aplicación se ejecuta con los permisos mínimos necesarios en Windows, Linux, Android e iOS.
- **Sanitización:** Aunque las respuestas son predefinidas, cualquier input del usuario (como el nombre del perfil) será sanitizado para evitar ataques de inyección si la app se compila para Web.

### 5.2. Rendimiento y Eficiencia

- **Virtualización de Listas:** El historial de chat utilizará virtualización (ej. `@tanstack/react-virtual`) para renderizar únicamente los mensajes visibles en pantalla, manteniendo el uso de memoria RAM al mínimo incluso después de horas de juego.
- **Zero-Cost Abstractions:** Rust garantizará un consumo de recursos imperceptible en segundo plano para la gestión del estado del juego.
- **Tamaño del Bundle Minúsculo:** Al usar Tauri, no se empaqueta Chromium (como hace Electron). La aplicación usará el WebView nativo del sistema operativo (Edge WebView2 en Windows, WebKit en macOS/iOS, etc.), resultando en un instalador de pocos megabytes.
