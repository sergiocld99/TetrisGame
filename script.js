// UI elements
const canvas = document.getElementById("myCanvas")
const nextCanvas = document.getElementById("nextCanvas")
const scoreText = document.getElementById("scoreNumber")
const linesText = document.getElementById("linesNumber")
const fullText = document.getElementById("fullNumber")

// Prepare board
const context = canvas.getContext("2d")
const blockSize = 30
const boardWidth = 10
const boardHeight = 20
const boardSize = boardWidth * boardHeight

// Prepare colors
const blockColors = ['black', 'red', 'orange', 'yellow', '#00ff00', 'cyan', 'blue', '#fab3f5', 'gray']
const colorCount = blockColors.length - 2

// construimos el tablero de 20 filas por 10 columnas
let board = Array.from({length: boardHeight}, () => Array(boardWidth).fill(0))

// prepare next block
const nextContext = nextCanvas.getContext("2d")
const nextBoardWidth = 3
const nextBoardHeight = 3
let nextBoard = Array.from({length: nextBoardHeight}, () => Array(nextBoardWidth).fill(0))

// game variables
let current_color = getRandomColor(colorCount)
let score = 0
let lines = 0
let goodPieces = 0
let badPieces = 0

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
            if (checkLine()) addScore(100)
            else addScore(Math.round(piece_y / 4))  
            
            piece_x = getRandomValue(boardWidth)
            current_color = getNextColor()
            choseNextBlock()
        } else {
            loseGame()
        }

        piece_y = -1 
    }
}

function addScore(diff){
    score += diff
    scoreText.innerText = score.toString()

    if (diff == 100) goodPieces += 8
    else if (diff == 5) goodPieces += 1
    else {
        badPieces += Math.pow((5-diff), 2)

        if (badPieces > 100){
            badPieces /= 4
            goodPieces /= 4
        }
    }

    efficiency = badPieces ? (goodPieces) / (goodPieces + badPieces) : 1
    fullText.innerText = `${Math.floor(efficiency * 100)}%`
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
    if (full){
        for(y=boardHeight-2; y>-1; y--){
            for(x=0; x<boardWidth; x++){
                board[y+1][x] = board[y][x]
            }
        }

        lines++
        linesText.innerText = lines.toString()
        return true
    }

    return false
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
    score = 0
    lines = 0
    goodPieces = 0
    badPieces = 0

    choseNextBlock()
    drawBoard()
    drawNextBoard()

    linesText.innerText = "0"
    scoreText.innerText = "0"
    fullText.innerText = "100%"

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