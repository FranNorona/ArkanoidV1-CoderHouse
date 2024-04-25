const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const $sprite = document.querySelector('#sprite');
const $bricks = document.querySelector('#bricks');

canvas.width = 448;
canvas.height = 400;

/*Definimos los objetos*/
/*Pelota o Bola*/
const ball = {
    radius: 3,
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: -3,
    dy: -3
};

/*Paleta o Pala*/
const paddle = {
    sensitivity: 8,
    width: 50,
    height: 10,
    rightPressed: false,
    leftPressed: false
};

/*Declaramos donde queremos ubicar nuestra paleta, luego de crear dicho objeto*/
paddle.x = (canvas.width - paddle.width) / 2;
paddle.y = canvas.height - paddle.height - 10;

/*Ladrillos*/
const ladrillo = {
    rowCount: 6,
    columnCount: 13,
    width: 32,
    height: 16,
    padding: 0,
    offsetTop: 80,
    offsetLeft: 16,
    info: []
};

/*La variable LADRILLO_STATUS nos va a ayudar en la logica de saber que ladrillos estan rotos*/
const LADRILLO_STATUS = {
    ACTIVE: 1,
    DESTROYED: 0
};
/*El siguiente bucle es para generar los ladrillos de forma automatica y los colores de forma random*/
for (let c = 0; c < ladrillo.columnCount; c++) {
    ladrillo.info[c] = [] //Iniciamos con un array vacio
    for (let r = 0; r < ladrillo.rowCount; r++) {
      //Calculamos donde van a estar ubicados los ladrillos
      const bricksX = c * (ladrillo.width + ladrillo.padding) + ladrillo.offsetLeft;
      const bricksY = r * (ladrillo.height + ladrillo.padding) + ladrillo.offsetTop;
      //Asignamos un color aleatorio al ladrillo
      const random = Math.floor(Math.random() * 8)
      //Guardamos la información de cada ladrillo en el array vacio de antes
    ladrillo.info[c][r] = {
        x: bricksX,
        y: bricksY,
        status: LADRILLO_STATUS.ACTIVE,
        color: random
    }
    }
}
/*Declaramos las funciones para dibujar los objetos*/
/*Dibujamos la pelota*/
function drawBall() {
    ctx.beginPath() // iniciar el trazado
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.closePath() // terminar el trazado
};

/*Llamamos al dibujo*/
function drawPaddle()    {
    ctx.drawImage(
        $sprite,
        29,
        174,
        paddle.width,
        paddle.height,
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height
        );
}

function drawBricks()    {
    for (let c = 0; c < ladrillo.columnCount; c++)    {
        for (let r = 0; r < ladrillo.rowCount; r++)    {
            const currentBrick = ladrillo.info[c][r]
            if (currentBrick.status === LADRILLO_STATUS.DESTROYED) continue;

            const clipX = currentBrick.color * 32;
            ctx.drawImage(
                $bricks,
                clipX,
                0,
                ladrillo.width,
                ladrillo.height,
                currentBrick.x,
                currentBrick.y,
                ladrillo.width,
                ladrillo.height
            );
        }
    }
}

function drawUI() {
    ctx.fillText(`FPS: ${framesPerSec}`, 5, 10)
}

/*LOGICA DEL JUEGO*/
/*Colisiones generales*/
function collisionDetection() {
    for (let c = 0; c < ladrillo.columnCount; c++) {
        for (let r = 0; r < ladrillo.rowCount; r++) {
            const currentBrick = ladrillo.info[c][r]
            if (currentBrick.status === LADRILLO_STATUS.DESTROYED) continue;

        const isBallSameXAsBrick =
            ball.x > currentBrick.x &&
            ball.x < currentBrick.x + ladrillo.width

        const isBallSameYAsBrick =
            ball.y > currentBrick.y &&
            ball.y < currentBrick.y + ladrillo.height

        if (isBallSameXAsBrick && isBallSameYAsBrick) {
            ball.dy = -ball.dy
          currentBrick.status = LADRILLO_STATUS.DESTROYED //Marcar el ladrillo como destruido
        }
        }
    }
}

/*Colisiones sobre los laterales*/
function ballWallCollision() {
    if (
        ball.x + ball.dx > canvas.width - ball.radius ||
        ball.x + ball.dx < ball.radius
    )    {
        ball.dx = -ball.dx
    }
}

/*Colisiones sobre la parte TOP*/
function ballTopCollision()    {
    if (ball.y + ball.dy < ball.radius)    {
        ball.dy = -ball.dy;
    }
}


/*Colisiones sobre la paleta*/
function ballPaddleCollision()    {
    const isBallSameXAsPaddle =
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width;

    const isBallSameYAsPaddle =
    ball.y + ball.dy > paddle.y;

    if (isBallSameXAsPaddle && isBallSameYAsPaddle) {
        ball.dy = -ball.dy
    } else if (
        ball.y + ball.dy > canvas.height - ball.radius || ball.y + ball.dy > paddle.y + paddle.height
    )    {
        console.log('Game Over');
        document.location.reload()
    }
}

/*Movimiento de la pelota o bola*/
function moveBall()    {
    ball.x += ball.dx;
    ball.y += ball.dy;
}

/*Movimiento de la paleta*/
function paddleMovement()    {
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.sensitivity
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.sensitivity
    }
}

/*Definimos una funcion para que limpie el dibujo, lo utilizaremos frame a frame para que haga el efecto deseado*/
function cleanCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

/*Generamos eventos para poder controlar la paleta con el teclado*/
function initEvents()    {
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    function keyDownHandler(event) {
        const { key } = event
        if (key === 'Right' || key === 'ArrowRight' || key.toLowerCase() === 'd') {
            rightPressed = true
        } else if (key === 'Left' || key === 'ArrowLeft' || key.toLowerCase() === 'a') {
            leftPressed = true
        }
    }

    function keyUpHandler(event) {
        const { key } = event
        if (key === 'Right' || key === 'ArrowRight' || key.toLowerCase() === 'd') {
            rightPressed = false
        } else if (key === 'Left' || key === 'ArrowLeft' || key.toLowerCase() === 'a') {
        leftPressed = false
        }
    }
}
/*Establecemos funciones para renderizar el juego*/
const fps = 60;

let msPrev = window.performance.now();
let msFPSPrev = window.performance.now() + 1000;

const msPerFrame = 1000 / fps;

let frames = 0;
let framesPerSec = fps;

/*Llamamos a la funcion para su dibujo*/
function draw()    {
    window.requestAnimationFrame(draw);

    const msNow = window.performance.now();
    const msPassed = msNow - msPrev;

    if (msPassed < msPerFrame) return;

    const excessTime = msPassed % msPerFrame
    msPrev = msNow - excessTime

    frames++

    if (msFPSPrev < msNow)  {
    msFPSPrev = window.performance.now() + 1000
    framesPerSec = frames;
    frames = 0;
    }

    cleanCanvas();

    //Dibujamos los elementos
    drawBall();
    drawPaddle();
    drawBricks();
    drawUI();

    //Llamamos a las colisiones y movimiento
    collisionDetection();
    ballWallCollision();
    ballTopCollision();
    ballPaddleCollision();
    moveBall();
    paddleMovement();
}

draw();
initEvents();