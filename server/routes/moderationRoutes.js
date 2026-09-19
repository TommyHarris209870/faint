const express = require("express");

const router = express.Router();

const db = require("../database");
const requireModerator =
    require("../middleware/auth");

// ==========================================
// Get ALL threads
// GET /api/moderation/threads
// ==========================================

router.get("/threads", (req, res) => {

    db.all(
        `
        SELECT
            threads.id,
            threads.name,
            threads.subject,
            threads.comment,
            threads.created_at,
            boards.slug AS board_slug,
            boards.title AS board_title

        FROM threads

        JOIN boards
        ON threads.board_id = boards.id

        ORDER BY threads.created_at DESC
        `,

        (err, rows) => {

            if (err) {

                console.error("Failed to load threads:", err.message);

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json(rows);

        }
    );

});


// ==========================================
// SEARCH THREADS
// GET /api/moderation/search?q=
// ==========================================

router.get(
    "/search",
    requireModerator,
    (req, res) => {

    const query = req.query.q || "";

    if (!query.trim()) {

        return res.json([]);

    }

    const search = `%${query}%`;

    db.all(
        `
        SELECT
            threads.id,
            threads.name,
            threads.subject,
            threads.comment,
            threads.created_at,
            boards.slug AS board_slug,
            boards.title AS board_title

        FROM threads

        JOIN boards
        ON threads.board_id = boards.id

        WHERE
            CAST(threads.id AS TEXT) LIKE ?
            OR threads.subject LIKE ?
            OR threads.comment LIKE ?
            OR threads.name LIKE ?
            OR boards.slug LIKE ?
            OR boards.title LIKE ?

        ORDER BY threads.created_at DESC
        `,

        [
            search,
            search,
            search,
            search,
            search,
            search
        ],

        (err, rows) => {

            if (err) {

                console.error("Search failed:", err.message);

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json(rows);

        }
    );

});


// ==========================================
// GET ONE THREAD + ITS REPLIES
// GET /api/moderation/thread/:id
// ==========================================

router.get(
    "/thread/:id",
    requireModerator,
    (req, res) => {

    const threadId = req.params.id;

    db.get(
        `
        SELECT
            threads.*,
            boards.slug AS board_slug,
            boards.title AS board_title

        FROM threads

        JOIN boards
        ON threads.board_id = boards.id

        WHERE threads.id = ?
        `,

        [threadId],

        (err, thread) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            if (!thread) {

                return res.status(404).json({
                    error: "Thread not found"
                });

            }


            // Get replies belonging to this thread

            db.all(
                `
                SELECT *
                FROM replies
                WHERE thread_id = ?
                ORDER BY created_at ASC
                `,

                [threadId],

                (err, replies) => {

                    if (err) {

                        return res.status(500).json({
                            error: err.message
                        });

                    }

                    res.json({

                        thread: thread,

                        replies: replies

                    });

                }
            );

        }
    );

});


// ==========================================
// DELETE THREAD + ALL REPLIES
// DELETE /api/moderation/thread/:id
// ==========================================

router.delete(
    "/thread/:id",
    requireModerator,
    (req, res) => {

    const threadId = req.params.id;


    // First delete replies

    db.run(
        `
        DELETE FROM replies
        WHERE thread_id = ?
        `,

        [threadId],

        function(err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


            // Then delete the thread

            db.run(
                `
                DELETE FROM threads
                WHERE id = ?
                `,

                [threadId],

                function(err) {

                    if (err) {

                        return res.status(500).json({
                            error: err.message
                        });

                    }


                    if (this.changes === 0) {

                        return res.status(404).json({
                            error: "Thread not found"
                        });

                    }


                    res.json({

                        success: true,

                        message: "Thread deleted successfully",

                        thread_id: threadId

                    });

                }
            );

        }
    );

});


module.exports = router;