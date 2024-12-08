let users = [];

const getUser = (id)=>{
    const existingUser = users?.find((user) => user.userId == id);
    return existingUser
}

module.exports = {users,getUser};