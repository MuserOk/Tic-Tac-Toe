// Elementos del DOM
const menuInicio = document.getElementById('menuInicio');
const contenedorJuego = document.getElementById('contenedorJuego');
const tablero = document.getElementById('tablero');
const indicadorTurno = document.getElementById('indicadorTurno');
const modalResultado = document.getElementById('modalResultado');
const textoResultado = document.getElementById('textoResultado');
const detalleResultado = document.getElementById('detalleResultado');
const etiquetaJugador1 = document.getElementById('etiquetaJugador1');
const etiquetaJugador2 = document.getElementById('etiquetaJugador2');

// Botones
const btnX = document.getElementById('btn-x');
const btnO = document.getElementById('btn-o');
const vsCpu = document.getElementById('vsCpu');
const vsPlayer = document.getElementById('vsPlayer');
const botonReiniciar = document.getElementById('botonReiniciar');
const botonSalir = document.getElementById('botonSalir');
const botonSiguienteRonda = document.getElementById('botonSiguienteRonda');

// Marcadores
const puntuacionX = document.getElementById('puntuacionX');
const puntuacionO = document.getElementById('puntuacionO');
const puntuacionEmpates = document.getElementById('puntuacionEmpates');

// Variables del juego
let jugadorActual = 'X';
let fichaJugador1 = 'X';
let esVsCPU = false;
let tableroJuego = ['', '', '', '', '', '', '', '', ''];
let juegoActivo = true;
let puntuaciones = { x: 0, o: 0, empates: 0 };

const combinacionesGanadoras = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // filas
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columnas
    [0, 4, 8],
    [2, 4, 6] // diagonales
];


// Actualizar etiquetas de jugadores
function actualizarEtiquetasJugadores() {
    if (fichaJugador1 === 'X') {
        etiquetaJugador1.textContent = 'X (TÚ)';
        etiquetaJugador2.textContent = esVsCPU ? 'O (CPU)' : 'O (J2)';
    } else {
        etiquetaJugador1.textContent = 'O (TÚ)';
        etiquetaJugador2.textContent = esVsCPU ? 'X (CPU)' : 'X (J2)';
    }
}

// Inicializar el tablero
function inicializarTablero() {
    tablero.innerHTML = '';
    const clasesCelda = "bg-blue-900 rounded-lg shadow flex justify-center items-center cursor-pointer hover:bg-blue-800 transition-colors ";
    const clasesTamanio = "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 ";
    const clasesTexto = "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold ";

    for (let i = 0; i < 9; i++) {
        const celda = document.createElement('div');
        celda.className = clasesCelda + clasesTamanio + clasesTexto;
        celda.dataset.indice = i;
        celda.addEventListener('click', manejarClicCelda);
        tablero.appendChild(celda);
    }

    jugadorActual = fichaJugador1;
    indicadorTurno.textContent = `TURNO DE ${jugadorActual}`;
}

// Manejar clic en celda
function manejarClicCelda(e) {
    const indice = e.target.dataset.indice;

    if (tableroJuego[indice] !== '' || !juegoActivo) return;

    hacerMovimiento(indice, jugadorActual);

    if (verificarGanador(jugadorActual)) {
        finalizarJuego(jugadorActual);
        return;
    }

    if (verificarEmpate()) {
        finalizarJuego('empate');
        return;
    }

    cambiarJugador();
}

// Realizar movimiento
function hacerMovimiento(indice, jugador) {
    tableroJuego[indice] = jugador;
    const celda = tablero.children[indice];
    celda.textContent = jugador;
    const esJugador1 = (jugador === fichaJugador1);
    celda.classList.add(esJugador1 ? 'text-green-400' : 'text-orange-400');
}

// Cambiar jugador
function cambiarJugador() {
    jugadorActual = jugadorActual === 'X' ? 'O' : 'X';
    indicadorTurno.textContent = `TURNO DE ${jugadorActual}`;

    // Si es turno de la CPU y estamos en modo CPU, hacer movimiento automático
    if (esVsCPU && juegoActivo) {
        const fichaCPU = fichaJugador1 === 'X' ? 'O' : 'X';
        if (jugadorActual === fichaCPU) {
            setTimeout(movimientoCPU, 500);
        }
    }
}
// Verificar victoria
function verificarGanador(jugador) {
    return combinacionesGanadoras.some(combinacion => {
        return combinacion.every(indice => tableroJuego[indice] === jugador);
    });
}

// Verificar empate
function verificarEmpate() {
    return tableroJuego.every(celda => celda !== '');
}

// Movimiento de la CPU
function movimientoCPU() {
    if (!juegoActivo) return;

    const fichaCPU = fichaJugador1 === 'X' ? 'O' : 'X';

    // Estrategia simple: primero busca ganar, luego bloquea, luego movimiento aleatorio
    let movimiento;

    // 1. Buscar movimiento ganador
    movimiento = encontrarMovimientoGanador(fichaCPU);

    // 2. Si no, bloquear al jugador
    if (movimiento === undefined) {
        movimiento = encontrarMovimientoGanador(fichaJugador1);
    }

    // 3. Si no, movimiento aleatorio
    if (movimiento === undefined) {
        const celdasVacias = tableroJuego.map((celda, indice) => celda === '' ? indice : null).filter(val => val !== null);
        movimiento = celdasVacias[Math.floor(Math.random() * celdasVacias.length)];
    }

    if (movimiento !== undefined) {
        hacerMovimiento(movimiento, fichaCPU);

        if (verificarGanador(fichaCPU)) {
            finalizarJuego(fichaCPU);
            return;
        }

        if (verificarEmpate()) {
            finalizarJuego('empate');
            return;
        }

        cambiarJugador();
    }
}

// Encontrar movimiento ganador o bloqueador
function encontrarMovimientoGanador(jugador) {
    for (const combinacion of combinacionesGanadoras) {
        const [a, b, c] = combinacion;
        const celdas = [tableroJuego[a], tableroJuego[b], tableroJuego[c]];

        // Si hay 2 del jugador y 1 vacía
        if (celdas.filter(c => c === jugador).length === 2 && celdas.includes('')) {
            return combinacion[celdas.indexOf('')];
        }
    }
    return undefined;
}

// Finalizar juego
function finalizarJuego(resultado) {
    juegoActivo = false;

    // Deshabilitar el tablero
    const celdas = document.querySelectorAll('#tablero > div');
    celdas.forEach(celda => {
        celda.classList.add('opacity-70', 'pointer-events-none');
    });

    if (resultado === 'empate') {
        textoResultado.textContent = 'RONDA EMPATADA';
        detalleResultado.textContent = 'NADIE GANA';
        puntuaciones.empates++;
        puntuacionEmpates.textContent = puntuaciones.empates;
    } else {
        const esVictoriaJugador = (resultado === fichaJugador1);
        textoResultado.textContent = esVictoriaJugador ? '¡GANASTE!' : '¡PERDISTE!';

        // Mostrar el mensaje correcto según el modo de juego
        if (esVsCPU) {
            detalleResultado.textContent = `${resultado} ${esVictoriaJugador ? '(TÚ)' : '(CPU)'} GANA`;
        } else {
            detalleResultado.textContent = `${resultado} ${esVictoriaJugador ? '(J1)' : '(J2)'} GANA`;
        }

        const esVictoriaJugador1 = (resultado === fichaJugador1);
        if (esVictoriaJugador1) {
            if (fichaJugador1 === 'X') {
                puntuaciones.x++;
                puntuacionX.textContent = puntuaciones.x;
            } else {
                puntuaciones.o++;
                puntuacionO.textContent = puntuaciones.o;
            }
        } else {
            if (fichaJugador1 === 'X') {
                puntuaciones.o++;
                puntuacionO.textContent = puntuaciones.o;
            } else {
                puntuaciones.x++;
                puntuacionX.textContent = puntuaciones.x;
            }
        }

        // Resaltar celdas ganadoras
        const combinacionGanadora = combinacionesGanadoras.find(combinacion =>
            combinacion.every(indice => tableroJuego[indice] === resultado)
        );

        if (combinacionGanadora) {
            combinacionGanadora.forEach(indice => {
                tablero.children[indice].classList.add('winner-cell');
            });
        }
    }

    modalResultado.classList.remove('hidden');
}

// Reiniciar ronda
function reiniciarRonda() {
    tableroJuego = ['', '', '', '', '', '', '', '', ''];
    juegoActivo = true;
    jugadorActual = fichaJugador1;
    indicadorTurno.textContent = `TURNO DE ${jugadorActual}`;

    // Restaurar opacidad y eventos
    const celdas = document.querySelectorAll('#tablero > div');
    celdas.forEach(celda => {
        celda.classList.remove('opacity-70', 'pointer-events-none', 'winner-cell', 'text-green-400', 'text-orange-400');
        celda.textContent = '';
    });

    modalResultado.classList.add('hidden');
    // Si es modo CPU y el jugador eligió O, la CPU hace el primer movimiento
    if (esVsCPU && fichaJugador1 === 'O') {
        setTimeout(() => {
            jugadorActual = 'X'; // La CPU es X en este caso
            movimientoCPU();
        }, 500);
    }
}

// Reiniciar juego completo
function reiniciarJuego() {
    reiniciarRonda();
    puntuaciones = { x: 0, o: 0, empates: 0 };
    puntuacionX.textContent = '0';
    puntuacionO.textContent = '0';
    puntuacionEmpates.textContent = '0';
}

// Volver al menú
function volverAlMenu() {
    menuInicio.classList.remove('hidden');
    contenedorJuego.classList.add('hidden');
    reiniciarJuego();
}

// Event listeners
btnX.addEventListener('click', () => {
    fichaJugador1 = 'X';
    btnX.classList.add('bg-gray-400', 'text-blue-950');
    btnX.classList.remove('hover:bg-gray-400', 'hover:text-blue-950', 'text-gray-400');
    btnO.classList.remove('bg-gray-400', 'text-blue-950');
    btnO.classList.add('hover:bg-gray-400', 'hover:text-blue-950', 'text-gray-400');
    actualizarEtiquetasJugadores();
});

btnO.addEventListener('click', () => {
    fichaJugador1 = 'O';
    btnO.classList.add('bg-gray-400', 'text-blue-950');
    btnO.classList.remove('hover:bg-gray-400', 'hover:text-blue-950', 'text-gray-400');
    btnX.classList.remove('bg-gray-400', 'text-blue-950');
    btnX.classList.add('hover:bg-gray-400', 'hover:text-blue-950', 'text-gray-400');
    actualizarEtiquetasJugadores();
});

vsCpu.addEventListener('click', () => {
    esVsCPU = true;
    actualizarEtiquetasJugadores();
    menuInicio.classList.add('hidden');
    contenedorJuego.classList.remove('hidden');
    reiniciarRonda();

});

vsPlayer.addEventListener('click', () => {
    esVsCPU = false;
    actualizarEtiquetasJugadores();
    menuInicio.classList.add('hidden');
    contenedorJuego.classList.remove('hidden');
    reiniciarRonda();
});

botonReiniciar.addEventListener('click', reiniciarRonda);
botonSalir.addEventListener('click', volverAlMenu);
botonSiguienteRonda.addEventListener('click', reiniciarRonda);

// Inicializar
inicializarTablero();
actualizarEtiquetasJugadores();