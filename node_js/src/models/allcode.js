'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Allcode extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Allcode.hasMany(models.User, { foreignKey: 'position', as: 'positionData' })
            Allcode.hasMany(models.User, { foreignKey: 'gender', as: 'genderData' })
            // Allcode.hasMany(models.User, { foreignKey: 'timeType', as: 'timeTypeForUser' })

            Allcode.hasMany(models.schedule, { foreignKey: 'timeType', as: 'timeTypeData' })

            Allcode.hasMany(models.doctor_infor, { foreignKey: 'priceId', as: 'priceTypeData' })
            Allcode.hasMany(models.doctor_infor, { foreignKey: 'paymentId', as: 'paymentTypeData' })

            Allcode.hasMany(models.booking, { foreignKey: 'timeType', as: 'timeTypeDatapatient' })

        }
    };
    Allcode.init({
        keyMap: DataTypes.STRING,
        type: DataTypes.STRING,
        valueEN: DataTypes.STRING,
        valueVI: DataTypes.STRING,

    }, {
        sequelize,
        modelName: 'Allcode',
    });
    return Allcode;
};