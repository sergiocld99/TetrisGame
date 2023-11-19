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
const candidate_pieces = [
    [{x: 0, y: 0}],
    [{x: 0, y: 0}, {x: 0, y: -1}],
    [{x: 0, y: 0}, {x: 0, y: -1}, {x: 0, y: -2}]
]

let current_relative_piece = candidate_pieces[getRandomValue(candidate_pieces.length)]
let next_relative_piece
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
    safeClearPiece(piece_x, piece_y)

    if (canMoveTo(piece_x, piece_y+1)){
        safePaintPiece(piece_x, piece_y+1)
        //board[piece_y+1][piece_x] = current_color
        piece_y++
    } else {
        //board[piece_y][piece_x] = current_color
        safePaintPiece(piece_x, piece_y)

        if (isBoardValid()){
            let linesAdded = 0

            while (checkLine()) linesAdded++
            if (linesAdded) addScore(100*linesAdded)
            else addScore(Math.round(piece_y / 4))  
            
            piece_x = getRandomValue(boardWidth)
            current_color = getNextColor()
            current_relative_piece = next_relative_piece
            choseNextBlock()
            drawNextBoard()
        } else {
            loseGame()
        }

        piece_y = -1 
    }
}

function addScore(diff){
    score += diff
    scoreText.innerText = score.toString()

    if (diff >= 100) goodPieces += diff / 10
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
    let color = getRandomColor(colorCount)
    next_relative_piece = candidate_pieces[getRandomValue(candidate_pieces.length)]

    // clear next board
    nextBoard.forEach((row, y) => {
        row.forEach((color, x) => {
            nextBoard[y][x] = 0
        })
    })

    next_relative_piece.forEach(coords => {
        nextBoard[2+coords.y][1+coords.x] = color
    })
}

function getNextColor(){
    return nextBoard[2][1]
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
    //drawNextBoard()
}

// ---- LISTENERS -----------------

document.addEventListener('keydown', e => {
    console.log(e)

    if (e.key == "Enter"){
        resetGame()
    } else if (e.key == "ArrowRight"){
        if (canMoveTo(piece_x+1, piece_y)) {
            //board[piece_y][piece_x] = 0
            safeClearPiece(piece_x, piece_y)
            piece_x++
        }
    } else if (e.key == "ArrowLeft"){
        if (canMoveTo(piece_x-1, piece_y)) {
            //board[piece_y][piece_x] = 0
            safeClearPiece(piece_x, piece_y)
            piece_x--
        }
    }
})

// ---- UTILS ---------------------

function safePaint(x,y) {
    if (isValidPlace(x,y)) board[y][x] = current_color
}

function safePaintPiece(x0, y0){
    current_relative_piece.forEach(coords => {
        safePaint(x0 + coords.x, y0 + coords.y)
    })
}

function safeClear(x,y){
    if (isValidPlace(x,y)) board[y][x] = 0
}

function safeClearPiece(x0, y0){
    current_relative_piece.forEach(coords => {
        safeClear(x0 + coords.x, y0 + coords.y)
    })
}

function canMoveTo(x,y){
    if (isValidPlace(x,y)) return board[y][x] == 0
    return false
}

function isValidPlace(x,y){
    return (y >= 0 && y < boardHeight && x >= 0 && x < boardWidth)
}

function isBoardValid(){
    let result = true

    board[0].forEach(color => {
        if (color){
            result = false
            return
        }
    })

    return result
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