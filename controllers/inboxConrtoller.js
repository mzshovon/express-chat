function getInbox(req, res, next) {
    res.render("inbox", {
        title: "Inbox - Express Chat Application"
    });
}

module.exports = {
    getInbox
};