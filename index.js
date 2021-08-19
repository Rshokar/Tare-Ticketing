"use strict";
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");

const { readFile } = require('fs');
const mongoose = require('mongoose').set('debug', true);;
const ObjectId = require('mongodb').ObjectId;
const ejsLint = require('ejs-lint');
const ObjectsToCsv = require("objects-to-csv");
const zip = require('express-zip');

const app = express();

mongoose.connect("mongodb+srv://gross:GjRoH10TY93a2Wme@testforgross.inl6e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
).catch(error => console.log(error))



app.use("/js", express.static("static/js"));
app.use("/css", express.static("static/css"));
app.use("/html", express.static("static/html"));

app.use(expressLayouts)
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const AuthController = require("./controllers/AuthController");
const TicketController = require("./controllers/TicketController");
const UserController = require("./controllers/UserController");
const InvoiceController = require("./controllers/InvoiceController");
const authenticate = require("./middleware/authenticate");
const User = require("./models/user");
const Dispatch = require("./models/dispatch");
const Job = require("./models/job")
const { decode } = require("punycode");
const { update } = require("./models/user");


/**
 * This is the route that returns index.html. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date MAy 16 2021
 */
app.get("/", authenticate, (req, res) => {
  res.render("index", {
    page: "Index"
  });
})

/**
 * This route will return the HTML for dashboard page
 * @author Ravinder Shokar 
 * @versio 1.0 
 * @date May 16 2021
 */
app.get("/dashboard", authenticate, (req, res) => {
  const pageName = "Dashboard";
  const token = req.cookies.jwt;

  res.url = "/account";
  jwt.verify(token, "butternut", (err, decodedToken) => {

    if (decodedToken.type == 'dispatcher') {
      Dispatch.find({
        $and: [
          { "dispatcher.id": decodedToken.id },
          {
            $or: [{ "status.empty": { $gt: 0 } }, { "status.sent": { $gt: 0 } }, { "status.active": { $gt: 0 } }, { "status.confirmed": { $gt: 0 } }]
          }
        ]
      }).then((result) => {
        res.render("dashboard", { page: pageName, dispatches: result, user: decodedToken })
      })
    } else {
      Job.find({
        $and: [
          { "operator.id": decodedToken.id },
          { $or: [{ status: "sent" }, { status: "confirmed" }, { status: "active" }] }
        ]
      }).then((jobs) => {
        ejsLint("dashboard")
        res.render("dashboard", { page: pageName, jobs: jobs, user: decodedToken })
      })
    }
  })
})

/**
 * This route will return the HTML for the account page 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 18 2021
 */
app.get("/account", authenticate, (req, res) => {
  let pageName = "Account"
  let token = req.cookies.jwt;

  jwt.verify(token, "butternut", (err, decodedToken) => {
    res.render("account",
      {
        page: pageName,
        user: decodedToken,
      })
  })
})


/**
 * This route is responsible for returning the HTML appropriate 
 * for the contractors page
 * @author Ravidner Shokar 
 * @vesrion 1.0 
 * @date July 11 2021
 */
app.get("/contractors", authenticate, (req, res) => {
  let pageName = "Contractors";
  let token = req.cookies.jwt;

  jwt.verify(token, "butternut", (err, decodedToken) => {
    if (err) {
      res.sendStatus(404);
    } else {
      User.findOne({
        _id: decodedToken.id
      }).then((user) => {
        res.render("contractors",
          {
            page: pageName,
            user: decodedToken,
            contractors: user.contractors,
          })
      })

    }

  })
})

/**
 * This function is responsible for adding a contractor to an dispatcher or 
 * operator account. The contractors rate will be set to 0
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 17 2021  
 */
app.post("/add_contractor", UserController.addRates, (req, res) => {
})

/**
 * This route gets the contractor data and renders the appropriate HTML 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 12 2021
 */
app.get("/contractor", authenticate, (req, res) => {
  const pageName = "Contractor";
  const token = req.cookies.jwt;
  let contractor;

  console.log("Inputed Contractor", req.query.contractor);
  jwt.verify(token, "butternut", (err, decodedToken) => {
    if (err) {
      res.sendStatus(404);
    }
    User.findOne({ _id: decodedToken.id })
      .then((user) => {
        for (let cont in user.contractors) {
          if (cont == req.query.contractor) {
            res.render("contractor", {
              page: pageName,
              user: decodedToken,
              contRates: user.contractors[cont].contractorRates,
              opRates: user.contractors[cont].operatorRates,
            })
          }
        }
      })

  })
})

/**
 * This route is responsible for updating a contractors operator rates
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 17 2021
 */
app.post("/update_operator_rates", (req, res) => {
  const token = req.cookies.jwt;
  const contractor = req.body.contractor;
  const rates = req.body.rates;

  jwt.verify(token, "butternut", (err, decodedToken) => {
    if (err) {
      res.send({
        status: "error",
        message: "Error verifying JWT token"
      })
    } else {
      User.findOne({ _id: decodedToken.id })
        .then((user) => {
          user.contractors[contractor].operatorRates = rates;
          console.log(user.contractors[contractor])
          user.markModified("contractors");
          user.save();
          res.send({
            status: "success",
            message: "Updated Operators Rates."
          })
        })

    }
  })
})

/**
 * This route is responsible for updating a contractors 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 17 2021
 */
app.post("/update_contractor_rates", (req, res) => {
  const token = req.cookies.jwt;
  const contractor = req.body.contractor;
  const rates = req.body.rates;

  jwt.verify(token, "butternut", (err, decodedToken) => {
    if (err) {
      res.send({
        status: "error",
        message: "Error verifying JWT token"
      })
    } else {
      User.findOne({ _id: decodedToken.id })
        .then((user) => {
          user.contractors[contractor].contractorRates = rates;
          console.log(user.contractors[contractor])
          user.markModified("contractors");
          user.save();
          res.send({
            status: "success",
            message: "Updated Contractor Rates."
          })
        })

    }
  })
})


/**
 * This route is responsible for rendering the HTML page for my account info. On this page 
 * the user will be able to edit and view accound info 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 28 2021
 */
app.get("/my_settings", authenticate, (req, res) => {
  const token = req.cookies.jwt;
  const pageName = "My Settings"

  jwt.verify(token, "butternut", (err, decodedToken) => {
    User.findOne({
      _id: decodedToken.id
    }).then((user) => {
      if (user == null) {
        res.render('layout')
      } else {
        res.render("my_settings", { user: decodedToken, page: pageName, userAccount: user })
      }
    })
  })
})


/**
 * This route will return the appropriate HTML for the login page. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 18 2021
 */
app.get("/login", (req, res) => {
  readFile("static/html/login.html", "utf-8", (err, html) => {
    if (err) {
      throw err;
    }
    res.send(html);
  })
})

/**
 * This route is responsible for logging users out of. This route will change the JWT tokenn 
 * age to 0 thus destroying it. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date MAy 23 2021
 */
app.get("/logout", (req, res) => {
  res.cookie('jwt', { maxAge: 0 });
  res.redirect('/login');
});

/**
 * This route is responsible for logging in new users. It will compare passwords 
 * and if valid insert Json Web Token into cookies containing user_ID and user_type.
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date May 23 2021
 */
app.post("/login_user", AuthController.login, (req, res) => {
  res.redirect("/dashboard")
})

/**
 * This route will return the appropriate HTML for the register page. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 19 2021
 */
app.get("/register", (req, res) => {
  readFile("static/html/register.html", "utf-8", (err, html) => {
    if (err) {
      throw err;
    }
    res.send(html);
  })
})

/**
 * This route is repsonsible for regustering a new user and then redirecting to the login
 * page.
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date May 23 2021 
 */
app.post("/register_user", AuthController.register, (req, res) => {
  res.redirect("/login")
})

/**
 * This route will return the appropriate HTML for the tickets page. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/tickets", authenticate, (req, res) => {
  const token = req.cookies.jwt;

  jwt.verify(token, "butternut", (err, decodedToken) => {
    if (err) {
      console.log(err);
      res.send({
        status: "error",
        message: "error decoding JWT"
      })
    }

    if (decodedToken.type == "dispatcher") {
      Dispatch.find({
        $and: [{ "dispatcher.id": decodedToken.id }, { "status.complete": { $gt: 0 } }, { "status.sent": 0 }, { "status.active": 0 }]
      })
        .then((dispatches) => {
          Job.find({
            $and: [
              { "dispatcher.id": decodedToken.id },
              { status: "complete" }

            ]
          })
            .then((jobs) => {

              const pageName = "Tickets";
              res.render("tickets", { page: pageName, dispatches, jobs, user: decodedToken });
            })
        })
    } else {
      Job.find({
        $and: [{ "operator.id": decodedToken.id }, { status: "complete" }]
      })
        .then((jobs) => {
          console.log(jobs);
          const pageName = "Tickets";
          res.render("tickets", { page: pageName, jobs, user: decodedToken });
        })


    }


  })
})

/**
 * This route will return the appropriate HTML for the dispatch page. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/dispatch", authenticate, (req, res) => {
  const token = req.cookies.jwt;
  const dispatchId = req.query.id;
  const pageName = "Dispatch Ticket";

  jwt.verify(token, "butternut", (err, decodedToken) => {
    Dispatch.findOne({ _id: dispatchId })
      .then((result) => {
        console.log(result);
        res.render("dispatch", { page: pageName, dispatch: result, user: decodedToken });
      })
  })


})

/**
 * This route will return the appropriate HTML for the job page. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/job", authenticate, (req, res) => {

  const jobTicket = req.query.id;
  const token = req.cookies.jwt;
  let pageName = "Job Ticket";

  jwt.verify(token, "butternut", (err, decodedToken) => {
    Job.findOne({
      _id: new ObjectId(jobTicket)
    })
      .then((job) => {
        if (job == null) {
          res.send("Job ticket not found");
        } else {
          const [perLoadLocations, tonLoadLocations] = getLoadLocations(job);
          res.render("job", { page: pageName, job, user: decodedToken, perLoadLocations, tonLoadLocations });
        }
      })
  })
})


/**
 * This function will get all load locations for a job ticket. It will seperated 
 * by tonnage or load ticket 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 27 2021 
 * @param job Job ticket
 * @return An Array containing [perLoadLocations, tonnageLoadLocations]
 */
function getLoadLocations(job) {
  let perLst = [];
  let tonLst = []

  if (job.rates.perLoad !== undefined && job.rates.perLoad.rates !== undefined) {
    perLst = [...job.rates.perLoad.rates]
  }

  if (job.rates.tonnage !== undefined && job.rates.tonnage.rates !== undefined) {
    tonLst = [...job.rates.tonnage.rates];
  }

  if (perLst != []) {
    if (!(perLst.length <= 1)) {
      perLst = remLoadLocationDuplicates(perLst)
    }
  }

  if (tonLst != []) {
    if (!(tonLst.length <= 1)) {
      tonLst = remLoadLocationDuplicates(tonLst)
    }
  }

  return [perLst, tonLst]
}


var remLoadLocationDuplicates = (lst) => {
  for (let i = lst.length - 1; i > 0; i--) {
    for (let j = 0; j < i; j++) {
      if (lst[i].l == lst[j].l) {
        lst.splice(j, 1);

        i--
        j = -1;
      }
    }
  }

  return lst
}




/**
 * This fuction will gather the possible dump locations dependent on which loadId passed in 
 * job ticket
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 27 2021
 * @param job job Ticket
 * @param id load ticket ID
 */
function getDumpLocations(job, id) {
  const load = job.loadTickets[id];
  const per = "load";
  const ton = "ton";

  let dumpLocations = []

  const perRates = (job.rates.perLoad === undefined ? [] : [...job.rates.perLoad.rates]);
  const tonRates = (job.rates.tonnage === undefined ? [] : [...job.rates.tonnage.rates]);


  if (job.rates.hourly) {
    return [job.dumpLocation];
  } else if (load.type === ton) {
    for (let i = 0; i < tonRates.length; i++) {
      if (tonRates[i].l == load.loadLocation) {
        dumpLocations.push(tonRates[i].d)
      }
    }
  } else if (load.type === per) {
    for (let i = 0; i < perRates.length; i++) {
      if (perRates[i].l == load.loadLocation) {
        dumpLocations.push(perRates[i].d)
      }
    }
  }
  return dumpLocations
}


/**
 * This route is responsible for changing the status of a job ticket to confirmed and 
 * updating the dispatch ticket if it exist. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 26 2021
 */
app.post("/confirm_job_ticket", TicketController.confirmJobTicket, (req, res) => {
  res.send({
    status: "success",
    message: "Stauts has been updated"
  })
})

/**
 * This route is responsible for changing the status of a job to active and updating 
 * the parent dispatch ticket.
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 26 2021
 */
app.post("/activate_job_ticket", TicketController.activateJobTicket, (req, res) => {
  res.send({
    status: "success",
    message: "Job status updated"
  });
})

/**
 * This route is responsible for changing the status of a job ticket to complete and 
 * updating it parent dispatch ticket.
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 3 2021
 */
app.post("/complete_job_ticket", TicketController.completeJobTicket, (req, res) => {
})

/**
 * This route is responsible for adding a created load ticket to a job ticket
 * @author Ravinder Shokar 
 * @version 1.0
 * @date June 30 2021
 */
app.post("/submit_load_ticket", TicketController.submitLoadTicket, (req, res) => { })

/**
 * This route is responsible for finishing a load ticket. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 1 2021
 */
app.post("/finish_load_ticket", TicketController.finishLoadTicket, (req, res) => {
})


/**
 * This route is responsible for rendering the correct HTML for the purpose of editing 
 * a load ticket
 * @author Ravinder Shokar 
 * @vesrion 1.0 
 * @date July 2 2021
 */
app.get("/edit_load", authenticate, (req, res) => {
  const pageName = "Edit Load Ticket";
  const token = req.cookies.jwt;
  let job, perLoc, tonLoc, dumpLoc, load;

  jwt.verify(token, "butternut", (err, decodedToken) => {
    TicketController.getJob(req.query.id)
      .then((job) => {
        [perLoc, tonLoc] = getLoadLocations(job);
        dumpLoc = getDumpLocations(job, req.query.loadId);
        load = job.loadTickets[req.query.loadId];
        res.render("edit_load", {
          loadId: req.query.loadId,
          page: pageName,
          user: decodedToken,
          minDate: job.date + "T00:00",
          job,
          load,
          perLoc,
          tonLoc,
          dumpLoc,
          rateBools: getRateTypeObj(job),
        });
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(404)
      })
  })
})


/**
 * Get a JSON object that defines a job tickets type of rates
 * @author Ravinder Shokar
 * @version 1.0 
 * @date Aug 9 2021
 * @param { JSON } j job ticket
 */
const getRateTypeObj = (j) => {
  return {
    p: j.rates.perLoad !== undefined,
    t: j.rates.tonnage !== undefined,
    h: j.rates.hourly !== undefined
  }
}

/**
 * This route is responsible for editing a load ticket. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 2 2021
 */
app.post("/edit_load", TicketController.updateLoadTicket, (req, res) => {
})

/**
 * This route is responsible for deleting a load ticket 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 2 2021 
 */
app.post("/delete_load_ticket", TicketController.deleteLoadTicket, (req, res) => {
  res.send({
    status: "success",
    message: "Successfully deleted load ticket."
  })
})

/**
 * This route will return the appropriate HTML for the creating a new dispatch. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/new_dispatch", authenticate, (req, res) => {
  console.log(req.query)
  const token = req.cookies.jwt;
  let pageName = (req.query.edit ? "Edit Dispatch" : "New Dispatch");

  jwt.verify(token, "butternut", (err, decodedToken) => {
    User.findOne({ _id: decodedToken.id })
      .then((user) => {
        res.render("new_dispatch", { page: pageName, user: decodedToken, contractors: user.contractors });
      })

  })

})

/**
 * This route will return the appropriate HTML for adding operators to a dispatch. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date Jun 16 2021 
 */
app.get("/add_operators", authenticate, (req, res) => {
  const token = req.cookies.jwt;
  const pageName = (req.query.edit ? "Edit Operators" : "Add Operators")

  jwt.verify(token, "butternut", (err, decodedToken) => {
    res.render("add_operators", { page: pageName, user: decodedToken });
  })
})

/**
 * This route will return the appropraite HTML for adding rates to a dispatch ticket
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 13 2021
 */
app.get("/add_rates", authenticate, (req, res) => {
  const token = req.cookies.jwt;
  const pageName = (req.query.edit ? "Edit Rates" : "Add Rates")
  console.log(req.query);

  jwt.verify(token, "butternut", (err, decodedToken) => {
    if (err) {
      res.send("Error decoding JWT");
    } else {
      User.findOne({ _id: decodedToken.id })
        .then((user) => {
          console.log(req.query.contractor);
          const opRates = user.contractors[req.query.contractor].operatorRates;
          const contRates = user.contractors[req.query.contractor].contractorRates;
          res.render("add_rates", { page: pageName, user: decodedToken, opRates, contRates });
        })
    }

  })
})

/**
 * This route is will return the appropriate HTML for previewing an dispatch before 
 * it is made
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
app.get("/dispatch_preview", authenticate, (req, res) => {
  const token = req.cookies.jwt;

  jwt.verify(token, "butternut", (err, decodedToken) => {
    if (err) {
      res
    }
    let pageName = "Dispatch Preview";
    res.render("dispatch_preview", { page: pageName, user: decodedToken });
  })

})

/**
 * This route is responsible to creating a dispatch and the appropriate job tickets
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
app.post("/submit_dispatch", authenticate, TicketController.createDispatch, (req, res) => { })


/**
 * This route is responsible for updating a dispatch ticket and the 
 * corresponding job ticket 
 * @author Ravinder Shokar 
 * @vesrion 1.0 
 * @date Aug 16 2021
 */
app.post("/edit_dispatch", TicketController.editDispatch, (req, res) => { })

/**
 * This route will return the appropriate HTML for the employee page. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/employees", authenticate, (req, res) => {
  let token = req.cookies.jwt;
  let pageName = "Employees";

  jwt.verify(token, "butternut", (err, decodedToken) => {
    User.findOne({ _id: decodedToken.id })
      .then(user => {
        res.render("employees",
          {
            page: pageName,
            user: user,
          })
      })
  })
})

/**
 * This route will return the appropriate HTML for adding a new employee. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/new_employee", authenticate, (req, res) => {
  let token = req.cookies.jwt;
  let pageName = "New Employee";

  jwt.verify(token, "butternut", (err, decodedToken) => {
    res.render("new_employee",
      {
        page: pageName,
        user: {
          name: decodedToken.name,
          company: decodedToken.company
        }
      })
  })
})

/**
 * This route will serve the HTML neccesary to edit and delete employees. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date MAy 23 2021  
 */
app.get("/employee", authenticate, (req, res) => {
  const pageName = "Employee"
  let token = req.cookies.jwt;
  let id = req.query.id

  jwt.verify(token, "butternut", (err, decodedToken) => {
    User.findOne({ _id: id })
      .then(emp => {
        if (emp) {
          res.render("employee",
            {
              page: pageName,
              user: {
                name: decodedToken.name,
                company: decodedToken.company
              },
              employee: emp
            })
        } else {
          res.send({ message: "User Not Found" })
        }
      })
  })
})

/**
 * This route will serve the HTML neccesary to edit and delete employees. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date MAy 23 2021  
 */
app.post("/update_employee", authenticate, UserController.updateEmployee, (req, res) => {
})


/**
 * This route is responsible for registering new employees
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date May 24 2021
 */
app.post("/register_employee", AuthController.registetEmp, (req, res) => {
  res.send({ message: "Succesfully added employee", status: "success" });
})

/**
 * This route is reponsible for deleteing registered employees
 * @author Ravinder Shokar 
 * @version 1.0
 * @date Jun 7 2021
 */
app.post("/delete_employee", AuthController.deleteEmp, (req, res) => {
  res.send({ message: "Succesfully Deleted Employee", status: "success" });
})


/**
 * This route is responsible for getting all current users employees
 * @author Ravinder Shokar 
 * @version 1.0
 * @date June 21 2021  
 */
app.get("/get_employees", authenticate, (req, res) => {
  const token = req.cookies.jwt;

  jwt.verify(token, "butternut", (err, decodedToken) => {
    if (err) {
      res.send({
        status: "error",
        message: "Error verifying JWT"
      })
    }
    User.findOne({ "_id": decodedToken.id })
      .then((user) => {
        if (user) {
          res.send({
            status: "success",
            result: user.employees
          })
        }
      })
  })
})

/**
 * This route will return the appropriate HTML for the operator page. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/operators", authenticate, (req, res) => {
  let pageName = "Owner Operators";
  res.render("operators", { page: pageName });
})

/**
 * This route will return an array of operators dependent on the search 
 * parameters passed
 * @author Ravinder Shokar 
 * @version 1.0
 * @date June 21 2021 
 */
app.get("/search_operators", authenticate, (req, res) => {
  console.log(req.query.query);

  User.find({ $and: [{ company: { "$regex": req.query.query } }, { type: "operator" }] })
    .then((users) => {
      if (users) {
        res.send({
          status: "success",
          results: users
        })
        console.log(users);
      }
    })
})


/**
 * This function get a job ticket
 * @author Ravinder Shokar 
 * @vesion 1.0
 * @date July 27 2021
 */
app.get("/get_job", (req, res) => {
  const jobId = req.query.jobId;
  console.log(req.query)

  Job.findOne({
    _id: jobId
  })
    .then((job) => {
      if (job == null) {
        res.send({
          staus: "error",
          message: "No job ticket found"
        })
      } else {
        res.send({
          status: "success",
          job,
        })
      }
    })
})

app.get("/get_dispatch", authenticate, async (req, res) => {
  let disp;

  console.log(req.query);
  try {
    disp = await TicketController.getDispatch(req.query.id);
    res.send({
      status: "success",
      result: disp,
    })
  } catch (e) {
    console.log(e)
    res.send({
      status: "error",
      err: e
    })
  }
})


app.get("/invoicing", authenticate, (req, res) => {
  let pageName = "Invoicing";
  let token = req.cookies.jwt;
  let contractors = []

  jwt.verify(token, "butternut", (err, decodedToken) => {
    if (err) {
      res.sendStatus(404);
    } else {
      User.findOne({ _id: decodedToken.id })
        .then((user) => {
          if (user == null) {
            res.sendStatus(404);
          } else {

            res.render("invoice", {
              page: pageName,
              user: decodedToken,
              contractors: user.contractors
            })
          }
        })

    }
  })
})

app.post("/build_invoice", InvoiceController.createInvoice, (req, res) => {
})


app.get("/download", async (req, res) => {
  const CSVPATH = __dirname + "/invoices/csv/invoice.csv";
  const PDFPATH = __dirname + "/invoices/pdf/invoice.pdf";

  let inv, rows, csvInvoice;
  let csv = req.query.csv;
  let pdf = req.query.pdf;
  let csvName, pdfName;

  try {
    inv = await InvoiceController.getInvoice(req.query.id);
    rows = InvoiceController.convertToJSON(inv.i)


    if (csv === 'true') {
      csvInvoice = new ObjectsToCsv(rows);
      await csvInvoice.toDisk(CSVPATH);
      csvName = inv.customer + "_" + inv.dateRange.start.toLocaleDateString() + "_" + inv.dateRange.finish.toLocaleDateString() + ".csv";
    }
    if (pdf === "true") {
      await InvoiceController.buildPDFInvoice(rows, inv, PDFPATH);
      pdfName = inv.customer + "-_" + inv.dateRange.start.toLocaleDateString() + "_" + inv.dateRange.finish.toLocaleDateString() + ".pdf";
    }

    if (csv === "true" && pdf === "true") {
      console.log("Send PDF and CSV");
      return res.zip([{ path: CSVPATH, name: csvName }, { path: PDFPATH, name: pdfName }])
    } else if (pdf === "true") {
      return res.download(PDFPATH, pdfName);
    } else if (csv === "true") {
      return res.download(CSVPATH, csvName);
    }
  } catch (e) {
    console.log({ status: "error", err: e });
  }
})

//App Listen.
app.listen(8000, () => console.log("App available on http://localhost:8000"));