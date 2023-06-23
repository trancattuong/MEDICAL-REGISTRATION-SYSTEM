'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Allcode, { foreignKey: 'position', targetKey: 'keyMap', as: 'positionData' })
      User.belongsTo(models.Allcode, { foreignKey: 'gender', targetKey: 'keyMap', as: 'genderData' })
      User.hasOne(models.markdown, { foreignKey: 'doctorId' })
      User.hasOne(models.doctor_infor, { foreignKey: 'doctorId' })
      User.hasMany(models.schedule, { foreignKey: 'doctorId', as: 'doctorData' })
      User.hasMany(models.booking, { foreignKey: 'patientId', as: 'patientData' })
    }
  };
  User.init({
    u_rfid: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    Name: DataTypes.STRING,
    age: DataTypes.STRING,
    address: DataTypes.STRING,
    phonenumber: DataTypes.STRING,
    gender: DataTypes.STRING,
    image: DataTypes.STRING,
    role: DataTypes.STRING,
    position: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};