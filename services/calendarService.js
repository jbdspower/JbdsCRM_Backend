const eventModal = require('../modals/calendar/event');
const calendarService = module.exports = {}

calendarService.createEvent = async function createEvent(dbName, data, user) {
    try {
        const event = await eventModal.getModel(dbName);
        data.userId = user._id;
        data.userName = user.name
        const model = new event(data)
        const res = await model.save()
        return res;

    } catch (err) {
        throw err;
    }
};

calendarService.getAllEvent = function getAllTool(dbName, user, callback) {
    let query = {}
    if ((user.role == "manager") || (user.role == "employee")) {
        query.userId = user._id
    }
    eventModal.getModel(dbName).then((model) => {
        model.getAllEvent(query, (err, data) => {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, data);
            }
        })
    })
        .catch((err) => {
            callback(err, null);
        })
};
