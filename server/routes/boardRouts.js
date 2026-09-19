
//importing rxpress
const express = require("express");

//now importing the express router
const router = express.Router();

//import the database
const db = require("../database");

//that's the get req to get the selected page , if the selected page doesnt exist return a 404 error

router.get("/:slug", (req, res) => {
    //reading the slug from the URL

    const slug = req.params.slug;

    db.get(
        "SELECT * FROM boards WHERE slug = ?",
        [slug],
        (err, row) => {
            //get the sql error
            if(err) {
                return res.status(500).json({
                    error: err.message
                });
            
            }

            if(!row){
                return res.status(404).json({
                    error: "Board not found"
                });

            }
            //success
            res.json(row);
        }
    );
});

//export the routers
module.exports = router;