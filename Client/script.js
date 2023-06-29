input = window.prompt('Enter Your Name:');
while(input ==='' || input == null)
{
    input=window.prompt("Enter your Name");
}
const playerName = input;
//console.log("Name is" + playerName);

const socket = io("ws://localhost:5000");
socket.emit("player-joined",playerName, () => {
    //console.log("Informed the server that a player has joined");
});
var sym;
socket.on("player-approved", (playersSymbol) =>{
    this.sym=playersSymbol;
    //console.log("you have been approved to play with symbol "+ sym);
});
socket.on("game-won",(s,winnerName) =>{
    //console.log(s+" won the game");
    showMessage(winnerName+"("+s+") Won !!");
    isMoveAllowed=false;
});
socket.on("draw", () =>{
    console.log("Draw");
    showMessage("DRAW MATCH !!");
    isMoveAllowed=false;
});
socket.on("room-full",()=>{
    console.log("sorry, you are not allowed to play");
    window.prompt("Sorry Room Full")
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
socket.on("reset-complete",()=>
{
    isMoveAllowed=true;
    showMessage("Reset Done");
});
socket.on("freeze",()=>{
    isMoveAllowed=false;
});
socket.on("turn-info",(turnSymbol) =>
{
    if(turnSymbol ===sym)
    {
        showMessage("Your turn "+sym);
    }
    else{
        showMessage("Opponent's turn ");
    }
});
socket.on("reset-match",()=>{
    updateBoard();
    isMoveAllowed=true;
});
var roominfo1 = document.getElementById("roomInfo1")
var msgbox = document.getElementById("msgbox");
var roominfo2 = document.getElementById("roomInfo2");
var isMoveAllowed=true;
let bMatrix = [[document.getElementById("g00"),document.getElementById("g01"),document.getElementById("g02")],[document.getElementById("g10"),document.getElementById("g11"),document.getElementById("g12")],[document.getElementById("g20"),document.getElementById("g21"),document.getElementById("g22")]];
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
var playersInRoom=[];

function resetButtonClicked()
{
    socket.emit("reset-request");
    isMoveAllowed=false;
}
function updateBoard()
{
    for(let i=0;i<3;i++)
    {
        for(let j=0;j<3;j++)
        {
            bMatrix[i][j].innerHTML=board[i][j];
        }
    }
}
socket.on("room-info",(presentinroom) =>
{
    console.log(presentinroom);
    if(presentinroom.length != 2){
        roominfo1.innerHTML="Only you"
        roominfo2.innerHTML=""
        showMessage("Waiting !")
    }
    else{
        roominfo1.innerHTML=presentinroom[0];
        roominfo2.innerHTML= presentinroom[1];
    }

});
function showMessage(msg)
{
    msgbox.innerHTML = msg;
}