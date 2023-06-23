import { request } from "express"
import db from "../models/index"
require('dotenv').config();
import _ from 'lodash'

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limitInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                where: { role: 'R2' },
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: ['password']
                },
                include: [
                    { model: db.Allcode, as: "positionData", attributes: ['valueEN', 'valueVI'] },
                    { model: db.Allcode, as: "genderData", attributes: ['valueEN', 'valueVI'] }

                ],
                raw: true,
                nest: true
            })
            resolve({
                errCode: 0,
                data: users
            })
        } catch (e) {
            reject(e);
        }
    })
}

let getAllDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { role: 'R2' },
                attributes: {
                    exclude: ['password', 'image']
                }
            })
            resolve({
                errCode: 0,
                data: doctors
            })
        } catch (e) {
            reject(e)
        }
    })
}

let checkDetailInforDoctor = (inputData) => {
    let arrFields = ['doctorId', 'contentHTML', 'contentMarkdown',
        'action', 'selectedPayment', 'selectedPrice', 'note', 'specialtyId']
    let isValid = true;
    let element = ``;
    for (let i = 0; i < arrFields.length; i++) {
        if (!inputData[arrFields[i]]) {
            isValid = false;
            element = arrFields[i]
            break;
        }
    }
    return {
        isValid: isValid,
        element: element
    }
}

let saveDatailInforDoctor = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let checkObj = checkDetailInforDoctor(inputData);
            if (checkObj.isValid === false) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing paramenter: ${checkObj.element}`
                })
            } else {

                //upsert to Markdown
                if (inputData.action === 'CREATE') {
                    await db.markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId: inputData.doctorId,

                        specialtyId: inputData.specialtyId
                    })
                } else if (inputData.action === 'EDIT') {
                    let doctorMarkdown = await db.markdown.findOne({
                        where: { doctorId: inputData.doctorId },
                        raw: false
                    })
                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTML = inputData.contentHTML;
                        doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
                        doctorMarkdown.description = inputData.description;
                        doctorMarkdown.updatedAt = new Date()
                        await doctorMarkdown.save()
                    }
                }

                //upsert to Doctor Infor Table
                let doctorInfor = await db.doctor_infor.findOne({
                    where: {
                        doctorId: inputData.doctorId,
                    },
                    raw: false
                })

                if (doctorInfor) {
                    doctorInfor.doctorId = inputData.doctorId;
                    doctorInfor.priceId = inputData.selectedPrice;
                    doctorInfor.paymentId = inputData.selectedPayment;
                    doctorInfor.note = inputData.note;

                    doctorInfor.specialtyId = inputData.specialtyId;
                    await doctorInfor.save()
                } else {
                    await db.doctor_infor.create({
                        doctorId: inputData.doctorId,
                        priceId: inputData.selectedPrice,
                        paymentId: inputData.selectedPayment,
                        note: inputData.note,

                        specialtyId: inputData.specialtyId,
                    })
                }
                resolve({
                    errCode: 0,
                    errMessage: "Save infor doctor succeed"
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getDetailDoctorById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing paramenter"
                })
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: inputId
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        { model: db.markdown, attributes: ['description', 'contentHTML', 'contentMarkdown'] },
                        { model: db.Allcode, as: "positionData", attributes: ['valueEN', 'valueVI'] },
                        {
                            model: db.doctor_infor, attributes: { exclude: ['id', 'doctorId'] },
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueVI', 'valueEN'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueVI', 'valueEN'] },
                            ]
                        },
                    ],
                    raw: false,
                    nest: true
                })

                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary')
                }
                if (!data) data = [];

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e)

        }
    })
}

let bulkCreateSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.arrSchedule || !data.doctorId || !data.formateDate) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required param !"
                })
            }
            else {
                let schedule = data.arrSchedule
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    })
                }

                let existing = await db.schedule.findAll(
                    {
                        where: { doctorId: data.doctorId, date: data.formateDate, },
                        attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
                        raw: true
                    }
                );


                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date;

                })

                if (toCreate && toCreate.length > 0) {
                    await db.schedule.bulkCreate(toCreate);
                }

                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                })
            }


        } catch (e) {
            reject(e)
        }
    })
}

let getScheduleDoctorByDate = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter"
                })
            } else {
                let dataSchedule = await db.schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date,
                    },
                    include: [

                        { model: db.Allcode, as: "timeTypeData", attributes: ['valueEN', 'valueVI'] },
                        { model: db.User, as: "doctorData", attributes: ['Name'] },


                    ],
                    raw: false,
                    nest: true
                })

                if (!dataSchedule) dataSchedule = []
                resolve({
                    errCode: 0,
                    data: dataSchedule
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}


let getExtraInforDoctorById = (Idinput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!Idinput) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter"
                })
            } else {
                let data = await db.doctor_infor.findOne({
                    where: {
                        doctorId: Idinput
                    },
                    attributes: {
                        exclude: ['id', 'doctorId']
                    },
                    include: [
                        { model: db.Allcode, as: 'priceTypeData', attributes: ['valueVI', 'valueEN'] },
                        { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueVI', 'valueEN'] },
                    ],
                    raw: false,
                    nest: true
                })
                if (!data) data = []
                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getProfileDoctorById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter"
                })
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: inputId
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        { model: db.markdown, attributes: ['description', 'contentHTML', 'contentMarkdown'] },
                        { model: db.Allcode, as: "positionData", attributes: ['valueEN', 'valueVI'] },
                        {
                            model: db.doctor_infor, attributes: { exclude: ['id', 'doctorId'] },
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueVI', 'valueEN'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueVI', 'valueEN'] },
                            ]
                        },
                    ],
                    raw: false,
                    nest: true
                })

                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary')
                }

                if (!data) data = []
                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getListPatientForDoctor = (doctorId, date) => {

    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter"
                })
            } else {
                let data = await db.booking.findAll({
                    where: {
                        statusId: 'S2',
                        doctorId: doctorId,
                        date: date,
                    },
                    include: [
                        {
                            model: db.User,
                            as: 'patientData',
                            attributes: ['email', 'Name', 'u_rfid', 'gender', 'address'],
                            include: [
                                { model: db.Allcode, as: "genderData", attributes: ['valueEN', 'valueVI'] },
                            ]
                        },
                        { model: db.Allcode, as: "timeTypeDatapatient", attributes: ['valueEN', 'valueVI'] },

                    ],
                    raw: false,
                    nest: true
                }
                )
                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let sendRemedy = (data) => {

    return new Promise(async (resolve, reject) => {
        try {
            if (!data.doctorId || !data.patientId || !data.timeType) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter"
                })
            } else {
                let appointment = await db.booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        patientId: data.patientId,
                        timeType: data.timeType,
                        statusId: 'S2'
                    },
                    raw: false
                })
                if (appointment) {
                    appointment.statusId = 'S3'
                    await appointment.save()
                }

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}


module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    saveDatailInforDoctor: saveDatailInforDoctor,
    getDetailDoctorById: getDetailDoctorById,
    bulkCreateSchedule: bulkCreateSchedule,
    getScheduleDoctorByDate: getScheduleDoctorByDate,
    getExtraInforDoctorById: getExtraInforDoctorById,
    getProfileDoctorById: getProfileDoctorById,
    getListPatientForDoctor: getListPatientForDoctor,
    sendRemedy: sendRemedy

}