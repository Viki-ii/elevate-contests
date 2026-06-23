const jwt = require("jsonwebtoken");
const { pool } = require("../db");

async function authMiddleware(req, res, next) {
    try {
        // Step 1: Read Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Expected format: Bearer token_here
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Step 2: Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // decoded = { userId: 1 }

        // Step 3: Fetch user from DB
        const result = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Step 4: Attach user to request
        req.user = result.rows[0];

        // Step 5
        next();

    } catch (err) {
        console.log(err);

        return res.status(401).json({
            message: "Unauthorized"
        });
    }
}

module.exports = authMiddleware;