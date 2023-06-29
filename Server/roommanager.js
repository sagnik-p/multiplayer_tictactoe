const roomManager = {
    state:{rooms:[],}, // this state variable contains an array of room objects
    createRoom(roomId) // function to create a room object
    {
        var room ={
            id:roomId,
            players:[],
            matrix:
            {
                tile00:false,
                tile01:false,
                tile02:false,
                tile10:false,
                tile11:false,
                tile12:false,
                tile20:false,
                tile21:false,
                tile32:false,
            },
            nextPlayer:"",
        };

        this.state.rooms.push(room); // push this room object into the global array state.room
    },
    getRoom(roomId) // function that returns room object according to the room id
    {
        for(let i=0;i<this.state.rooms.length;i++)
        {
            if(this.state.rooms[i].id == roomId) //if the room has same id as the required id, match found, return
                return this.state.rooms[i];
        }
        return false;
    },
    getAllRooms() // return all the room objects
    {
        return this.state.rooms;
    },
    getPlayer(room,playerId)
    {
        for(let i=0;i<room.players.length;i++)
        {
            if(room.players[i].id==playerId)
                return room.players[i];
        }
        return false;
    },
    resetGame(roomId)
    {
        let currentRoom=this.getRoom(roomId)
        currentRoom.matrix=
        {
            tile00:false,
            tile01:false,
            tile02:false,
            tile10:false,
            tile11:false,
            tile12:false,
            tile20:false,
            tile21:false,
            tile32:false,
        };
    },
    isRoomPlaying(roomId)
    {
        let currentRoom=this.getRoom(roomId);
        for(let tile in room.matrix)
        {
            if(currentRoom.matrix[tile]==true)
            {
                return true;
            }
        }
        return false;
    },
};
module.exports=roomManager;