const playerName = window.prompt('Enter Your name:');


const socket = io("ws://localhost:5000");
socket.emit("player-joined",playerName, () => {
    console.log("Informed the server that a player has joined");
});
var sym
socket.on("player-approved", (playersSymbol) =>{
    this.sym=playersSymbol;
    console.log("you have been approved to play with symbol "+ sym);
});
socket.on("room-full",()=>{
    console.log("sorry, you are not allowed to play");
})
var messageToUser="Hello";
var msgbox = document.getElementById("msgbox");
msgbox.style.opacity=1;
let bMatrix = [[document.getElementById("b00"),document.getElementById("b01"),document.getElementById("b02")],[document.getElementById("b10"),document.getElementById("b11"),document.getElementById("b12")],[document.getElementById("b20"),document.getElementById("b21"),document.getElementById("b22")]];
let board = [[' ',' ',' '],[' ',' ',' '],[' ',' ',' ']];
function clicked(a,b)
{
    if(board[a][b] != ' ')
    {
        invalidMove();
    }
    else
    {
        board[a][b]=sym;
        changeSymbol();
        updateBoard();
        checkStatus();
        socket.emit('tile-click',a,b,()=>{
            console.log("emitted coordinates: " + a + b);
        })
       
    }
}
function resetButtonClicked()
{
    location.reload();
}
function updateBoard()
{
    for(let i=0;i<3;i++)
    {
        for(let j=0;j<3;j++)
        {
            bMatrix[i][j].value=board[i][j];
        }
    }
}
function checkStatus()
{
    for (let i = 0; i < 3; i++) 
    {
        if (board[i][0] === board[i][1] && board[i][1] === board[i][2] && board[i][2]!=' ') 
        {
            gameWon(board[i][0]);
        }
    }
    for (let j = 0; j < 3; j++) 
    {
        if (board[0][j] === board[1][j] && board[1][j] === board[2][j] && board[2][j]!=' ') 
        {
            gameWon(board[0][j]);   
        }
    }
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[2][2]!=' ') 
    {
        gameWon(board[0][0]);
    }
    if (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[2][0]!=' ') 
    {
    gameWon(board[0][2]);
    }
    if(isDraw())
        matchDraw();
}
function isDraw()
{
    for(let i=0;i<3;i++)
    {
        for(let j=0;j<3;j++)
        {
            if(board[i][j]==' ')
                return false;
        }
    }
    return true;
}
function matchDraw()
{
    disableButtons();
    document.getElementById("msgbox").append("Draw ");
}
function changeSymbol()
{
    if(sym=='X')
    {
        sym='O';
    }else{
        sym='X';
    }
}
function gameWon(s)
{
    document.getElementById("msgbox").append("Won by "+s+"")

    msgbox.style.opacity=1;
    disableButtons();
}
function invalidMove()
{
    window.alert("Invalid Move");
}
function disableButtons()
{
    for(let i=0;i<3;i++)
    {
        for(let j=0;j<3;j++)
        {
            bMatrix[i][j].disabled=true;
        }
    }
}