const Dispatch = require("../models/dispatch");
const User = require("../models/user");
const Job = require("../models/job");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');


const addRates = (req, res, next) => {
  const token = req.cookies.jwt;
  const cont = req.body.cont;
  let user;

  if (!cont || cont.length < 2) {
    res.send({ status: "error", message: "Contractor name must be longer than two characters." })
    next();
  } else {
    jwt.verify(token, "butternut", async (err, dT) => {
      if (err) {
        res.send({ status: "error", err: { code: "form", message: "error validating user." } });
        next()
      } else {
        try {
          user = await getUser(dT.id);
          contractors = user.contractors.toJSON()
          if (!contractors) {
            console.log("No contractors")
            contractors = {}
          }
          if (contractors[cont] !== undefined) {
            res.send({ status: "error", err: { code: "form", message: "Contractor already exist." } })
            next()
          } else {
            contractors[cont] = { contractorRates, operatorRates, billingAddress: {} }
            user.toJSON()["contractors"] = contractors;
            user.markModified("contractors")
            user.save(err => {
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
              }
              next()
            })
          }
        } catch (e) {
          console.log(e);
          res.send({ status: "error", err: e })
        }
      }
    })
  }

  var contractorRates = {
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
  var operatorRates = {
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


const updateEmployee = (req, res, next) => {
  let token = req.cookies.jwt;
  let disp;

  jwt.verify(token, "butternut", async (err, dT) => {
    if (err) {
      res.send({ status: "error", err: { code: "form", message: "error validating user." } })
    }
    else {
      try {
        emp = await getUser(req.body.empId);
        emp.phone = req.body.phone;
        emp.fName = req.body.fName;
        emp.lName = req.body.lName;

        if (emp.email !== req.body.email && !await userExistByEmail(req.body.email)) {
          emp.email = req.body.email;
        }
        console.log(req.body);
        disp = await updateDispatcher(emp, dT);

        if (req.body.password && req.body.password.trim() !== "") {
          emp.password = await hashPassword(req.body.password);
        }

        emp.save();
        disp.save();
        res.send({ status: "success", message: "Dispatcher and employee updated!" })
        next()
      } catch (e) {
        console.log(e)
        res.send({ status: "errorr", err: e })
        next()
      }
    }

    function updateDispatcher(emp, dT) {
      return new Promise((res, rej) => {
        User.findOne({ _id: dT.id })
          .then(user => {
            if (!user) { rej({ code: "form", message: "Error getting finding dispatcher" }) }
            else {
              for (let i = 0; i < user.employees.length; i++) {
                if (user.employees[i].id.equals(emp._id)) {
                  user.employees[i].fName = emp.fName;
                  user.employees[i].lName = emp.lName;
                  user.employees[i].phone = emp.phone;
                  user.markModified("employees");
                  res(user)
                }
              }
            }
          })
      })
    }
  })
}


/**
 * Checks if a user exist with dependent on email passed in
 * @version 1.0 
 * @date Aug 29 2021
 * @param { String } e email 
 * @param { Boolean } reject if true function will reject if false.
 * @returns { Boolean } true if user exist
 */
function userExistByEmail(e, reject) {
  return new Promise((res, rej) => {
    User.exists({ email: e }, function (err, result) {
      if (err) {
        rej({ code: "form", message: "Error Looking For User" })
      } else {
        if (reject && result) {
          rej({ code: "email", message: "Email already in use." })
        }
        res(result)
      }
    })
  })
}

function hashPassword(p) {
  return new Promise((res, rej) => {
    const ERR = { code: "form", message: "Error proccessing password" }
    bcrypt.genSalt(10, function (err, salt) {
      if (err) { rej(ERR) }
      bcrypt.hash(p, salt, function (err, hashedPassword) {
        if (err) {
          res.send(ERR)
        } else {
          res(hashedPassword);
        }
      })
    })
  })
}


const getUser = async (id) => {
  return new Promise((res, rej) => {
    User.findOne({
      _id: Object(id)
    })
      .then(user => {
        if (user === null) {
          rej({ code: "user", message: "Error finding user" });
        } else {
          res(user);
        }
      })
  })
}

const getUserByName = (company, type) => {
  return new Promise((res, rej) => {
    User.findOne({ company: company, type: type })
      .then(user => {
        if (!user) { rej({ code: "operator", message: "Could not find operator" }) }
        else { res(user) }
      })
  })
}

const updateContractorAddress = (req, res, next) => {
  let address = req.body.address;
  let contractor = req.body.contractor;
  let token = req.cookies.jwt;
  let found = false;
  let user, contractors;

  jwt.verify(token, "butternut", async (err, dT) => {
    if (err) {
      res.send({ status: "error", err: { code: "form", message: "Error validating user" } })
    }
    try {
      user = await getUser(dT.id);
      contractors = user.contractors.toJSON()
      if (user._doc["contractors"][contractor]) {
        user._doc["contractors"][contractor].billingAddress = address;
        user.markModified("contractors")
        await user.save()
        found = true;
        res.send({ status: "success", message: "Updated Contractor Billing Address" });
        next();
      }
      if (!found) {
        console.log("Hello")
        res.send({ status: "error", err: { code: "form", message: "Could not find contracotr" } });
        next()
      }
    } catch (e) {
      console.log(e)
      res.send({ status: "error", err: e })
    }
  })
}

const updateAddress = (req, res, next) => {
  let address = req.body.address;
  let token = req.cookies.jwt;
  let user;

  jwt.verify(token, "butternut", async (err, dT) => {
    if (err) { res.send({ status: "error", err: { code: "form", message: "error validating user." } }) }
    else {
      try {
        user = await getUser(dT.id);
        user["address"] = address;
        console.log(user)
        user.save()
          .then(() => {
            res.send({
              status: "success",
              message: "User updated succesfully"
            })
            next()
          })
          .catch(e => {
            console.log(e)
            res.send({ status: "error", err: { code: "form", message: "Error saving user. " } })
            next()
          })
      } catch (e) {
        res.send({ status: "error", erre })
        next()
      }
    }
  })
}


const updateUser = (req, res, next) => {
  let token = req.cookies.jwt;
  let u = req.body;
  let user;
  jwt.verify(token, "butternut", async (err, dT) => {
    if (err) { res.send({ status: "error", err: { code: "form", message: "Could not verify user" } }) }
    else {
      console.log(req.body);
      try {
        user = await getUser(dT.id);
        console.log("User before edit", user);
        user.fName = u.fName;
        user.lName = u.lName;
        user.phone = u.phone;
        if (user.email !== u.email && !await userExistByEmail(u.email, true)) {
          user.email = u.email;
        }
        if (u.password) { user.password = await hashPassword(u.password); }
        console.log("User after edit", user);
        user.save(err => {
          if (err) {
            res.send({ status: "error", err: { code: "form", message: "Error saving user." } })
          } else {
            res.send({ status: "success", message: "User updated!" })
          }
        })
      } catch (e) {
        console.log(e)
        res.send({ status: "error", err: e })
      }
      next()
    }
  })
}


module.exports = {
  addRates,
  updateEmployee,
  getUser,
  updateContractorAddress,
  updateAddress,
  updateUser,
  getUserByName
};