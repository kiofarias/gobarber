import * as Yup from 'yup';
import { parseISO, startOfHour, isBefore } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointments = await Appointment.findAll({
      where: { user_id: req.UserId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 2,
      offset: (page - 1) * 2,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: {
            model: File,
            as: 'avatar',
            attributes: ['path', 'url'],
          },
        },
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { provider_id, date } = req.body;

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }
    /* 
    Check if start time is a possible appointment
     */
    const startHour = startOfHour(parseISO(date));
    if (isBefore(startHour, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }
    /* 
    Check if start time is a possible appointment to that provider in database
     */
    const checkAvaliability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: startHour,
      },
    });

    if (checkAvaliability) {
      return res
        .status(400)
        .json({ error: 'Appointment hour at date is not available' });
    }

    const appointment = await Appointment.create({
      user_id: req.UserId,
      provider_id,
      date: startHour,
    });
    return res.json(appointment);
  }
}

export default new AppointmentController();
