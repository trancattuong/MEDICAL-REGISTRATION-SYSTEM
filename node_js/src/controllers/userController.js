import userService from "../services/userService"

let handleLogin = async (req, res) => {
    let Name = req.body.Name;
    let u_rfid = req.body.u_rfid;
    let password = req.body.password;

    if (!Name || !u_rfid || !password) {
        return res.status(500).json({
            errCode: 1,
            message: "Missing inputs parameter!"
        })
    }

    let userData = await userService.handleUserLogin(Name, u_rfid, password)
    // console.log(userData)
    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.errMessage,
        user: userData.user ? userData.user : {}
    })
}

let handleGetAllUsers = async (req, res) => {
    let id = req.query.id;

    if (!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameters',
            users: []
        })
    }

    let users = await userService.getAllUsers(id);
    // console.log(users)
    return res.status(200).json({
        errCode: 0,
        errMessage: 'OK ok ok',
        users
    })
}

let handleCreateNewUser = async (req, res) => {
    let message = await userService.createNewUser(req.body);
    return res.status(200).json(message)
}

let handleEditUser = async (req, res) => {
    let data = req.body;
    let message = await userService.updateUserData(data)
    return res.status(200).json(message)
}

let handleDeleteUser = async (req, res) => {
    if (!req.body.id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: "Missing required parameters"
        })
    }
    let message = await userService.deleteUser(req.body.id);
    return res.status(200).json(message)
}

let getAllCode = async (req, res) => {
    try {
        let data = await userService.getAllCodeService(req.query.type);
        return res.status(200).json(data)
    } catch (e) {
        console.log('Get all code error: ', e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

module.exports = {
    handleLogin: handleLogin,
    handleGetAllUsers: handleGetAllUsers,
    handleCreateNewUser: handleCreateNewUser,
    handleEditUser: handleEditUser,
    handleDeleteUser: handleDeleteUser,
    getAllCode: getAllCode,


}