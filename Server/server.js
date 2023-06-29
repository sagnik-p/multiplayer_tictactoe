const express = require("express");
const app=express();
const http = require("http");
const server=http.createServer(app);
const cors=require("cors");
const { Server } = require("socket.io");
const { basename } = require("path");
const io = new Server(server, { cors: {origin: "*",}, });
var playersid=[];
var players=[];
const symbols=["X","O"];
var turn="X";
var board = [[' ',' ',' '],[' ',' ',' '],[' ',' ',' ']];
app.use( cors( {origin: "*",} ) );
app.get("/", function (req, res) {res.sendFile(__dirname+"/index.html");});
io.on("connection", (socket) => {
  console.log("inside");
    socket.on("player-joined", (playerName) => {
       console.log("new player " + playerName+ " wants to join");
      if(!(playerName in players) && players.length<2)
      { 
        players.push(playerName);
        playersid.push(socket.id);
        socket.emit("player-approved",symbols[players.length-1]);
        console.log("now playing\n");
        console.log(players);
        console.log(playersid);
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

    socket.on("reset-game", (roomid) => {
      roomManager.resetGame(roomid);
      io.emit("reset-game" + roomid, roomid);
      io.emit("game-update" + roomid, roomManager.getRoom(roomid));
    });
    socket.on("get-room", (roomId) => {
      let room = roomManager.getRoom(roomId);
      socket.emit("get-room" + roomId, room);
    });
    socket.on("create-room", (roomId) => {
      roomManager.createRoom(roomId);
    });
    socket.on("disconnect", () =>
    {
      io.emit("disconnected",getNameFromId(socket.id));
      console.log(`User ${socket.id} disconnected from the room`);
      playersid.splice(playersid.indexOf(socket.id),1);
      players.splice(playersid.indexOf(socket.id),1);
      console.log(players);
      console.log(playersid);
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
}
function matchDraw()
{
    disableButtons();
    document.getElementById("msgbox").append("Draw ");
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
  playersid=[];
  players=[];
}