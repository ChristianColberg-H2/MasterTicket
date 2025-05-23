let loginAuth = async (req, res, next) => {
    if (!req.session.user_id) {
        res.redirect('/login');
        return;
    }
    next();
};

export default loginAuth;