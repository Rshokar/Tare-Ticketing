"use strict";
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");

const { readFile } = require('fs');
const mongoose = require('mongoose');


const app = express();



app.use("/js", express.static("static/js"));
app.use("/css", express.static("static/css"));
app.use("/html", express.static("static/html"));

app.use(expressLayouts)
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



/**
 * This is the route that returns index.html. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date MAy 16 2021
 */
app.get("/", (req, res) => {
    res.render("index");
})

/**
 * This route will return the HTML for dashboard page
 * @author Ravinder Shokar 
 * @versio 1.0 
 * @date May 16 2021
 */
app.get("/dashboard", (req, res) => {
    res.render("dashboard")
})

/**
 * This route will return the HTML for the account page 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 18 2021
 */
app.get("/account", (req, res) => {
    res.render("account")
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
 * This route will return the appropriate HTML for the tickets page. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/tickets", (req, res) => {
    res.render("tickets");
})

/**
 * This route will return the appropriate HTML for the dispatch page. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/dispatch", (req, res) => {
    res.render("dispatch");
})

/**
 * This route will return the appropriate HTML for the job page. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/job", (req, res) => {
    res.render("job");
})

/**
 * This route will return the appropriate HTML for the load ticket page. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/load", (req, res) => {
    res.render("load");
})

/**
 * This route will return the appropriate HTML for the creating a new dispatch. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/new_dispatch", (req, res) => {
    res.render("new_dispatch");
})

/**
 * This route will return the appropriate HTML for the employee page. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/employees", (req, res) => {
    res.render("employees");
})

/**
 * This route will return the appropriate HTML for adding a new employee. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/new_employee", (req, res) => {
    res.render("new_employee");
})

/**
 * This route will return the appropriate HTML for the operator page. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date May 22 2021
 */
app.get("/operators", (req, res) => {
    res.render("operators");
})


//App Listen.
app.listen(8000, () => console.log("App available on http://localhost:8000"));