'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      u_rfid: "123321",
      email:'catcat141718@gmail.com',
      password: '134679',
      Name: 'Tuong',
      age:'22',
      address: 'Thủ Đức',
      gender:'0',
      phonenumber: '774030324',
      role:'ROLE',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
