// ==========================================
// Moderator Authentication Middleware
// ==========================================

function requireModerator(req, res, next) {

    if (!req.session || !req.session.moderator) {

        return res.status(401).json({

            error: "Moderator authentication required"

        });

    }


    next();

}


module.exports = requireModerator;