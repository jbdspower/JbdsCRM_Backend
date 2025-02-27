// const crypto = require('crypto');
const categroy = require('../modals/productDetails/categroy');
const product = require('../modals/productDetails/product');
const userModal = require('../modals/userManagement/user');
const userRoleModal = require('../modals/userManagement/userRole')
const ticketModal = require('../modals/ticket/ticket');
const reportingService = module.exports = {}


reportingService.GetDashboardData = async function GetDashboardData(data, dbName, company, user) {
    try {
        let query = {}
        if (user.role == "super_admin") {
            query = {}
        } else {
            query = { "SR_Data_Logs.FieldData.AssignPerson.value": user.name }
        }
        const priority = ["Urgent", "High", "Low", "Medium"]
        const status = [
            { Status: "On Hold", Color: 'purple' },
            { Status: "Cancelled", Color: 'white' },
            { Status: "New Ticket", Color: "yellow" },
            { Status: "In Progress", Color: "green" },
            { Status: "On Time Completion", Color: "blue" },
            { Status: "Due Date Completion", Color: "orrange" },
            { Status: "Due Date Extend", Color: "red" },
        ]
        const returnObj = {
            totalEmployee: { count: 0, ids: [] },
            activeEmployee: { count: 0, ids: [] },
            activeTicket: { count: 0, ids: [] },
            monthTicket: { count: 0, ids: [] },
            onHoldTicket: { count: 0, ids: [] },
            dueDateTicket: { count: 0, ids: [] },
            closeTicket: { count: 0, ids: [] },
            ticketStatus: status.map(p => { return { ...p, Count: 0 } }),
            ticketPriority: priority.map(p => { return { Priority: p, Count: 0, Ids: [] } }),
            upcomingEvents: [],
            stickyNotes: []
        }
        const currentDate = new Date(); // Get current date

        // Get the start of the current month (1st day of the month, time at 00:00:00)
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0);
        currentDate.setHours(23, 59, 559, 999)
        // Get the current date (with time)

        let tickets = await ticketModal.getModel(dbName);
        let users = await userModal.getModel(dbName)
        let roles = await userRoleModal.getModel(dbName);
        roles = await roles.findOne({ UserRole: "employee" });
        let Ids = []
        returnObj.totalEmployee.count = await users.countDocuments({ userRole: roles._id || "" })
        Ids = await users.find({ userRole: roles._id || "" }, { _id: 1 })
        returnObj.totalEmployee.ids = Ids.map(x => x._id)

        returnObj.activeEmployee.count = await users.countDocuments({ userRole: roles._id || "", active: true })
        Ids = await users.find({ userRole: roles._id || "", active: true }, { _id: 1 })
        returnObj.activeEmployee.ids = Ids.map(x => x._id)

        returnObj.activeTicket.count = await tickets.countDocuments({ Status: "Active", DocumentType: "ServiceRequest", ...query })
        Ids = await tickets.find({ Status: "Active", DocumentType: "ServiceRequest", ...query })
        returnObj.activeTicket.ids = Ids.map(x => x._id)

        returnObj.monthTicket.count = await tickets.countDocuments({ DocumentType: "ServiceRequest", StartDate: { $gte: startOfMonth, $lte: currentDate }, ...query })
        Ids = await tickets.find({ DocumentType: "ServiceRequest", StartDate: { $gte: startOfMonth, $lte: currentDate }, ...query })
        returnObj.monthTicket.ids = Ids.map(x => x._id)

        returnObj.onHoldTicket.count = await tickets.countDocuments({ DocumentType: "ServiceRequest", Status: "On Hold", ...query })
        Ids = await tickets.find({ DocumentType: "ServiceRequest", Status: "On Hold", ...query })
        returnObj.onHoldTicket.ids = Ids.map(x => x._id)

        returnObj.dueDateTicket.count = await tickets.countDocuments({ DocumentType: "ServiceRequest", StateName: { $ne: "Close" }, DueDate: { $gte: currentDate }, ...query })
        Ids = await tickets.find({ DocumentType: "ServiceRequest", StateName: { $ne: "Close" }, DueDate: { $gte: currentDate }, ...query })
        returnObj.dueDateTicket.ids = Ids.map(x => x._id)

        returnObj.closeTicket.count = await tickets.countDocuments({ DocumentType: "ServiceRequest", StateName: "Close", ...query })
        Ids = await tickets.find({ DocumentType: "ServiceRequest", StateName: "Close", ...query })
        returnObj.closeTicket.ids = Ids.map(x => x._id)

        const allTickets = await tickets.find({ DocumentType: "ServiceRequest", ...query })
        allTickets.forEach((ticket) => {
            const priorityIdx = returnObj.ticketPriority.findIndex(x => x.Priority == ticket.Priority);
            if (priorityIdx > -1) {
                returnObj.ticketPriority[priorityIdx].Count = returnObj.ticketPriority[priorityIdx].Count + 1
                returnObj.ticketPriority[priorityIdx].Ids.push(ticket._id)

            }

        })

        returnObj.ticketStatus.forEach((s, idx) => {
            if (s.Status == "New Ticket") {
                returnObj.ticketStatus[idx].Count = allTickets.filter((x) => x.StateName == "Create SR").length;
                returnObj.ticketStatus[idx].Ids = allTickets.filter((x) => x.StateName == "Create SR").map(x => x._id);
            }
            if (s.Status == "In Progress") {
                returnObj.ticketStatus[idx].Count = allTickets.filter((x) => x.StateName == s.Status).length;
                returnObj.ticketStatus[idx].Ids = allTickets.filter((x) => x.StateName == s.Status).map(x => x._id);

            }
            if (s.Status == "On Hold") {
                returnObj.ticketStatus[idx].Count = allTickets.filter((x) => x.Status == s.Status).length;
                returnObj.ticketStatus[idx].Ids = allTickets.filter((x) => x.Status == s.Status).map(x => x._id);

            }
            if (s.Status == "Cancelled") {
                returnObj.ticketStatus[idx].Count = allTickets.filter((x) => x.Status == s.Status).length;
                returnObj.ticketStatus[idx].Ids = allTickets.filter((x) => x.Status == s.Status).map(x => x._id);

            }
            if (s.Status == "Due Date Extend") {
                let count = 0
                const ids = []
                allTickets.forEach(ticket => {
                    ticket.SR_Data_Logs.forEach((x) => {
                        if (x.UpdateData && x.UpdateData.length > 0) {
                            x.UpdateData.forEach((dueDate) => {
                                if (dueDate.DueDate) {
                                    count = count + 1
                                    ids.push(ticket._id)
                                }
                            })
                        }
                    })
                })
                returnObj.ticketStatus[idx].Count = count;
                returnObj.ticketStatus[idx].Ids = ids;

            }
            if (s.Status == "Due Date Completion") {
                let count = 0
                const ids = []
                allTickets.forEach(ticket => {
                    ticket.SR_Data_Logs.forEach((x) => {
                        if (x.UpdateData && x.UpdateData.length > 0) {
                            x.UpdateData.forEach((dueDate) => {
                                if (dueDate.DueDate && x.StateName == "Close") {
                                    count = count + 1
                                    ids.push(ticket._id)
                                }
                            })
                        }
                    })
                })
                returnObj.ticketStatus[idx].Count = count;
                returnObj.ticketStatus[idx].Ids = ids;
            }
            if (s.Status == "On Time Completion") {
                let count = 0
                const ids = []
                allTickets.forEach(ticket => {
                    ticket.SR_Data_Logs.forEach((x) => {
                        if (x.UpdateData && x.UpdateData.length == 0) {
                            if (x.StateName == "Close") {
                                count = count + 1
                                ids.push(ticket._id)
                            }
                        }
                    })
                })
                returnObj.ticketStatus[idx].Count = count;
                returnObj.ticketStatus[idx].Ids = ids;
            }
        })

        return returnObj;


    } catch (err) {
        throw err;
    }
}







