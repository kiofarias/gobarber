import Sequelize from 'sequelize';

import databaseConfig from '../config/database';

import User from '../app/models/User';

const models = [User];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.conn = new Sequelize(databaseConfig);
    models.map((model) => model.init(this.conn));
  }
}

export default new Database();
