// prompt the user the enter his/her name
input = window.prompt('Enter Your Name:');
while(input ==='' || input == null)
{
    input=window.prompt("Enter your Name:");
}

const playerName = input;
const socket = io("ws://localhost:5000");
var sym;
var roominfo1 = document.getElementById("roomInfo1")
var msgbox = document.getElementById("msgbox");
var roominfo2 = document.getElementById("roomInfo2");
var isMoveAllowed=true;
let bMatrix = [[document.getElementById("g00"),document.getElementById("g01"),document.getElementById("g02")],[document.getElementById("g10"),document.getElementById("g11"),document.getElementById("g12")],[document.getElementById("g20"),document.getElementById("g21"),document.getElementById("g22")]];
let board = [[' ',' ',' '],[' ',' ',' '],[' ',' ',' ']];
var playersInRoom=[];
// send the server a room joining request
socket.emit("player-joined",playerName, () => {
    //console.log("Informed the server that you want to join the room");
});
// if server approves this client, set this client's symbol as sent by the server
socket.on("player-approved", (playersSymbol) =>{
    this.sym=playersSymbol;
    //console.log("you have been approved to play with symbol "+ sym);
});
// If the room is full , this client will be rejected
socket.on("room-full",()=>{
    console.log("sorry, you are not allowed to play");
    window.prompt("Sorry Room is Full. Please try Again Later")
});

socket.on("message",(msg)=>{
    console.log("msg received" + msg);
    showMessage(msg);
});

// Game conditions
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

// receive the updated board from the server and sync
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

// when this client receives reset confirmation from the server, handle it
socket.on("reset-complete",()=>
{
    isMoveAllowed=true;
    console.log("Reset Done");
})
// if the server asks the client to freeze the board, handle it
socket.on("freeze",()=>{
    isMoveAllowed=false;
});
// receive the broadcasted info and update the values accordingly
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




// when a tile is clicked, send the info to the server
function clicked(a,b)
{
    if(isMoveAllowed)
    {
        socket.emit('tile-click',a,b,sym,()=>{
            console.log("emitted coordinates: " + a + b);
        })
    }
}


// if the user clicks on the reset button, send the request to the server
function resetButtonClicked()
{
    socket.emit("reset-request");
    isMoveAllowed=false;
}
// function to update the local board according to the board received from the server
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

// receive the broadcasted info and accordingly update the values
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

// a function that helps to show a message to the user . This message can be 'invalid move' , 'not your turn' etc.
function showMessage(msg)
{
    msgbox.innerHTML = msg;
}