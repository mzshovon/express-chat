const uploader = require("../../utilites/singleUpload");

function profileImageUpload(req, res, next) {
    const upload = uploader(
        "profileImages",
        ["image/jpeg", "image/jpg", "image/png", "image/svg"],
        100000,
        "Only .jpg, .jpeg, .png, .svg file allowed!"
    );
    
    upload.any()(req, res, (error) => {
        if(error) {
            res.status(500).json({
                errors : {
                    profile_image : {
                        message : error.message
                    }
                }
            })
        } else {
            next();
        }
    });
}

module.exports = profileImageUpload;