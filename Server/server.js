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
let board = [[' ',' ',' '],[' ',' ',' '],[' ',' ',' ']];
app.use( cors( {origin: "*",} ) );
app.get("/", function (req, res) {res.sendFile(__dirname+"/index.html");});

io.on("connection", (socket) => {

    //socket.io work
    socket.on("player-joined", (playerName) => {
       console.log("new player " + playerName+ " wants to join");
      if(!(playerName in players) && players.length<2)
      { 
        players.push(playerName);
        socket.emit("player-approved",symbols[players.length-1]);
        console.log(players);
      }else{
        console.log("player "+ playerName + " was rejected");
        socket.emit("room-full");
      }
    })
    socket.on("entered-room", (roomid) => {
      playersid.push(socket.id);
      console.log("player with id " + playersid+ "entered the room" + playersid.length);
      /*
      let room = roomManager.getRoom(roomid);
      if(!room) {
        //if room does not exist, create a new room
        roomManager.createRoom(roomid);
        room = roomManager.getRoom(roomid);
      }
      let playerData = createPlayer(socket.id, shape);
      room.players.push(playerData);
      socket.roomId = room.id;
      console.log(`User with socket id ${socket.id} connected to room ${socket.roomId}`);
      //emit the info to all clients
      */
      socket.emit("entered-room", roomid,()=>{
        console.log("player entered, data emitted");
      });
    });
    socket.on("tile-click", (a,b,sym) => {
      console.log("coordinates received "+sym+": ("+a+","+b+")");
      if(board[a][b] != ' ')
      {
        console.log("Invalid move detected")
        socket.emit("message","invalid move");
      }
      else
      {
        console.log("valid move");
        board[a][b]=sym;
        io.emit('board-update',board);
      }


/*
      //if (roomManager.isRoomPlaying(socket.roomId)==false) { // match not in progress, this is the first move
        room.tiles[coordinates] = roomManager.getPlayer(room, socket.id).shape;
        room.nextPlayer = socket.id;//emit to all clients
        io.emit("tile-click" + room.id, room);
        console.log("tile clicked");
        console.log(coordinates);
        return;
      //}
      if (room.nextPlayer == socket.id || room.tiles[coordinates]) // either not this players turn or tile already filled, invalid move
        return;
      room.tiles[coordinates] = roomManager.getPlayer(room, socket.id).shape;
      room.nextPlayer = socket.id;
      io.emit("tile-click" + room.id, room); // emit to all clients*/
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
    socket.on("disconnect", () => {
      let room = roomManager.getRoom(socket.roomId);
      if (!room) return; // room not made
      for (let i = 0; i < room.players.length; i++) {
        if (room.players[i].id === socket.id) {
          room.players.splice(i, 1); // splice is used to remove the array element
          io.emit("user-disconnected" + socket.roomId);
          if (roomManager.alreadyPlaying(socket.roomId)) {
            roomManager.resetGame(socket.roomId);
            io.emit("reset-game" + socket.roomId, socket.roomId);
            io.emit("game-update" + socket.roomId, roomManager.getRoom(socket.roomId));
          }
        }
      }
      console.log(`User ${socket.id} disconnected from room ${socket.roomId}`);
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