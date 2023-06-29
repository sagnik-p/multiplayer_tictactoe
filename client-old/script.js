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
socket.on("game-won",(s) =>{
    //console.log(s+" won the game");
    showMessage(s + "won");
    isMoveAllowed=false;
});
socket.on("draw", () =>{
    console.log("Draw");
    showMessage("Draw");
    isMoveAllowed=false;
});
socket.on("player-list",(playerList) =>
{
});
socket.on("room-full",()=>{
    console.log("sorry, you are not allowed to play");
    window.prompt("Sorry Room FUll")
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
    isMoveAllowed=false;
});
socket.on("reset-match",()=>{
    updateBoard();
    isMoveAllowed=true;
});
var msgbox = document.getElementById("msgbox");
var roominfo=document.getElementById("roomInfo");
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
var playersInRoom=[];

function resetButtonClicked()
{
    socket.emit("reset-request");
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
function showRoomInfo()
{
    socket.emit("request-room-info");
    socket.on("waiting",()=>
    {
        roominfo.innerHTML="Waiting";
    })
    socket.on("room-info",(info) =>
    {
        roominfo.innerHTML=info[0];
        roominfo.innerHTML="<br>";
        roominfo.innerHTML=info[1];
    })
}
