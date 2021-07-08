// init the users array
let users = []

//  add user
const addUser = (id, username, room) => {

    // Clean the data

    username = username.trim().toLowerCase()

    room = room.trim().toLowerCase()


    // validate the data

    if (!username || !room) {

        return {
            error: 'Username and room are required!'
        }
    }


    //check for  existing users in a specific room
    const existingUser = users.find((user) => {

        // return true if a user with this username exist in this room
        return user.room === room && user.username === username

    })

    if (existingUser) {


        return {
            error: 'Username is in use!'
        }
    }


    // store user

    const user = {id, username, room}

    users.push(user)

    return {user: user}
}


const removeUser = (id) => {

    const  index = users.findIndex((user)=>{

        return user.id === id
    })

    if (index !== -1){

        // this return the the array with the deleted items in this case only one item is returned and it is access
        // with [0]
        return users.splice(index,1)[0]
    }

    return  -1


}

// find user by id
const getUser = (id) => {

    // find a user by id using find, if no match was found undefined will be returned
    return users.find((user)=>{

        return user.id === id
    })
}


const findUsersInRoom = (room)=>{

    // the array that will contain the users of target room
    let roomUsers = []

    // find and push all the user from the same room
    users.find((user)=>{

        if (user.room === room){
            roomUsers.push(user)
        }
    })

    return roomUsers
}


module.exports ={
    addUser,
    removeUser,
    findUsersInRoom,
    getUser
}