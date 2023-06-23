import db from "../models/index"

let createSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!data.name || !data.imageBase64
                || !data.descriptionHTML || !data.descriptionMarkdown) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing paramenter"
                })
            } else {
                await db.specialty.create({
                    name: data.name,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown
                })

                resolve({
                    errCode: 0,
                    errMessage: "OK !"
                })

            }
        } catch (e) {
            reject(e)
        }


    })
}

let getAllSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.specialty.findAll({

            });

            if (data && data.length > 0) {
                data.map(item => {
                    item.image = new Buffer(item.image, 'base64').toString('binary')
                    return item
                })
            }
            resolve({
                errMessage: 'Ok',
                errCode: 0,
                data
            })
        } catch (e) {
            reject(e)
        }


    })
}

let getDetailSpecialtyById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing paramenter"
                })
            } else {
                let data = await db.specialty.findOne({
                    where: {
                        id: inputId
                    },
                    attributes: ['descriptionHTML', 'descriptionMarkdown', 'name'],
                })

                if (data) {
                    let doctorSpecialty = await db.doctor_infor.findAll({
                        where: {
                            specialtyId: inputId
                        },
                        attributes: ['doctorId'],
                    })
                    data.doctorSpecialty = doctorSpecialty;

                } else data = []

                resolve({
                    errMessage: 'Ok',
                    errCode: 0,
                    data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {

    createSpecialty,
    getAllSpecialty,
    getDetailSpecialtyById,
}