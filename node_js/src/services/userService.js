import bcrypt from 'bcryptjs';
import db from '../models/index'

const saltRounds = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, saltRounds);
            resolve(hashPassword);
        } catch (e) {
            reject(e)
        }

    })
}

let handleUserLogin = (Name, u_rfid, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};

            let isExist = checkUserName(u_rfid)
            if (isExist) {

                let user = await db.User.findOne({
                    attributes: ['id', 'Name', 'role', 'password', 'u_rfid'],

                    where: {
                        u_rfid: u_rfid
                        ,
                        Name: Name
                    },
                    raw: true

                });
                if (user) {
                    let check = await bcrypt.compareSync(password, user.password);
                    if (check) {
                        userData.errCode = 0;
                        userData.errMessage = 'OK ok';

                        delete user.password;
                        userData.user = user;
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = 'Wrong password';
                    }

                } else {
                    userData.errCode = 2;
                    userData.errMessage = "User's not found"
                }

            } else {
                userData.errCode = 1;
                userData.errMessage = "Your's Name or Rfid isn't exist in your system"

            }
            resolve(userData)
        } catch (e) {
            reject(e)
        }
    })
}

let checkUserName = (userrfid, username) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({

                where: {
                    u_rfid: userrfid
                },
                // where: {
                //     Name: username
                // }
            })
            if (user) {
                resolve(true)

            }
            else {
                resolve(false)
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (userId === 'ALL') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            resolve(users)

        } catch (e) {
            reject(e)
        }
    })
}

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let check = await checkUserName(data.u_rfid);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: "Your RFID is already in used, Plz try another RFID !"
                })
            }
            else {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password)
                await db.User.create({
                    u_rfid: data.u_rfid,
                    email: data.email,
                    Name: data.Name,
                    age: data.age,
                    password: hashPasswordFromBcrypt,
                    address: data.address,
                    phonenumber: data.phonenumber,
                    gender: data.gender,
                    role: data.role,
                    position: data.position,
                    image: data.avatar
                })
            }

            resolve({
                errCode: 0,
                message: 'OK ok ok ok'
            })

        } catch (e) {
            reject(e);
        }

    })
}

let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        let user = await db.User.findOne({
            where: { id: userId },
            raw: false
        })
        if (!user) {
            resolve({
                errCode: 2,
                errMessage: "The user isn't exist"

            })
        }

        await user.destroy();
        resolve({
            errCode: 0,
            errMessage: "The user is deleted"

        })
    })
}


let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // console.log('check data', data)
            if (!data.id) {
                resolve({
                    errCode: 2,
                    errmessage: 'Missinng required parameters'
                })
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false
            })
            if (user) {
                user.u_rfid = data.u_rfid;
                user.email = data.email;
                user.Name = data.Name;
                user.age = data.age;
                user.address = data.address;
                user.phonenumber = data.phonenumber;
                user.gender = data.gender;
                user.role = data.role;
                user.position = data.position;
                if (data.avatar) {
                    user.image = data.avatar;
                }

                await user.save();

                resolve({
                    errCode: 0,
                    message: 'Update the user succeeds'
                })

            } else {
                resolve({
                    errCode: 0,
                    message: 'User not found'
                });
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let res = {};
                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput }
                });
                res.errCode = 0;
                res.data = allcode;
                resolve(res)
            }

        } catch (e) {
            reject(e)
        }
    })
}


module.exports = {
    handleUserLogin: handleUserLogin,
    checkUserName: checkUserName,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    hashUserPassword: hashUserPassword,
    deleteUser: deleteUser,
    updateUserData: updateUserData,
    getAllCodeService: getAllCodeService,


}