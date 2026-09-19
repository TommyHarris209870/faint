// Dear hacker, only God and I knew how this thing is running.
// And now only God knows.
// So please consider not shittalking me when you get access
// to the source code <3



// IMPORTS
const express = require("express");
const path = require("path");
const session = require("express-session");
const helmet = require ("helmet");
const db = require("./database");

const boardRouts = require("./routes/boardRouts");
const threadRoutes = require("./routes/threadRoutes");
const replyRoutes = require("./routes/replyRoutes");
const moderationRoutes = require("./routes/moderationRoutes");
const authRoutes = require("./routes/authRoutes");

// CREATE EXPRESS APP

const app = express();

const PORT = process.env.PORT || 3000;

//SECURITY HEADERS

app.use(helmet());

// MIDDLEWARE


// Allow Express to read JSON request bodies
app.use(express.json());

// Allow Express to read form data
app.use(express.urlencoded({
     extended: true 
    }));


// SESSION


app.use(session({



    secret: process.env.SESSION_SECRET || "development-only-secret",

    resave: false,

    saveUninitialized: false,

    cookie: {



        httpOnly: true,

       

        sameSite: "lax",

      

        maxAge: 1000 * 60 * 60 * 8

    }

}));



// AUTH ROUTES


app.use("/api/auth", authRoutes);



// STATIC PUBLIC FILES


app.use(express.static("public"));



// API ROUTES


app.use("/api/boards", boardRouts);

app.use("/api/threads", threadRoutes);

app.use("/api/replies", replyRoutes);

//MODERATION MIDDLEWARE

function requireModerator(req, res, next){
    if(!req.session || !req.session.moderator){
        return res.status(401).json({
            error: "unauthorized"
        });
    }
    next();
}

app.use("/api/moderation",requireModerator,moderationRoutes);



// HOME PAGE


app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../public",
            "index.html"
        )
    );

});



// BOARD PAGE


app.get("/board/:slug", (req, res) => {

    const slug = req.params.slug;

    console.log(`User opened board: ${slug}`);

    res.sendFile(
        path.join(
            __dirname,
            "../public",
            "board.html"
        )
    );

});


// SINGLE THREAD PAGE


app.get("/thread/:id", (req, res) => {

    const threadId = req.params.id;

    console.log(`User opened thread: ${threadId}`);

    res.sendFile(
        path.join(
            __dirname,
            "../public",
            "thread.html"
        )
    );

});


// BOARD THREAD PAGE


app.get("/board/:slug/thread/:id", (req, res) => {

    const threadId = req.params.id;

    console.log(`User opened thread: ${threadId}`);

    res.sendFile(
        path.join(
            __dirname,
            "../public",
            "thread.html"
        )
    );

});


// TEST ROUTE


app.get("/test", (req, res) => {

    res.send("Hello from Rotten!");

});



// PROTECTED DASHBOARD


app.get("/dashboard", (req, res) => {

    if (!req.session || !req.session.moderator) {

        return res.redirect("/login.html");

    }

    // Moderator is authenticated.
    // Show dashboard.

    res.sendFile(
    path.join(__dirname, 
        "private", 
        "dashboard.html")
    );

});



// START SERVER

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});