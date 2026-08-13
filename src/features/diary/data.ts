export interface DiaryEntry {
	chapter: number;
	title: string;
	/** resumen de lo que se habló / sucedió en el capítulo */
	recap: string;
	/** reflexión del protagonista sobre el capítulo */
	text: string;
	/** nota personal del protagonista (marginalia) */
	note: string;
}

/**
 * Diario del protagonista: una entrada completa por capítulo con el resumen de
 * la conversación, la reflexión y una nota personal.
 */
export const DIARY: DiaryEntry[] = [
	{
		chapter: 1,
		title: "El número en la nota",
		recap:
			"Encontré una caja en la entrada con un rollo de fotos y un número escrito a mano. Le escribí al número sin pensarlo dos veces, y alguien respondió.",
		text: "No sé por qué escribí, pero algo me dijo que debía hacerlo. A veces un impulso lo cambia todo.",
		note: "Guardé la caja. Algo me dice que no es casual que llegara a mí.",
	},
	{
		chapter: 2,
		title: "36 fotos",
		recap:
			"Revelé el rollo: 36 fotos de una ciudad que no reconozco. Alguien llamado Maya apareció al otro lado del chat con respuestas raras, como si las fotos le importaran más de lo que dice.",
		text: "Treinta y seis fotos que no son mías, pero que ya siento parte de mi historia. Y detrás de cada una, alguien.",
		note: "Debería preguntarle si las fotos son suyas. Tengo que saber.",
	},
	{
		chapter: 3,
		title: "La chica del neón",
		recap:
			"Le conté sobre la foto de la chica frente al neón. Se puso rara, cortante, y me preguntó si había más como esa. Hay una historia ahí que no quiere contar todavía.",
		text: "Hay algo en esa imagen que le duele, y yo, sin querer, la abrí.",
		note: "La foto del neón. Algo le dolió. Toca con cuidado.",
	},
	{
		chapter: 4,
		title: "Primera noche",
		recap:
			"La conversación se fue hasta las 2 a.m. Hablamos de todo y de nada: música, miedo a la gente, por qué se escribe a desconocidos. Se me hizo corta la noche.",
		text: "Ya no me sentí tan solo. Es curioso cómo un desconocido puede llenar un silencio que cargaba desde hace años.",
		note: "No recuerdo la última vez que se me pasó la noche tan rápido.",
	},
	{
		chapter: 5,
		title: "Aparece y desaparece",
		recap:
			"Maya se esfumó dos días. Cuando volvió, dijo que le daba miedo depender de alguien. Le dije que yo también, y que igual me quedo.",
		text: "Cuando volvió, me di cuenta de que ya la esperaba. De que ya me importa.",
		note: "La esperé. Eso ya significa algo.",
	},
	{
		chapter: 6,
		title: "Rutina",
		recap:
			"Empezamos con un 'buenos días' que se volvió ritual. Me contó de su rutina, de sus fotos, de su barrio. Yo le conté del mío.",
		text: "Lo que se repite con ganas deja de ser casualidad. Esto ya no es casualidad.",
		note: "Su buenos días ya es lo primero que busco al despertar.",
	},
	{
		chapter: 7,
		title: "Sesión en la azotea",
		recap:
			"Me mandó una sesión de fotos en su azotea: la luz del atardecer, su ciudad. Me explicó por qué mira la luz así. La entendí un poco más.",
		text: "Vi el mundo a través de sus fotos y por un momento sentí que lo veía con sus ojos.",
		note: "Ver el mundo con sus ojos me gusta más de lo que debería.",
	},
	{
		chapter: 8,
		title: "Playlist",
		recap:
			"Hizo una playlist para mí y para ella. Dijo que cada canción tiene un color y me describió cada una. La canción ámbar era su favorita.",
		text: "Me mandó una canción ámbar y la escuché dos veces. Cuidado: estoy empezando a guardar sus canciones.",
		note: "Escuché la canción ámbar dos veces seguidas.",
	},
	{
		chapter: 9,
		title: "El primer malentendido",
		recap:
			"Peleamos por un comentario sobre sus fotos que sonó a desprecio. Me lo dijo, me disculpé sin excusas y se arregló. No guardamos rencor.",
		text: "Aprendí que con ella no sirven las frases hechas. Solo la verdad, sin filtros.",
		note: "Con ella las frases hechas no funcionan. Mejor ser honesto, aunque escueza.",
	},
	{
		chapter: 10,
		title: "Su cuarto",
		recap:
			"Hizo un video de su cuarto: desorden, rollos, papeles y su cámara. Me mostró lo que nadie ve. Le dije que me gustaba su caos.",
		text: "Nadie agradece que te muestres tal cual eres; ella sí. Quiero ser de los que se quedan a ver sus miedos.",
		note: "Que alguien te enseñe su desorden es un acto de confianza.",
	},
	{
		chapter: 11,
		title: "Insomnio",
		recap:
			"De madrugada, sin poder dormir, me contó lo que quiere ser cuando deje de tener miedo. Le dije que ya era mi persona de las 3 a.m. y no mentí.",
		text: "Quiero ser valiente como ella está aprendiendo a serlo. Y quiero estar cuando no pueda dormir.",
		note: "Su 'no puedo dormir' me tiene en alerta. Quiero estar cuando aparece.",
	},
	{
		chapter: 12,
		title: "Silencio",
		recap:
			"Tres días de silencio. Cuando volvió me contó que estuvo a punto de dejar el proyecto y de escribirme para siempre. Volvió rota, pero volvió.",
		text: "La extrañaba más de lo que quiero admitir. Volvió rota y aun así me alegré de que volviera.",
		note: "El silencio me pesó más de lo que voy a admitir.",
	},
	{
		chapter: 13,
		title: "La crisis",
		recap:
			"Me confesó que se siente un fraude: que sus fotos no son suyas, que no se lo merece. La escuché y le dije que está bien no estar bien.",
		text: "Se siente un fraude, como yo a veces. Le dije que está bien no estar bien y me lo agradeció como si fuera oro.",
		note: "Ojalá alguien me lo dijera a mí también. A veces me siento igual.",
	},
	{
		chapter: 14,
		title: "La discusión",
		recap:
			"Discutimos feo. Me gritó en el chat por algo que no le dije a tiempo. Me quedé, la dejé hablar y al final me dio las gracias por quedarme.",
		text: "Aprendí que a veces querer es callar y quedarse, no arreglar. Discutimos, y también eso fue querernos.",
		note: "Querer a veces es callar y quedarse. Hoy lo entendí.",
	},
	{
		chapter: 15,
		title: "Distancia",
		recap:
			"Pasaron días de frialdad. Volvió con fotos de calles vacías que eran un mensaje: así se sentía. La entendí sin que dijera nada.",
		text: "Seguía ahí, viendo lo que sentía sin que lo dijera.",
		note: "Sus fotos hablan cuando ella no puede.",
	},
	{
		chapter: 16,
		title: "Reconciliación",
		recap:
			"Hicimos un trato: honestidad por encima de todo. Me prometió avisarme cuando tuviera miedo en vez de desaparecer. Acepté.",
		text: "Por primera vez en mucho tiempo, siento que esto va en serio.",
		note: "Un trato con ella. Primera vez que un pacto se siente así.",
	},
	{
		chapter: 17,
		title: "El borde",
		recap:
			"Estuvimos a punto de cruzar una línea en la conversación y ella se asustó, se fue un rato y volvió. Me pidió que la esperara en el borde.",
		text: "Aquí estoy, esperando, porque vale la pena.",
		note: "La espero. Las buenas historias tienen ese borde.",
	},
	{
		chapter: 18,
		title: "El proyecto",
		recap:
			"La aceptaron en la exposición del barrio. Me contó la idea completa y me pidió que la ayudara a elegir las fotos. Dijo que mi opinión le importa.",
		text: "Entré a su vida creativa y quiero quedarme ahí. Su historia ahora es un poco mía.",
		note: "Su proyecto ya es un poco mío. Me gusta cómo suena eso.",
	},
	{
		chapter: 19,
		title: "Casi",
		recap:
			"Me confesó que estuvo a punto de besarme en su imaginación, en la galería de su cabeza. Yo también lo estuve. Se quedó flotando el 'casi'.",
		text: "Este 'casi' ya no es de los que se olvidan.",
		note: "Un casi que no pienso olvidar.",
	},
	{
		chapter: 20,
		title: "Celos",
		recap:
			"Hablamos de fantasmas del pasado: su ex, mis inseguridades. Los dos celosos, los dos queriendo ser la única persona que haga sonreír al otro.",
		text: "Me dijo que quiere ser la única que me haga sonreír. Y yo, que quiero ser el que la hace sonreír a ella.",
		note: "Quiero ser el único que la haga sonreír.",
	},
	{
		chapter: 21,
		title: "El plan",
		recap:
			"Cerramos el plan: la exposición es el sábado y nos veremos en persona. Me dijo que no sabe si va a poder soltarme al abrazarme.",
		text: "Dijo que no sabe si podrá soltarme al abrazarme. Yo tampoco quiero soltarla.",
		note: "El sábado. Me tiemblan las manos solo de pensarlo.",
	},
	{
		chapter: 22,
		title: "El sueño",
		recap:
			"Soñó que nos besábamos entre sus fotos colgadas. Despertó con el corazón a mil y me lo contó con vergüenza. Le dije que yo también lo he soñado.",
		text: "Yo también lo he soñado. Mañana quizá lo hagamos real.",
		note: "Mañana el sueño puede ser real. Estoy nervioso.",
	},
	{
		chapter: 23,
		title: "La caída",
		recap:
			"Me contó la verdad del rollo: era un 'te dejo' que nunca llegó a enviar. El miedo a que yo hiciera lo mismo la perseguía. La escuché y me quedé.",
		text: "Aun así, quiero abrazarla. La verdad no me quitó las ganas de estar cerca.",
		note: "La verdad no me quitó las ganas de estar cerca. Todo lo contrario.",
	},
	{
		chapter: 24,
		title: "Verdad",
		recap:
			"Confesión completa: lo que sentía desde el principio, el miedo, y que quiere besarme. Dije que yo también, que llevo días queriendo lo mismo.",
		text: "Después de tanto silencio, por fin nos estamos diciendo lo que sentimos.",
		note: "Por fin nos estamos diciendo lo que sentimos.",
	},
	{
		chapter: 25,
		title: "La invitación",
		recap:
			"Me invitó oficialmente a la exposición, solo para mí, antes de que abra. Me advirtió que a solas no sabe si podrá evitar besarme.",
		text: "Yo tampoco voy a poder evitarlo.",
		note: "Yo tampoco voy a poder evitarlo.",
	},
	{
		chapter: 26,
		title: "El encuentro",
		recap:
			"La vi por primera vez, de verdad. En la galería, entre sus fotos, se hizo un silencio donde estuvimos a punto de besarnos. Casi. Otra vez casi.",
		text: "Es más real de lo que imaginé. Ese casi lo guardo conmigo.",
		note: "Es más real, más bonita, más todo de lo que imaginé.",
	},
	{
		chapter: 27,
		title: "La declaración",
		recap:
			"Lo dijimos de frente: lo que sentimos, sin escondernos. Y lo sellamos. Todo el camino de mensajes, las dudas y los silencios, llegaron a ese momento.",
		text: "Nosotros, de frente, sin escondernos. Y lo sellamos con un beso.",
		note: "No hay casi esta vez. Fue un sí.",
	},
	{
		chapter: 28,
		title: "Finales",
		recap:
			"La exposición terminó y con ella decidimos el rumbo: una historia que empezó con un número en una caja. Sea cual sea el final, ya no soy el que era.",
		text: "La historia que empezó con una caja de cartón terminó como ninguna que imaginé.",
		note: "Lo que empezó como un adiós terminó como un hola.",
	},
];
