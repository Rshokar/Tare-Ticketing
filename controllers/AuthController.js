const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const cookieParser = require("cookie-parser");
const UserObject = require("../Objects/user/User");
const EmployeObject = require("../Objects/user/Employee");
const DispatcherObject = require("../Objects/user/Dispatcher");
const AuthController = require("../Objects/AuthController");

/**
 * This function is responsible for registering users. 
 * @author Ravinder Shokar 
 * @version 1.1
 * @date Oct 11 2021
 */
const register = async (req, res, next) => {
  let user = new UserObject(req.body);
  let password = req.body.secretSauce;

  try {
    user.validateUser();
    await AuthController.doesEmailAlreadyExist(user.email);
    AuthController.validatePassword(password);
    await AuthController.registerUser(user, password);
    next();
  } catch (e) {
    console.log(e);
    res.send({ message: e.message });
  }
}

/**
 * This function is responsible for logging in new users. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Oct 21 2021
 */
const login = async (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;
  let user;

  try {
    UserObject.validateEmail(email)
    user = await AuthController.doesUserExistWithEmail(email);
    await AuthController.comparePasswords(password, user.password);
    const token = jwt.sign(
      {
        id: user._id,
        type: user.type,
        name: user.fName + " " + user.lName,
        company: user.company,
      }, "butternut", { expiresIn: 24 * 60 * 60 });
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 24 * 24 * 60 * 1000
    });
    next();
  } catch (e) {
    console.log(e);
    res.send({ status: "Error", err: { code: e.code, message: e.message } })
  }
}

/**
 * This function is responsible for registering employees. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Oct 21 2021
 */
const registetEmp = async (req, res, next) => {
  const TYPE = "employee";
  let token = req.cookies.jwt
  let email = req.body.email;
  let password = req.body.password;
  req.body.password = undefined;
  let employee = new EmployeObject(req.body);
  let decodedToken;

  try {
    decodedToken = await AuthController.verifyJWTToken(token);
    employee.employer = decodedToken.id;
    employee.type = TYPE;
    employee.validateUser();
    AuthController.validatePassword(password);
    await AuthController.doesEmailAlreadyExist(employee.email);
    employee.id = await AuthController.registerUser(employee, password);
    await DispatcherObject.addEmployee(decodedToken.id, employee);
    next();
  } catch (e) {
    console.log(e);
  }
}

/**
 * This function is responsible for deleting employees from dispatcher registration and 
 * the employee account
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Jun 7 2021 
 */
const deleteEmp = async (req, res, next) => {
  const empId = req.body.empID;
  const token = req.cookies.jwt;
  let employees;

  jwt.verify(token, 'butternut', async (err, decodedToken) => {
    if (err) {
      console.log("failure to verify JWT");
      res.send({
        status: "error",
        message: "Error finding current user ID."
      })
    }
    User.findOne({ _id: decodedToken.id })
      .then(user => {
        if (user) {
          for (let emp in user.employees) {
            if (user.employees[emp].id == empId) {
              user.employees.splice(emp, 1);
            }
          }

          User.deleteOne({ _id: empId }, (err, res) => {
            if (err) {
              res.send({
                message: "Error finding employee",
                status: "error"
              })
            }
            console.log(res);
            user.save();
            next();
          })
        } else {
          console.log("Error finding dispatcher");
          res.send({
            status: "error",
            message: "Error finding dispatcher"
          })
        }
      })
      .catch(err => {
        console.log(err);
        res.send({
          status: "error",
          message: "Error finding dispatcher"
        })
      })
  })

}

/**
 * This function is responsible for adding the employee to the dispatchers document. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date May 23 2021
 * @param emp is the employee being added to dispatcher document. 
 */
async function addEmp(emp, token) {
  return new Promise(res => {
    jwt.verify(token, "butternut", (err, decodedToken) => {
      User.findOne({ _id: decodedToken.id })
        .then(user => {

          let employee = {
            fName: emp.fName,
            lName: emp.lName,
            phone: emp.phone,
            id: emp._id,
          }
          user.employees.push(employee);

          user.save()
            .then(() => {
              res(user.company)
            })
            .catch(e => {
              console.log(e)
            });
        })
    })
  })

}

/**
 * This function is responsible for removing the employee from the dispatcher document 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Jun 7 2021
 */
async function removeEmp(empId, token) {
}

module.exports = {
  register, login, registetEmp, deleteEmp
}