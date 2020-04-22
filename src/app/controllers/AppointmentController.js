import * as Yup from 'yup';
import { parseISO, startOfHour } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';

class AppointmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      res.status(400).json({ error: 'Validation fails' });
    }

    const { provider_id, date } = req.body;

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }
    /* 
    Check if start time is a possible appointment
     */
    const startHour = startOfHour(parseISO(date));
    if (startHour < new Date()) {
      res.status(400).json({ error: 'Past dates are not permitted' });
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
      res
        .status(400)
        .json({ error: 'Appointment hour at date is not available' });
    }

    const appointment = await Appointment.create({
      user_id: req.UserId,
      provider_id,
      date: startHour,
    });
    res.json(appointment);
  }
}

export default new AppointmentController();
