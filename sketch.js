let ventanasTareas = []; // Array para almacenar las ventanas de tareas
let tareasCompletadas = 0; // Contador para llevar la cuenta de cuántas ventanas de tareas se han cerrado
const tiempoTotal = 40 * 1000; // Duración total en milisegundos para la aparición de nuevas ventanas
const intervaloInicial = 0.9 * 1000; // Intervalo inicial de tiempo en milisegundos para la creación de nuevas ventanas
const intervaloFinal = 0.3 * 1000; // Intervalo final de tiempo en milisegundos para la creación de nuevas ventanas
let video; // Variable para almacenar el video
let botonInicio; // Variable para el botón de inicio
let totalVentanasCreadas = 0; // Contador para el total de ventanas creadas
let creandoVentanas = true; // Variable para saber si se siguen creando ventanas
let sonidos = []; // Array para almacenar los sonidos de notificación
let imagenes = {}; // Objeto para almacenar las imágenes de notificación

function preload() {
  // Cargar los sonidos de notificación y manejar posibles errores
  for (let i = 1; i <= 8; i++) {
    let rutaSonido = `sonidos/${i}.wav`;
    loadSound(rutaSonido, (sonido) => {
      console.log(`Sonido ${rutaSonido} cargado correctamente`);
      sonidos.push(sonido);
    }, (err) => {
      console.error(`Error al cargar el sonido ${rutaSonido}:`, err);
    });
  }

  // Cargar las imágenes de notificación
  let nombresImagenes = ['facebook', 'instagram', 'gmail', 'linkedin', 'mensaje', 'tiktok', 'whatsapp', 'youtube'];
  nombresImagenes.forEach(nombre => {
    let rutaImagen = `notificaciones/${nombre}.jpg`;
    loadImage(rutaImagen, (img) => {
      console.log(`Imagen ${rutaImagen} cargada correctamente`);
      imagenes[nombre] = img;
    }, (err) => {
      console.error(`Error al cargar la imagen ${rutaImagen}:`, err);
    });
  });
}

function setup() {
  noCanvas(); // No necesitamos un canvas visible
  video = select('#video-arte'); // Selecciona el elemento del video
  video.hide(); // Oculta el video al principio
  video.elt.onended = reiniciarExperiencia; // Añade un evento que escucha cuando el video termina
  botonInicio = select('#boton-inicio'); // Selecciona el botón de inicio
  botonInicio.mousePressed(iniciarExperiencia); // Asigna la función iniciarExperiencia al evento mousePressed del botón
}

function iniciarExperiencia() {
  botonInicio.hide(); // Oculta el botón de inicio
  document.getElementById('fondo-arte').style.filter = 'none'; // Quita el desenfoque al inicio
  video.show(); // Muestra el video
  video.elt.play().then(() => {
    setTimeout(() => {
      video.elt.pause(); // Pausa el video después de 3 segundos
      document.getElementById('fondo-arte').style.filter = 'blur(10px)'; // Aplica desenfoque al fondo
      iniciarCreacionVentanas(intervaloInicial, 0); // Inicia la creación de ventanas con intervalos crecientes
    }, 3000); // Espera 3 segundos antes de aplicar el desenfoque y pausar el video
  }).catch((error) => {
    console.error('Error al reproducir el video:', error);
  });
}

function iniciarCreacionVentanas(intervaloTiempo, tiempoTranscurrido) {
  if (tiempoTranscurrido >= tiempoTotal) {
    creandoVentanas = false; // Detiene la creación de ventanas después del tiempo total
    return;
  }

  crearVentanaTarea(); // Crea una nueva ventana de tarea
  totalVentanasCreadas++; // Incrementa el contador de ventanas creadas

  // Calcula el nuevo intervalo de tiempo
  let nuevoIntervaloTiempo = map(tiempoTranscurrido, 0, tiempoTotal, intervaloInicial, intervaloFinal);
  let nuevoTiempoTranscurrido = tiempoTranscurrido + nuevoIntervaloTiempo;

  setTimeout(() => {
    iniciarCreacionVentanas(nuevoIntervaloTiempo, nuevoTiempoTranscurrido);
  }, nuevoIntervaloTiempo);
}

function draw() {
  for (let i = ventanasTareas.length - 1; i >= 0; i--) { // Itera sobre el array `ventanasTareas` de atrás hacia adelante
    if (!ventanasTareas[i].estaCerrada) { // Si una ventana no está cerrada
      ventanasTareas[i].mostrar(); // Muestra la ventana de tarea
    } else {
      ventanasTareas[i].botonCerrar.remove(); // Elimina el botón de cierre del DOM
      ventanasTareas.splice(i, 1); // La elimina del array
      tareasCompletadas++; // Aumenta el contador de tareas completadas
      if (!creandoVentanas && tareasCompletadas === totalVentanasCreadas) { // Si todas las tareas han sido completadas
        revelarArte(); // Revela la obra de arte
      }
    }
  }
}

class VentanaTarea {
  constructor(x, y, contenido, imagen) {
    this.x = x;
    this.y = y;
    this.ancho = windowWidth * 0.2; // Establece un ancho fijo
    this.alto = windowHeight * 0.2; // Establece una altura fija
    this.contenido = contenido;
    this.imagen = imagen;
    this.estaCerrada = false;

    // Crear el contenedor de la ventana
    this.divVentana = createDiv().addClass('ventana-tarea').position(this.x, this.y).size(this.ancho, this.alto);

    // Crear el cuerpo de la ventana
    this.divCuerpo = createDiv('').addClass('cuerpo-tarea').parent(this.divVentana);
    let imgElement = createImg(this.imagen).parent(this.divCuerpo);
    this.divCuerpo.child(createP(this.contenido));

    // Crear el botón de cierre
    this.botonCerrar = createButton('X').addClass('boton-cerrar').parent(this.divVentana).style('float', 'right');
    this.botonCerrar.mousePressed(() => this.cerrar());

    // Reproducir un sonido de notificación
    reproducirSonidoAleatorio();
  }

  mostrar() {
    this.divVentana.position(this.x, this.y);
  }

  cerrar() {
    this.estaCerrada = true;
    this.divVentana.hide();
  }
}

function crearVentanaTarea() {
  const x = random(windowWidth - 480); // Genera una coordenada x aleatoria para la nueva ventana, asegurándose de que la ventana quepa en el ancho
  const y = random(windowHeight - 260); // Genera una coordenada y aleatoria para la nueva ventana, asegurándose de que la ventana quepa en la altura
  const contenido = ""; // Define el contenido de la ventana (vacío)
  const nombreImagen = random(Object.keys(imagenes)); // Selecciona un nombre de imagen aleatorio
  const rutaImagen = `notificaciones/${nombreImagen}.jpg`; // Construye la ruta de la imagen
  const nuevaVentana = new VentanaTarea(x, y, contenido, rutaImagen); // Crea una nueva instancia de `VentanaTarea` con las coordenadas y el contenido
  ventanasTareas.push(nuevaVentana); // Añade la nueva ventana al array `ventanasTareas`
}



function crearVentanaTarea() {
  const x = random(windowWidth - 480); // Genera una coordenada x aleatoria para la nueva ventana, asegurándose de que la ventana quepa en el ancho
  const y = random(windowHeight - 260); // Genera una coordenada y aleatoria para la nueva ventana, asegurándose de que la ventana quepa en la altura
  const contenido = `Contenido ${ventanasTareas.length + 1}`; // Define el contenido de la ventana
  const nombreImagen = random(Object.keys(imagenes)); // Selecciona un nombre de imagen aleatorio
  const rutaImagen = `notificaciones/${nombreImagen}.jpg`; // Construye la ruta de la imagen
  const nuevaVentana = new VentanaTarea(x, y, contenido, rutaImagen); // Crea una nueva instancia de `VentanaTarea` con las coordenadas y el contenido
  ventanasTareas.push(nuevaVentana); // Añade la nueva ventana al array `ventanasTareas`
}

function reproducirSonidoAleatorio() {
  if (sonidos.length > 0) {
    let sonido = random(sonidos); // Selecciona un sonido aleatorio del array
    sonido.play(); // Reproduce el sonido
  } else {
    console.error("No se han cargado sonidos.");
  }
}

function revelarArte() {
  document.getElementById('fondo-arte').style.filter = 'none'; // Quita el desenfoque del fondo para revelar la obra de arte
  video.show(); // Muestra el video
  video.elt.play(); // Reproduce el video
}

function reiniciarExperiencia() {
  // Resetea todas las variables y el estado de la aplicación
  ventanasTareas.forEach(ventana => ventana.divVentana.remove());
  ventanasTareas = [];
  tareasCompletadas = 0;
  totalVentanasCreadas = 0; // Reinicia el contador de ventanas creadas
  creandoVentanas = true; // Reinicia la variable de creación de ventanas
  video.hide();
  video.stop(); // Detiene el video
  video.elt.currentTime = 0; // Reinicia el video al inicio
  document.getElementById('fondo-arte').style.filter = 'none'; // Quita el desenfoque inicial
  botonInicio.show(); // Muestra el botón de inicio
}
