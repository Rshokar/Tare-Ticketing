const Dispatch = require("../models/dispatch");
const Job = require("../models/job");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

/**
 * This function is responsible for creating dispatch tickets and operator tickets
 * @author Ravinder Shokar 
 * @date June 22 2021 
 * @version 1.0 
 */
const createDispatch = (req, res, next) => {
    const token = req.cookies.jwt
    const operators = req.body.operators;


    jwt.verify(token, "butternut", (err, decodedToken) => {
        if (err) {
            res.send({
                status: "error",
                message: "Error decoding JWT token."
            })
        }

        console.log(operators);

        let dispatch = new Dispatch({
            dispatcher: {
                id: decodedToken.id,
                company: decodedToken.company,
            },
            operators: req.body.operators,
            date: req.body.date,
            dumpLocation: req.body.dumpLocation,
            loadLocation: req.body.loadLocation,
            contractor: req.body.contractor,
            numTrucks: req.body.numTrucks,
            notes: req.body.notes,
            material: req.body.material,
            supplier: req.body.supplier,
            reciever: req.body.reciever,
            status: {}
        })

        createJobTickets(dispatch)
            .then((dispatch) => {
                dispatch.save();
                console.log("Successfully created job tickes", dispatch);
                next()
            })
            .catch(() => {
                console.log("Failed to create job tickets.")
            })


    })
}

/**
 * This function is responsible for creating job tickets depending on a dispatch tickets 
 * requirements. This function will also update the dispatch status. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @param {} dispatch a dispatch ticket 
 * @returns an dispatch with updated statuses
 */
const createJobTickets = (dispatch) => {
    return new Promise((resolve, reject) => {
        const jobTickets = []
        const dispatchStatus = {
            empty: 0,
            sent: 0,
            confirmed: 0,
            active: 0,
            complete: 0
        }

        dispatch.operators.forEach((spot, index) => {

            if (spot.id == "") {
                dispatchStatus.empty += 1;
            } else {
                dispatchStatus.sent += 1;
            }

            let job = new Job({
                dispatcher: dispatch.dispatcher,
                dispatchTicket: dispatch._id,
                operator: {
                    id: spot.id,
                    name: spot.name,
                },
                date: dispatch.date,
                startTime: spot.startTime,
                dumpLocation: dispatch.dumpLocation,
                loadLocation: dispatch.loadLocation,
                contractor: dispatch.contractor,
                equipment: spot.equipment,
                notes: dispatch.notes,
                material: dispatch.material.material,
                supplier: dispatch.supplier,
                reciever: dispatch.reciever,
                status: spot.status,
                position: index,
            })

            dispatch.operators[index].jobTicket = job._id;

            job.save();

        })
        dispatch.status = dispatchStatus

        resolve(dispatch);
    })
}


/**
 * This function is responsible for changing the status of a job ticket to confirmed.
 * This function also utilizes updateDispatchStatus() to update the status of the dispatch
 * @author Ravinder Shoakr 
 * @vesrion 1.0 
 * @date June 26 2021
 */
const confirmJobTicket = (req, res, next) => {
    const jobId = req.body.jobId;

    Job.findOne({ _id: jobId })
        .then((ticket) => {
            const prevStatus = ticket.status;

            console.log(ticket);

            ticket.status = 'confirmed';
            updateDispatchStatus(prevStatus, "confirmed", ticket)
                .then((dispatch) => {
                    console.log(dispatch);
                    dispatch.save();
                    ticket.save();
                    next();
                })
                .catch((err) => {
                    console.log(err);
                    res.send({
                        status: 'error',
                        message: "Error finding dispatch",
                    })
                })
        })
}

/**
 * This function is responsible for changing the status of a job ticket to active. 
 * This function also utilizes updateDispatchStatus() to update the status of the dispatch
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 26 2021
 */
const activateJobTicket = (req, res, next) => {
    const jobId = req.body.jobId;

    Job.findOne({ _id: jobId })
        .then((ticket) => {
            const prevStatus = ticket.status;

            ticket.status = 'active';

            updateDispatchStatus(prevStatus, 'active', ticket)
                .then((dispatch) => {
                    console.log(dispatch);
                    console.log(ticket)

                    dispatch.save();
                    ticket.save();
                    next();
                })
                .catch((err) => {
                    console.log(err)
                    res.send({
                        status: "error",
                        message: "Error finding dispatch"
                    })
                })
        })
}


/**
 * This function will changes the status of a dispatch and operator status.
 * @author Ravinder Shokar 
 * @vesrion 1.0 
 * @date June 26 2021
 * @return Promise 
 */
const updateDispatchStatus = (prevStatus, newStatus, job) => {
    return new Promise((resolve, reject) => {
        Dispatch.findOne({ _id: job.dispatchTicket })
            .then((dispatch) => {
                console.log(dispatch);
                if (dispatch == null) {
                    reject("No dispatch found");
                } else {
                    for (let i = 0; i < dispatch.operators.length; i++) {
                        if (dispatch.operators[i].jobTicket == job.id) {
                            dispatch.operators[i].status = newStatus;
                        }
                    }
                    dispatch.status[prevStatus]--;
                    dispatch.status[newStatus]++;

                    dispatch.markModified("status");
                    dispatch.markModified("operators");

                    resolve(dispatch);
                }
            })
    })
}


module.exports = {
    createDispatch, confirmJobTicket, activateJobTicket
}