const express = require("express");
const app=express();
const http = require("http");
const server=http.createServer(app);
const cors=require("cors");
const { Server } = require("socket.io");
const io = new Server(server, { cors: {origin: "*",}, });

// variables and constant declarations
const PORT = 5000;
var playersid=[];
var players=[];
const symbols=["X","O"];
var turn="X"; // 'X' starts the match
var board = [[' ',' ',' '],[' ',' ',' '],[' ',' ',' ']];
app.use( cors( {origin: "*",} ) );
app.get("/", function (req, res) {res.sendFile(__dirname+"/index.html");});


io.on("connection", (socket) => {
    socket.on("player-joined", (playerName) => {
       console.log("new player " + playerName+ " sent a join request");
      if(!(playerName in players) && players.length<2)
      { 
        players.push(playerName);
        playersid.push(socket.id);
        socket.emit("player-approved",symbols[players.length-1]);
        //io.emit("player-list",players);
        //io.emit("turn-info",turn)
      }else{
        console.log("player "+ playerName + " was rejected because room is full");
        socket.emit("room-full");
      }
      sendRoomInfo();
    });
    socket.on("tile-click", (a,b,sym) => {
      console.log("coordinates received "+sym+": ("+a+","+b+")");
      if(board[a][b] === ' ' && turn ===sym && players.length == 2)
      {
        //console.log("valid move received ");
        board[a][b]=sym;
        io.emit('board-update',board);
        invertTurn(); // change who has to play next
        io.emit("turn-info",turn);
        checkStatus();
        sendRoomInfo();
      }
      else 
      {
        console.log("Invalid move detected");
        if (turn != sym)
          socket.emit("message","Opponent's turn");
        else
          socket.emit("message","Invalid Move");
      }
    });

    socket.on("reset-request",()=>
    {
      reset();
      sendRoomInfo();
    });

    socket.on("disconnect", () =>
    {
      io.emit("disconnected",getNameFromId(socket.id));
      console.log("User"+getNameFromId(socket.id)+"with id "+socket.id +"disconnected from the room");
      playersid.splice(playersid.indexOf(socket.id),1);
      players.splice(playersid.indexOf(socket.id),1);
      reset();
      sendRoomInfo();
      console.log(players);
      console.log(playersid);
     });
});

server.listen(PORT, () => {
  console.log(`Server Live at port ${PORT}`);
});


function checkStatus()
{
  // standard game logic, checks if someone has won the game
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
    // check diagonals
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[2][2]!=' ') 
    {
      gameWon(board[0][0]);
    }
    if (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[2][0]!=' ') 
    {
      gameWon(board[0][2]);
    }
    // no one has won the game, check if draw or not
    if(isDraw())
        matchDraw();
}
function isDraw()
{
  // match is draw when all the tiles are filled and no one has won
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

function getNameFromSymbol(sym)
{
  // this function returns the name of player with the given symbol
  if(sym === "X")
    return players[0];
  else
    return players[1];
}

function gameWon(s)
{
  // function to handle game win
  console.log("game won by " + s);
  io.emit("game-won", s,getNameFromSymbol(s));
}

function matchDraw()
{
  // Handle draw match
  console.log("draw");
  io.emit("game-draw");
}

function sendRoomInfo()
{
  // function to broadcast all room details to all clients
    io.emit("room-info",players);
}

function invertTurn()
{
  // change who gives the next turn
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
  // returns the name of player with a certain socket id
  return players[playersid.indexOf(id)];
}

function reset()
{
  // function to handle reset request sent by a client
  board = [[' ',' ',' '],[' ',' ',' '],[' ',' ',' ']]; // empty the board
  turn="X"; // first turn is of 'X'
  //broadcat the updated board, reset confirmation and turn information, that is, who gives the next turn 
  io.emit("board-update",board);
  io.emit("reset-complete");
  io.emit("turn-info",turn);
}