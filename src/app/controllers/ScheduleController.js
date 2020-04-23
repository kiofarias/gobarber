import { parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import User from '../models/User';
import Appointment from '../models/Appointment';

class ScheduleController {
  async index(req, res) {
    const { date } = req.query;
    const checkIsProvider = await User.findOne({
      where: {
        id: req.UserId,
        provider: true,
      },
    });

    if (!checkIsProvider) {
      return res.status(401).json({ error: 'User is not a provider' });
    }

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.UserId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parseISO(date)), endOfDay(parseISO(date))],
        },
      },
    });

    return res.json(appointments);
  }
}

export default new ScheduleController();
