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


class AuthController {
  /**
   * This function is responsible for registering users. 
   * @author Ravinder Shokar 
   * @version 1.1
   * @date Oct 11 2021
   */
  static async register(req, res, next) {
    let user = new UserObject(req.body);
    let password = req.body.password;
    console.log(req.body);

    try {
      user.validateUser();
      await Authorizer.doesEmailAlreadyExist(user.email);
      Authorizer.validatePassword(password);
      await Authorizer.registerUser(user, password);
      next();
    } catch (e) {
      console.log(e);
      res.status(400).send({ err: { code: e.code, message: e.message } });
    }
  }

  /**
   * This function is responsible for logging in new users. 
   * @author Ravinder Shokar 
   * @version 1.0 
   * @date Oct 21 2021
   */
  static async login(req, res, next) {
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
      res.status(400).send({ status: "Error", err: { code: e.code, message: e.message } })
    }
  }

  /**
   * This function is responsible for registering employees. 
   * @author Ravinder Shokar 
   * @version 1.0 
   * @date Oct 21 2021
   */
  static async registerEmp(req, res, next) {
    let token = req.cookies.jwt
    let employee = new EmployeObject(req.body);

    console.log("Request", req.body);
    try {
      let decodedToken = await Authorizer.verifyJWTToken(token);
      await Authorizer.doesEmailAlreadyExist(employee.email);
      employee.employer = decodedToken.id;
      employee.validateUser();
      Authorizer.validatePassword(req.body.password);
      employee.id = await Authorizer.registerUser(employee, req.body.password);
      res.send({ status: "success", result: { empId: employee.id } })
      next();
    } catch (e) {
      console.log(e);
      res.status(400).send({ status: "error", err: { code: e.code, message: e.message } })
    }
  }

  /**
   * This function is responsible for deleting employees from dispatcher registration and 
   * the employee account
   * @author Ravinder Shokar 
   * @version 1.0 
   * @date Jun 7 2021 
   */
  static async deleteEmp(req, res, next) {
    const empId = req.body.empID;
    const token = req.cookies.jwt;
    let employee;

    try {
      let decodedToken = await Authorizer.verifyJWTToken(token);
      employee = await EmployeeObject.getUserWithId(empId);
      if (employee._doc.employer.toString() != decodedToken.id) {
        throw new ValidationErrors.InvalidInputError("User and Employee do not match!");
      }
      await employee.delete()
      next();
    } catch (e) {
      console.log(e);
      res.status(400).send({
        status: "error", err: {
          message: e.message,
          code: e.code,
        }
      });
    };
  }

  /**
   * Deletes the currently logged in user
   * @author Ravinder Shokar 
   * @date Nov 12 2021
   */
  static async deleteUser(req, res, next) {
    const token = req.cookies.jwt;

    try {
      let decodedToken = await Authorizer.verifyJWTToken(token);
      await UserObject.deleteUser(decodedToken.id);
      next();
    } catch (e) {
      console.log(e);
      res.status(400).send({ err: { message: e.message, code: e.code } });
    }
  }
}

module.exports = AuthController