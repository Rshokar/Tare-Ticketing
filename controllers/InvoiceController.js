const Invoice = require("../models/invoice");
const TicketController = require("./TicketController");
const UserController = require("./UserController");
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const { ObjectId } = require("mongodb");
const fs = require('fs');
const PDFDocument = require("pdfkit");


/**
 * Creates an Invoice
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 10 2021
 */
const createInvoice = async (req, res, next) => {
  const COMPLETE = "complete";
  const token = req.cookies.jwt;
  const query = req.body;

  let jobs = []
  let status, inv;

  jwt.verify(token, "butternut", async (err, decodedToken) => {
    if (err) {
      res.send({ staus: "error", err: { code: 'form', message: "Error decoding token." } })
      next();
    } else {
      try {
        status = await validateInvoiceQuery(query);
        inv = await newInvoice(query, decodedToken.id);
        jobs = await TicketController.getJobTickets(query, decodedToken.id, decodedToken.type, COMPLETE);
        inv = await buildInvoice(jobs, inv, query.type);
        console.log(inv)
        inv.save();
        res.send({
          status: "success",
          message: "Successfully built Invoice. Select which format you would like.",
          result: {
            inv
          }
        })
      } catch (err) {
        console.log('The Error', err);
        if (err.code === "clarify_rate") {
          getDispatch(jobs.dispatchTicket)
            .then((disp) => {
              res.send({
                status: "error", err, result: {
                  dispatch: disp
                }
              })
            })
        } else {
          res.send({ status: "error", err });
          next();
        }

      }
    }
  })
}

/**
 * Removes unneccesary keys from LST
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 12 2021
 * @param { Array } lst of rows  
 * @returns An array of rows
 */
function arrayConvertToJSON(lst) {
  let temp = [];
  for (let i = 0; i < lst.length; i++) {
    temp.push(lst[i].toJSON());
  }
  return temp;
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
 * @param { String } type Customer type. 
 * @returns { Promise }
 */
function buildInvoice(jobs, inv, type) {
  return new Promise((res, rej) => {
    inv.total = 0;
    for (let i = 0; i < jobs.length; i++) {
      if (jobs[i].rates.hourly) {
        buildHourlyRow(jobs[i], type).then((row) => {
          inv.total += row.total;
          inv.i.push(row);
        })
          .catch((err) => { console.log(err); rej(err) });
      } else {

        if (jobs[i].rates.tonnage) {
          buildTonnageRows(jobs[i], type).then(([rows, total]) => {
            inv.total += total;
            inv.i.push(...rows);
          }).catch((err) => { console.log(err); rej(err); });
        }

        if (jobs[i].rates.perLoad) {
          buildPerLoadRows(jobs[i], type).then(([rows, total]) => {
            inv.total += total;
            inv.i.push(...rows);
          }).catch((err) => { console.log(err); rej(err); });
        }
      }
    }
    console.log('Finished Invoice', inv)
    res(inv);
  })
}

/**
 * Builds hourly rows
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 10 2021
 * @param { Job } j Job tickets
 * @param { String } t Invoice type
 * @returns { Promise } Resolves with a row
 */
function buildHourlyRow(j, t) {
  return new Promise((res, rej) => {
    const MSINHOUR = 3600000;
    let rate, key;
    amount = Math.round(((j.finish - j.start) / MSINHOUR) * 100) / 100;
    [rate, key] = getHourlyRate(j, t);

    if (rate === 0) {
      rej({ code: "clarify_rate", message: { dispId: j.dispatch, type: "hourly", key } })
      return;
    } else {
      row = {};
      res({
        date: j.date.toLocaleDateString(),
        truck: j.operator.name,
        load: j.loadLocation,
        dump: j.dumpLocation,
        amount: amount,
        rate: rate,
        total: parseFloat(((amount * rate) * 100).toFixed(2)) / 100,
      })
    }
  })
}

/**
 * Builds per load rows
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 10 2021
 * @param { Job } j Job tickets
 * @param { String } t Invoice type
 * @return  { Promise } Resolves with rows.
 */
function buildPerLoadRows(job, t) {
  return new Promise((res, rej) => {
    const rates = job.rates.perLoad.rates;
    const fee = job.rates.perLoad.fee;
    const loads = job.loadTickets;

    let rows = [];
    let total = 0;

    for (let i = 0; i < loads.length; i++) {
      for (let j = 0; j < rates.length; j++) {
        if (loads[i].loadLocation === rates[j].l && loads[i].dumpLocation === rates[j].d) {
          if (t === "contractor") {
            rate = rates[j].r;
          } else if (t === "dispatcher" || t === "operator") {
            rate = (job.dispatcher.id !== undefined ? (rates[j].r - (rates[j].r * (fee / 100).toFixed(2))) : rates[j].r)
          }

          if (rate === 0) {
            rej({ code: "clarify_rate", message: { dispId: j.dispatch, type: "perLoad", rateIndex: j } })
            return;
          } else {
            total += rate;
            rows.push({
              date: loads[i].loadTime.toLocaleDateString(),
              truck: job.operator.name,
              load: loads[i].loadLocation,
              dump: loads[i].dumpLocation,
              amount: 1,
              rate: rate,
              total: rate
            })
            j = rates.length;
          }
        }
      }
    }
    res([rows, total]);
  })
}


/**
 * Builds tonnage rows
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 11 2021
 * @param { Job } j Job tickets
 */
function buildTonnageRows(job, t) {
  return new Promise((res, rej) => {
    const rates = job.rates.tonnage.rates;
    const fee = job.rates.tonnage.fee;
    const loads = job.loadTickets;

    let rows = [];
    let total = 0;
    let temp = 0;

    for (let i = 0; i < loads.length; i++) {
      for (let j = 0; j < rates.length; j++) {
        if (loads[i].loadLocation === rates[j].l && loads[i].dumpLocation === rates[j].d) {
          if (t === "contractor") {
            rate = rates[j].r;
          } else if (t === "dispatcher" || t === "operator") {
            rate = (job.dispatcher.id !== undefined ? (rates[j].r - (rates[j].r * (fee / 100).toFixed(2))) : rates[j].r)
          }

          if (rate === 0) {
            rej({ code: "clarify_rate", message: { dispId: j.dispatch, type: "tonnage", rateIndex: j } })
            return;
          } else {
            temp = parseFloat((loads[i].tonnage * rate).toFixed(2));
            total += temp;

            rows.push({
              date: loads[i].loadTime.toLocaleDateString(),
              truck: job.operator.name,
              load: loads[i].loadLocation,
              dump: loads[i].dumpLocation,
              amount: loads[i].tonnage,
              rate: rate,
              total: temp,
            })
            j = rates.length;
          }
        }
      }
    }
    res([rows, total]);
  })
}

/**
 * Gets hourly rate dependent on job equipment
 * @author Ravinder Shokar
 * @version 1.0 
 * @date Aug 10 2021
 * @param { JSON } j
 * @param { String } type operator || contractor
 * @retuurn The hourly rate. 
 */
function getHourlyRate(j, type) {
  let rate = 0;
  let key = "";
  let rates = (type === "contractor" ? j.rates.hourly.cont : j.rates.hourly.oper);
  if (j.equipment.truck === "Tandem") {
    if (j.equipment.trailer === "default") {
      key = "t"
      rate = rates.t;
    } else if (j.equipment.trailer === "2-axle-pony") {
      key = "t2p"
      rate = rates.t2p;
    } else if (j.equipment.trailer === "3-axle-pony") {
      key = "t3p"
      rate = rates.t3p;
    } else if (j.equipment.trailer === "3-axle-transfer") {
      key = "t3tf"
      rate = rates.t3tf;
    } else if (j.equipment.trailer === "4-axle-transfer") {
      key = "t4tf"
      rate = rates.t4tf;
    } else if (j.equipment.trailer === "4-axle-end-dump") {
      key = "t4ed"
      rate = rates.t4ed;

    }

  } else if (j.equipment.truck === "triaxle") {
    if (j.equipment.trailer === "default") {
      key = "tri"
      rate = rates.tri;
    } else if (j.equipment.trailer === "2-axle-pony") {
      key = "tri2p"
      rate = rates.tri2p;
    } else if (j.equipment.trailer === "3-axle-pony") {
      key = "tri3p"
      rate = rates.tri3p;
    } else if (j.equipment.trailer === "3-axle-transfer") {
      key = "tri3tf"
      rate = rates.tri3tf;
    } else if (j.equipment.trailer === "4-axle-transfer") {
      key = "tri4tf"
      rate = rates.tri4tf;
    } else if (j.equipment.trailer === "4-axle-end-dump") {
      key = "tri4ed"
      rate = rates.tri4ed;
    }
  }
  return [rate, key];
}


/**
 * Gets a new invoice
 * @author Ravinder Shokar 
 * @version 1.0
 * @date Aug 3 2021
 * @param { JSON } q Invoice query
 * @param { String } id User Id
 * @return { Promise }
 */
function newInvoice(q, id) {
  return new Promise(async (res, rej) => {
    let user = {};
    let customer = {};
    let inv, tempUser, tempCutomer;

    try {
      tempUser = (await UserController.getUser(id))._doc;
      user["name"] = tempUser.company;
      user["id"] = tempUser._id;
      user["billingAddress"] = tempUser.address;
      if (q.type === "operator") {
        tempCutomer = await UserController.getUserByName(q.customer, (tempUser.type === "operator" ? "dispatcher" : "operator"));
        customer["name"] = tempCutomer.company;
        customer["id"] = tempCutomer._id;
        customer["billingAddress"] = tempCutomer.address;
      } else {
        customer["name"] = q.customer
        customer["billingAddress"] = tempUser.contractors[q.customer].billingAddress;
      }
      inv = new Invoice({
        user,
        customer,
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

/**
 * Gets an invoice
 * @author Ravinder Shokar 
 * @vesrion 1.0 
 * @date Aug 12 2021 
 * @param { String } id Invoice id
 * @return { Promise } Invoice
 */
function getInvoice(id) {
  return new Promise((res, rej) => {
    Invoice.findOne({
      _id: ObjectId(id)
    })
      .then(inv => {
        if (inv === null) {
          rej({ status: "error", message: "Error finding invoice" })
        } else {
          res(inv);
        }
      })
  })
}



/**
 * Builds PDF invoice
 * @author Ravinder Shokar 
 * @version 1.0
 * @date Aug 8 2021
 * @param  { JSON } inv invocie
 * @param { String } path where to save pdf
 */
const buildPDFInvoice = (rows, inv, path) => {
  let user, bottom;
  return new Promise(async res => {

    const writeStream = fs.createWriteStream(path);
    let doc = new PDFDocument({ margin: 50, compress: false });
    generateHeader(doc, inv);
    generateCustomerInformation(doc, inv);
    bottom = generateInvoiceTable(doc, rows, inv);
    generateFooter(doc, bottom);
    doc.end();

    doc.pipe(writeStream);

    writeStream.on("finish", () => {
      res();
    })
  })
}



/**
 * Generates header
 * @param { PDFDocument } doc PDF Document
 * @param { User } user user  
 */
function generateHeader(doc, inv) {
  let user = inv.user
  let add = user.billingAddress.city + " "
    + user.billingAddress.province + " "
    + user.billingAddress.country + " "
    + user.billingAddress.postal;
  doc
    .image("./static/images/logo.jpg", 50, 45, { width: 50 })
    .fillColor("#444444")
    .fontSize(20)
    .text(inv.user.company, 110, 57)
    .fontSize(10)
    .text(inv.user.company, 200, 50, { align: "right" })
    .text(inv.user.billingAddress.address, 200, 65, { align: "right" })
    .text(add, 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  // Temp shipping data
  const SHIPPING = invoice.customer.billingAddress;
  const DATE = invoice.dateRange.start.toLocaleDateString()

  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoice._id, 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(DATE, 150, customerInformationTop + 15)
    .text("Balance Due:", 50, customerInformationTop + 30)
    .text(
      formatCurrency(invoice.total),
      150,
      customerInformationTop + 30
    )

    .font("Helvetica-Bold")
    .text(invoice.customer.name, 300, customerInformationTop)
    .font("Helvetica")
    .text(SHIPPING.address, 300, customerInformationTop + 15)
    .text(
      SHIPPING.city +
      ", " +
      SHIPPING.province +
      ", " +
      SHIPPING.country,
      300,
      customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, rows, inv) {
  const BOTTOM = 720
  const invoiceTableTop = 330;
  let i, count;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Date",
    "Item",
    "Description",
    "Unit Cost",
    "Quantity",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  count = 1;
  for (i = 0; i < rows.length; i++) {
    const item = rows[i];
    let position = invoiceTableTop + (i + 1) * 30;
    if (position % BOTTOM === 0) {
      count = 0;
      doc.addPage();
    }
    if (position >= BOTTOM) {
      count++;
      position = count * 30;
    }
    const description = item.load + " - " + item.dump;
    generateTableRow(
      doc,
      position,
      item.date,
      item.truck,
      description,
      formatCurrency(item.rate),
      item.amount,
      formatCurrency(item.total)
    );

    generateHr(doc, position + 20);
  }

  let subtotalPosition = invoiceTableTop + (i + 1) * 30;
  if (subtotalPosition > BOTTOM) {
    count++;
    if (((count) * 30) > BOTTOM) {
      count = 1
    }
    subtotalPosition = count * 30
  }

  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal",
    "",
    formatCurrency(inv.total)
  );

  // const paidToDatePosition = subtotalPosition + 20;
  // generateTableRow(
  //   doc,
  //   paidToDatePosition,
  //   "",
  //   "",
  //   "Paid To Date",
  //   "",
  //   formatCurrency(invoice.paid)
  // );

  // const duePosition = paidToDatePosition + 25;
  // doc.font("Helvetica-Bold");
  // generateTableRow(
  //   doc,
  //   duePosition,
  //   "",
  //   "",
  //   "Balance Due",
  //   "",
  //   formatCurrency(invoice.subtotal - invoice.paid)
  // );
  doc.font("Helvetica");
  if (subtotalPosition + 30 % BOTTOM === 0) {
    doc.addPage();
    return 0;
  }
  return (subtotalPosition + 30)
}

function generateFooter(doc, bottom) {
  doc
    .fontSize(10)
    .text(
      "Payment is due within 15 days. Thank you for your business.",
      50,
      bottom,
      { align: "center", width: 500 }
    );
}

function generateTableRow(
  doc,
  y,
  date,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(date, 50, y)
    .text(item, 120, y)
    .text(description, 240, y)
    .text(unitCost, 350, y, { width: 90, align: "right" })
    .text(quantity, 410, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatCurrency(cents) {
  return "$" + (cents).toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

module.exports = { createInvoice, getInvoice, arrayConvertToJSON, buildPDFInvoice }