// UI elements
const canvas = document.getElementById("myCanvas")
const nextCanvas = document.getElementById("nextCanvas")

// Prepare board
const context = canvas.getContext("2d")
const boardWidth = 10
const boardHeight = 20
const blockSize = 30
const blockColors = ['black', 'red', 'orange', 'yellow', '#00ff00', 'cyan', 'blue', '#fab3f5', 'gray']
const colorCount = blockColors.length - 2
let current_color = getRandomColor(colorCount)

// construimos el tablero de 20 filas por 10 columnas
let board = Array.from({length: boardHeight}, () => Array(boardWidth).fill(0))

// prepare next block
const nextContext = nextCanvas.getContext("2d")
const nextBoardWidth = 3
const nextBoardHeight = 3
let nextBoard = Array.from({length: nextBoardHeight}, () => Array(nextBoardWidth).fill(0))

// generamos una pieza de ejemplo
let piece_x = 0
let piece_y = 0 

// ---- FUNCIONES ----------------------------------------------

function drawBlock(x, y, color, ctx){
    ctx.fillStyle = blockColors[color]
    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize)

    // borde
    ctx.strokeStyle = "#555"
    ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize)
}

function drawBoard(){
    board.forEach((row, y) => {
        row.forEach((color, x) => {
            drawBlock(x,y,color,context)
        })
    })
}

function drawNextBoard(){
    nextBoard.forEach((row, y) => {
        row.forEach((color, x) => {
            drawBlock(x,y,color,nextContext)
        })
    })
}

function movePiece(){
    safeClear(piece_x, piece_y)

    if (canMoveTo(piece_x, piece_y+1)){
        board[++piece_y][piece_x] = current_color
    } else {
        board[piece_y][piece_x] = current_color

        if (isValidPlace(piece_x, piece_y-1)){
            checkLine()
            piece_x = getRandomValue(boardWidth)
            current_color = getNextColor()
            choseNextBlock()
        } else {
            loseGame()
        }

        piece_y = -1 
    }
}

function choseNextBlock(){
    nextBoard[1][1] = getRandomColor(colorCount)
}

function getNextColor(){
    return nextBoard[1][1]
}

function checkLine(){
    let full = true

    // check if exists a blank space (black color)
    board[boardHeight-1].forEach(color => {
        if (color === 0){
            full = false
            return
        }
    })

    // move down everything (x1)
    if (full) for(y=boardHeight-2; y>-1; y--){
        for(x=0; x<boardWidth; x++){
            board[y+1][x] = board[y][x]
        }
    }
}

function loseGame(){
    const grayColor = blockColors.length - 1

    board.forEach((row, y) => {
        row.forEach((color, x) => {
            if (color) board[y][x] = grayColor
        })
    })
}

function resetGame(){
    board = board.map(row => row.map(color => 0))
    nextBoard = nextBoard.map(row => row.map(color => 0))

    choseNextBlock()
    drawBoard()
    drawNextBoard()

    piece_x = 0
    piece_y = -1
}

function gameLoop(){
    movePiece()
    //testBoard()
    drawBoard()
    drawNextBoard()
}

// ---- LISTENERS -----------------

document.addEventListener('keydown', e => {
    console.log(e)

    if (e.key == "Enter"){
        resetGame()
    } else if (e.key == "ArrowRight"){
        if (canMoveTo(piece_x+1, piece_y)) {
            board[piece_y][piece_x] = 0
            piece_x++
        }
    } else if (e.key == "ArrowLeft"){
        if (canMoveTo(piece_x-1, piece_y)) {
            board[piece_y][piece_x] = 0
            piece_x--
        }
    }
})

// ---- UTILS ---------------------

function safePaint(x,y){
    if (isValidPlace(x,y)) board[y][x] = current_color
}

function safeClear(x,y){
    if (isValidPlace(x,y)) board[y][x] = 0
}

function canMoveTo(x,y){
    if (isValidPlace(x,y)) return board[y][x] == 0
    return false
}

function isValidPlace(x,y){
    return (y >= 0 && y < boardHeight && x >= 0 && x < boardWidth)
}

function getRandomValue(max){
    return Math.floor(Math.random() * max);
}

function getRandomColor(count){
    return Math.floor(Math.random() * count) + 1
}

function testBoard(){
    for (x=0; x<boardWidth; x++){
        for (y=0; y<boardHeight; y++){
            board[y][x] = getRandomValue(3)
        }
    }
}

// ---- MAIN PROGRAM --------------

resetGame()
setInterval(gameLoop, 60)