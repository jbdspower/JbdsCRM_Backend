const user = require('../modals/userManagement/user');
const userRoleSchema = require('../modals/userManagement/userRole');
const userModel = require('../modals/userManagement/user');
const ticketComment = require('../modals/ticket/ticketComment');
const workFlow = require('../modals/ticket/workFlow');
const serviceRequest = require('../modals/ticket/ticket')
const customerService = require('../modals/master/customer')
const errorFunction = require('../utills/error');
const watsConfig = require('../config/whatsup.config.json')
const { default: axios } = require('axios');
const _ = require('lodash');
let serviceRequestService = module.exports = { checkUserIsValidOrNot }

//////////// Service Request Type ////////////////////
serviceRequestService.createServiceRequestType = async function createServiceRequestType(dbName, data) {
    try {
        const model = await serviceRequestType.getModel(dbName)
        const result = await model.createServiceRequestType(data);
        return result;
    } catch (err) {
        throw err;
    }
};

serviceRequestService.updateServiceRequestTypeById = function updateServiceRequestTypeById(dbName, id, updateObj, callback) {
    serviceRequestType.getModel(dbName)
        .then((model) => {
            model.findOne({ DocumentType: "ServiceRequestType", RequestType: updateObj.RequestType }, (err, existingData) => {
                if (err) {
                    return callback(err, null);
                }
                if (existingData && existingData._id.toString() !== id) {
                    let error = errorFunction(' already Have', 500, 'Duplicate Error')
                    return callback(error, null);
                }
                model.updateServiceRequestTypeById(id, updateObj, (err, data) => {
                    if (err) {
                        return callback(err, null)
                    } else {
                        return callback(null, data);
                    }
                })
            });
        })
        .catch((err) => {
            callback(err, null)
        })
};

serviceRequestService.getAllServiceRequestType = function getAllServiceRequestType(dbName, callback) {
    serviceRequestType.getModel(dbName)
        .then((model) => {
            model.getAllServiceRequestType((err, data) => {
                if (err) {
                    return callback(err, null)
                } else {
                    return callback(null, data);
                }
            })
        })
        .catch((err) => {
            callback(err, null)
        })
};

serviceRequestService.deleteServiceRequestTypeById = function deleteServiceRequestTypeById(dbName, id, callback) {
    serviceRequestType.getModel(dbName)
        .then((model) => {
            model.deleteServiceRequestTypeById(id, (err, data) => {
                if (err) {
                    return callback(err, null)
                } else {
                    return callback(null, data);
                }
            })
        })
        .catch((err) => {
            callback(err, null)
        })
};


/////////// Ticket Comment ///////////////////

// function sendNotificationToUsers(dbName, notifyArr = [], currentUser) {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const userModel = await user.getModel(dbName);
//             const users = await userModel.find({ name: { $in: notifyArr.map(x => x.User) } })
//             const doArr = []
//             users.forEach((x) => {
//                 const chat = _.cloneDeep(watsConfig.struc)
//                 chat.templateParams.push(`${data.ClientName}`)
//                 chat.templateParams.push(`${currentUser.name}`)
//                 chat.templateParams.push(`${data.TicketId}`)
//                 chat.templateParams.push(`${data.CompanyName}`)
//                 chat.templateParams.push(`${data.Message}`)
//                 chat.destination = '91' + x.mobileNumber;
//                 doArr.push(axios.post(watsConfig.api, chat))
//             })
//             await Promise.all(doArr)
//             resolve('done')
//         }
//         catch (ex) {
//             reject(ex);
//         }
// })
// }

serviceRequestService.createComment = async function CreateComment(dbName, data, user1) {
    try {
        const model = await ticketComment.getModel(dbName);
        const userModel = await user.getModel(dbName);
        const srModal = await serviceRequest.getModel(dbName)
        const srData = await srModal.findOne({ SR_ID: data.TicketId });
        let logs = srData.SR_Data_Logs.filter(x => x.FieldData && x.FieldData.AssignPerson && x.FieldData.AssignPerson.length > 0)
        logs.sort((a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt))
        let notifyArr = [{ User: srData.SR_Data_Logs[0].CreatedBy, SendAt: new Date() }]
        logs.forEach((assignState) => {
            if (assignState && assignState.FieldData && assignState.FieldData.AssignPerson) {
                assignState.FieldData.AssignPerson.forEach((val) => {
                    if (val.value !== user1.name) {
                        notifyArr.push({ User: val.value, SendAt: new Date() })
                    }
                })
            }
        })
        notifyArr = notifyArr.filter(x => x.User !== user1.name)
        data.CommentBy = user1.name;
        data.CommentDate = new Date();
        data.NotificationTo = notifyArr
        data.CreatedBy = user.name
        const users = await userModel.find({ name: { $in: notifyArr.map(x => x.User) } })
        const doArr = []
        users.forEach((x) => {
            const chat = _.cloneDeep(watsConfig.struc)
            chat.templateParams.push(`${x.name}, ${user1.name} left a comment on your Service Request ID ${data.TicketId} is : ${data.Message}`)
            chat.templateParams.push(`JBDS TEAM`)
            chat.destination = '91' + x.mobileNumber;
            doArr.push(axios.post(watsConfig.api, chat))
        })
        try {
            await Promise.all(doArr);
        } catch (err) {
            console.error("Error sending notifications:", err.response ? err.response.data : err.message);
        }

        const result = await model.createComment(data);
        return result;

    } catch (err) {
        throw err;
    }
};

serviceRequestService.updateDueDate = async function updateDueDate(dbName, data, user) {
    try {
        const srModal = await serviceRequest.getModel(dbName)
        const srData = await srModal.findOne({ SR_ID: data.TicketId });
        const lastState = srData.SR_Data_Logs[srData.SR_Data_Logs.length - 1]
        data.DueDate = new Date(data.DueDate);
        data.DueDate.setHours(23, 59, 59, 999)
        if (lastState.UpdateData.length > 0) {
            lastState.UpdateData.push({ DueDate: data.DueDate, User: user.name })
        } else {
            lastState.UpdateData = [{ DueDate: data.DueDate, User: user.name }]
        }
        srData.DueDate = data.DueDate;
        srData.SR_Data_Logs[srData.SR_Data_Logs.length - 1] = lastState
        await srModal.updateOne({ SR_ID: data.TicketId }, srData);
        return data.TicketId;

    } catch (err) {
        throw err;
    }
};

serviceRequestService.updateTicketAssignee = async function updateTicketAssignee(dbName, data, user) {
    try {
        const srModal = await serviceRequest.getModel(dbName)
        const srData = await srModal.findOne({ SR_ID: data.TicketId });
        srData.SR_Data_Logs.forEach((x) => {
            if (x.FieldData.AssignRole == "employee") {
                x.FieldData.AssignPerson = data.Assignee
            }
        })
        await srModal.updateOne({ SR_ID: data.TicketId }, srData);
        return data.TicketId;

    } catch (err) {
        throw err;
    }
};

serviceRequestService.ReOpenTicket = async function ReOpenTicket(dbName, data, user) {
    try {
        const srModal = await serviceRequest.getModel(dbName)
        const srData = await srModal.findOne({ SR_ID: data.TicketId });
        const lastState = srData.SR_Data_Logs[srData.SR_Data_Logs.length - 1]
        const userModal = await userModel.getModel(dbName);
        const createBy = await userModal.findOne({ name: lastState.CreatedBy })
        const userRoleModal = await userRoleSchema.getModel(dbName);
        const userRoleDoc = await userRoleModal.findOne({ _id: createBy.userRole });
        if (userRoleDoc.UserRole == "manager") {
            srData.StateName = "Assign"
            srData.StateType = "Assign"
            srData.SR_Data_Logs.splice(srData.SR_Data_Logs.length - 1, 1)
            await srModal.updateOne({ SR_ID: data.TicketId }, srData);
            return data.TicketId;
        } else {
            throw new Error("Only manager reject ticket open can not re-open ticket if reject by employee")
        }


    } catch (err) {
        throw { message: err.message };
    }
};

serviceRequestService.changeParams = async function changeParams(dbName, data, user) {
    try {
        const srModal = await serviceRequest.getModel(dbName)
        const srData = await srModal.findOne({ SR_ID: data.TicketId });
        if (data.Param == "Status") {
            srData.Status = data.Value
        }
        if (data.Param == "Priority") {
            srData.Priority = data.Value
        }
        await srModal.updateOne({ SR_ID: data.TicketId }, srData);
        return data.TicketId;
    } catch (err) {
        throw { message: err.message };
    }
};

serviceRequestService.getTicketHistory = async function getTicketHistory(dbName, data) {
    try {
        const srModal = await serviceRequest.getModel(dbName)
        const srData = await srModal.findOne({ SR_ID: data.id });
        return srData;

    } catch (err) {
        throw err;
    }
};

serviceRequestService.getCommentByQuery = async function getCommentByQuery(dbName, query, user) {
    try {
        const model = await ticketComment.getModel(dbName);
        const sentMsg = await model.find({ TicketId: query.TicketId, CommentBy: user.name }).lean();
        const rcvddMsg = await model.find({ TicketId: query.TicketId, "NotificationTo.User": user.name }).lean();
        return { RcvdMsg: rcvddMsg, SentMsg: sentMsg };

    } catch (err) {
        throw err;
    }
};

//////////// Work Flow //////////////

serviceRequestService.createWorkFlow = async function createWorkFlow(dbName, data) {
    try {
        const model = await workFlow.getModel(dbName);
        const result = await model.createWorkFlow(data);
        return result;

    } catch (err) {
        throw err;
    }
};

serviceRequestService.updateWorkFlowById = function updateWorkFlowById(dbName, id, updateObj, callback) {
    workFlow.getModel(dbName)
        .then((model) => {
            model.findOne({ DocumentType: "WorkFlow", WorkFlowName: updateObj.WorkFlowName }, (err, existingData) => {
                if (err) {
                    return callback(err, null);
                }
                if (existingData && existingData._id.toString() !== id) {
                    let error = errorFunction('WorkFlow already Have', 409, 'Duplicate Error')
                    return callback(error, null);
                }
                model.updateWorkFlowById(id, updateObj, (err, data) => {
                    if (err) {
                        return callback(err, null)
                    } else {
                        return callback(null, data);
                    }
                });
            });
        })
        .catch((err) => {
            callback(err, null)
        })
};

serviceRequestService.getAllWorkFlow = function getAllWorkFlow(dbName, callback) {
    workFlow.getModel(dbName)
        .then((model) => {
            model.getAllWorkFlow((err, data) => {
                if (err) {
                    return callback(err, null)
                } else {
                    return callback(null, data);
                }
            })
        })
        .catch((err) => {
            callback(err, null)
        })
};

serviceRequestService.deleteWorkFlowById = function deleteWorkFlowById(dbName, id, callback) {
    workFlow.getModel(dbName)
        .then((model) => {
            model.deleteWorkFlowById(id, (err, data) => {
                if (err) {
                    return callback(err, null)
                } else {
                    return callback(null, data);
                }
            })
        })
        .catch((err) => {
            callback(err, null)
        })
};

function IsUserTeamLead(user, data = []) {
    const logs = data.find((x) => x.FieldData.TeamLead && x.FieldData.TeamLead == user.name)
    if (logs) {
        return true
    } else {
        return false
    }
}


async function executeChildWorkflow(childStateData, dbName, srDoc) {
    try {
        const model = await workFlow.getModel(dbName);
        const workFlowDoc = await model.findOne({ DocumentType: "WorkFlow", WorkFlowName: childStateData.NextStateName }).lean();
        if (childStateData.SR_Data_Logs) {
            const state = { ...workFlowDoc.State[0] }
            return state;
        }
        else {
            const state = { ...workFlowDoc.State[0], SR_ID: srDoc.SR_ID, FirstState: srDoc.SR_Data_Logs[0], PrevStateData: {} }
            return state;
        }
    }
    catch (err) {
        return err;
    }
}

serviceRequestService.getNextServiceRequestState = async function getNextServiceRequestState(user, dbName, data) {
    try {
        data = { ...data }
        if (data.WorkFlowid) {
            const model = await workFlow.getModel(dbName);
            const result = await model.findOne({ DocumentType: "WorkFlow", _id: data.WorkFlowid }).lean();
            const state = { ...result.State[0] }
            state.SR_ID = await generateServiceRequestID(dbName)
            state.Step = "Initial"
            state.WorkFlowId = data.WorkFlowid
            state.StateIndex = 0;
            return state;

        } else {
            const model = await serviceRequest.getModel(dbName);
            const result = await model.findOne({ SR_ID: data.Sr_ID }).lean();
            if (!result) {
                return "State_Close";
            }



            const workFlowDoc = await model.findOne({ DocumentType: "WorkFlow", _id: result.WorkFlowId }).lean();
            let dataCurrentStateName = {}
            let checkOut = result.SR_Data_Logs[result.SR_Data_Logs.length - 1]
            let isLastComplete = false
            if (checkOut.Control_Name == "Check Out") {
                const checkIn = result.SR_Data_Logs[result.SR_Data_Logs.length - 2]
                const users = _.uniqBy(checkOut.FieldData.TimeEstimate, "User")
                isLastComplete = (users.length == checkIn.FieldData.TimeEstimate.length ? true : false)
            }
            if (checkOut.Control_Name == "Check In") {
                isLastComplete = (checkOut.FieldData.TimeEstimate.some(x => x.User == user.name) ? true : false)
            }
            if (['Check Out', 'Check In'].includes(checkOut.Control_Name) && !isLastComplete) {
                dataCurrentStateName = result.SR_Data_Logs[result.SR_Data_Logs.length - 2];
                const last = result.SR_Data_Logs[result.SR_Data_Logs.length - 1];
                if (dataCurrentStateName.FieldData.AssignPerson) {
                    let assignedPerson = []
                    result.SR_Data_Logs.forEach((one) => {
                        if (one.FieldData && one.FieldData.AssignPerson) {
                            assignedPerson = [...assignedPerson, ...one.FieldData.AssignPerson]
                        }
                    })
                    dataCurrentStateName.FieldData.AssignPerson = assignedPerson
                    dataCurrentStateName.FieldData.AssignPerson.forEach(x => {
                        if (last.FieldData.TimeEstimate && last.FieldData.TimeEstimate.some(a => a.User == x.value)) {
                            x.IsAlready = true
                        }
                    })
                }
                if (dataCurrentStateName.FieldData.TimeEstimate) {
                    dataCurrentStateName.FieldData.TimeEstimate.forEach(x => {
                        if (last.FieldData.TimeEstimate && last.FieldData.TimeEstimate.some(a => a.User == x.User)) {
                            x.IsAlready = true
                        }
                    })
                }
            } else {
                dataCurrentStateName = result.SR_Data_Logs[result.SR_Data_Logs.length - 1];
            }

            if (dataCurrentStateName.NextStateName == "Close") {
                return "State_Close";
            }


            const assignStates = result.SR_Data_Logs.filter((one) => one.FieldData.AssignPerson && one.FieldData.AssignPerson.length > 0)
            const assignLastState = assignStates[assignStates.length - 1]
            const isViewOnly = assignLastState.FieldData.AssignPerson && assignLastState.FieldData.AssignPerson.some(one => one.value == user.name || user.role == "super_admin");
            // if (user.role == "super_admin") {
            //     return "View_Only"
            // }

            // if (!isViewOnly || user.role == "super_admin") {
            //     return "View_Only"
            // }



            // const lastState = result.SR_Data_Logs[result.SR_Data_Logs.length - 1]
            // if (lastState.FieldData.TeamLead) {
            //     if (!(lastState.FieldData.TeamLead == user.name) && user.role !== "super_admin") {
            //         return "Waiting_For_Accpet"
            //     }
            // }



            let stateIdx = workFlowDoc.State.findIndex(state => state.StateName === dataCurrentStateName.NextStateName);
            // let isApproveAll = dataCurrentStateName.FieldData.TimeEstimate
            // if (isApproveAll && !(isApproveAll.some(x => dataCurrentStateName.Users.some(u => x.User == u.User))) && user.role !== "super_admin") {
            //     stateIdx = stateIdx - 1
            // }
            let workFlowCurrentStateName = workFlowDoc.State[stateIdx]
            //workFlowCurrentStateName.Fields = workFlowCurrentStateName.Fields && workFlowCurrentStateName.Fields.filter(field => (!field.user_role_view) || field.user_role_view.includes(dataCurrentStateName.FieldData.AssignRole) || user.role == "super_admin")

            workFlowCurrentStateName.Fields = workFlowCurrentStateName.Fields && workFlowCurrentStateName.Fields.filter(field => (!field.user_role_view) || field.user_role_view.includes(user.role) || user.role == "super_admin")
            workFlowCurrentStateName.Control = workFlowCurrentStateName.Control && workFlowCurrentStateName.Control.filter(field => user.role == "super_admin" || ((!field.User_Roles_Eligible) || field.User_Roles_Eligible.includes(user.role)))

            //  workFlowCurrentStateName.Control = workFlowCurrentStateName.Control && workFlowCurrentStateName.Control.filter(field => user.role == "super_admin" || ((!field.User_Roles_Eligible) || field.User_Roles_Eligible.includes(dataCurrentStateName.FieldData.AssignRole)))

            const stateFieldValIdx = workFlowCurrentStateName.Fields ? workFlowCurrentStateName.Fields.findIndex(one => one.value && one.value.Data && one.value.Data.length > 0) : -1
            if (stateFieldValIdx > -1) {
                const field = workFlowCurrentStateName.Fields[stateFieldValIdx]
                const dataObj = result.SR_Data_Logs.find(x => x.StateName == field.value.State)
                const obj = {}
                if (field.value.Data) {
                    field.value.Data.forEach((key) => {
                        obj[key] = dataObj.FieldData[key]
                    })
                }
                field.value.Data = obj
                workFlowCurrentStateName.Fields[stateFieldValIdx] = field
            }

            if (!IsUserTeamLead(user, result.SR_Data_Logs)) {
                if (dataCurrentStateName.FieldData && dataCurrentStateName.FieldData.AssignPerson) {
                    dataCurrentStateName.FieldData.AssignPerson = dataCurrentStateName.FieldData.AssignPerson.filter(one => one.value == user.name)
                }
                if (dataCurrentStateName.FieldData && dataCurrentStateName.FieldData.TimeEstimate) {
                    dataCurrentStateName.FieldData.TimeEstimate = dataCurrentStateName.FieldData.TimeEstimate.filter((one) => one.User == user.name)
                }
            }
            dataCurrentStateName = result.SR_Data_Logs.filter(x => x.NextStateName == workFlowCurrentStateName.StateName)
            dataCurrentStateName = dataCurrentStateName[dataCurrentStateName.length - 1]
            let assignedPerson = []
            result.SR_Data_Logs.forEach((one) => {
                if (one.FieldData && one.FieldData.AssignPerson) {
                    assignedPerson = [...assignedPerson, ...one.FieldData.AssignPerson]
                }
            })

            if (user.role == "employee" && !result.SR_Data_Logs.some(x => x.FieldData.TeamLead == user.name)) {
                assignedPerson = assignedPerson.filter(x => x.value == user.name)
            }


            dataCurrentStateName.FieldData.AssignPerson = _.uniqBy(assignedPerson, "value")
            dataCurrentStateName.StartDate = result.StartDate;
            dataCurrentStateName.DueDate = result.DueDate

            // dataCurrentStateName.Fields=dataCurrentStateName.Fields.filter((x)=>!x.enable|| e.enable)
            let statusWarn = ""
            const controls = workFlowCurrentStateName.Control;
            if (workFlowCurrentStateName.StateName == "Complete" || workFlowCurrentStateName.StateName == "Pending" || workFlowCurrentStateName.StateName == "InProgress") {
                statusWarn = "Inspection Is Pending"
                result.SR_Data_Logs.forEach((x) => {
                    if (x.Control_Name == "Start Inspection") {
                        statusWarn = "Inspection Is Progress"
                        workFlowCurrentStateName.Control = controls
                    }
                    if (x.Control_Name == "Complete Inspection") {
                        workFlowCurrentStateName.Control = controls
                            .filter(x => x.Control_Name !== "Complete Inspection" && x.Control_Name !== "Start Inspection")
                        statusWarn = ""
                    }
                })
            }
            workFlowCurrentStateName = { ...workFlowCurrentStateName, Warning: statusWarn, ticketData: result, PrevStateData: dataCurrentStateName, SR_ID: data.Sr_ID, WorkFlowId: result.WorkFlowId, StateIndex: stateIdx }
            return workFlowCurrentStateName;
        }

    } catch (err) {
        throw err;
    }
};

serviceRequestService.getServiceRequestStateLogs = async function getServiceRequestStateLogs(dbName, data) {
    try {
        const model = await serviceRequest.getModel(dbName);
        const result = await model.getServiceRequestStateLogs(data);
        return result;
    }
    catch (err) {
        throw err;
    }
};

//////////// Service Request State Type ////////////////////
serviceRequestService.createServiceRequestStateType = async function createServiceRequestStateType(dbName, data) {
    try {
        const model = await workFlow.getModel(dbName)
        const result = await model.createServiceRequestStateType(data);
        return result;
    } catch (err) {
        throw err;
    }
};


///////////// Service Request //////////////////
async function generateServiceRequestID(dbName) {
    try {
        let dateTime = require('date-and-time');
        let todaysDate = dateTime.format(new Date(Date.now()), 'YYMMDD');

        const modal = await serviceRequest.getModel(dbName);
        let dbResult = await modal.find({ DocumentType: "ServiceRequest", SR_ID: new RegExp(`^JBDS-T${todaysDate}-`) }).sort({ SR_ID: -1 }).limit(1).lean();
        let newServiceRequestID;
        if (dbResult.length > 0) {
            let lastServiceRequestID = dbResult[0].SR_ID;
            lastServiceRequestID = lastServiceRequestID.split('-')
            let lastNumber = parseInt(lastServiceRequestID[lastServiceRequestID.length - 1]);
            let nextNumber = lastNumber + 1;
            let paddedNumber = nextNumber.toString().padStart(4, '0');
            newServiceRequestID = `JBDS-T${todaysDate}-${paddedNumber}`;
        }
        else {
            newServiceRequestID = `JBDS-T${todaysDate}-0001`;
        }
        return newServiceRequestID;

    } catch (err) {
        throw err;
    }
}


serviceRequestService.createServiceRequest = async function createServiceRequest(dbName, data, userId) {
    try {
        const RequestTypeModel = await serviceRequestType.getModel(dbName)
        const RequestType = await RequestTypeModel.findOne({ DocumentType: "ServiceRequestType", RequestType: data.RequestType });
        data.RequestType = RequestType._id;
        data.SR_ID = await generateServiceRequestID(dbName);
        data.CreatedBy = userId;

        const workFlowModel = await workFlow.getModel(dbName);
        let workFlowDoc = await workFlowModel.findOne({ DocumentType: "WorkFlow", WorkFlowName: "breackdown" });
        data.CurrentStateType = workFlowDoc.State[0].StateType;
        data.CurrentStateName = workFlowDoc.State[0].StateName;

        let SR_Data_Logs = { CreatedBy: userId, CreatedAt: new Date(), StateType: workFlowDoc.State[0].StateType, StateName: workFlowDoc.State[0].StateName };
        data.SR_Data_Logs = SR_Data_Logs;

        const model = await serviceRequest.getModel(dbName);
        const result = await model.createServiceRequest(data);
        return result;
    } catch (err) {
        throw err;
    }
};

serviceRequestService.updateServiceRequestById = function updateServiceRequestById(dbName, id, updateObj, callback) {
    serviceRequest.getModel(dbName)
        .then((model) => {
            model.updateServiceRequestById(id, updateObj, (err, data) => {
                if (err) {
                    return callback(err, null)
                } else {
                    return callback(null, data);
                }
            })
        })
        .catch((err) => {
            callback(err, null)
        })
};

serviceRequestService.getAllServiceRequest = async function getAllServiceRequest(dbName) {
    try {
        const model = await serviceRequest.getModel(dbName);
        const data = await model.find({ DocumentType: "ServiceRequest" });
        return data;
    } catch (err) {
        throw err;
    }
}

serviceRequestService.getServiceRequestFromToTill = async function getServiceRequestFromToTill(dbName, params) {
    try {

        let From = new Date(params.From);
        let Till = new Date(params.Till);
        From = new Date(From.setHours(0, 0, 0, 0));
        Till = new Date(Till.setHours(23, 59, 59, 999));

        const { Page, PageSize } = params;
        const skipCount = (Page - 1) * PageSize;

        const model = await serviceRequest.getModel(dbName);
        const result = await model.getServiceRequestFromToTill(From, Till, skipCount, PageSize);
        return result;

    } catch (err) {
        throw err;
    }
};

serviceRequestService.deleteServiceRequestById = function deleteServiceRequestById(dbName, id, callback) {
    serviceRequest.getModel(dbName)
        .then((model) => {
            model.deleteServiceRequestById(id, (err, data) => {
                if (err) {
                    return callback(err, null)
                } else {
                    return callback(null, data);
                }
            })
        })
        .catch((err) => {
            callback(err, null)
        })
};

function checkUserIsValidOrNot(workFlowDoc, data, userId) {
    try {
        let userExistOrNot = false;
        workFlowDoc.State.forEach(element => {
            if (element.StateName === data.StateName) {
                element.Control.forEach(one => {
                    let userExist = one.User_Roles_Eligible.find(one => one.User == userId);
                    if (userExist) {
                        userExistOrNot = true;
                    }
                });
            }
        });

        return userExistOrNot;

    } catch (err) {
        throw err;
    }
}


async function createCustomerIfNotExist(data, dbName) {
    try {

        let customerObj = {
            name: data.Data.ClientName,
            companyName: data.Data.CompanyName,
            mobileNumber: data.Data.ClientMobNumber,
            email: data.Data.ClientEmailId,
            designation: data.Data.Designation,
            address: data.Data.ClientAddress,
            department: data.Data.Department,
            plant: data.Data.Plant,
        };
        const customerModal = await customerService.getModel(dbName)
        const findObj = await customerModal.findOne({ companyName: customerObj.companyName, name: customerObj.name, mobileNumber: customerObj.mobileNumber })
        if (!findObj) {
            const data = new customerModal(customerObj)
            const res = await data.save()
            return res;
        }
        return "Done"
    }
    catch (err) {
        return err;
    }
}

async function createServiceRequest(user, dbName, data, userId) {
    try {
        const serviceRequestModel = await serviceRequest.getModel(dbName);
        const priority = data.Data.Priority;
        delete data.Data.Priority;
        let SR_Data_Logs = {
            FieldData: data.Data,
            CreatedBy: user.name,
            CreatedAt: new Date(),
            StateType: data.StateType,
            StateName: data.StateName,
            Control_Name: data.Control.Control_Name,
            Action: data.Control.Action,
            NextStateName: data.Control.NextStateName,
            UpdateData: [],
        };
        if (data.Data.DueDate) {
            SR_Data_Logs.UpdateData.push({ User: user.name, DueDate: data.Data.DueDate })
        }
        data.SR_Data_Logs = SR_Data_Logs;
        data.StateName = data.Control.NextStateName;
        data.StateType = data.Control.NextStateName;
        data.StartDate = data.Data.StartDate;
        data.DueDate = data.Data.DueDate;
        data.CreatedBy = user.name

        if (data.StateName == "Assign" && data.Data.AssignPerson && data.Data.AssignRole == 'employee') {
            const firstState = data.SR_Data_Logs
            const model = await userModel.getModel(dbName)
            const otp = generateFourDigitRandomNumber()
            const TeamLead = await model.findOne({ name: data.Data.TeamLead })
            //==========================================   ye code phle comment tha ========================
            const chat = _.cloneDeep(watsConfig.Customer_Template)
            console.log(chat, "chat")
            chat.templateParams.push(`${firstState.FieldData.ClientName}`)
            chat.templateParams.push(`${data.SR_ID}`)
            chat.templateParams.push(`${TeamLead.name}`)
            chat.templateParams.push(`${TeamLead.name}`)
            chat.templateParams.push(`${TeamLead.mobileNumber} and share with this OTP is ${otp} to our employee after complete the work.`)
            chat.destination = '91' + firstState.FieldData.ClientMobNumber
            await axios.post(watsConfig.api, chat)
            //==========================================   ye code phle comment tha ========================

            const chat2 = _.cloneDeep(watsConfig.Emp_Template)
            chat2.templateParams.push(`${TeamLead.name}`)
            chat2.templateParams.push(`${firstState.FieldData.ClientName}`)
            chat2.templateParams.push(`${firstState.FieldData.CompanyName}`)
            chat2.templateParams.push(`${firstState.FieldData.ClientMobNumber}`)
            chat2.templateParams.push(`${firstState.FieldData.ClientEmailId}`)
            chat2.templateParams.push(`${firstState.FieldData.ClientAddress}`)
            chat2.destination = '91' + TeamLead.mobileNumber
            await axios.post(watsConfig.api, chat2)
            // data.CustomerOTP = otp;
        }
        if (data.StateName == "Assign" && data.Data.AssignPerson && data.Data.AssignRole == 'manager') {
            const firstState = data.SR_Data_Logs
            const model = await userModel.getModel(dbName)
            const emp = await model.findOne({ name: { $in: data.Data.AssignPerson.map(x => x.value) } })
            console.log("emp", emp)
            const chat2 = _.cloneDeep(watsConfig.Emp_Template)
            chat2.templateParams.push(`${emp.name}`)
            chat2.templateParams.push(`${firstState.FieldData.ClientName}`)
            chat2.templateParams.push(`${firstState.FieldData.CompanyName}`)
            chat2.templateParams.push(`${firstState.FieldData.ClientMobNumber}`)
            chat2.templateParams.push(`${firstState.FieldData.ClientEmailId}`)
            chat2.templateParams.push(`${firstState.FieldData.ClientAddress}`)
            chat2.destination = '91' + emp.mobileNumber
            console.log("Sending message with: ", chat2)
            await axios.post(watsConfig.api, chat2)
            // data.CustomerOTP = otp;
        }
        data.Status = "Active"
        data.Priority = (priority && priority.length > 0 ? priority[0].value : "")
        await serviceRequestModel.createServiceRequest(data);
        await createCustomerIfNotExist(data, dbName)
        return data.SR_ID;

    } catch (err) {
        console.log(err)
        throw err;
    }
}

function generateFourDigitRandomNumber() {
    // Generate a random number between 1000 and 9999
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// async function executeServiceRequestState(user, dbName, data) {
//     try {
//         data = { ...data };
//         const model = await serviceRequest.getModel(dbName);
//         const serviceRequestDoc = await model.findOne({ DocumentType: "ServiceRequest", SR_ID: data.SR_ID });
//         if (data.Control.Action == "Update_State") {
//             const srData = serviceRequestDoc.SR_Data_Logs[serviceRequestDoc.SR_Data_Logs.length - 1]
//             serviceRequestDoc.DueDate = data.Data.DueDate
//             serviceRequestDoc.StateType = data.Control.NextStateName
//             serviceRequestDoc.StateName = data.Control.NextStateName
//             srData.NextStateName = data.Control.NextStateName
//             srData.UpdateData.push({ UpdatedAt: new Date(), User: user.name, ...data.Data, Control_Name: data.Control.Control_Name, Action: data.Control.Action })
//             serviceRequestDoc.SR_Data_Logs[serviceRequestDoc.SR_Data_Logs.length - 1] = srData
//             await model.updateOne({ SR_ID: data.SR_ID }, serviceRequestDoc);
//             return data.SR_ID;
//         } else {
//             let SR_Data_Logs = {
//                 FieldData: data.Data,
//                 CreatedBy: user.name,
//                 CreatedAt: new Date(),
//                 StateType: data.StateType,
//                 StateName: data.StateName,
//                 UpdateData: [],
//                 EventLogs: [],
//                 Control_Name: data.Control.Control_Name,
//                 Action: data.Control.Action,
//                 NextStateName: data.Control.NextStateName,
//             };
//             const lastState = serviceRequestDoc.SR_Data_Logs[serviceRequestDoc.SR_Data_Logs.length - 1]
//             if (lastState && (lastState.Control_Name == data.Control.Control_Name) && ["Check Out", "Check In"].includes(data.Control.Control_Name)) {
//                 if (data.Data && data.Data.TimeEstimate) {

//                     data.Data.TimeEstimate.forEach((us) => {
//                         const obj = { User: us.User, WorkDesc: us.WorkDesc }
//                         data.Control.Event_To_Log.forEach((one) => {
//                             if (one.Event == "TimeLog") {
//                                 obj[one.FieldName] = new Date()
//                             }
//                             if (one.Event == "Location") {
//                                 obj[one.FieldName] = data.Data.Location
//                             }
//                         })
//                         SR_Data_Logs.EventLogs.push(obj)
//                         lastState.FieldData.TimeEstimate.push(us)
//                     })
//                     SR_Data_Logs.EventLogs.forEach((x) => {
//                         if (!lastState.EventLogs.some(user => user.User == x.User)) {
//                             lastState.EventLogs.push(x)
//                             lastState
//                         }
//                     })
//                     serviceRequestDoc.SR_Data_Logs[serviceRequestDoc.SR_Data_Logs.length - 1] = lastState
//                 }
//             } else {
//                 if (data.Data && data.Data.TimeEstimate) {
//                     data.Data.TimeEstimate.forEach((us) => {
//                         const obj = { User: us.User, WorkDesc: us.WorkDesc }
//                         data.Control.Event_To_Log.forEach((one) => {
//                             if (one.Event == "TimeLog") {
//                                 obj[one.FieldName] = new Date()
//                             }
//                             if (one.Event == "Location") {
//                                 obj[one.FieldName] = data.Data.Location
//                             }
//                         })
//                         SR_Data_Logs.EventLogs.push(obj)

//                     })

//                 }
//                 checkValidateWarinigTicket(serviceRequestDoc, SR_Data_Logs, data)
//                 const otp = generateFourDigitRandomNumber()
//                 await checkAndSendNotification(data, otp, serviceRequestDoc, dbName)
//                 serviceRequestDoc.CustomerOTP = otp;

//                 serviceRequestDoc.SR_Data_Logs.push(SR_Data_Logs);
//                 serviceRequestDoc.StateName = data.Control.NextStateName
//                 serviceRequestDoc.StateType = data.Control.NextStateName
//             }

//             await model.updateOne({ SR_ID: data.SR_ID }, serviceRequestDoc);
//             return data.SR_ID;
//         }


//     } catch (error) {
//         throw error;
//     }
// }

//=========================================rohit new point===================================================

async function executeServiceRequestState(user, dbName, data) {
    try {
        console.log("Received data:", JSON.stringify(data, null, 2));

        data = { ...data };
        const model = await serviceRequest.getModel(dbName);
        const serviceRequestDoc = await model.findOne({ DocumentType: "ServiceRequest", SR_ID: data.SR_ID });

        if (!serviceRequestDoc) {
            throw new Error(`Service request with SR_ID ${data.SR_ID} not found.`);
        }

        if (!serviceRequestDoc.SR_Data_Logs || serviceRequestDoc.SR_Data_Logs.length === 0) {
            throw new Error("SR_Data_Logs is empty or undefined.");
        }

        console.log("Service Request Document found:", JSON.stringify(serviceRequestDoc, null, 2));

        if (data.Control.Action == "Update_State") {
            const srData = serviceRequestDoc.SR_Data_Logs[serviceRequestDoc.SR_Data_Logs.length - 1];
            serviceRequestDoc.DueDate = data.Data.DueDate;
            serviceRequestDoc.StateType = data.Control.NextStateName;
            serviceRequestDoc.StateName = data.Control.NextStateName;
            srData.NextStateName = data.Control.NextStateName;

            srData.UpdateData = srData.UpdateData || [];
            srData.UpdateData.push({
                UpdatedAt: new Date(),
                User: user.name,
                ...data.Data,
                Control_Name: data.Control.Control_Name,
                Action: data.Control.Action,
            });

            serviceRequestDoc.SR_Data_Logs[serviceRequestDoc.SR_Data_Logs.length - 1] = srData;
            await model.updateOne({ SR_ID: data.SR_ID }, serviceRequestDoc);
            return data.SR_ID;
        } else {
            let SR_Data_Logs = {
                FieldData: data.Data,
                CreatedBy: user.name,
                CreatedAt: new Date(),
                StateType: data.StateType,
                StateName: data.StateName,
                UpdateData: [],
                EventLogs: [],
                Control_Name: data.Control.Control_Name,
                Action: data.Control.Action,
                NextStateName: data.Control.NextStateName,
            };

            const lastState = serviceRequestDoc.SR_Data_Logs[serviceRequestDoc.SR_Data_Logs.length - 1];

            if (lastState && lastState.Control_Name == data.Control.Control_Name && ["Check Out", "Check In"].includes(data.Control.Control_Name)) {
                if (data.Data && data.Data.TimeEstimate && Array.isArray(data.Data.TimeEstimate)) {
                    data.Data.TimeEstimate.forEach((us) => {
                        const obj = { User: us.User, WorkDesc: us.WorkDesc };
                        if (data.Control.Event_To_Log && Array.isArray(data.Control.Event_To_Log)) {
                            data.Control.Event_To_Log.forEach((one) => {
                                if (one.Event == "TimeLog") {
                                    obj[one.FieldName] = new Date();
                                }
                                if (one.Event == "Location") {
                                    obj[one.FieldName] = data.Data.Location;
                                }
                            });
                        }
                        SR_Data_Logs.EventLogs.push(obj);
                        lastState.FieldData.TimeEstimate.push(us);
                    });

                    SR_Data_Logs.EventLogs.forEach((x) => {
                        if (!lastState.EventLogs.some(user => user.User == x.User)) {
                            lastState.EventLogs.push(x);
                        }
                    });
                    serviceRequestDoc.SR_Data_Logs[serviceRequestDoc.SR_Data_Logs.length - 1] = lastState;
                }
            } else {
                if (data.Data && data.Data.TimeEstimate && Array.isArray(data.Data.TimeEstimate)) {
                    data.Data.TimeEstimate.forEach((us) => {
                        const obj = { User: us.User, WorkDesc: us.WorkDesc };
                        if (data.Control.Event_To_Log && Array.isArray(data.Control.Event_To_Log)) {
                            data.Control.Event_To_Log.forEach((one) => {
                                if (one.Event == "TimeLog") {
                                    obj[one.FieldName] = new Date();
                                }
                                if (one.Event == "Location") {
                                    obj[one.FieldName] = data.Data.Location;
                                }
                            });
                        }
                        SR_Data_Logs.EventLogs.push(obj);
                    });
                }

                checkValidateWarinigTicket(serviceRequestDoc, SR_Data_Logs, data);
                const otp = generateFourDigitRandomNumber();
                await checkAndSendNotification(data, otp, serviceRequestDoc, dbName);
                serviceRequestDoc.CustomerOTP = otp;
                serviceRequestDoc.SR_Data_Logs.push(SR_Data_Logs);
                serviceRequestDoc.StateName = data.Control.NextStateName;
                serviceRequestDoc.StateType = data.Control.NextStateName;
            }

            await model.updateOne({ SR_ID: data.SR_ID }, serviceRequestDoc);
            return data.SR_ID;
        }
    } catch (error) {
        console.error("Error in executeServiceRequestState:", error.message);
        console.error("Error stack:", error.stack);
        throw error;
    }
}

//=========================================rohit new point===================================================


// async function checkAndSendNotification(data, otp, serviceRequestDoc, dbName) {
//     if (data.Control.Control_Name == "Check In" || data.Control.Control_Name == "Check Out") {
//         let states = serviceRequestDoc.SR_Data_Logs.filter(one => one.FieldData.AssignRole == "manager")
//         states = states[states.length - 1]
//         const model = await userModel.getModel(dbName)
//         const manager = await model.findOne({ name: states.AssignPerson[0].value })
//         const chat = _.cloneDeep(watsConfig.struc)
//         chat.templateParams.push(`${manager.name}, Employee ${user.name} ${data.Control.Control_Name} on ticket ${serviceRequestDoc.SR_ID}`)
//         chat.templateParams.push(`JBDS TEAM`)
//         chat.destination = '91' + manager.mobileNumber;
//         await axios.post(watsConfig.api, chat)
//     }

//     if (data.StateName == "Assign" && data.Data.AssignPerson && data.Data.AssignRole == 'employee') {
//         const firstState = serviceRequestDoc.SR_Data_Logs[0]
//         const model = await userModel.getModel(dbName)
//         const TeamLead = await model.findOne({ name: data.Data.TeamLead })
//         const chat = _.cloneDeep(watsConfig.Customer_Template)
//         chat.templateParams.push(`${firstState.FieldData.ClientName}`)
//         chat.templateParams.push(`${data.SR_ID}`)
//         chat.templateParams.push(`${TeamLead.name}`)
//         chat.templateParams.push(`${TeamLead.name}`)
//         chat.templateParams.push(`${TeamLead.mobileNumber} and share with this OTP is ${otp} to our employee after complete the work.`)
//         chat.destination = '91' + firstState.FieldData.ClientMobNumber
//         await axios.post(watsConfig.api, chat)

//         const chat2 = _.cloneDeep(watsConfig.Emp_Template)
//         chat2.templateParams.push(`${TeamLead.name}`)
//         chat2.templateParams.push(`${firstState.FieldData.ClientName}`)
//         chat2.templateParams.push(`${firstState.FieldData.CompanyName}`)
//         chat2.templateParams.push(`${firstState.FieldData.ClientMobNumber}`)
//         chat2.templateParams.push(`${firstState.FieldData.ClientEmailId}`)
//         chat2.templateParams.push(`${firstState.FieldData.ClientAddress}`)
//         chat2.destination = '91' + TeamLead.mobileNumber
//         await axios.post(watsConfig.api, chat2)
//         serviceRequestDoc.CustomerOTP = otp;
//     }
//     if (data.StateName == "Assign" && data.Data.AssignPerson && data.Data.AssignRole == 'manager') {
//         const firstState = serviceRequestDoc.SR_Data_Logs[0]
//         const model = await userModel.getModel(dbName)
//         const emp = await model.findOne({ name: { $in: data.Data.AssignPerson.map(x => x.value) } })
//         const chat2 = _.cloneDeep(watsConfig.Emp_Template)
//         chat2.templateParams.push(`${emp.name}`)
//         chat2.templateParams.push(`${firstState.FieldData.ClientName}`)
//         chat2.templateParams.push(`${firstState.FieldData.CompanyName}`)
//         chat2.templateParams.push(`${firstState.FieldData.ClientMobNumber}`)
//         chat2.templateParams.push(`${firstState.FieldData.ClientEmailId}`)
//         chat2.templateParams.push(`${firstState.FieldData.ClientAddress}`)
//         chat2.destination = '91' + emp.mobileNumber
//         await axios.post(watsConfig.api, chat2)
//          serviceRequestDoc.CustomerOTP = otp;
//     }
// }




//=========================rohit new point==============================================
async function checkAndSendNotification(data, otp, serviceRequestDoc, dbName) {
    try {
        if (data.Control.Control_Name === "Check In" || data.Control.Control_Name === "Check Out") {
            let states = serviceRequestDoc.SR_Data_Logs.filter(one => one?.FieldData?.AssignRole === "manager");
            states = states.length > 0 ? states[states.length - 1] : null;

            if (states && states.AssignPerson && states.AssignPerson.length > 0) {
                const model = await userModel.getModel(dbName);
                const manager = await model.findOne({ name: states.AssignPerson[0]?.value });

                if (manager) {
                    const chat = _.cloneDeep(watsConfig.struc);
                    chat.templateParams.push(`${manager.name}, Employee ${data?.User?.name} ${data.Control.Control_Name} on ticket ${serviceRequestDoc.SR_ID}`);
                    chat.templateParams.push(`JBDS TEAM`);
                    chat.destination = '91' + manager.mobileNumber;
                    await axios.post(watsConfig.api, chat);
                }
            }
        }

        if (data.StateName === "Assign" && data.Data?.AssignPerson && data.Data.AssignRole === 'employee') {
            const firstState = serviceRequestDoc.SR_Data_Logs.length > 0 ? serviceRequestDoc.SR_Data_Logs[0] : null;

            if (firstState?.FieldData?.ClientName && firstState?.FieldData?.ClientMobNumber) {
                const model = await userModel.getModel(dbName);
                const TeamLead = await model.findOne({ name: data.Data.TeamLead });

                if (TeamLead) {
                    const chat = _.cloneDeep(watsConfig.Customer_Template);
                    chat.templateParams.push(`${firstState.FieldData.ClientName}`);
                    chat.templateParams.push(`${data.SR_ID}`);
                    chat.templateParams.push(`${TeamLead.name}`);
                    chat.templateParams.push(`${TeamLead.name}`);
                    chat.templateParams.push(`${TeamLead.mobileNumber} and share this OTP: ${otp} with our employee after completing the work.`);
                    chat.destination = '91' + firstState.FieldData.ClientMobNumber;
                    await axios.post(watsConfig.api, chat);

                    const chat2 = _.cloneDeep(watsConfig.Emp_Template);
                    chat2.templateParams.push(`${TeamLead.name}`);
                    chat2.templateParams.push(`${firstState.FieldData.ClientName}`);
                    chat2.templateParams.push(`${firstState.FieldData.CompanyName}`);
                    chat2.templateParams.push(`${firstState.FieldData.ClientMobNumber}`);
                    chat2.templateParams.push(`${firstState.FieldData.ClientEmailId}`);
                    chat2.templateParams.push(`${firstState.FieldData.ClientAddress}`);
                    chat2.destination = '91' + TeamLead.mobileNumber;
                    await axios.post(watsConfig.api, chat2);

                    serviceRequestDoc.CustomerOTP = otp;
                }
            }
        }

        if (data.StateName === "Assign" && data.Data?.AssignPerson && data.Data.AssignRole === 'manager') {
            const firstState = serviceRequestDoc.SR_Data_Logs.length > 0 ? serviceRequestDoc.SR_Data_Logs[0] : null;

            if (firstState?.FieldData?.ClientName) {
                const model = await userModel.getModel(dbName);
                const emp = await model.findOne({ name: { $in: data.Data.AssignPerson?.map(x => x.value) ?? [] } });

                if (emp) {
                    const chat2 = _.cloneDeep(watsConfig.Emp_Template);
                    chat2.templateParams.push(`${emp.name}`);
                    chat2.templateParams.push(`${firstState.FieldData.ClientName}`);
                    chat2.templateParams.push(`${firstState.FieldData.CompanyName}`);
                    chat2.templateParams.push(`${firstState.FieldData.ClientMobNumber}`);
                    chat2.templateParams.push(`${firstState.FieldData.ClientEmailId}`);
                    chat2.templateParams.push(`${firstState.FieldData.ClientAddress}`);
                    chat2.destination = '91' + emp.mobileNumber;
                    await axios.post(watsConfig.api, chat2);

                    serviceRequestDoc.CustomerOTP = otp;
                }
            }
        }
    } catch (error) {
        console.error("Error in checkAndSendNotification:", error.message);
    }
}



//=========================================rohit new point==============================================
serviceRequestService.changeServiceRequestState = async function changeServiceRequestState(user, dbName, data) {
    try {

        if (data.Step === "Initial") {
            let serviceRequest = await createServiceRequest(user, dbName, data);
            return serviceRequest;

        } else {
            let serviceRequest = await executeServiceRequestState(user, dbName, data);
            return serviceRequest;
        }

    } catch (err) {
        throw err;
    }
};

serviceRequestService.ticketUpdateCustomData = async function ticketUpdateCustomData(user, dbName, data) {
    try {
        let updateData = await ticketUpdateCustomDataFunc(user, dbName, data);
        return updateData;

    } catch (err) {
        throw err;
    }
};

async function ticketUpdateCustomDataFunc(user, dbName, data) {
    try {
        data = { ...data };
        const srid = data.SR_ID
        const _id = data._id
        const model = await serviceRequest.getModel(dbName);
        const serviceRequestDoc = await model.findOne({ DocumentType: "ServiceRequest", SR_ID: srid });
        delete data._id;
        delete data.SR_ID
        serviceRequestDoc.CustomData = data
        await model.updateOne({ SR_ID: srid }, serviceRequestDoc);
        const updateTicket = await model.findOne({ DocumentType: "ServiceRequest", SR_ID: srid });
        return updateTicket.CustomData;

    } catch (err) {
        throw err;
    }
}

function checkValidateWarinigTicket(srData, stateLogs, data) {
    try {
        const control = data.Control;
        let firstState = srData.SR_Data_Logs.find((x) => x.StateName == "Create SR")
        firstState = firstState.FieldData;
        const startDate = new Date(firstState.StartDate);
        startDate.setHours(0, 0, 0, 0)
        const dueDate = new Date(srData.DueDate);
        dueDate.setHours(23, 59, 59, 999);
        if (control.WarningCheck) {

            if (control.Control_Name == "Complete Inspection") {

                if (!srData.SR_Data_Logs.some(x => x.Control_Name == "Start Inspection")) {
                    throw new Error("Please start the inspection first before complete the inspection.")
                }
                //=============================newpoint=====================================
                if (!srData.DueDate) {
                    throw new Error("Please add due date before complete inspection or ask manager to add due date.")
                }
                // if (stateLogs.FieldData && stateLogs.FieldData.Files.length == 0) {
                //     throw new Error("Please upload MOM doc for complete the inspection.")
                // }
                // //=============================newpoint uncomment=====================================
            }
            if (srData.DueDate && control.Control_Name === "Check In") {
                const checkIn = new Date(stateLogs.EventLogs?.[0]?.CheckInTime)
                if (startDate <= checkIn && dueDate >= checkIn) {

                } else {
                    throw new Error("Check In Time Between Start Date and Due Date can not start time before or after. If you want this time to check in please ask to manager extend your dates.")
                }
            }


            // if (srData.DueDate && control.Control_Name === "Check In") {
            //     const checkInTime = stateLogs?.EventLogs?.[0]?.CheckInTime;
                
            //     console.log("Start Date:", startDate.toISOString());
            //     console.log("Due Date:", dueDate.toISOString());
            //     console.log("Check In Time (Raw):", checkInTime);
                
            //     if (!checkInTime) {
            //         throw new Error("Check In Time is missing or invalid.");
            //     }
                
            //     const checkIn = new Date(checkInTime);
            //     console.log("Check In Time (Parsed):", checkIn.toISOString());
                
            //     if (isNaN(checkIn.getTime())) {
            //         throw new Error("Invalid Check In Time format.");
            //     }
                
            //     if (!(checkIn >= startDate && checkIn <= dueDate)) {
            //         throw new Error("Check In Time must be between Start Date and Due Date.");
            //     }
            // }
            if (srData.DueDate && control.Control_Name == "Check Out") {
                const checkIn = new Date(stateLogs.EventLogs[0].CheckOutTime)
                if (startDate <= checkIn && dueDate >= checkIn) {
                } else {
                    throw new Error("Check Out Time Between Start Date and Due Date can not start time before or after. If you want this time to check out please ask to manager extend your dates.")
                }
            }


            // if (srData.DueDate && control.Control_Name === "Check Out") {
            //     const checkOutTime = stateLogs?.EventLogs?.[0]?.CheckOutTime;
                
            //     console.log("Check Out Time (Raw):", checkOutTime);
                
            //     if (!checkOutTime) {
            //         throw new Error("Check Out Time is missing or invalid.");
            //     }
                
            //     const checkOut = new Date(checkOutTime);
            //     console.log("Check Out Time (Parsed):", checkOut.toISOString());
                
            //     if (isNaN(checkOut.getTime())) {
            //         throw new Error("Invalid Check Out Time format.");
            //     }
                
            //     if (!(checkOut >= startDate && checkOut <= dueDate)) {
            //         throw new Error("Check Out Time must be between Start Date and Due Date.");
            //     }
            // }
            if (control.Control_Name == "Complete") {
                const completeDate = new Date()
                if (!srData.DueDate) {
                    throw new Error("Please add due date before complete the ticket or ask manager to add due date.")
                }
                if (startDate <= completeDate && dueDate >= completeDate) {

                } else {
                    throw new Error("You can't complete the task because your time is ends. If you want this time to complete the taks please ask to manager extend your dates.")
                }

                if (data.Data.CustomerOTP !== srData.CustomerOTP) {
                    throw new Error("Please enter the valid customer OTP to complete the ticket.")
                }
            }


        }


        // if (control.Control_Name === "Complete") {
        //     const completeDate = new Date();
            
        //     if (!srData.DueDate) {
        //         throw new Error("Please add a due date before completing the ticket or ask the manager to add a due date.");
        //     }
            
        //     if (!(completeDate >= startDate && completeDate <= dueDate)) {
        //         throw new Error("You can't complete the task because your time has ended. If you need more time, ask your manager to extend your dates.");
        //     }
            
        //     if (data.Data.CustomerOTP !== srData.CustomerOTP) {
        //         throw new Error("Please enter a valid customer OTP to complete the ticket.");
        //     }
        // }
    // }
        return "Done"
    }
    catch (err) {
        throw new Error(err.message);
    }
}

serviceRequestService.GetAllTicket = async function GetAllTicket(user, dbName) {
    try {

        const model = await serviceRequest.getModel(dbName);
        let result;
        if (user.role == "super_admin" || user.role == "manager") {
            result = await model.find({ DocumentType: "ServiceRequest" }).sort({ createdAt: -1 }).lean()
        } else {
            result = await model.find({ DocumentType: "ServiceRequest", "SR_Data_Logs.FieldData.AssignPerson.value": user.name }).sort({ createdAt: -1 }).lean()
        }
        return result;
    } catch (err) {
        throw err;
    }
};


async function generatePMRequestID(dbName) {
    try {
        let dateTime = require('date-and-time');
        let todaysDate = dateTime.format(new Date(Date.now()), 'YYMMDD');

        const modal = await pm_DataEntry.getModel(dbName);
        let dbResult = await modal.find({ DocumentType: "PMCheckSheetDataEntry", PM_ID: new RegExp(`^PMID-${todaysDate}-`) }).sort({ PM_ID: -1 }).limit(1).lean();
        let newPMRequestID;
        if (dbResult.length > 0) {
            let lastPMRequestID = dbResult[0].PM_ID;
            let lastNumber = parseInt(lastPMRequestID.substring(12));
            let nextNumber = lastNumber + 1;
            let paddedNumber = nextNumber.toString().padStart(4, '0');
            newPMRequestID = `PMID-${todaysDate}-${paddedNumber}`;
        } else {
            newPMRequestID = `PMID-${todaysDate}-0001`;
        }
        return newPMRequestID;

    } catch (err) {
        throw err;
    }
}

async function createPMRequest(dbName, data, userId, workFlowDoc) {
    try {
        const mouldModel = await mould.getModel(dbName);
        const userModal = await user.getModel(dbName);
        const userRoleModal = await userRole.getModel(dbName);
        let MouldMasterDoc = await mouldModel.findOne({ DocumentType: "MoldMaster", MoldId: data.MoldId }).lean();
        const updateMouldDoc = await mouldModel.updateOne(
            { MoldId: data.Mold_Id },
            { $set: { LastMaintenanceDate: new Date(), PM_Due: false, PM_Alert: false } }
        );
        data.WorkFlow = workFlowDoc._id;
        data.CreatedBy = userId;
        data.PM_ID = await generatePMRequestID(dbName);

        let userArr = [];
        for (const element of workFlowDoc.State) {
            if (element.StateName === data.StateName) {
                for (const one of element.Control) {
                    if (one.Control_Name === data.Control.Control_Name) {
                        for (const userRole of one.User_Roles_Eligible) {
                            const userDoc = await userModal.findOne({ _id: userRole.User });
                            const userRoleDoc = await userRoleModal.findOne({ _id: userDoc.UserRole });
                            let obj = { User: userDoc.name, UserRole: userRoleDoc.UserRole, Approved: true, CreatedAt: new Date() };
                            if (userRole.User == userId) {
                                obj.Approved = true;
                                userArr.push(obj);
                            }
                        }
                    }
                }
            }
        }

        let PM_Data_Logs = {
            CreatedBy: userId,
            CreatedAt: new Date(),
            StateType: workFlowDoc.State[0].StateType,
            StateName: workFlowDoc.State[0].StateName,
            Control_Name: data.Control.Control_Name,
            Action: data.Control.Action,
            NextStateName: data.Control.NextStateName,
            Users: userArr,
        };

        data.PM_Data_Logs = PM_Data_Logs;
        data.MoldId = MouldMasterDoc._id;

        const DataEntryModel = await pm_DataEntry.getModel(dbName);
        const result = await DataEntryModel.createPMCheckSheet(data);
        return data.PM_ID;

    } catch (err) {
        throw err;
    }
}

async function executePMServiceRequestState(dbName, data, userId, workFlowDoc) {
    try {
        const model = await pm_DataEntry.getModel(dbName);
        const PmRequestDoc = await model.findOne({ DocumentType: "PMCheckSheetDataEntry", PM_ID: data.PM_ID });
        const userRoleModal = await userRole.getModel(dbName);
        const userModal = await user.getModel(dbName);

        let isAnyOrAll = workFlowDoc.State.find(one => one.StateName == data.StateName);
        isAnyOrAll = isAnyOrAll.Control.find(a => a.Control_Name == data.Control.Control_Name);

        const lastState = PmRequestDoc.PM_Data_Logs[PmRequestDoc.PM_Data_Logs.length - 1];
        if (lastState.StateName === data.StateName && isAnyOrAll && isAnyOrAll.Action_On_User_Input !== 'Any') {
            const userDoc = await userModal.findOne({ _id: userId });
            let userAlreadyModified = lastState.Users.find(one => one.User === userDoc.name && one.Approved === true);
            if (userAlreadyModified && lastState.Action !== "Update") {
                let error = errorFunction("You already Perform your part", 501, "Already Done");
                throw error;

            } else {
                if (data.StateType === "BreakDowmComp") {
                    let doArr = [];
                    data.checkpoints.forEach(one => {
                        if (one.SparesConsumed) {
                            one.SparesConsumed.forEach(element => {
                                let obj = { TransactionType: "Decrease", BatchNumber: element.BatchNumber, Qty: element.Quantity };
                                doArr.push(sparePartsService.updateStockHistoryForMaintenance(dbName, element.SpareId, obj, userId));
                            });
                        }
                    });
                    doArr = await Promise.all(doArr);
                    PmRequestDoc.checkpoints = data.checkpoints;
                }

                if (data.StateType === "PMPrepration") {
                    PmRequestDoc.PMPrepration = data.checkpoints;
                }

                lastState.Users.forEach(one => {
                    if (one.User === userDoc.name) {
                        one.Approved = true;
                        one.Remarks = data.remarks;
                    }
                });

                let allUsersApproved = true;
                for (const user of lastState.Users) {
                    if (user.Approved === false) {
                        allUsersApproved = false;
                        break;
                    }
                }

                if (allUsersApproved) {
                    if (data.Control.NextStateName === "Close") {
                        PmRequestDoc.StateType = "Close";
                        PmRequestDoc.StateName = "Close";
                        const updateSR = await model.updateOne({ PM_ID: data.PM_ID }, PmRequestDoc);
                        return "No Next State To Return";
                    } else {
                        PmRequestDoc.StateType = data.StateType;
                        PmRequestDoc.StateName = data.StateName;
                        const updateSR = await model.updateOne({ PM_ID: data.PM_ID }, PmRequestDoc);
                        return PmRequestDoc.PM_ID;
                    }
                }

                const updateSR = await model.updateOne({ PM_ID: data.PM_ID }, PmRequestDoc);
                return PmRequestDoc.PM_ID;

            }
        } else {
            if (data.StateType === "BreakDowmComp") {
                let doArr = [];
                data.checkpoints.forEach(one => {
                    if (one.SparesConsumed) {
                        one.SparesConsumed.forEach(element => {
                            let obj = { TransactionType: "Decrease", BatchNumber: element.BatchNumber, Qty: element.Quantity };
                            doArr.push(sparePartsService.updateStockHistoryForMaintenance(dbName, element.SpareId, obj, userId));
                        });
                    }
                });
                doArr = await Promise.all(doArr);
                PmRequestDoc.checkpoints = data.checkpoints;

            }

            if (data.StateType === "PMPrepration") {
                PmRequestDoc.PMPrepration = data.checkpoints;
            }

            let userArr = [];
            let Action;
            for (const element of workFlowDoc.State) {
                if (element.StateName === data.StateName) {
                    for (const one of element.Control) {
                        if (one.Control_Name === data.Control.Control_Name) {
                            Action = one.Action;
                            if (one.Action_On_User_Input === "Any") {
                                for (const userRole of one.User_Roles_Eligible) {
                                    if (userRole.User == userId) {
                                        const userDoc = await userModal.findOne({ _id: userRole.User });
                                        const userRoleDoc = await userRoleModal.findOne({ _id: userDoc.UserRole });
                                        let obj = { User: userDoc.name, UserRole: userRoleDoc.UserRole, Approved: true, Remarks: data.remarks, CreatedAt: new Date() };
                                        userArr.push(obj);
                                    }
                                }
                            } else {
                                for (const userRole of one.User_Roles_Eligible) {
                                    const userDoc = await userModal.findOne({ _id: userRole.User });
                                    const userRoleDoc = await userRoleModal.findOne({ _id: userDoc.UserRole });
                                    let obj = { User: userDoc.name, UserRole: userRoleDoc.UserRole, };
                                    if (userRole.User == userId) {
                                        obj.Approved = true;
                                        obj.Remarks = data.remarks;
                                        obj.CreatedAt = new Date();
                                    } else {
                                        obj.Approved = false;
                                    }
                                    userArr.push(obj);
                                }
                            }
                        }
                    }
                }
            }

            let PM_Data_Logs = {
                CreatedBy: userId,
                CreatedAt: new Date(),
                StateType: data.StateType,
                StateName: data.StateName,
                Users: userArr,
                Control_Name: data.Control.Control_Name,
                Action: data.Control.Action,
                NextStateName: data.Control.NextStateName,
            };
            PmRequestDoc.PM_Data_Logs.push(PM_Data_Logs);

            if (Action === "Change State" && userArr.length <= 1) {
                if (data.Control.NextStateName === "Close") {
                    PmRequestDoc.StateType = "Close";
                    PmRequestDoc.StateName = "Close";
                    const updateSR = await model.updateOne({ PM_ID: data.PM_ID }, PmRequestDoc);
                    return "No Next State To Return";
                } else {
                    PmRequestDoc.StateType = data.StateType;
                    PmRequestDoc.StateName = data.StateName;
                    const updateSR = await model.updateOne({ PM_ID: data.PM_ID }, PmRequestDoc);
                    return PmRequestDoc.PM_ID;

                }
            }

            const updateSR = await model.updateOne({ PM_ID: data.PM_ID }, PmRequestDoc);
            return PmRequestDoc.PM_ID;
        }

    } catch (err) {
        throw err;
    }
}


serviceRequestService.changePMRequestState = async function changePMRequestState(dbName, data, userId) {
    try {
        const model = await workFlow.getModel(dbName);
        const workFlowDoc = await model.findOne({ DocumentType: "WorkFlow", _id: data.WorkFlow }).lean();

        let userIsValidOrNot = checkUserIsValidOrNot(workFlowDoc, data, userId);
        if (!userIsValidOrNot) {
            let err = errorFunction(`You are not allowed to perform any operation in State Name:- ${data.StateName}`, 500, "Not Allowed")
            throw err;
        }

        if (data.StateType === "Create Request") {
            let PMRequest = await createPMRequest(dbName, data, userId, workFlowDoc);
            return PMRequest;

        } else {
            let PMRequest = await executePMServiceRequestState(dbName, data, userId, workFlowDoc);
            return PMRequest;
        }

    } catch (err) {
        throw err;
    }
};

serviceRequestService.getNextPMRequestState = async function getNextPMRequestState(dbName, data) {
    try {

        if (data.WorkFlowid) {
            const model = await workFlow.getModel(dbName);
            const result = await model.findOne({ DocumentType: "WorkFlow", _id: data.WorkFlowid });
            return result.State[0];

        } else {
            const model = await pm_DataEntry.getModel(dbName);
            const result = await model.findOne({ PM_ID: data.PM_ID });
            if (!result) {
                return "No Next State To Return";
            }

            const workFlowDoc = await model.findOne({ DocumentType: "WorkFlow", _id: result.WorkFlow }).lean();
            let dataCurrentStateName = result.PM_Data_Logs[result.PM_Data_Logs.length - 1];
            let workFlowCurrentStateName = workFlowDoc.State.find(state => state.StateName === dataCurrentStateName.StateName);
            let workFlowCurrentStateNameControl = workFlowCurrentStateName.Control.find(one => one.Control_Name === dataCurrentStateName.Control_Name);

            if (workFlowCurrentStateNameControl.Action_On_User_Input === "All") {
                for (const one of dataCurrentStateName.Users) {
                    if (one.Approved === false) {
                        const nextState = workFlowDoc.State.find(state => state.StateName === dataCurrentStateName.StateName);
                        if (nextState) {
                            return nextState;
                        }
                    }
                }
            }

            const nextState = workFlowDoc.State.find(state => state.StateName === dataCurrentStateName.NextStateName);
            return nextState ? nextState : "No Next State To Return";
        }

    } catch (err) {
        throw err;
    }
};
