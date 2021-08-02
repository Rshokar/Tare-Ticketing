const Dispatch = require("../models/dispatch");
const User = require("../models/user");
const Job = require("../models/job");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");


const addRates = (req, res, next) => {
  const token = req.cookies.jwt;
  const contractor = req.body.contractor;

  if (contractor.length < 2) {
    res.send({
      status: "error",
      message: "Contractor name must be longer than two characters."
    })
    next();
  } else {
    jwt.verify(token, "butternut", (err, decodedToken) => {
      if (err) {
        res.send({
          status: "error",
          message: "Error decoding JWT token"
        })
      } else {
        User.findOne({ _id: decodedToken.id })
          .then((user) => {

            if (user.contractors == undefined) {
              user.contractors = {};
            }

            if (user.contractors[contractor] != undefined) {
              res.send({
                status: "error",
                message: "Contractor Already Exist."
              })
            } else {
              user.contractors[contractor] = {
                contractorRates: {
                  t: 0,
                  t2p: 0,
                  t3p: 0,
                  t3tf: 0,
                  t4tf: 0,
                  t4ed: 0,
                  tri: 0,
                  tri2p: 0,
                  tri3p: 0,
                  tri3tf: 0,
                  tri4tf: 0,
                  tri4ed: 0,
                },
                operatorRates: {
                  tonnage: 0,
                  perLoad: 0,
                  t: 0,
                  t2p: 0,
                  t3p: 0,
                  t3tf: 0,
                  t4tf: 0,
                  t4ed: 0,
                  tri: 0,
                  tri2p: 0,
                  tri3p: 0,
                  tri3tf: 0,
                  tri4tf: 0,
                  tri4ed: 0,
                }
              }
              user.markModified("contractors");
              user.save((err) => {
                if (err) {
                  res.send({
                    status: "error",
                    message: "Error Saving Contractor."
                  })
                } else {
                  res.send({
                    status: "success",
                    message: "Contractor has been added."
                  })
                  next();
                }
              })
            }
          })
      }
    })
  }
}


const updateEmployee = (req, res, next) => {
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
              next()
            } else if (result) {
              res.send({ message: "Email Already Exist" })
              next()
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
              next()
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
                  next()
                })
            })
          })
        }
      })
  })
}

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


module.exports = { addRates, updateEmployee };