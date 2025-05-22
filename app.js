import Express from 'express';
import session from 'express-session';
import DotEnv from 'dotenv';

import commonRoute from './routes/common.js';

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

app.use(commonRoute);

app.listen(process.env.PORT, (err) => {
    console.log(err ? err : `Server is running on port ${process.env.PORT}`);
});