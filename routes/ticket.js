import { Router } from 'express';
import Models from '../orm/models.js';
import { Op } from 'sequelize';


const router = Router();

router.get('/tickets', async (req, res) => {
    const { user_id } = req.session;
    if (!user_id) {
        return res.redirect('/login');
    }

    try {
        let tickets = await Models.Tickets.findAll({
            where: {
                user_id: user_id,
                status_id: {
                    [Op.notIn]: [5, 6]
                }
            },
            order: [[
                Models.sequelize.literal('CASE WHEN updatedAt IS NULL THEN 1 ELSE 0 END, updatedAt DESC, createdAt DESC')
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
    let { title, description, priority_id, category_id } = req.body;
    console.log(req.body);

    if (!user_id) {
        return res.redirect('/login');
    }

    if (!title || !description || !priority_id || !category_id) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    title = title.charAt(0).toUpperCase() + title.slice(1);
    description = description.charAt(0).toUpperCase() + description.slice(1);

    try {
        const newTicket = await Models.Tickets.create({
            user_id: user_id,
            assigned_to: null,
            category_id: category_id,
            status_id: 1, // Default status
            priority_id: priority_id,
            title: title,
            description: description,
            dueDate: null,
            closedAt: null
        });

        return res.status(200).json({ message: 'Ticket created successfully', id: newTicket.id });
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
        ticket.dataValues.comments = await Models.Comments.findAll({
            where: { ticket_id: ticketId },
            order: [['createdAt', 'ASC']]
        });

        for (let comment of ticket.dataValues.comments) {
            comment.dataValues.user = await Models.Users.findOne({ where: { id: comment.user_id }});
            console.log(comment.dataValues.user);
        }

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

router.put('/cancel/:ticketId', async (req, res) => {
    const { user_id } = req.session;
    const { ticketId } = req.params;

    if (!user_id) {
        return res.redirect('/login');
    }

    try {
        let ticket = await Models.Tickets.findOne({ where: { id: ticketId, user_id: user_id } });

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (ticket.status_id === 6) {
            return res.status(400).json({ message: 'Ticket is already cancelled' });
        }

        ticket.status_id = 6;
        await ticket.save();

        return res.status(200).json({ message: 'Ticket cancelled successfully' });
    } catch (err) {
        console.error('[Cancel Ticket]:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
})

router.put('/resolve/:ticketId', async (req, res) => {
    const { user_id } = req.session;
    const { ticketId } = req.params;

    if (!user_id) {
        return res.redirect('/login');
    }

    try {
        let ticket = await Models.Tickets.findOne({ where: { id: ticketId, user_id: user_id } });

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (ticket.status_id === 5) {
            return res.status(400).json({ message: 'Ticket is already resolved' });
        }

        ticket.status_id = 5;
        await ticket.save();

        return res.status(200).json({ message: 'Ticket resolved successfully' });
    } catch (err) {
        console.error('[Cancel Ticket]:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/closed-tickets', async (req, res) => {
    const { user_id } = req.session;
    console.log(user_id);
    if (!user_id) {
        return res.redirect('/login');
    }

    try {
        let tickets = await Models.Tickets.findAll({
            where: {
                user_id: user_id,
                status_id: {
                    [Op.notIn]: [1, 2, 3, 4]
                }
            },
            order: [[
                Models.sequelize.literal('CASE WHEN updatedAt IS NULL THEN 1 ELSE 0 END, updatedAt DESC, createdAt DESC')
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

export default router;