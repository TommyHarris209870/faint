const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();

const db = require("../database");


// ==========================================
// Moderator Login
// POST /api/auth/login
// ==========================================

router.post("/login", (req, res) => {

    const { username, password } = req.body;


    if (!username || !password) {

        return res.status(400).json({
            error: "Username and password are required"
        });

    }


    db.get(
        `
        SELECT *
        FROM moderators
        WHERE username = ?
        `,
        [username],
        async (err, moderator) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


if (!moderator) {

    console.log("LOGIN FAILED: username not found:", username);

    return res.status(401).json({
        error: "Invalid username or password"
    });

}


            try {

                const passwordCorrect =
                    await bcrypt.compare(
                        password,
                        moderator.password
                    );
if (!passwordCorrect) {

    console.log("LOGIN FAILED: password incorrect for:", username);

    return res.status(401).json({
        error: "Invalid username or password"
    });

}
                // Store moderator information
                // inside the session.

                req.session.moderator = {

                    id: moderator.id,

                    username: moderator.username

                };
                console.log("LOGIN SUCCESS:", moderator.username);


                res.json({

                    success: true,

                    username: moderator.username

                });

            }

            catch (error) {

                console.error(error);

                res.status(500).json({
                    error: "Login failed"
                });

            }

        }
    );

});


// ==========================================
// Check current login
// GET /api/auth/me
// ==========================================

router.get("/me", (req, res) => {

    if (!req.session.moderator) {

        return res.status(401).json({
            authenticated: false
        });

    }


    res.json({

        authenticated: true,

        moderator: req.session.moderator

    });

});


// ==========================================
// Logout
// POST /api/auth/logout
// ==========================================

router.post("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {

            return res.status(500).json({
                error: "Logout failed"
            });

        }


        res.json({
            success: true
        });

    });

});


module.exports = router;