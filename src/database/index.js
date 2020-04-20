import Sequelize from 'sequelize';

import databaseConfig from '../config/database';

import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';

const models = [User, File, Appointment];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.conn = new Sequelize(databaseConfig);
    models
      .map((model) => model.init(this.conn))
      .map((model) => model.associate && model.associate(this.conn.models));
  }
}

export default new Database();
