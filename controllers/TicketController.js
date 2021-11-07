const Authorizer = require("../Objects/Authorizer");
const Dispatch = require("../models/dispatch");
const Job = require("../models/job");
const User = require("../models/user");
const DispatchTicket = require("../Objects/tickets/DispatchTicket");
const JobTicket = require("../Objects/tickets/JobTicket");
const { ObjectId } = require("mongodb");
const UserController = require("../controllers/UserController");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
'use strict';


class TicketController {
  /**
   * This function is responsible for creating dispatch tickets and operator tickets
   * @author Ravinder Shokar 
   * @date June 22 2021 
   * @version 1.0 
   */
  static async createDispatch(req, res, next) {
    const token = req.cookies.jwt
    const operators = req.body.operators;
    req.body.startLocation = req.body.loadLocation;

    try {
      let decodedToken = await Authorizer.verifyJWTToken(token);
      let dispatch = new DispatchTicket(req.body);
      console.log(dispatch)
      dispatch.userId = decodedToken.id;
      await dispatch.verifyTicket();
      dispatch.status = TicketController.#generateStatusObjectFromOperators(operators);
      let dispatchId = await dispatch.saveTicket();
      await TicketController.#createJobTickets(operators, dispatchId);
      next();
    } catch (e) {
      console.log(e);
      res.send({ status: "error", code: { message: e.message, code: e.code } })
    }
  }

  /**
   * Returns an object with the status of each job ticket 
   * passed in. 
   * @param { JSON } operators
   * @return { JSON } 
   */
  static #generateStatusObjectFromOperators(operators) {
    let statusObject = { empty: 0, sent: 0, confirmed: 0, active: 0, complete: 0 }
    for (let i = 0; i < operators.length; i++) {
      switch (operators[i].status) {
        case 'sent':
          statusObject.sent++;
          break;
        case "confirmed":
          statusObject.confirmed++;
          break;
        case "active":
          statusObject.active++;
          break;
        case "complete":
          statusObject.complete++
          break;
        default:
          statusObject.empty++;
      }
    }
    return statusObject;
  }

  /**
   * Cretes many job tickets. 
   * @param {JSON} operators 
   * @param {String} dispatchId 
   * @returns { Promise } on res returns list of jobId
   * on rej throws SavingTicketError
   */
  static #createJobTickets(operators, dispatchId) {
    return new Promise((res, rej) => {
      let job;
      let jobIds = []
      for (let i = 0; i < operators.length; i++) {
        operators[i].dispatchId = dispatchId;
        job = new JobTicket(operators[i]);
        job.saveTicket()
          .then(jobId => {
            jobIds.push(jobId);
          })
          .catch(e => {
            console.log(e)
            rej(new ValidationError.SavingTicketsError("Error saving job ticket", jobIds));
          })
      }
      res();
    })
  }
  // jwt.verify(token, "butternut", async (err, decodedToken) => {
  //   if (err) {
  //     res.send({
  //       status: "error",
  //       message: "Error decoding JWT token."
  //     })
  //     next();
  //   }

  //   try {
  //     if (rates.hourly) {
  //       user = await UserController.getUser(decodedToken.id);
  //       rates["hourly"] = { cont: rates.hourly, oper: user._doc.contractors[req.body.contractor].operatorRates }
  //     }
  //     let dispatch = new Dispatch({
  //       dispatcher: {
  //         id: ObjectId(decodedToken.id),
  //         company: decodedToken.company,
  //       },
  //       operators: req.body.operators,
  //       date: req.body.date + "T00:00",
  //       dumpLocation: req.body.dumpLocation,
  //       loadLocation: req.body.loadLocation,
  //       contractor: req.body.contractor,
  //       numTrucks: req.body.numTrucks,
  //       notes: req.body.notes,
  //       material: req.body.material,
  //       supplier: req.body.supplier,
  //       reciever: req.body.reciever,
  //       status: {},
  //       rates,
  //     })

  //     dispatch = await createJobTickets(dispatch.operators, dispatch);
  //     dispatch.save();
  //     res.send({ status: "success", message: "Succesfull Ajax call" })
  //     next();
  // } catch (e) {
  //   console.log(e);
  //   res.send({ status: "error", err: e })
  //   next()
  // }
  //   })
}



/**
 * Updates a dispatch ticket and job tickets. 
 */
const editDispatch = async (req, res, next) => {
  const DATA = req.body;
  DATA.date = DATA.date.split("T")[0] + "T00:00";
  let dispatch;
  try {
    dispatch = await getDispatch(DATA._id);
    dispatch = await updateDspatchDetails(DATA, dispatch);
    dispatch = await updateRates(DATA, dispatch);
    dispatch = await updateOperators(DATA, dispatch);
    dispatch.save();
    res.send({ status: "success", message: "Succesfully updated dispatch" })
  } catch (e) {
    console.log(e);
    res.send({ status: "error", err: e });
    next();
  }
}

/**
 * This function updates the base dispatch details. Contractor, 
 * Date, Load Location, Dump Location, Reciever, Supplier, Materail, 
 * and notes
 * @author Ravinder Shokar
 * @version 1.0 
 * @date Aug 16 2021
 * @param { JSON } data New dispatch data
 * @param { JSON } disp Old dispatch ticket 
 * @returns Promise resolves if a valid update
 */
function updateDspatchDetails(data, disp) {
  const STATUS = disp.status
  return new Promise(async (res, rej) => {
    try {
      await validateDispatchDetails(data);
      if ((STATUS.sent > 0 || STATUS.confirmed > 0) && STATUS.active === 0 && STATUS.complete === 0) {
        disp.dumpLocation = data.dumpLocation;
        disp.loadLocation = data.loadLocation;
        disp.notes = data.notes;
        disp.numTrucks = data.numTrucks;
        disp.material = data.material;
        disp.supplier = data.supplier;
        disp.reciever = data.reciever;
      } else if (STATUS.active > 0) {
        disp.notes = data.notes;
        disp.numTrucks = data.numTrucks;
        disp.material = data.material;
        disp.supplier = data.supplier;
        disp.reciever = data.reciever;
      }
      res(disp)
    } catch (e) {
      rej(e);
    }
  })
}

/** 
 * This function will validate the dispatch
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 16 2021 
 * @return Promise. Resolves if valid
 */
function validateDispatchDetails(data) {
  let isValid = true;
  return new Promise((res, rej) => {
    if (data.contractor == ""
      || data.date == ""
      || data.dumpLocation == ""
      || data.loadLocation == ""
    ) {
      rej({ code: "form", message: "Rerquired Fields must not be left empty" })
      return false;
    }

    if (data.numTrucks < 0) {
      rej({ code: "num_trucks", message: "Number of trucks must be greater or equal than zero" });
      isValid = false;
    }

    if (data.loadLocation.length < 2) {
      rej({ code: "load", message: "Load Location must be longer than two characters" });
      isValid = false;
    }

    if (data.dumpLocation.length < 2) {
      rej({ code: "dump", message: "Dump Location must be longer than two characters" });
      isValid = false;
    }

    if (data.reciever.length > 0 && data.reciever.length < 2) {
      rej({ code: "reciever", message: "Reciever must be longer than two characters" });
      isValid = false;
    }

    if (data.supplier.length > 0 && data.supplier.length < 2) {
      rej({ code: "supplier", message: "Supplier must be longer than two characters" });
      isValid = false;
    }

    if (data.material.length > 0 && data.material.length < 2) {
      rej({ code: "material", message: "Material must be longer than two characters" });
      isValid = false;
    }

    if (isValid) {
      res();
    }
  })
}

/**
 * This function updates operators of a dispatch ticket. 
 * It makes sure no operator with status of active or complete is removed. 
 * @param { JSON } data New dispatch data
 * @param { JSON } disp Old dispatch ticket 
 * @returns Promise resolves if everything is valid and job 
 * tickets are saved properly. 
 */
function updateOperators(data, disp) {
  return new Promise(async (res, rej) => {
    const ACTIVE = "active";
    const COMPLETE = "complete"

    let dispOps = disp.operators;
    let dataOps = data.operators;

    // Make sure active and complete operators cannot be removed.
    for (let i = 0; i < dispOps.length; i++) {
      if (dispOps[i].status === ACTIVE || dispOps[i].status === COMPLETE) {
        if (!isOpInDispatch(dispOps[i], data)) {
          rej({ code: "operators", message: "Active or Complete operator has been removed from dispaatch.", result: dispOps[i] })
        }
      }
    }

    //Make sure operator data is valid. 
    for (let i = 0; i < dataOps.length; i++) {
      if (!validateOperator(dataOps[i], data)) {
        rej({ code: "operators", message: "Operator could not be validated.", result: dataOps[j] })
      }
    }

    //Check for duplicate operators. 
    for (let i = 0; i < data.numTrucks; i++) {
      for (let j = i + 1; j < data.numTrucks; j++) {
        if (dataOps[i].id === dataOps[j]) {
          rej({ code: "operators", message: "Duplicate operators found", result: dataOps[j] })
        }
      }
    }

    try {
      for (let i = 0; i < dataOps.length; i++) {
        for (let j = 0; j < dispOps.length; j++) {
          if (dispOps[j].id && dispOps[j].id.equals(dataOps[i].id)) {
            dataOps[i]["jobId"] = dispOps[j].jobId;
            await updateJobTicket(dataOps[i].jobId, data, dataOps[i]);
            dispOps.splice(j, 1);
            j = dispOps.length;
          }
        }
      }

      for (let i = 0; i < dispOps.length; i++) {
        if (dispOps[i].jobId !== undefined) {
          await deleteJobTicket(dispOps[i].jobId);
        }
      }

      //Convert all data.operator ID's from Strings to to Object Id
      data.operators.forEach((op, i) => {
        if (op.id) { data.operators[i].id = ObjectId(op.id); }
        console.log(op)
      })

      disp.operators = data.operators
      disp = await createJobTickets(disp.operators, disp);
    } catch (e) {
      rej(e);
    }

    res(disp);
  })
}

/**
 * Updatess a dispatches rates
 * @author Ravinder Shokar
 * @version 1.0 
 * @date Aug 18 2021
 * @param { JSON } data new dispatch data
 * @param { Dispatch } disp old dispatch data
 * @return Promise. Resolves if rates are valid. 
 */
function updateRates(data, disp) {
  return new Promise((res, rej) => {
    const DATAR = data.rates;
    const DISPR = disp.rates;

    let areRoutesValid;

    if (DATAR.hourly && (DATAR.perLoad || DATAR.tonnage)) {
      rej({ code: "rates", message: "Invalid Rate fomat. Cannot have hourly and perload or tonnage rate." })
    }

    if (disp.status.active > 0 || disp.status.complete > 0) {
      if (!DATAR.hourly && DISPR.hourly) {
        rej({ code: "rates", message: "Dispatch is active or complete, cannot change rate type. Must be hourly." });
      } else if (!DATAR.perLoad && DISPR.perload) {
        rej({ code: "rates", message: "Dispatch is active or complete, cannot change rate type. Must include per load." });
      } else if (!DATAR.tonnage && DISPR.tonnage) {
        rej({ code: "rates", message: "Dispatch is active or complete, cannot change rate type. Must include tonnage." });
      }

      if (DATAR.tonnage && DISPR.tonnage && !hasRoutes(DATAR.tonnage.rates, DISPR.tonnage.rates)) {
        rej({ code: "rates", message: "Missing tonnage route. Active or Complete dispatch cannot have routes removed." });
      };

      if (DATAR.perLoad && DISPR.perLoad && !hasRoutes(DATAR.perLoad.rates, DISPR.perLoad.rates)) {
        rej({ code: "rates", message: "Missing per load route. Active or Complete dispatch cannot have routes removed." });
      };
    }

    if (!DATAR.hourly) {
      if (DATAR.perLoad && DATAR.tonnage) { areRoutesValid = validateRoutes([...DATAR.perLoad.rates, ...DATAR.tonnage.rates]) }
      else if (DATAR.perload) { areRoutesValid = validateRoutes(DATAR.perLoad.rates) }
      else if (DATAR.tonnage) { areRoutesValid = validateRoutes(DATAR.tonnage.rates) }
    }

    if (DATAR.hourly || areRoutesValid) {
      disp.rates = data.rates;
      res(disp);
    }
  })
}


/**
 * Validate multiple routes. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date Aug 18 2021 
 * @param { Array } routes each element is a JSON object { l: loadLocation, d: dumpLocation, r: rate} 
 * @returns True if all routes are valid.
 */
function validateRoutes(routes) {
  let isValid = true;
  for (let i = 0; i < routes.length; i++) {
    isValid = validateRoute(routes[i]);
    if (!isValid) { return isValid }
  }
  return isValid
}

/**
 * Validates a single route
 * @author Ravinder Shokar 
 * @version 1.0
 * @date Aug 18 2021 
 * @param { JSON } route { l: loadLocation, d: dumpLocation, r: rate}
 * @return True is route is valid
 */
function validateRoute(route) {
  if (route.r < 0) {
    console.log("Rate less than zero");
    return false;
  } else if (route.l.trim() === "" || route.d.trim() === "") {
    console.log("Dump and load locations cannot be left empty")
    return false;
  }
  return true;
}


/**
 * compares two array of routes { l, d, r }. It checks to see if all of x 
 * routes are in y routes
 * l: loadLocation { String },
 * d: dumpLocation { String }, 
 * r: rate { Number }
 * @param {*} x 
 * @param {*} y 
 * @return Boolean. True if x is in y
 */
function hasRoutes(y, x) {
  let isValid;
  for (let i = 0; i < x.length; i++) {
    isValid = false
    for (let j = 0; j < y.length; j++) {
      if (x[i].l === y[j].l && x[i].d === y[j].d) {
        isValid = true;
      }
    }
    if (!isValid) {
      return false;
    }
  }
  return true;
}

/**
 * Checks to see if a operators is located in a dispatch. 
 * @param { JSON } op operator spot data
 * @param { JSON } disp dispatch ticket
 * @return True if operators is in dispatch 
 */
function isOpInDispatch(op, disp) {
  const OPS = disp.operators;
  for (let i = 0; i < OPS.length; i++) {
    if (op.id.equals(OPS[i].id)) {
      return true;
    }
  }
  return false;
}

/**
 * Verifies operator data
 * @author Ravinder Shokar 
 * @vesrion 1.0 
 * @date Aug 16 2021
 * @param { JSON } op spot data.  
 * @returns true if valid
 */
function validateOperator(op, disp) {
  const DISPDATE = new Date(disp.date);
  const START = new Date(op.start);

  if (Object.prototype.toString.call(START) === "[object Date]") {
    // it is a date
    if (isNaN(START.getTime())) {  // d.valueOf() could also work
      console.log(" Must select a start date and time.");
      return false;
    }
  } else {
    console.log("Must select a start date and time.");
    return false;
  }

  if (START < DISPDATE) {
    console.log("Start time cannot be before dispatch date");
    return false;
  }

  if (op.id !== "" && op.equipment.truck == "default") {
    console.log("Truck type must be selected.");
    return false;
  }
  return true;
}

/**
 * This function is responsible for creating job tickets.
 * @author Ravinder Shokar 
 * @version 1.1
 * @param { JSON } ops a dispatch tickets spot data. 
 * @param { Job, Dispatch } data if dispatch ticket is passed in, status's of job tickets will
 * be tracked and updated on dispatch.  
 * @returns an dispatch with updated statuses
 */
const createJobTickets = (ops, data) => {
  const EMPTY = "empty";
  const SENT = 'sent';
  const CONFIRMED = 'confirmed';
  const ACTIVE = 'active';
  const COMPLETE = 'complete';

  let empty = sent = confirmed = active = complete = 0;
  let job;

  return new Promise((res, rej) => {
    const dispatchStatus = { empty, sent, confirmed, active, complete }
    ops.forEach(async (spot, index) => {
      if (data instanceof Dispatch) {
        if (spot.status === EMPTY) { dispatchStatus.empty += 1; }
        else if (spot.status === SENT) { dispatchStatus.sent += 1 }
        else if (spot.status === CONFIRMED) { dispatchStatus.confirmed += 1 }
        else if (spot.status === ACTIVE) { dispatchStatus.active += 1 }
        else if (spot.status === COMPLETE) { dispatchStatus.complete += 1 }
        data.status = dispatchStatus
      }
      if ((spot.id === undefined || spot.id === "") || spot.jobId !== undefined) { return }

      try {
        job = await createJobTicket(spot, data);
      } catch (e) {
        console.log(e);
        rej(e)
      }

      if (data instanceof Dispatch) { data.operators[index].jobId = job._id; }
      job.save();
    })
    res(data);
  })


}


/**
 * Creates a single Job ticket
 * @author Ravinder Shokar
 * @version 1.0 
 * @date AUg 17 2021
 * @param { JSON } op operator spot Data
 * @param { JSON, Dispatch } data job data. If data is a dispatch adds dispatcher 
 * and dispatch ticket data. 
 */
const createJobTicket = (op, data) => {
  return new Promise(res => {
    let dispatcher, dispatchTicket;
    if (data instanceof Dispatch) {
      dispatcher = { id: data.dispatcher.id, company: data.dispatcher.company };
      dispatchTicket = data._id;
    } else {
      dispatcher = {};
    }
    res(new Job({
      dispatcher,
      dispatchTicket,
      operator: { id: op.id, name: op.name },
      date: data.date,
      start: op.start,
      dumpLocation: data.dumpLocation,
      loadLocation: data.loadLocation,
      contractor: data.contractor,
      equipment: { truck: op.equipment.truck, trailer: op.equipment.trailer },
      notes: data.notes,
      material: data.material,
      supplier: data.supplier,
      reciever: data.reciever,
      status: op.status,
      rates: data.rates,
    }))
  })
}






/**
 * Updates a single job ticket
 * @param { String } jobId 
 * @param { JSON } jobData dispatch ticket or job ticket can be passed in
 * @param { JSON } op operator information { eqipment, name, status, id, start }  
 * @returns Promise Resolves if job ticket is updated.
 */
const updateJobTicket = (jobId, jobData, op) => {
  return new Promise(async (res, rej) => {
    let job;

    try {
      job = await getJob(jobId);
      job.operator = { id: op.id, name: op.name };
      job.date = jobData.date;
      job.start = op.start;
      job.dumpLocation = jobData.dumpLocation;
      job.loadLocation = jobData.loadLocation;
      job.contractor = jobData.contractor;
      job.equipment = { truck: op.equipment.truck, trailer: op.equipment.trailer };
      job.notes = jobData.notes;
      job.material = jobData.material;
      job.supplier = jobData.supplier;
      job.reciever = jobData.reciever;
      job.status = op.status;
      job.rates = jobData.rates;

      job.save()
        .then(() => {
          res()
        })
        .catch((e) => {
          res({ status: "error", e: { code: "operators", message: "error saving job ticket" }, result: job })
        })
    } catch (e) {
      rej({ code: "operators", message: "error updating job ticket", result: job })
    }
  })
}

/**
 * Deletes a single job ticket
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 17 2021
 * @param {*} jobId 
 * @return Promise Resolves if job ticket is deleted
 */
const deleteJobTicket = (jobId) => {
  return new Promise((res, rej) => {
    Job.deleteOne({ _id: ObjectId(jobId) })
      .then(data => {
        if (data.deletedCount < 1) {
          rej({ code: "operators", message: "Error deleting job ticket" })
        } else {
          res();
        }
      })
      .catch(e => {
        console.log(e);
        rej({ code: "operators", message: "Error deleting job ticket" })
      })
  })
}


/**
 * This function is responsible for changing the status of a job ticket to confirmed.
 * This function also utilizes updateDispatchStatus() to update the status of the dispatch
 * @author Ravinder Shoakr 
 * @vesrion 1.0 
 * @date June 26 2021
 */
const confirmJobTicket = async (req, res, next) => {
  const jobId = req.body.jobId;
  const newStatus = 'confirmed';
  const increment = true;
  const decrement = false;

  try {
    let jobTicket = await JobTicket.getJobTicketWithDispatch(jobId);
    console.log(jobTicket);
    jobTicket.status = newStatus;
    console.log(jobTicket);
    let dispatchTicket = new DispatchTicket(jobTicket.dispatch);
    dispatchTicket.changeDispatchStatus('sent', decrement);
    dispatchTicket.changeDispatchStatus('confirmed', increment);
    console.log(dispatchTicket.status);

  } catch (e) {
    console.log(e);
  }

  // Job.findOne({ _id: jobId })
  //   .then((ticket) => {
  //     if (ticket == null) {
  //       res.send({
  //         status: "error",
  //         message: "Error finding job"
  //       })
  //     }

  //     const prevStatus = ticket.status;

  //     ticket.status = newStatus;
  //     updateDispatchStatus(prevStatus, newStatus, ticket)
  //       .then((dispatch) => {
  //         dispatch.save();
  //         ticket.save();
  //         next();
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         res.send({
  //           status: 'error',
  //           message: "Error finding dispatch",
  //         })
  //       })
  //   })
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
        ticket["finish"] = req.body.signOffTime;
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
            if (dispatch.operators[i].jobId == job.id) {
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
      job.loadTickets.splice(req.body.loadId, 1);

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
const getJobTickets = (q, id, userType, status) => {
  return new Promise((res, rej) => {
    let customer;
    let user;

    if (q.type === "contractor") {
      customer = { contractor: q.customer }
    } else if (q.type === "operator" && userType === "operator") {
      customer = { "dispatcher.company": q.customer };
    } else if (q.type === "operator") {
      customer = { "operator.name": q.customer };
    }

    if (userType === "dispatcher") {
      user = { "dispatcher.id": id };
    } else {
      user = { "operator.id": id };
    }

    Job.find({
      $and: [user, customer, { status: status }, { $and: [{ date: { $gte: q.start, $lte: q.finish } }] }]
    }).then((jobs) => {
      if (jobs.length === 0) {
        rej({ code: "form", message: "No jobs found." });
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

/**
 * Gets a dispatch ticket
 * @author Ravidner Shokar 
 * @version 1.0 
 * @date Aug 13 2021
 * @param { String } id Dispatch id
 * @returns { Promise } resolves if dispatch found rej if not dispatch exist or error 
 * occures 
 */
const getDispatch = (id) => {
  return new Promise((res, rej) => {
    Dispatch.findOne({
      _id: ObjectId(id)
    })
      .then(ticket => {
        console.log(ticket)
        if (ticket === null) {
          rej({ code: "form", message: "Error finding dispatch ticket" })
        } else {
          res(ticket);
        }
      })
  })
}


/**
 * Gets most recent complete jobs
 * @param {*} id dispatcher Id
 * @param {*} num number of tickets wanted
 * @returns 
 */
const getNumCopmletedDispatch = (id, num) => {
  return new Promise((res, rej) => {
    Dispatch.find({
      $and: [{ "dispatcher.id": id },
      { "status.complete": { $gt: 0 } },
      { "status.sent": 0 },
      { "status.confirmed": 0 },
      { "status.active": 0 }]
    }).limit(num)
      .then(disp => {
        console.log("Hello")
        console.log(disp)
        if (disp.length === 0) {
          rej({ code: "no_tickets", message: "No dispatch tickets found" })
        } else {
          res(disp)
        }
      })
  })
}

/**
 * Gets most recent complete jobs
 * @param { ObjectId } id dispatcher Id
 * @param { Number } num number of tickets wanted
 * @param { String } userType user type
 * @returns 
 */
const getNumCopmletedJobs = (id, num, userType) => {
  return new Promise((res, rej) => {
    const DISPATCHER = "dispatcher";
    if (userType === DISPATCHER) {
      Job.find({
        $and: [{ "dispatcher.id": id }, { status: "complete" }]
      }).limit(num)
        .then(jobs => {
          if (jobs.length === 0) {
            rej({ code: "no_tickets", message: "No Job tickets found" })
          } else {
            res(jobs)
          }
        })
    } else {
      Job.find({
        $and: [{ "operator.id": id }, { status: "complete" }]
      }).limit(num)
        .then(jobs => {
          if (jobs.length === 0) {
            rej({ status: "error", message: "No tickets found" })
          } else {
            res(jobs)
          }
        })
    }

  })
}





module.exports = {
  TicketController,
  confirmJobTicket,
  activateJobTicket,
  submitLoadTicket,
  finishLoadTicket,
  updateLoadTicket,
  deleteLoadTicket,
  completeJobTicket,
  getJobTickets,
  getJob,
  getDispatch,
  editDispatch,
  getNumCopmletedDispatch,
  getNumCopmletedJobs
}