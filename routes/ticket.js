import { Router } from 'express';
import Models from '../orm/models.js';

const router = Router();

router.get('/tickets', async (req, res) => {
    const { user_id } = req.session;
    if (!user_id) {
        return res.redirect('/login');
    }

    try {
        let tickets = await Models.Tickets.findAll({
            where: { user_id: user_id},
            order: [[
                Models.sequelize.literal('CASE WHEN updated_at IS NULL THEN 1 ELSE 0 END, updated_at DESC, created_at DESC')
            ]]
        });

        for (let ticket of tickets) {
            ticket.dataValues.status = await Models.Status.findOne({ where: { id: ticket.status_id } });
            ticket.dataValues.priority = await Models.Priorities.findOne({ where: { id: ticket.priority_id } });
            ticket.dataValues.category = await Models.Categories.findOne({ where: { id: ticket.category_id } });
            delete ticket.dataValues.status_id;
            delete ticket.dataValues.priority_id;
            delete ticket.dataValues.category_id;
        }

        return res.status(200).json({ tickets });
    } catch (err) {
        console.error('[Tickets]:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/categories', async (req, res) => {
    try {
        const categories = await Models.Categories.findAll();
        return res.status(200).json({ categories });
    } catch (err) {
        console.error('[Categories]:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/priorities', async (req, res) => {
    try {
        const priorities = await Models.Priorities.findAll();
        return res.status(200).json({ priorities });
    } catch (err) {
        console.error('[Priorities]:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/create', async (req, res) => {
    const { user_id } = req.session;
    const { title, description, priority_id, category_id } = req.body;
    console.log(req.body);

    if (!user_id) {
        return res.redirect('/login');
    }

    if (!title || !description || !priority_id || !category_id) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        await Models.Tickets.create({
            user_id: user_id,
            assigned_to: null,
            category_id: category_id,
            status_id: 1, // Default status
            priority_id: priority_id,
            title: title,
            description: description,
            created_at: new Date(),
            updated_at: null,
            due_date: null,
            closed_at: null
        });

        return res.status(200).json({ message: 'Ticket created successfully' });
    } catch (err) {
        console.error('[Create Ticket]:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:ticketId', async (req, res) => {
    const { user_id } = req.session;
    const { ticketId } = req.params;

    if (!user_id) {
        return res.redirect('/login');
    }

    try {
        console.log(ticketId);
        let ticket = await Models.Tickets.findOne({
            where: { id: ticketId, user_id: user_id }
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        ticket.dataValues.status = await Models.Status.findOne({ where: { id: ticket.status_id } });
        ticket.dataValues.priority = await Models.Priorities.findOne({ where: { id: ticket.priority_id } });
        ticket.dataValues.category = await Models.Categories.findOne({ where: { id: ticket.category_id } });

        delete ticket.dataValues.status_id;
        delete ticket.dataValues.priority_id;
        delete ticket.dataValues.category_id;
        delete ticket.dataValues.user_id;
        delete ticket.dataValues.assigned_user_id;

        return res.status(200).json({ ticket });
    } catch (err) {
        console.error('[Get Ticket]:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;