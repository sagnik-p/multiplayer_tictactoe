input = window.prompt('Enter Your name:');
while(input ==='' || input == null)
{
    input=window.prompt("Enter your Name");
}
const playerName = input;
console.log("Name is" + playerName);
const socket = io("ws://localhost:5000");
socket.emit("player-joined",playerName, () => {
    console.log("Informed the server that a player has joined");
});
var sym;
socket.on("player-approved", (playersSymbol) =>{
    this.sym=playersSymbol;
    console.log("you have been approved to play with symbol "+ sym);
});
socket.on("game-won",(s) =>{
    console.log(s+" won the game");
    showMessage(s + "won");
    freezeBoard();
});
socket.on("draw", () =>{
    console.log("Draw");
    showMessage("draw");
    freezeBoard();
});
socket.on("room-full",()=>{
    console.log("sorry, you are not allowed to play");
});
socket.on("message",(msg)=>{
    console.log("msg received" + msg);
    showMessage(msg);
});
socket.on("board-update", (updatedBoard) => {
    console.log("Updated board received");
    console.log(updatedBoard);
    for(let i=0;i<3;i++)
    {
        for(let j=0;j<3;j++)
        {
            board[i][j]=updatedBoard[i][j];
        }
        updateBoard();
    }
});
socket.on("freeze",()=>{
    freezeBoard();
});
var messageToUser="Hello";
var msgbox = document.getElementById("msgbox");
msgbox.style.opacity=1;
var isMoveAllowed=true;
let bMatrix = [[document.getElementById("b00"),document.getElementById("b01"),document.getElementById("b02")],[document.getElementById("b10"),document.getElementById("b11"),document.getElementById("b12")],[document.getElementById("b20"),document.getElementById("b21"),document.getElementById("b22")]];
let board = [[' ',' ',' '],[' ',' ',' '],[' ',' ',' ']];
function clicked(a,b)
{
    if(isMoveAllowed)
    {
        socket.emit('tile-click',a,b,sym,()=>{
            console.log("emitted coordinates: " + a + b);
        })
    }
}

function resetButtonClicked()
{

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
function showMessage(msg)
{
    msgbox.innerHTML = msg;
}
function freezeBoard()
{
    isMoveAllowed=false;
}