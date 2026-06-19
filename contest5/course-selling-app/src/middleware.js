const { users } = require("./db");

function auth(req, res, next) {

    const token = req.headers.token;

    const user = users.find(
        u => u.token === token
    );

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    req.user = user;

    next();
}

module.exports = auth;