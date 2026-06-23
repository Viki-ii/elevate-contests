require("dotenv").config();

console.log("JWT_SECRET =", process.env.JWT_SECRET);

const express = require("express");
const { pool } = require("./db");
const jwt = require("jsonwebtoken");
const {
    SignupSchema,
    SigninSchema,
    CreateWorkspaceSchema,
    CreateTaskSchema
} = require("./types/types");

const authMiddleware = require("./middleware/authMiddleware");
const app = express();

app.use(express.json());

app.get("/me", authMiddleware, (req, res) => {
    res.json({
        user: req.user
    });
});


app.post("/signup", async (req, res) => {
    const { success, data } = SignupSchema.safeParse(req.body);

    if (!success) {
        return res.status(400).json({
            message: "Invalid inputs"
        });
    }

    try {
        await pool.query(
            "INSERT INTO users(username,password) VALUES($1,$2)",
            [data.username, data.password]
        );

        res.json({
            message: "User created"
        });

    } catch (err) {
        res.status(400).json({
            message: "User already exists"
        });
    }
});

app.post("/signin", async (req, res) => {
    const { success, data } = SigninSchema.safeParse(req.body);

    if (!success) {
        return res.status(400).json({
            message: "Invalid inputs"
        });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE username=$1 AND password=$2",
            [data.username, data.password]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                message: "Invalid credentials"
            });
        }

        const user = result.rows[0];

        console.log("user =", user);
        console.log("secret =", process.env.JWT_SECRET);
        console.log(typeof process.env.JWT_SECRET);

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET
        );

        res.json({
            token
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error"
        });
    }
});

app.post("/workspace", authMiddleware, async (req, res) => {
    const { success, data } = CreateWorkspaceSchema.safeParse(req.body);

    if (!success) {
        return res.status(400).json({
            message: "Invalid inputs"
        });
    }

    try {
        const result = await pool.query(
            "INSERT INTO workspaces(name, user_id) VALUES($1, $2) RETURNING id",
            [data.name, req.user.id]
        );

        res.json({
            workspaceId: result.rows[0].id
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error"
        });
    }
}); 


app.get("/workspaces", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM workspaces WHERE user_id = $1",
            [req.user.id]
        );

        res.json({
            workspaces: result.rows
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Server error"
        });
    }
});

app.delete("/workspace/:workspaceId", authMiddleware, async (req, res) => {
    const workspaceId = req.params.workspaceId;

    try {
        // Step 1: verify workspace belongs to user
        const workspace = await pool.query(
            "SELECT * FROM workspaces WHERE id=$1 AND user_id=$2",
            [workspaceId, req.user.id]
        );

        if (workspace.rows.length === 0) {
            return res.status(403).json({
                message: "Workspace not found or unauthorized"
            });
        }

        // Step 2: delete tasks inside workspace
        await pool.query(
            "DELETE FROM tasks WHERE workspace_id=$1",
            [workspaceId]
        );

        // Step 3: delete workspace
        await pool.query(
            "DELETE FROM workspaces WHERE id=$1",
            [workspaceId]
        );

        res.json({
            message: "Workspace deleted"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error"
        });
    }
});


app.post("/task", authMiddleware, async (req, res) => {
    const workspaceId = req.headers.workspaceid;

    const { success, data } = CreateTaskSchema.safeParse(req.body);

    if (!success) {
        return res.status(400).json({
            message: "Invalid inputs"
        });
    }

    // ADD DUE DATE VALIDATION HERE 👇
    const dueDate = new Date(data.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
        return res.status(400).json({
            message: "Due date cannot be in past"
        });
    }

    try {
        const workspace = await pool.query(
            "SELECT * FROM workspaces WHERE id=$1 AND user_id=$2",
            [workspaceId, req.user.id]
        );

        if (workspace.rows.length === 0) {
            return res.status(403).json({
                message: "Unauthorized workspace access"
            });
        }

        // MODIFY INSERT QUERY HERE 👇
        const result = await pool.query(
            `INSERT INTO tasks(title, description, completed, workspace_id, due_date)
             VALUES($1, $2, $3, $4, $5)
             RETURNING id`,
            [
                data.title,
                data.description,
                false,
                workspaceId,
                data.dueDate
            ]
        );

        res.json({
            taskId: result.rows[0].id
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/tasks", authMiddleware, async (req, res) => {
    const workspaceId = req.headers.workspaceid;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    try {
        const result = await pool.query(
            `SELECT *
             FROM tasks
             WHERE workspace_id=$1
             AND workspace_id IN (
                SELECT id FROM workspaces WHERE user_id=$2
             )
             AND title ILIKE $3
             LIMIT $4 OFFSET $5`,
            [workspaceId, req.user.id, `%${search}%`, limit, offset]
        );

        res.json({
            tasks: result.rows
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error"
        });
    }
});


app.put("/task/:taskId", authMiddleware, async (req, res) => {
    const taskId = req.params.taskId;
    const { completed } = req.body;

    try {
        const result = await pool.query(
            `UPDATE tasks
             SET completed=$1
             WHERE id=$2
             AND workspace_id IN (
                SELECT id FROM workspaces WHERE user_id=$3
             )
             RETURNING *`,
            [completed, taskId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                message: "Unauthorized"
            });
        }

        res.json({
            message: "Task updated"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});


app.delete("/task/:taskId", authMiddleware, async (req, res) => {
    const taskId = req.params.taskId;

    try {
        const result = await pool.query(
            `DELETE FROM tasks
             WHERE id=$1
             AND workspace_id IN (
                SELECT id FROM workspaces WHERE user_id=$2
             )
             RETURNING *`,
            [taskId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                message: "Unauthorized"
            });
        }

        res.json({
            message: "Task deleted"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});



app.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        const totalWorkspaces = await pool.query(
            "SELECT COUNT(*) FROM workspaces WHERE user_id=$1",
            [req.user.id]
        );

        const totalTasks = await pool.query(
            `SELECT COUNT(*) FROM tasks
             WHERE workspace_id IN (
                SELECT id FROM workspaces WHERE user_id=$1
             )`,
            [req.user.id]
        );

        const completedTasks = await pool.query(
            `SELECT COUNT(*) FROM tasks
             WHERE completed=true
             AND workspace_id IN (
                SELECT id FROM workspaces WHERE user_id=$1
             )`,
            [req.user.id]
        );

        const pendingTasks = await pool.query(
            `SELECT COUNT(*) FROM tasks
             WHERE completed=false
             AND workspace_id IN (
                SELECT id FROM workspaces WHERE user_id=$1
             )`,
            [req.user.id]
        );

        res.json({
            totalWorkspaces: Number(totalWorkspaces.rows[0].count),
            totalTasks: Number(totalTasks.rows[0].count),
            completedTasks: Number(completedTasks.rows[0].count),
            pendingTasks: Number(pendingTasks.rows[0].count)
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error"
        });
    }
});


app.listen(3000, () => {
    console.log("Server running");
});