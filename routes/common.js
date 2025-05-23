import { Router } from 'express';

let router = Router();

router.get('/', (req, res) => {
    res.render('index.ejs', { name: req.session.name });
});

export default router;