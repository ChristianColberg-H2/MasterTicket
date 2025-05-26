import { Router } from 'express';
import bcrypt from 'bcryptjs';

import Models from '../orm/models.js';

let router = Router();

router.get('/', (req, res) => {
    if (req.session.user_id) {
        return res.redirect('/');
    }

    res.render('register.ejs');
});

router.post('/', async (req, res) => {
    let { name, email, password, confirmPassword } = req.body;
    console.log(req.body);

    name = name.charAt(0).toUpperCase() + name.slice(1);
    email = email.charAt(0).toUpperCase() + email.slice(1);

    if (!name || !email || !password) {
        console.log(1);
        return res.status(400).json(
            {message: 'Username, Email and Password is required'
        });
    }

    if (name.length < 3 || name.length > 20) {
        console.log(2);
        return res.status(400).json(
            { message: 'Username must be between 3 and 20 characters'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.log(4);
        return res.status(400).json({
            message: 'Invalid email format'
        });
    }

    if (password.length < 6) {
        console.log(3);
        return res.status(400).json(
            { message: 'Password must be at least 6 characters'
        });
    }

    if (password !== confirmPassword) {
        console.log(5);
        return res.status(400).json(
            { message: 'Password and Confirm Password do not match'
        });
    }

    try {
        let userExists = await Models.Users.findOne({
            where: { name: name }
        });
        let emailExists = await Models.Users.findOne({
            where: { email: email }
        });

        if (userExists) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        if (emailExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        let password_hash = await bcrypt.hash(password, 10);
        let user = await Models.Users.create({
            name: name,
            email: email,
            password_hash: password_hash,
            role_id: 1,
            is_active: true
        });

        req.session.user_id = user.id;
        req.session.username = user.username;
        req.session.role_id = user.role_id;
        req.session.is_active = user.is_active;

        res.status(200).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role_id: user.role_id,
            }
        });
        console.log(`[Register]\t\tUser ${user.name} registered successfully.`);
    } catch (err) {
        console.error('[Register]:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;