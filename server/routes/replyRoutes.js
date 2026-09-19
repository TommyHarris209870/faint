const express = require("express");

const router = express.Router();

const db = require("../database");

// =========================================
// Get all replies for a thread
// GET /api/replies/:threadId
// =========================================

router.get("/:threadId", (req, res) => {

    const threadId = req.params.threadId;

    db.all(
        `
        SELECT *
        FROM replies
        WHERE thread_id = ?
        ORDER BY created_at ASC
        `,
        [threadId],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json(rows);

        }
    );

});

// =========================================
// Create a reply
// POST /api/replies
// =========================================

router.post("/", (req, res) => {

    const {

        thread_id,
        name,
        comment

    } = req.body;

    db.run(
        `
        INSERT INTO replies
        (thread_id, name, comment)
        VALUES (?, ?, ?)
        `,
        [
            thread_id,
            name || "Anonymous",
            comment
        ],
        function(err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json({

                success: true,

                id: this.lastID

            });

        }
    );

});

module.exports = router;