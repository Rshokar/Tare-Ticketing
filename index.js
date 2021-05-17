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

app.listen(8000, () => console.log("App available on http://localhost:8000"));