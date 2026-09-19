const bcrypt = require("bcrypt");

const db = require("./database");


const username = "admin";

const password = "11112008";


bcrypt.hash(password, 12, (err, hash) => {

    if (err) {

        console.error(
            "Password hashing failed:",
            err
        );

        return;

    }


    db.run(
        `
        INSERT INTO moderators
        (username, password)
        VALUES (?, ?)
        `,
        [username, hash],
        function(err) {

            if (err) {

                console.error(
                    "Failed to create moderator:",
                    err.message
                );

                return;

            }


            console.log(
                "Moderator created successfully."
            );

            console.log(
                "Username:",
                username
            );

        }
    );

});