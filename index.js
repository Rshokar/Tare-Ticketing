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
app.get("/", (req, res) => {
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

  jwt.verify(token, "butternut", (err, decodedToken) => {
    console.log(decodedToken);

    if (decodedToken.type == 'dispatcher') {
      Dispatch.find({
        dispatcher: { id: decodedToken.id, company: decodedToken.company }
      }).then((result) => {
        console.log(result)
        res.render("dashboard", { page: pageName, dispatches: result, user: decodedToken })
      })
    } else {
      Job.find({
        "operator.id": decodedToken.id
      }).then((jobs) => {

        let ticketStatus = {
          sent: 0,
          confirmed: 0,
          active: 0,
        }

        jobs.forEach((job) => {
          if (job.status == "sent") {
            ticketStatus.sent++;
          } else if (job.status == "confirmed") {
            ticketStatus.confirmed++;
          } else if (job.status == "active") {
            ticketStatus.active++;
          }
        })

        console.log("Ticket Status", ticketStatus);
        res.render("dashboard", { page: pageName, jobs: jobs, ticketStatus: ticketStatus, user: decodedToken })
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
    console.log(decodedToken)
    res.render("account",
      {
        page: pageName,
        user: {
          name: decodedToken.name,
          company: decodedToken.company,
          type: decodedToken.type
        },
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
  let pageName = "Tickets";
  res.render("tickets", { page: pageName });
})

/**
 * This route will return the appropriate HTML for the dispatch page. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/dispatch", authenticate, (req, res) => {
  const dispatchId = req.query.id;
  const pageName = "Dispatch Ticket";

  Dispatch.findOne({ _id: dispatchId })
    .then((result) => {
      console.log(result);
      res.render("dispatch", { page: pageName, dispatch: result });
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
      _id: jobTicket
    })
      .then((result) => {
        res.render("job", { page: pageName, job: result, user: decodedToken });
      })
  })
})

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
 * the dispatch ticket if it exist
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 26 2021
 */
app.post("/activate_job_ticket", TicketController.activateJobTicket, (req, res) => {
  res.send({
    status: "success",
    message: "Nice ajax call"
  });
})

/**
 * This route will return the appropriate HTML for the load ticket page. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/load", authenticate, (req, res) => {
  let pageName = "Load Ticket";
  res.render("load", { page: pageName });
})

/**
 * This route will return the appropriate HTML for the creating a new dispatch. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/new_dispatch", authenticate, (req, res) => {
  let pageName = "New Dispatch";
  res.render("new_dispatch", { page: pageName });
})

/**
 * This route will return the appropriate HTML for adding operators to a dispatch. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date Jun 16 2021 
 */
app.get("/add_operators", authenticate, (req, res) => {
  let pageName = "Add Operators";
  res.render("add_operators", { page: pageName });
})

/**
 * This route is will return the appropriate HTML for previewing an dispatch before 
 * it is made
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
app.get("/dispatch_preview", authenticate, (req, res) => {
  let pageName = "Dispatch Preview";
  res.render("dispatch_preview", { page: pageName });
})

/**
 * This route is responsible to creating a dispatch and the appropriate job tickets
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
app.post("/submit_dispatch", authenticate, TicketController.createDispatch, (req, res) => {
  res.send({ status: "success", message: "Succesfull Ajax call" })
})

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
app.post("/update_employee", authenticate, async (req, res) => {
  let token = req.cookies.jwt;
  let empId = req.query.id;
  let empEmail = req.body.email;

  jwt.verify(token, "butternut", (err, decodedToken) => {
    User.findOne({ _id: empId })
      .then(emp => {
        emp.phone = req.body.phone;
        emp.fName = req.body.fName;
        emp.lName = req.body.lName;
        if (empEmail == emp.email) {
          emp.email = req.body.email;
        } else {
          User.exists({ email: empEmail }, function (err, result) {
            if (err) {
              res.send({ message: "Error Updating Employee" })
            } else if (result) {
              res.send({ message: "Email Already Exist" })
            } else {
              emp.email = req.body.email;
            }
          })
        }

        updateEmp(emp, decodedToken);

        if (req.body.secretSauce.trim() == "") {
          emp.save()
            .then(() => {
              res.redirect("/employees");
            })
        } else {
          bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(req.body.secretSauce, salt, function (err, hashedPassword) {
              console.log("Password", hashedPassword);
              emp.password = hashedPassword;
              console.log("Employee", emp);
              emp.save()
                .then(() => {
                  res.redirect("/employees");
                })
            })
          })
        }
      })
  })
})



async function updateEmp(emp, decodedToken) {
  User.findOne({ _id: decodedToken.id })
    .then(user => {
      for (let i = 0; i < user.employees.length; i++) {
        if (user.employees[i].id.equals(emp._id)) {
          user.employees[i].fName = emp.fName;
          user.employees[i].lName = emp.lName;
          user.employees[i].phone = emp.phone;
          user.markModified("employees");
          user.save();
        }
      }
    })
}

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



//App Listen.
app.listen(8000, () => console.log("App available on http://localhost:8000"));