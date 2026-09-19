const bcrypt = require("bcrypt");
const db = require("./database");

const username = "admin";
const newPassword = "11112005";

bcrypt.hash(newPassword, 10, (err, hash) => {

    if (err) {
        console.error(err);
        return;
    }

    console.log("NEW HASH:");
    console.log(hash);

    db.get(
        "SELECT username, password FROM moderators WHERE username = ?",
        [username],
        (err, moderator) => {

            if (err) {
                console.error(err);
                return;
            }

            console.log("BEFORE UPDATE:");
            console.log(moderator);

            db.run(
                `
                UPDATE moderators
                SET password = ?
                WHERE username = ?
                `,
                [hash, username],
                function (err) {

                    if (err) {
                        console.error(err);
                        return;
                    }

                    console.log("ROWS UPDATED:", this.changes);

                    db.get(
                        "SELECT username, password FROM moderators WHERE username = ?",
                        [username],
                        (err, updated) => {

                            if (err) {
                                console.error(err);
                                return;
                            }

                            console.log("AFTER UPDATE:");
                            console.log(updated);

                            bcrypt.compare(
                                newPassword,
                                updated.password,
                                (err, result) => {

                                    console.log(
                                        "PASSWORD TEST:",
                                        result
                                    );

                                    db.close();
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});