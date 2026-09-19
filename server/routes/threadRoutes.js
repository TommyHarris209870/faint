const express = require("express");
const multer = require("multer");

const path = require("path");
const router = express.Router();

const db = require("../database");

//upload configuration

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, path.join(__dirname, "../../public/uploads"));
    },
    filename: function(req, file, cb){
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }

});

const upload = multer({
    storage: storage,

    limits:{
        fileSize: 10*1024*1024
    }
});


// =========================================
// Get all threads for a board
// GET /api/threads/:slug
// =========================================

router.get("/:slug", (req, res) => {

    const slug = req.params.slug;

    db.all(
        `
        SELECT threads.*
        FROM threads
        JOIN boards
        ON threads.board_id = boards.id
        WHERE boards.slug = ?
        ORDER BY threads.created_at DESC
        `,
        [slug],

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
// Get ONE thread + its replies
// GET /api/threads/single/:id
// =========================================

router.get("/single/:id", (req, res) => {

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


// =========================================
// Create a new thread
// POST /api/threads
// =========================================

router.post("/",upload.single("image"), (req, res) => {

    const {
        board,
        name,
        subject,
        comment
    } = req.body;

    db.get(
        "SELECT id FROM boards WHERE slug = ?",
        [board],

        (err, boardRow) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            if (!boardRow) {

                return res.status(404).json({
                    error: "Board not found"
                });

            }

            db.run(
                `
                INSERT INTO threads
                (board_id, name, subject, comment, image)
                VALUES (?, ?, ?, ?, ?)
                `,

                [
                    boardRow.id,
                    name || "Anonymous",
                    subject,
                    comment,
                    req.file ? `/uploads/${req.file.filename}` : null
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

        }
    );

});


module.exports = router;