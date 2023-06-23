'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class doctor_infor extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            doctor_infor.belongsTo(models.User, { foreignKey: 'doctorId' })
            doctor_infor.belongsTo(models.Allcode, { foreignKey: 'priceId', targetKey: 'keyMap', as: 'priceTypeData' })
            doctor_infor.belongsTo(models.Allcode, { foreignKey: 'paymentId', targetKey: 'keyMap', as: 'paymentTypeData' })


            doctor_infor.belongsTo(models.booking, { foreignKey: 'doctorId', as: 'specialtyData1' })
            doctor_infor.belongsTo(models.specialty, { foreignKey: 'specialtyId', targetKey: 'id', as: 'specialtyName' })
        }
    };
    doctor_infor.init({
        doctorId: DataTypes.INTEGER,
        priceId: DataTypes.STRING,
        specialtyId: DataTypes.INTEGER,
        provinceId: DataTypes.STRING,
        paymentId: DataTypes.STRING,
        note: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'doctor_infor',
        freezeTableName: true
    });
    return doctor_infor;
}; 