import Express from 'express';
import session from 'express-session';
import DotEnv from 'dotenv';

import loginAuth from './middleware/auth.js';
import commonRoute from './routes/common.js';
import loginRoute from './routes/login.js';
import logoutRoute from './routes/logout.js';
import registerRoute from './routes/register.js';
import ticketRoute from './routes/ticket.js';
import commentRoute from './routes/comment.js';

let app = Express();
DotEnv.config();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: process.env.NODE_ENV === 'production',
    }
}));

app.use(Express.static('public'));

app.use('/login', loginRoute);
app.use('/logout', logoutRoute);
app.use('/register', registerRoute);
app.use('/ticket', ticketRoute);
app.use('/comment', commentRoute);
app.use(loginAuth, commonRoute);

app.listen(process.env.PORT, (err) => {
    console.log(err ? err : `Server is running on port ${process.env.PORT}`);
});