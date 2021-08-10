const Invoice = require("../models/invoice");
const TicketController = require("./TicketController");
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const { ObjectId } = require("mongodb");



const createInvoice = async (req, res, next) => {
  const token = req.cookies.jwt;
  const query = req.body;
  const status = await validateInvoiceQuery(query);

  let jobs
  let inv;
  let invId;

  if (status.valid) {
    jwt.verify(token, "butternut", async (err, decodedToken) => {
      if (err) {
        res.send({ staus: "error", message: "JWT cannot be verified." })
      } else {
        try {
          inv = await getInvoice(query, decodedToken.id);
          jobs = await TicketController.getJobTickets(query, decodedToken.id, decodedToken.type);
          invId = await buildInvoice(jobs, inv);
        } catch (e) {
          res.send({ staus: "error", message: e })
          next();
        }

      }

    })
  } else {
    res.send({ staus: status.status, message: status.message })
  }
}

/**
 * Verifies query
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 3 2021
 * @param { JSON } q
 * @return { valid, { status }} 
 */
const validateInvoiceQuery = async (q) => {
  const err = "error"
  const start = new Date(q.start);
  const finish = new Date(q.finish);


  let isValid = true;
  let message = "";
  let status = "success"

  if (q.finish === ""
    || q.start === ""
    || q.user === ""
    || (q.type !== "operator" && q.type !== "contractor" && q.type !== "dispatcher")) {
    message = "Invalid data passed in";
    staus = err
    isValid = false
  }

  if (finish < start) {
    message = "Finish date cannot be before start date";
    status = err
    isValid = false
  }
  return { valid: isValid, message, status };

}


/**
 * Builds Invocie
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 2 2021
 * @param { Jobs } jobs tickets to be invoices
 * @param { Invoice } inv Invoice to add togit 
 * @param { JSON } q Invoice query
 * @returns { Promise }
 */
function buildInvoice(jobs, inv) {
  let total = 0
  return new Promise((res, rej) => {
    for (let i = 0; i < jobs.length; i++) {
      if (jobs[i].rates.hourly !== undefined) {
        buildHourlyRow(jobs[i]).then((row) => { total += inv.i.push(row); })
          .catch((err) => { rej(err) });
      } else {

        if (jobs[i].rates.tonnage !== undefined) {
          buildTonnageRows(jobs[i]).then((rows) => {
            rows.forEach(row => {
              inv.i.push(row);
            });
          }).catch((err) => { rej(err) });
        }

        if (jobs[i].rates.perLoad !== undefined) {
          buildPerLoadRows(jobs[i]).then((rows) => {
            rows.forEach(row => {
              inv.i.push(row);
            });
          }).catch((err) => { rej(err) });
        }
      }
    }
    res(inv);
  })
}


/**
 * Builds tonnage rows
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 3 2021
 * @param { [Job] } jobs Job tickets
 */
function buildTonnageRows(jobs) {
}


/**
 * Builds per load rows
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 3 2021
 * @param { [Job] } jobs Job tickets
 */
function buildPerLoadRow(jobs) {

}

/**
 * Gets an existing invoice or a new invoice
 * @author Ravinder Shokar 
 * @version 1.0
 * @date Aug 3 2021
 * @param { JSON } q Invoice query
 * @param { String } id User Id
 * @return { Promise }
 */
function getInvoice(q, id) {
  let inv;
  return new Promise((res, rej) => {
    try {
      inv = new Invoice({
        user: ObjectId(id),
        customer: q.customer,
        dateRange: {
          start: q.start,
          finish: q.finish,
        },
        i: [],
        lastIndex: 0,
      })
      res(inv);
    } catch (e) {
      rej(e);
    }
  })
}





module.exports = { createInvoice }