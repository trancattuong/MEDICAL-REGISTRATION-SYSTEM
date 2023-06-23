import db from "../models/index"
import { v4 as uuidv4 } from 'uuid';
require('dotenv').config();
import _ from 'lodash'

let postBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {

        try {
            if (!data.email || !data.doctorId
                || !data.date || !data.timeType || !data.selectedGender
                || !data.u_rfid
            ) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing paramenter"
                })
            } else {
                let user = await db.User.findOrCreate({
                    where: {
                        email: data.email
                    },
                    defaults: {
                        email: data.email,
                        role: 'R3',
                        Name: data.fullName,
                        phonenumber: data.phoneNumber,
                        u_rfid: data.u_rfid,
                        address: data.address,
                        reason: data.reason,
                        gender: data.selectedGender,

                        // redirectLink: buildUrl(data.rfid)
                    },
                })
                console.log('check user', user[0])
                console.log('check data (2:23)', data)
                if (user && user[0]) {
                    await db.booking.findOrCreate({
                        where: {
                            patientId: user[0].id,
                        },
                        defaults: {
                            statusId: 'S1',
                            patientId: user[0].id,
                            doctorId: data.doctorId,
                            date: data.date,
                            nameSpecialty: data.specialtyName,
                            timeType: data.timeType,
                            rfid: data.u_rfid,

                        }
                    })
                }

                resolve({
                    errCode: 0,
                    errMessage: "Save infor patient succeed !"
                })

            }
        } catch (e) {
            reject(e)
        }
    })
}

let postRfid = (rfid) => {
    return new Promise(async (resolve, reject) => {

        try {
            if (!rfid) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter"
                })
            } else {

                console.log(rfid)
                let user = await db.booking.findOne({
                    where: {
                        rfid: rfid,
                    },
                    attributes: {
                        exclude: ["id", "statusId", "doctorId", "rfid",
                            "patientId", "date", "timeType", "createdAt", "updatedAt"]
                    },
                    include: [

                        { model: db.Allcode, as: "timeTypeDatapatient", attributes: ['valueVI'] },
                        { model: db.User, as: 'patientData', attributes: ['Name'] },
                        {
                            model: db.doctor_infor, as: 'specialtyData1', attributes: ['specialtyId'],
                            include: [
                                { model: db.specialty, as: 'specialtyName', attributes: ['name'] },
                            ]
                        },

                    ],
                    raw: false,
                    nest: true
                })


                let appointment = await db.booking.findOne({
                    where: {
                        rfid: rfid,
                        statusId: 'S1'
                    },
                    raw: false
                })

                if (appointment) {
                    appointment.statusId = "S2"
                    await appointment.save();
                }


                resolve({
                    data: user
                })

            }

        } catch (e) {
            reject(e)
        }
    })
}


module.exports = {
    postBookAppointment: postBookAppointment,
    postRfid: postRfid,


}