const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const cookieParser = require("cookie-parser");
const UserObject = require("../Objects/users/User");
const EmployeObject = require("../Objects/users/Employee");
const DispatcherObject = require("../Objects/users/Dispatcher");
const Authorizer = require("../Objects/Authorizer");
const EmployeeObject = require("../Objects/users/Employee");
const ValidationErrors = require("../Objects/ValidationErrors");

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
    await Authorizer.doesEmailAlreadyExist(user.email);
    Authorizer.validatePassword(password);
    await Authorizer.registerUser(user, password);
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
    user = await Authorizer.doesUserExistWithEmail(email);
    await Authorizer.comparePasswords(password, user.password);
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
const registerEmp = async (req, res, next) => {
  let token = req.cookies.jwt
  let password = req.body.password;
  req.body.password = undefined;
  let employee = new EmployeObject(req.body);

  try {
    let decodedToken = await Authorizer.verifyJWTToken(token);
    await Authorizer.doesEmailAlreadyExist(employee.email);
    employee.employer = decodedToken.id;
    employee.validateUser();
    Authorizer.validatePassword(password);
    employee.id = await Authorizer.registerUser(employee, password);
    res.send({ status: "success" })
    next();
  } catch (e) {
    console.log(e);
    res.send({ status: "error", err: { code: e.code, message: e.message } })
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
  let employee;


  try {
    let decodedToken = await Authorizer.verifyJWTToken(token);
    employee = await EmployeeObject.getUserWithId(empId, decodedToken.id);
    console.log(employee);
    if (employee.employer != decodedToken.id) {
      console.log("Made it inside of if check");
      throw new ValidationErrors.InvalidInputError("User and Employee do not match!");
    }
    console.log("Avoided if check");
    await employee.delete()
    next();
  } catch (e) {
    console.log(e);
    res.send({
      status: "error", err: {
        message: e.message,
        code: e.code,
      }
    });
  };
}


module.exports = {
  register, login, registerEmp, deleteEmp
}