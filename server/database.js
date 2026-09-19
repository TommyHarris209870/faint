// importing th sqlite3 library 

const sqlite3 = require("sqlite3").verbose();

//make the datebase file
const db = new sqlite3.Database("./server/rotten.db", (err) => {
    if(err){
        console.error("databse connection failed: ", err.message);

    }
    else {
        console.log("connected to rotten database.");

        //create the boards table if it doesn't already exist
        db.run(`
         CREATE TABLE IF NOT EXISTS boards (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         slug TEXT UNIQUE NOT NULL,
         title TEXT NUOT NULL,
         description TEXT
         )   
            `, (err) => {
                if(err){
                    console.error("faild to create boards table: ", err.message);
                }else{
                    console.log("boards table is ready.");
console.log("Default boards inserted.");

db.run(`
    CREATE TABLE IF NOT EXISTS threads(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL,
    name TEXT,
    subject TEXT,
    comment TEXT NOT NULL,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(board_id)
        REFERENCES boards(id)
    );

    `, (err) => {
        if(err){
            console.log("threads table is not created : ", err.message);
        }else{
            console.log("threads table is ready.");
        db.run(
            `
            CREATE TABLE IF NOT EXISTS replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL,
    name TEXT,
    comment TEXT NOT NULL,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(thread_id) REFERENCES threads(id)
);`, (err) => {
    if(err){
        console.log("comments table is not created : " , err.message);
    }else{
        console.log("comments table created");
    }
}
        );
        
db.run(`
    CREATE TABLE IF NOT EXISTS moderators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {

    if (err) {

        console.log(
            "moderators table is not created:",
            err.message
        );

    } else {

        console.log("moderators table is ready.");

    }

});

        }
    });
                }

            });
    }


});

module.exports = db;
