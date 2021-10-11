const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const cookieParser = require("cookie-parser");
const UserObject = require("../Objects/User");
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
 * @date May 23 2021
 */
const login = async (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (user) {
        bcrypt.compare(password, user.password, function (err, result) {
          if (result) {
            console.log(user);
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
          } else {
            res.send({ message: "Password is incorrect" });
          }
        });

      } else {
        res.send({
          message: "No user found"
        })
      }
    })
}

/**
 * This function is responsible for registering employees. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date May 24 2021
 */
const registetEmp = async (req, res, next) => {
  let token = req.cookies.jwt
  let email = req.body.email;
  User.findOne({ email: email })
    .then(user => {
      if (user) {
        res.send({ message: "email-exist" })
      } else {
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(req.body.password, salt, async (err, hashedPassword) => {
            if (err) {
              console.log(err);
              console.log("Error decoding decoded token.")
              res.send({
                error: err
              })
            } else {
              let employee = new User({
                phone: req.body.phone,
                fName: req.body.fName,
                lName: req.body.lName,
                email: req.body.email,
                password: hashedPassword,
                type: "employee",
              })

              try {
                employee["company"] = await addEmp(employee, token);
              } catch (e) {
                console.log(e)
              }

              employee.save()
                .then(() => {
                  console.log("Hello");
                  res.send({ message: "Succesfully added employee", status: "success" });
                  next();
                })
                .catch(e => {
                  console.log("Jello")
                  console.log(e)
                  res.send({ status: "error", message: "An error occured!" })

                })
            }
          })
        })
      }
    })
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