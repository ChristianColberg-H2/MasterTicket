import { Router } from 'express';
import Models from '../orm/models.js';

const router = Router();

router.post('/new', async (req, res) => {
    const { user_id } = req.session;
    let { content, ticket_id } = req.body;

    if (!user_id) {
        return res.redirect('/login');
    }

    if (!content || !ticket_id) {
        return res.status(400).json({ message: 'Content and ticket ID are required' });
    }

    content = content.charAt(0).toUpperCase() + content.slice(1);

    try {
        await Models.Comments.create({
            ticket_id: ticket_id,
            user_id: user_id,
            content: content,
            is_internal: false
        });

        return res.status(201).json({ message: 'Comment added successfully' });
    } catch (err) {
        console.error('[Comments]:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;