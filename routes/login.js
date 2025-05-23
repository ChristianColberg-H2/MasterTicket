import { Router } from 'express';
import Models from '../orm/models.js';
import bcrypt from 'bcryptjs';

let router = Router();

router.get('/', (req, res) => {
    if (req.session.user_id) {
        return res.redirect('/');
    }

    res.render('login.ejs');
});

router.post('/', async (req, res) => {
    const {name, password} = req.body;
    console.log(req.body);

    if (!name) {
        console.log(1);
        return res.status(400).json({message: 'name is required'});
    }
    if (!password) {
        console.log(2);
        return res.status(400).json({message: 'Password is required'});
    }

    try {
        let user = await Models.Users.findOne({
            where: {name: name}
        });
        if (!user) {
            console.log(3);
            return res.status(400).json({message: 'name does not exist'});
        }

        let isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            console.log(4);
            return res.status(400).json({message: 'Invalid password'});
        }

        req.session.user_id = user.id;
        req.session.name = user.name;

        return res.status(200).json({message: 'Login successful'});
    } catch (err) {
        console.error('[Login]:', err);
        res.status(500).json({message: 'Internal server error'});
    }
});

export default router;