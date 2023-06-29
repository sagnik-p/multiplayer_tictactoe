const express = require("express");
const app=express();
const http = require("http");
const server=http.createServer(app);
const cors=require("cors");
const { Server } = require("socket.io");
const io = new Server(server, { cors: {origin: "*",}, });
var playersid=[];
var players=[];
const symbols=["X","O"];
var turn="X";
var board = [[' ',' ',' '],[' ',' ',' '],[' ',' ',' ']];
app.use( cors( {origin: "*",} ) );
app.get("/", function (req, res) {res.sendFile(__dirname+"/index.html");});
io.on("connection", (socket) => {
    socket.on("player-joined", (playerName) => {
       console.log("new player " + playerName+ " wants to join");
      if(!(playerName in players) && players.length<2)
      { 
        players.push(playerName);
        playersid.push(socket.id);
        socket.emit("player-approved",symbols[players.length-1]);
        io.emit("player-list",players);
      }else{
        console.log("player "+ playerName + " was rejected");
        socket.emit("room-full");
      }
    });
    socket.on("tile-click", (a,b,sym) => {
      console.log("coordinates received "+sym+": ("+a+","+b+")");
      if(board[a][b] === ' ' && turn ===sym && players.length == 2)
      {
        console.log("valid move");
        board[a][b]=sym;
        io.emit('board-update',board);
        checkStatus();
        invertTurn();
      }
      else 
      {
        console.log("Invalid move detected");
        if (turn != sym)
          socket.emit("message","not your turn");
        else
          socket.emit("message","wrong place");
      }
    });
    socket.on("reset-request",()=>
    {
      reset();
    });
    socket.on("disconnect", () =>
    {
      io.emit("disconnected",getNameFromId(socket.id));
      console.log(`User ${socket.id} disconnected from the room`);
      playersid.splice(playersid.indexOf(socket.id),1);
      players.splice(playersid.indexOf(socket.id),1);
      reset()
      console.log(players);
      console.log(playersid);
     });
     socket.on("request-room-info", () =>
    {
      if(playerName.length==1)
      {
        io.emit("waiting");
      }else{
      io.emit("room-info",[playerName[0] + "(X)",playerName[1] + "(O)"]);
    }
     });
});
let PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server Live at port ${PORT}`);
});
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
function gameWon(s)
{
  console.log("game won by " + s);
  io.emit("game-won", s)
}
function matchDraw()
{
  console.log("draw");
  io.emit("game-draw");
}
function invertTurn()
{
  if(turn==="X")
  {
    turn="O";
  }
  else
  {
    turn="X";
  }
}
function getNameFromId(id)
{
  return players[playersid.indexOf(id)];
}
function reset()
{
  board = [[' ',' ',' '],[' ',' ',' '],[' ',' ',' ']];
  turn="X";
  io.emit("board-update",board);
}