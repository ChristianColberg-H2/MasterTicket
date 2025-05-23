import { Router } from 'express';

let router = Router();

router.get('/', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('[Logout]:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

export default router;