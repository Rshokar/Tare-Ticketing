

const dispatch = JSON.parse(sessionStorage.getItem('dispatch'))

/**
 * This function is resposible for displaying saved operators to the html.
 */
function addOperatorCards() {
    const ACTIVE = "active";
    const COMPLETE = "complete";
    const operatorsContainer = document.getElementById("operators");
    const time = "07:00"
    let numTrucks = dispatch.numTrucks;
    let operators = dispatch.operators;
    let disable = false;


    let start = { date: dispatch.date, time: time }
    let name = "Add Operator";
    let status = "empty";
    let id = "";
    let minDate = dispatch.date;

    let truck;
    let trailer;

    if (operators !== undefined && Object.keys(operators).length > 0) {
        for (let i = 0; i < numTrucks; i++) {
            start = { date: dispatch.date, time: time }
            name = "Add Operator";
            status = "empty";
            id = "";
            disable = false;
            console.log("Hello")
            if (operators[i] != undefined && operators[i].userId !== undefined) {
                name = operators[i].name;
                id = operators[i].userId;
                [truck, trailer] = getEquipmentHTML(operators[i].equipment)
                status = operators[i].status;
                if (operators[i].status === ACTIVE || operators[i].status === COMPLETE) { disable = true }
            } else if (operators[i] != undefined) {
                [truck, trailer] = getEquipmentHTML(operators[i].equipment);

            } else {
                [truck, trailer] = getEquipmentHTML();
            }

            if (operators[i].start !== undefined) {
                start.date = operators[i].start.split("T")[0];
                start.time = new Date(operators[i].start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            }
            let obj = {
                id: i,
                status: status,
                userId: id,
                name: name,
                truck,
                trailer,
                start,
                minDate,
                disable,
            }

            const operatorCardHTML = buildOperatorCard(obj);
            operatorsContainer.insertAdjacentHTML('beforeend', operatorCardHTML);
        }
    } else {
        [truck, trailer] = getEquipmentHTML();
        for (let i = 0; i < numTrucks; i++) {
            let obj = {
                id: i,
                status: status,
                userId: id,
                name: name,
                truck,
                trailer,
                start,
                minDate,
                disable
            }
            const operatorCardHTML = buildOperatorCard(obj);

            operatorsContainer.insertAdjacentHTML('beforeend', operatorCardHTML);
        }
    }
}



addOperatorCards();

/**
 * Thia function is responsible for returning the appropriate select fields depending 
 * on equipment
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 26 2021
 * @param e and JSON obj {truck, trailer}
 */
function getEquipmentHTML(e) {
    let html = [];

    html[0] = `
    <option value="Tandem" selected>Tandem</option>
    <option value="Triaxle">Triaxle</option>
    `

    html[1] = `
    <option value="default">Trailer</option>
    <option value="2-axle-pony">2-axle Pony</option>
    <option value="3-axle-pony">3-axle Pony</option>
    <option value="3-axle-transfer">3-axle Transfer</option>
    <option value="4-axle-transfer">4-axle Transfer</option>
    <option value="4-axle-end-dump">4-axle End Dump</option>
`

    if (e != undefined) {
        if (e.truck !== "Tandem" || e.trailer !== "default") {
            if (e.truck == "Tandem") {
                html[0] = `
            <option value="Tandem" selected>Tandem</option>
            <option value="Triaxle">Triaxle</option>
            `
            }
            if (e.truck == "Triaxle") {
                html[0] = `
            <option value="Tandem">Tandem</option>
            <option value="Triaxle" selected>Triaxle</option>
            `
            }

            if (e.trailer != "default") {
                if (e.trailer == "2-axle-pony") {
                    html[1] = `
                <option value="default">Trailer</option>
                <option value="2-axle-pony" selected>2-axle Pony</option>
                <option value="3-axle-pony">3-axle Pony</option>
                <option value="3-axle-transfer">3-axle Transfer</option>
                <option value="4-axle-transfer">4-axle Transfer</option>
                <option value="4-axle-end-dump">4-axle End Dump</option>
            `
                }
                if (e.trailer == "3-axle-pony") {
                    html[1] = `
                <option value="default">Trailer</option>
                <option value="2-axle-pony">2-axle Pony</option>
                <option value="3-axle-pony" selected>3-axle Pony</option>
                <option value="3-axle-transfer">3-axle Transfer</option>
                <option value="4-axle-transfer">4-axle Transfer</option>
                <option value="4-axle-end-dump">4-axle End Dump</option>
            `
                }

                if (e.trailer == "3-axle-transfer") {
                    html[1] = `
                <option value="default">Trailer</option>
                <option value="2-axle-pony">2-axle Pony</option>
                <option value="3-axle-pony">3-axle Pony</option>
                <option value="3-axle-transfer" selected>3-axle Transfer</option>
                <option value="4-axle-transfer">4-axle Transfer</option>
                <option value="4-axle-end-dump">4-axle End Dump</option>
            `
                }

                if (e.trailer == "4-axle-transfer") {
                    html[1] = `
                <option value="default">Trailer</option>
                <option value="2-axle-pony">2-axle Pony</option>
                <option value="3-axle-pony">3-axle Pony</option>
                <option value="3-axle-transfer">3-axle Transfer</option>
                <option value="4-axle-transfer" selected>4-axle Transfer</option>
                <option value="4-axle-end-dump">4-axle End Dump</option>
            `
                }

                if (e.trailer == "4-axle-end-dump") {
                    html[1] = `
                <option value="default">Trailer</option>
                <option value="2-axle-pony">2-axle Pony</option>
                <option value="3-axle-pony">3-axle Pony</option>
                <option value="3-axle-transfer">3-axle Transfer</option>
                <option value="4-axle-transfer">4-axle Transfer</option>
                <option value="4-axle-end-dump" selected>4-axle End Dump</option>
            `
                }

            }

        }
    }

    return html
}

/**
 * THis function will add an operator card to the html with the appropriate id.
 * @author Ravinder Shokar
 * @version 1.0 
 * @date June 20 2021
 */
function addOperator() {
    const numberOfTrucks = document.getElementById("number_of_trucks");
    const operatorsContainer = document.getElementById("operators")
    const [truck, trailer] = getEquipmentHTML();

    let start = { date: dispatch.date, time: '07:00' }
    let minDate = dispatch.date;
    let disable = false;

    const obj = {
        id: dispatch.numTrucks,
        status: "empty",
        userId: "",
        name: "Add Operator",
        truck,
        trailer,
        start,
        minDate,
        disable,
    }

    const operatorCardHTML = buildOperatorCard(obj);

    operatorsContainer.insertAdjacentHTML('beforeend', operatorCardHTML);
    dispatch.numTrucks++;
    if (dispatch.numTrucks >= 0) { numberOfTrucks.innerHTML = dispatch.numTrucks }
}

/**
 * This function is responsible for building creating operator card
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 27 2021
 * @param obj A JSON object containing card details
 */
function buildOperatorCard(obj) {
    console.log(obj)
    const DISABLE = (obj.disable ? "disabled" : "");
    const ONCLICK = (obj.disable ? "" : `openOperatorModal(${obj.id})`)

    html = `
    <div id="${obj.id}"class="operator mb-3 ${obj.status}">
        <div class="operator_container">
        <span class="operator_name" onclick="${ONCLICK}">${obj.name}</span>
        </div>
        <div class="equipment">
            <div class="truck">
                <select class="truck form-select" ${DISABLE}>
                    ${obj.truck}
                </select>
            </div>
            <div class="trailer">
                <select class="truck form-select" ${DISABLE}>
                    ${obj.trailer}
                </select>
            </div>
        </div>
        <div class="start date_time">
            <input type="date" class="date form-control" value="${obj.start.date}" min="${obj.minDate}" ${DISABLE}>
            <input type="time" class="time form-control" value="${obj.start.time}" ${DISABLE}>
        </div>
        <span class="user_id">${obj.userId}</span>
        <span class="error"></span>
`
    if (!obj.disable) {
        html += `<button type="button" class="btn btn-danger" onclick="deleteSpot(${obj.id})">Delete Operator</button>`
    }
    html += "</div>"

    return html;
}


/**
 * Deletes a spot and decrements all after it by 1
 * @param { Number } i spot index  
 */
function deleteSpot(index) {
    let spot;

    document.getElementById(index).remove();

    document.getElementById("number_of_trucks").innerHTML = dispatch.numTrucks - 1;
    dispatch.numTrucks--;

    for (let i = index; i < dispatch.numTrucks; i++) {
        spot = document.getElementById(i + 1)
        if (!(spot.classList.contains("active") || spot.classList.contains("complete"))) {
            spot.querySelector("button").setAttribute("onclick", `deleteSpot(${i})`);
        }
        document.getElementById(i + 1).setAttribute("id", i)
    }

}

/**
 * This fucntion will remove an oeprator card with the largest integers ID
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 20 2021
 */
function removeOperator() {

    const numberOfTrucks = document.getElementById("number_of_trucks");
    const operator = document.getElementById(dispatch.numTrucks - 1)

    if (dispatch.numTrucks > 0) {
        dispatch.numTrucks--
        numberOfTrucks.innerHTML = dispatch.numTrucks;
        operator.remove();
    } else { numberOfTrucks.innerHTML = 0 }
}


/**
 * This function is responsible for adding an operator to a spot in the HTML. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
function openOperatorModal(i) {
    const operatorsModal = document.getElementById("operators_modal");
    const spotIndex = document.getElementById("spot_index");

    operatorsModal.style.display = "block";
    spotIndex.innerHTML = i;
}

/**
 * This function is responsible for closing the operators modal
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
function closeModal() {
    const operatorsModal = document.getElementById("operators_modal");
    operatorsModal.style.display = "none";
}

/**
 * This function is responsible for sending a get request to the server. 
 * The server will return an obj containing current users employees
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
const getEmployees = () => {
    return new Promise((res, rej) => {
        $.ajax({
            url: "get_employees",
            type: "GET",
            dataType: "JSON",
            success: (data) => {
                console.log(data)
                if (data.status === "success" && data.result.length > 0) {
                    res(data.result)
                } else {
                    rej({
                        status: "error",
                        err: {
                            code: "no_employees",
                            message: "No employees found."
                        }
                    });
                }
            },
            error: (err) => {
                rej({
                    status: "error",
                    err: {
                        code: "could_not_connect",
                        message: "Could not connect server error getting employees."
                    }
                })
                console.log("Error", err);
            }
        })
    })
}

/**
 * This function is responsible for adding an operator to a spot in a the dispatch 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
const fillSpot = (id, fName, lName, type, company) => {
    const index = document.getElementById("spot_index").innerHTML;
    const spot = document.getElementById(index);

    spot.querySelector(".user_id").innerHTML = id;
    spot.className = "operator sent mb-3";

    if (type == "employee") {
        spot.querySelector(".operator_name").innerHTML = fName + " " + lName;
    } else if (type == "operator") {
        spot.querySelector(".operator_name").innerHTML = company;
    }
    closeModal();
}

/**
 * This function shows the employees tab
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021 
 */
function showEmployees() {
    const operators = document.getElementById('owner_operator');
    const employees = document.getElementById('employees');

    const operators_tab = document.getElementById('right_tab');
    const employees_tab = document.getElementById('left_tab');

    operators.style.display = "none";
    employees.style.display = "block";

    operators_tab.style.backgroundColor = "#CFD8DC";
    operators_tab.style.color = "black";

    employees_tab.style.backgroundColor = "#004065";
    employees_tab.style.color = "white";
}

/**
 * This function shows the operator tab
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021 
 */
function showOwnerOps() {
    const operators = document.getElementById('owner_operator');
    const employees = document.getElementById('employees');

    const operators_tab = document.getElementById('right_tab');
    const employees_tab = document.getElementById('left_tab');

    operators.style.display = "block";
    employees.style.display = "none";


    operators_tab.style.backgroundColor = "#004065";
    operators_tab.style.color = "white";

    employees_tab.style.backgroundColor = "#CFD8DC";
    employees_tab.style.color = "black";
}



/**
 * This function is responsible for querying owner operators in the DB
 */
const ownerOpSearch = document.getElementById("operator_search");
ownerOpSearch.addEventListener('keyup', (event) => {
    console.log(event.target.value);

    if (event.target.value.length > 2) {
        $.ajax({
            url: "search_operators",
            type: "GET",
            dataType: "JSON",
            data: { query: event.target.value },
            success: (data) => {
                console.log(data);
                const emptySearch = document.getElementById("empty_search");

                if (data.results.length == 0) {
                    emptySearch.innerHTML = "No Operator Found";
                    emptySearch.style.color = "red";
                } else {
                    const operators = document.getElementById("query_results");

                    emptySearch.style.display = "none";
                    operators.innerHTML = "";

                    for (let i = 0; i < data.results.length; i++) {
                        const div = document.createElement("div");
                        const companyName = document.createElement("h3");
                        const name = document.createElement("h5");

                        div.setAttribute("class", "employee");

                        operators.appendChild(div);

                        companyName.innerHTML = data.results[i].company
                        name.innerHTML = data.results[i].fName + " " + data.results[i].lName;

                        div.appendChild(companyName);
                        div.appendChild(name);

                        div.addEventListener('click', function () {
                            fillSpot(
                                data.results[i]._id,
                                data.results[i].fName,
                                data.results[i].lName,
                                data.results[i].type,
                                data.results[i].company
                            )
                        })
                    }
                }
            },
            error: (err) => {
                console.log(err);
            }
        })
    } else {
        const emptySearch = document.getElementById("empty_search");
        const operators = document.getElementById("query_results");

        operators.innerHTML = "";

        emptySearch.innerHTML = "Search an operator by Company Name";
        emptySearch.style.color = "black";
        emptySearch.style.display = "block";
    }
})


/**
 * This function will save the dispatch and then redirect to the the passed in 
 * URL 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
function back(url) {
    const edit = new URL(window.location.href).searchParams.get("edit");
    url += (edit ? "&edit=true&dispId=" + dispatch._id : "");
    dispatch["operators"] = getOperators();
    console.log(dispatch)
    sessionStorage.setItem('dispatch', JSON.stringify(dispatch));
    window.location.href = url;
}


/**
 * This function will get the operators spots and details and return 
 * them in a JSON obj 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
function getOperators() {
    const obj = {}
    for (let i = 0; i < dispatch.numTrucks; i++) {
        const spot = document.getElementById(i);
        const userId = spot.querySelector('.user_id').innerHTML;

        obj[i] = {
            equipment: {
                truck: spot.querySelector('.equipment .truck select').value,
                trailer: spot.querySelector('.equipment .trailer select').value,
            },
            startTime: spot.querySelector('.start .date').value + "T" + spot.querySelector('.start .time').value,
            name: spot.querySelector('.operator_container .operator_name').innerHTML,
            status: getSpotStatus(spot)
        }

        if (userId) {
            obj[i]["userId"] = userId
        }
    }
    return obj;
}


/**
 * Gets the status of the spot. 5 possible options.
 * Empty, Sent, Confirmed, Active, Complete
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 17 2021 
 * @param { HTML Element } spot 
 */
function getSpotStatus(spot) {
    const SENT = 'sent';
    const CONFIRMED = 'confirmed';
    const ACTIVE = 'active';
    const COMPLETE = 'complete';
    const EMPTY = "empty";

    let status;

    if (spot.classList.contains(SENT)) {
        status = SENT;
    } else if (spot.classList.contains(CONFIRMED)) {
        status = CONFIRMED;
    } else if (spot.classList.contains(ACTIVE)) {
        status = ACTIVE;
    } else if (spot.classList.contains(COMPLETE)) {
        status = COMPLETE;
    } else if (spot.classList.contains(EMPTY)) {
        status = EMPTY;
    }
    return status;
}

/**
 * This function collects dispatch data, verifies it , saves it to session storage
 * then redirects to preview page
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021 
 */
function next(url) {
    dispatch["operators"] = getOperators();
    const edit = new URL(window.location.href).searchParams.get("edit");
    url += (edit ? "?edit=true&dispId=" + dispatch._id : "");
    if (verifyOperators(dispatch.operators)) {
        console.log(url)
        console.log(dispatch.operators)
        sessionStorage.setItem('dispatch', JSON.stringify(dispatch))
        window.location.href = url;
    }
}


/**
 * This function verifies operators. 
 * If any fields are empty an error is shown
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
function verifyOperators(operators) {
    console.log(operators)
    let isValid = true
    let dispDate = new Date(dispatch.date);
    let start

    for (let i = 0; i < dispatch.numTrucks; i++) {
        const spot = document.getElementById(i);
        const error = spot.querySelector(".error")
        error.innerHTML = "";
        start = new Date(operators[i].startTime);

        if (Object.prototype.toString.call(start) === "[object Date]") {
            // it is a date
            if (isNaN(start.getTime())) {  // d.valueOf() could also work
                error.innerHTML += " Must select a start date and time.";
                error.style.display = "block"
                return false;
            }
        } else {
            error.innerHTML += " Must select a start date and time.";
            error.style.display = "block"
            return false;
        }

        if (start < dispDate) {
            error.innerHTML += "Start time cannot be before dispatch date";
            error.style.display = "block"
            returnfalse;
        }

        if (operators[i].id !== "") {
            if (operators[i].equipment.truck == "default") {
                error.innerHTML += "Truck type must be selected.";
                error.style.display = "block"
                return false;
            }
        }

        for (let j = i + 1; j < dispatch.numTrucks; j++) {
            if (operators[i].id && operators[i].id === operators[j].id) {
                error.innerHTML = "Operator has already been selected."
                return false;
            }
        }

    }
    return isValid;
}

$(document).ready(() => {
    const contractor = document.getElementById("contractor");
    const loadLocation = document.getElementById("load");
    const dumpLocation = document.getElementById("dump");
    const date = document.getElementById("date");
    const supplier = document.getElementById("supplier");
    const reciever = document.getElementById("reciever");
    const material = document.getElementById("material");
    const numTrucks = document.getElementById("num-trucks");
    const notes = document.getElementById("notes");

    document.getElementById("exit").setAttribute("onclick", `back('/add_rates?contractor=${dispatch.contractor.replace("&", "%26")}')`);

    contractor.innerHTML = dispatch.contractor;
    loadLocation.innerHTML = dispatch.loadLocation + "<p class='ticket_text'>Load</p>";
    dumpLocation.innerHTML = dispatch.dumpLocation + "<p class='ticket_text'>Dump</p>";
    date.innerHTML = dispatch.date;
    supplier.innerHTML = "Supplier: " + dispatch.supplier;
    reciever.innerHTML = "Reciever: " + dispatch.reciever;
    material.innerHTML = "Material: " + dispatch.material;
    numTrucks.innerHTML = "<i class='fas fa-truck'></i><span id='number_of_trucks'>" + dispatch.numTrucks + "</span><span id='plus' onclick='addOperator()'> + </span>";
    notes.innerHTML = dispatch.notes;


    getEmployees()
        .then((emps) => {
            const employeesContainer = document.getElementById("employees");
            employeesContainer.innerHTML = "";
            for (let i = 0; i < emps.length; i++) {
                console.log(i)
                let div = document.createElement("div");
                div.setAttribute('class', "employee");

                let name = document.createElement("h3");
                name.innerText = emps[i].fName + " " + emps[i].lName;

                div.appendChild(name);
                div.addEventListener("click", function () {
                    fillSpot(
                        emps[i]._id,
                        emps[i].fName,
                        emps[i].lName,
                        "employee"
                    )
                })
                employeesContainer.appendChild(div);
            }
        })
        .catch(e => {
            console.log(e);
            const empContainer = document.getElementById("employees");
            const div = document.createElement("div");
            const h1 = document.createElement("h1");
            const span = document.createElement("span");
            const a = document.createElement("a");
            const button = document.createElement("button")

            empContainer.innerHTML = "";

            let err = e.err;
            div.setAttribute("class", "no_tickets");
            h1.innerText = err.message;

            if (err.code === "no_employees") {
                a.setAttribute("href", "/new_employee")
                button.setAttribute("class", "btn btn-primary");
                button.innerHTML = "Add Employee";
                a.appendChild(button);

            } else if (err.code === "could_not_connect") {
                button.setAttribute("class", "btn btn-primary");
                button.setAttribute("onclick", getEmployees);
                button.innerHTML = "Reset"
                a.appendChild(button);
            }

            span.appendChild(a);
            div.appendChild(h1).appendChild(span)
            empContainer.appendChild(div)
        })
})