const Dispatch = require("../models/dispatch");
const Job = require("../models/job");
const User = require("../models/user");
const { ObjectId } = require("mongodb");
const UserController = require("../controllers/UserController");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
'use strict';

/**
 * This function is responsible for creating dispatch tickets and operator tickets
 * @author Ravinder Shokar 
 * @date June 22 2021 
 * @version 1.0 
 */
const createDispatch = (req, res, next) => {
  const token = req.cookies.jwt

  let rates = req.body.rates;
  let user;

  jwt.verify(token, "butternut", async (err, decodedToken) => {
    if (err) {
      res.send({
        status: "error",
        message: "Error decoding JWT token."
      })
      next();
    }

    try {
      if (rates.hourly !== undefined) {
        user = await UserController.getUser(decodedToken.id);
        rates["hourly"] = { cont: rates.hourly, oper: user.contractors[req.body.contractor].operatorRates }
      }
    } catch (e) {
      res.send({ status: "error", message: e })
      next()
    }

    let dispatch = new Dispatch({
      dispatcher: {
        id: decodedToken.id,
        company: decodedToken.company,
      },
      operators: req.body.operators,
      date: req.body.date + "T00:00",
      dumpLocation: req.body.dumpLocation,
      loadLocation: req.body.loadLocation,
      contractor: req.body.contractor,
      numTrucks: req.body.numTrucks,
      notes: req.body.notes,
      material: req.body.material,
      supplier: req.body.supplier,
      reciever: req.body.reciever,
      status: {},
      rates,
    })

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
        start: dispatch.operators[index].start,
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

      dispatch.operators[index].jobId = job._id;

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
 * Adda new load ticket
 * @author Ravinder Shokar 
 * @version 1.1
 * @date Aug 5 2021
 */
const submitLoadTicket = async (req, res, next) => {
  let status, x, y, job, tonnage;

  try {
    job = await getJob(req.body.jobId);
    x = await verifyActiveLoadTicket(req.body, job);
    y = await isApprovedLoadLocation(req.body.loadLocation, job, req.body.type);
  } catch (err) {
    res.send({ status: "error", err });
    next();
  }

  if (x && y) {
    tonnage = (req.body.type == "ton" ? req.body.tonnage : getBoxes(job.equipment))
    if (job.loadTickets == undefined) { job.loadTickets = []; }

    job.loadTickets.push({
      loadLocation: req.body.loadLocation,
      loadTime: req.body.loadTime,
      material: req.body.material,
      status: "active",
      type: req.body.type,
      tonnage,
    })

    job.save()
      .then((e) => {
        res.send({
          status: "success",
          message: "Succesfully added load ticket",
          loadId: job.loadTickets.length - 1,
          job
        })
        next()
      })
      .catch(() => {
        res.send({
          status: "error",
          err: {
            code: "form",
            message: "Error saving ticket",
          }
        })
        next()
      })


  }
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
  if (equipment.trailer === "default") {
    return 1;
  } else {
    return 2;
  }
}

/**
 * Finishes load ticket. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 1 2021 
 */
const finishLoadTicket = async (req, res, next) => {
  let job, x, y, load, loadId, dateTime;
  try {
    job = await getJob(req.body.jobId);
    [load, loadId] = await getActiveLoadTicket(job);
    x = await verifyFinishLoadTicket(load, req.body);
    y = await isApprovedDumpLocation(job, load, req.body.dumpLocation);
  } catch (e) {
    res.send({ status: "error", err: e });
    next();
  }
  if (x && y) {
    job.loadTickets[loadId]['dumpLocation'] = req.body.dumpLocation;
    job.loadTickets[loadId]['dumpTime'] = req.body.dumpTime;
    job.loadTickets[loadId].status = "complete"

    job.markModified("loadTickets");
    job.save()
      .then(() => {
        res.send({
          status: "success",
          message: "Succesfully updated job ticket",
          job,
          loadId
        })
      })
      .catch(() => {
        res.send({
          status: "error",
          err: {
            code: "form",
            message: "Error saving load ticket",
          }
        })
      })
    next();
  }
}

/**
 * Verifies data to complete a load ticket
 * @author Ravinder Shokar 
 * @version 1.0
 * @date Aug 6 2021
 * @param { JSON } l Load Ticket 
 * @param {JSON } data dump data
 * @returns { Promise } resolves and returns a boolean if data is valid.
 */
const verifyFinishLoadTicket = (l, data) => {
  let dateTime;
  return new Promise((res, rej) => {
    let [date, time] = data.dumpTime.split("T");
    dateTime = new Date(data.dumpTime);
    if (time === "" || date === "" || (data.dumpLocation === "default" || data.dumpLocation === "")) {
      rej({ code: "form", message: "Required fields can not be left empty or on default state" })
    } else if (data.dumpLocation.length < 2) {
      rej({ code: "dump", message: "Must be larger than 2 characters" })
    } else if (l.loadTime > dateTime) {
      rej({ code: "dump_dateTime", message: "Dump time cannnot be before Load time" });
    }
    res(true);
  })
}

/**
 * Verifies active tickets
 * @author Ravinder Shokar
 * @date Aug 5 2021
 * @param { JSON } t ticket data
 * @param { JSON } j job ticket
 * @return { Promise } resolved is isValid
 */
const verifyActiveLoadTicket = async (t, j) => {
  let d = new Date(t.loadTime);
  let [date, time] = t.loadTime.split("T");

  return new Promise((res, rej) => {
    if (t.loadLocation == "default" || t.material == "" || date === "" || time === "" ||
      (t.type !== "load" && (t.tonnage === 0 || t.tonnage === "NaN"))) {
      rej({ code: "form", message: "Required fields can not be left empty or on default state." });
    } else if (t.loadLocation.length < 2) {
      rej({ code: "load", message: "Load Location must be greater than two characters." });
    } else if (j.start > d) {
      rej({ code: "load_dateTime", message: "Load time cannot be before start time." });
    } else if (t.tonnage <= 0 && t.type === "ton") {
      rej({ code: "tonnage", message: "Must be greater than or equal to 0." });
    }

    res(true);
  })
}

/**
 * Gets active load ticket. It is assumed that 
 * a job can have only one load ticket
 * @param { JSON } j Job ticket
 * @returns { Promise } Resolves with load ticket and load index.
 */
const getActiveLoadTicket = (j) => {
  return new Promise((res, rej) => {
    for (let i = 0; i < j.loadTickets.length; i++) {
      if (j.loadTickets[i].status === "active") {
        res([j.loadTickets[i], i])
      }
    }
    rej({ code: "job", message: "No active load ticket" });
  })
}

/**
 * Makes sure a load ticket, load location matches a load location in a job ticket
 * @author Ravinder Shokar 
 * @version 1.0
 * @date Aug 5 2021
 * @param { JSON } j job ticket
 * @param { String } l Load Location
 * @param { String } t type of load ticket
 * @return { Promise } resolved if valid 
 */
const isApprovedLoadLocation = async (l, j, t) => {
  let load = []
  let isValid = false;

  return new Promise((res, rej) => {
    if (j.rates.hourly) {
      isValid = (j.loadLocation === l ? true : false);
    } else {
      if (t === "load") { j.rates.perLoad.rates.forEach((rate) => { load.push(rate.l) }) }
      if (t === "ton") { j.rates.tonnage.rates.forEach((rate) => { load.push(rate.l) }) }
    }

    for (let i = 0; i < load.length; i++) {
      if (load[i] === l) {
        isValid = true;
      }
    }

    if (isValid) {
      res(isValid);
    } else {
      rej({ code: "load", message: "Invalid load location." });
    }
  })
}

/**
 * Make sure a dump location is approved for load ticket
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 6 2021
 * @param {*} j Job ticket
 * @param {*} l Load ticket
 * @param {*} location dump location
 */
const isApprovedDumpLocation = (j, l, location) => {
  let routes = [];
  let isValid = false;

  return new Promise((res, rej) => {
    if (j.rates.hourly) {
      isValid = (j.dumpLocation === location ? true : false);
    } else {
      if (l.type === "load") { j.rates.perLoad.rates.forEach(route => { routes.push(route) }) };
      if (l.type === "ton") { j.rates.tonnage.rates.forEach(route => { routes.push(route) }) };
    }

    for (let i = 0; i < routes.length; i++) {
      if (routes[i].l === l.loadLocation && routes[i].d === location) {
        isValid = true;
      }
    }

    if (isValid) {
      res(isValid)
    } else {
      rej({ code: "dump", message: "Invalid dump location" });
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
const updateLoadTicket = async (req, res, next) => {
  const load = req.body.loadTicket;
  const id = req.body.loadId;

  let j, x, y, z, u;
  try {
    j = await getJob(load.jobId);
    x = await verifyActiveLoadTicket(load, j);
    y = await isApprovedLoadLocation(load.loadLocation, j, load.type);
    if (load.status === "complete") {
      u = await verifyFinishLoadTicket(load, load);
      z = await isApprovedDumpLocation(j, load, load.dumpLocation)
    } else {
      z = u = true
    }
  } catch (err) {
    console.log("The Error", err);
    res.send({ status: "error", err })
    next()
  }

  if (x && y && z && u) {
    j.loadTickets[id].loadLocation = load.loadLocation;
    j.loadTickets[id].loadTime = load.loadTime;
    j.loadTickets[id].material = load.material;
    j.loadTickets[id].tonnage = (load.type == "load" ? getBoxes(j.equipment) : load.tonnage);
    j.loadTickets[id].type = load.type;

    if (j.loadTickets[id].status !== "active") {
      j.loadTickets[id].dumpLocation = load.dumpLocation;
      j.loadTickets[id].dumpTime = load.dumpTime;
    }

    j.markModified("loadTickets")
    j.save()
      .then(() => {
        res.send({
          status: "success",
          message: "Succesfully updated load ticket."
        })
        next();
      })
      .catch((e) => {
        console.log(e)
        res.send({
          status: "error",
          err: {
            code: "form",
            message: "Error saving load ticket."
          }
        })
        next();
      });
  }
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

/**
 * Gets job ticket based on ID
 * @author Ravinder Shokar 
 * @version 1.0
 * @date Aug 5 2021
 * @param { String } id Job ticket id
 * @return { Promise } returns job ticket
 */
const getJob = async (id) => {
  return new Promise((res, rej) => {
    Job.findOne({ _id: ObjectId(id) })
      .then(job => {
        if (job == null) {
          rej({ code: "form", message: "Error finding job ticket." })
        } else {
          res(job)
        }
      })
  })
}



module.exports = {
  createDispatch,
  confirmJobTicket,
  activateJobTicket,
  submitLoadTicket,
  finishLoadTicket,
  updateLoadTicket,
  deleteLoadTicket,
  completeJobTicket,
  getJobTickets,
  getJob
}