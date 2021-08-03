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
      status: {},
      rates: (req.body.rates == undefined ? {} : req.body.rates),
    })

    console.log(dispatch)
    console.log(req.body.rates)

    createJobTickets(dispatch)
      .then((dispatch) => {
        dispatch.save((err) => {
          if (err) {
            res.send({
              status: "error",
              message: "Error Creating Dispatch"
            })
          } else {
            console.log("Successfully created job tickes", dispatch);
            next()
          }
        });
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
        material: dispatch.material,
        supplier: dispatch.supplier,
        reciever: dispatch.reciever,
        status: spot.status,
        position: index,
        rates: dispatch.rates
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
  const newStatus = 'confirmed';

  Job.findOne({ _id: jobId })
    .then((ticket) => {
      if (ticket == null) {
        res.send({
          status: "error",
          message: "Error finding job"
        })
      }
      const prevStatus = ticket.status;

      console.log(ticket);

      ticket.status = newStatus;
      updateDispatchStatus(prevStatus, newStatus, ticket)
        .then((dispatch) => {
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
  const newStatus = 'active';

  Job.findOne({ _id: jobId })
    .then((ticket) => {
      if (ticket == null) {
        res.send({
          status: "error",
          message: "Error finding job"
        })
      }
      const prevStatus = ticket.status;

      ticket.status = newStatus;

      updateDispatchStatus(prevStatus, newStatus, ticket)
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
 * This function is responsible for changing the status of a job ticket to complete.
 * This function also utilizes updateDispatchStatus() to update the status of the dispatch
 * @author Ravidner Shokar 
 * @version 1.0
 * @date July 3 2021
 */
const completeJobTicket = (req, res, next) => {
  const jobId = req.body.jobId;
  const newStatus = 'complete';
  let start;
  let finish;
  let prevStatus

  Job.findOne({ _id: jobId })
    .then((ticket) => {
      start = new Date(ticket.startTime);
      finish = new Date(req.body.time);

      if (ticket == null) {
        res.send({ status: "error", message: "Error finding job" })
        next()
      } else if (ticket.loadTickets.length != 0 && ticket.loadTickets[ticket.loadTickets.length - 1].status == "active") {
        res.send({ status: "error", message: "Finish Load Ticket Before Signing Off" })
        next();
      } else if (finish < start) {
        res.send({ status: "error", message: "Finish Time cannot be before start time" })
        next()
      } else {
        prevStatus = ticket.status;
        ticket.status = newStatus;
        ticket.finishTime = req.body.signOffTime;

        updateDispatchStatus(prevStatus, newStatus, ticket)
          .then((dispatch) => {
            dispatch.save();
            ticket.save();

            res.send({ status: "success", message: "Job status updated" })
            next();
          })
          .catch((err) => {
            console.log(err)
            res.send({ status: "error", message: "Error finding dispatch" })
            next();
          })
      }
    })
}



/**
 * This function will changes the status of a dispatch and operator status.
 * @author Ravinder Shokar 
 * @vesrion 1.0 
 * @date June 26 2021
 * @param prevStatus Previous status of the job ticket
 * @param newStatus New status for the job ticket. 
 * @param job Job ticket
 * @return Promise 
 */
const updateDispatchStatus = (prevStatus, newStatus, job) => {
  return new Promise((resolve, reject) => {
    Dispatch.findOne({ _id: job.dispatchTicket })
      .then((dispatch) => {
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

/**
 * This function is responsible for adding a new load ticket to a job ticket
 * @author Ravinder Shokar 
 * @version 1.0
 * @date June 30 2021
 */
const addLoadTicket = (req, res, next) => {
  let tonnage;
  Job.findOne({
    _id: req.body.jobId
  })
    .then((job) => {
      if (job == null) {
        res.send({
          status: "error",
          message: "Error finding job ticket"
        })
      }

      tonnage = (req.body.type == "ton" ? req.body.tonnage : getBoxes(job.equipment))

      if (job.loadTickets == undefined) {
        job.loadTickets = [];
      }

      job.loadTickets.push({
        loadLocation: req.body.loadLocation,
        loadTime: req.body.loadTime,
        material: req.body.material,
        status: "active",
        type: req.body.type,
        tonnage,
      })

      console.log(job);

      job.save();
      res.send({
        status: "success",
        message: "Succesfully added load ticket",
        ticketId: job.loadTickets.length - 1,
        job
      })
    })
}

/**
 * This function is responsible for rturning the correct boxes of material delivered on a 
 * per load ticket. 
 *  Eg. a single truck returns 1 
 *      a truck and trailer returns 2
 * @param equipment JSON object containing { truck: 'tandem', trailer: '4-axle-end-dump' }
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 24 2021
 */
function getBoxes(equipment) {
  if (equipment.trailer == "default") {
    return 1;
  } else {
    return 2;
  }
}

/**
 * This function is responsible for finishing a load ticket. It works 
 * by iterating over all load tickets trying looking for the one that 
 * has a status ofactive. It then adds values, changes the status to complete 
 * and saves it. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 1 2021 
 */
const finishLoadTicket = (req, res, next) => {
  Job.findOne({
    _id: req.body.jobId
  })
    .then((job) => {
      if (job == undefined) {
        res.send({
          status: "error",
          message: "Error querying job"
        })
      }
      for (let i = 0; i < job.loadTickets.length; i++) {
        if (job.loadTickets[i].status == "active") {

          if (new Date(req.body.dumpTime) < new Date(job.loadTickets[i].loadTime)) {
            res.send({
              status: "error",
              type: "past_dump_time",
              message: "Cannot dump load before loading time",
            })
            next();
          } else {
            job.loadTickets[i]['dumpLocation'] = req.body.dumpLocation;
            job.loadTickets[i]['dumpTime'] = req.body.dumpTime;
            job.loadTickets[i].status = "complete"

            console.log(job);

            job.markModified("loadTickets");
            job.save();

            res.send({
              status: "success",
              message: "Succesfully updated job ticket",
              result: {
                job: job,
                loadTicketId: i,
              }
            })
            next();
          }

        }
      }
    })
}

/**
 * This function is responsible for updating a load ticket dependent on 
 * the status of the load ticket.
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 2 2021
 */
const updateLoadTicket = (req, res, next) => {
  console.log(req.body);
  const loadTicket = req.body.loadTicket;

  Job.findOne({
    _id: req.body.id
  })
    .then((job) => {
      if (job == null) {
        res.send({
          status: "error",
          message: "Error Finding Job Ticket"
        })
      } else {
        job.loadTickets[req.body.loadId].loadLocation = loadTicket.loadLocation;
        job.loadTickets[req.body.loadId].loadTime = loadTicket.loadTime;
        job.loadTickets[req.body.loadId].material = loadTicket.material;
        job.loadTickets[req.body.loadId].tonnage = (loadTicket.type == "load" ? getBoxes(job.equipment) : loadTicket.tonnage);
        job.loadTickets[req.body.loadId].type = loadTicket.type;

        if (job.loadTickets[req.body.loadId].status != "active") {
          job.loadTickets[req.body.loadId].dumpLocation = loadTicket.dumpLocation;
          job.loadTickets[req.body.loadId].dumpTime = loadTicket.dumpTime;
        }

        console.log("Job Ticket", job.loadTickets[req.body.loadId]);
        console.log("Load Ticket", loadTicket);

        job.markModified("loadTickets");


        job.save();

        next();
      }
    })
}

/**
 * This function is responsible for deleting a load ticket from a job
 * ticket 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 2 2021
 */
const deleteLoadTicket = (req, res, next) => {
  console.log(req.body);

  Job.findOne({
    _id: req.body.jobId
  })
    .then((job) => {
      if (job == null) {
        res.send({
          status: "error",
          message: "Error finding job ticket"
        })
      }
      console.log("Before Splice", job);
      job.loadTickets.splice(req.body.loadId, 1);
      console.log("After Splice", job);


      job.markModified("loadTickets");

      job.save();

      next();
    })
}


/**
 * Gets all jobs dependent on query
 * @author Ravinder Shokar
 * @verision 1.0 
 * @date Aug 2 2021
 * @param { JSON } q { start, finish, customer, type}
 * @param { String } id Current User id
 * @param { String } type Current User type
 * @return { Promise }
 */
const getJobTickets = (q, id, userType) => {
  let customer;
  let user;

  if (q.type === "contractor") {
    customer = { contractor: q.customer }
  } else if (q.type === "operator") {
    customer = { "operator.name": q.customer };
  } else if (q.type === "dispatcher") {
    customer = { "dispatcher.company": q.customer };
  }

  if (userType === "dispatcher") {
    user = { "dispatcher.id": id };
  } else {
    user = { "operator.id": id };
  }

  return new Promise((res, rej) => {
    Job.find({
      $and: [user, customer,
        { $and: [{ date: { $gte: q.start }, date: { $lte: q.finish } }] },
      ]
    }).then((jobs) => {
      if (jobs.length === 0) {
        rej("No job tickets found in date range.");
      } else {
        res(jobs);
      }
    })
  })
}



module.exports = {
  createDispatch,
  confirmJobTicket,
  activateJobTicket,
  addLoadTicket,
  finishLoadTicket,
  updateLoadTicket,
  deleteLoadTicket,
  completeJobTicket,
  getJobTickets,
}