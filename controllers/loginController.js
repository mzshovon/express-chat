function getLogin(req, res, next) {
    res.render("index", {
        title: "Login - Express Chat Application"
    });
}

module.exports = {
    getLogin,
};