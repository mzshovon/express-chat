function getUsers(req, res, next) {
    res.render("users", {
        title: "User - Express Chat Application"
    });
}

module.exports = {
    getUsers
};