

let dispatch = JSON.parse(sessionStorage.getItem('dispatch'))

console.log(dispatch)

const contractor = document.querySelector(".dispatch h2");
const loadLocation = document.querySelector(".dispatch .load_location");
const dumpLocation = document.querySelector(".dispatch .dump_location");
const date = document.querySelector(".dispatch .date");
const supplier = document.querySelector(".dispatch .supplier");
const reciever = document.querySelector(".dispatch .reciever");
const material = document.querySelector(".dispatch .material");
const numTrucks = document.querySelector(".dispatch .num-trucks .trucks");
const notes = document.querySelector(".dispatch .notes");

contractor.innerHTML = dispatch.contractor;
loadLocation.innerHTML = dispatch.loadLocation;
dumpLocation.innerHTML = dispatch.dumpLocation;
date.innerHTML = dispatch.date;
supplier.innerHTML = "Supplier: " + dispatch.supplier;
reciever.innerHTML = "Reciever: " + dispatch.reciever;
material.innerHTML = "Material: " + dispatch.material;
numTrucks.innerHTML = dispatch.numTrucks;
notes.innerHTML = dispatch.notes;

/**
 * This function is resposible for adding spots to a dispatch.
 */
function addOperatorCards() {

    let numTrucks = dispatch.numTrucks;
    let operators = dispatch.operators;
    const operatorsContainer = document.getElementById("operators")

    if (operators != undefined) {
        for (let i = 0; i < numTrucks; i++) {
            let name;
            let id;
            let startTime;
            let equipment;
            let status;

            if (operators[i].id != "") {
                name = operators[i].name;
                id = operators[i].id;
                startTime = operators[i].startTime;
                equipment = operators[i].equipment;
                status = "filled"
            } else {
                name = "Add Operator";
                id = "null";
                status = "empty"
            }

            const operatorCardHTML =
                `
                    <div id="${i}"class="operator ${status}">
                        <div class="operator_container">
                        <span class="operator_name" onclick="openOperatorModal(${i})">${name}</span>
                        </div>
                        <div class="equipment">
                            <div class="truck">
                                <label></label>
                                <select class="truck" >
                                    <option value="default">Truck</option>
                                    <option value="2-axle">2-axle</option>
                                    <option value="3-axle">3-axle</option>
                                </select>
                            </div>
                            <div class="trailer">
                                <label></label>
                                <select class="truck">
                                    <option value="default">Trailer</option>
                                    <option value="2-axle-pony">2-axle Pony</option>
                                    <option value="3-axle-pony">3-axle Pony</option>
                                    <option value="4-axle-transfer">4-axle Transfer</option>
                                    <option value="4-axle-end-dump">4-axle End Dump</option>
                                </select>
                            </div>
                        </div>
                        <div class="start_time">
                            <input type="time" value="${startTime}">
                        </div>
                        <span class="user_id">${id}</span>
                        <span class="error"></span>
                    </div>
                `
            operatorsContainer.insertAdjacentHTML('beforeend', operatorCardHTML);
        }
    } else {
        for (let i = 0; i < numTrucks; i++) {
            const operatorCardHTML =
                `
                    <div id="${i}"class="operator empty">
                        <div class="operator_container">
                        <span class="operator_name" onclick="openOperatorModal(${i})">Add Operator</span>
                        </div>
                        <div class="equipment">
                            <div class="truck">
                                <label></label>
                                <select class="truck" >
                                    <option value="default">Truck</option>
                                    <option value="2-axle">2-axle</option>
                                    <option value="3-axle">3-axle</option>
                                </select>
                            </div>
                            <div class="trailer">
                                <label></label>
                                <select class="truck">
                                    <option value="default">Trailer</option>
                                    <option value="2-axle-pony">2-axle Pony</option>
                                    <option value="3-axle-pony">3-axle Pony</option>
                                    <option value="4-axle-transfer">4-axle Transfer</option>
                                    <option value="4-axle-end-dump">4-axle End Dump</option>
                                </select>
                            </div>
                        </div>
                        <div class="start_time">
                            <input type="time">
                        </div>
                        <span class="user_id"></span>
                        <span class="error"></span>
                    </div>
                `
            operatorsContainer.insertAdjacentHTML('beforeend', operatorCardHTML);
        }
    }

}

addOperatorCards();


/**
 * THis function will add an operator card to the html with the appropriate id.
 * @author Ravinder Shokar
 * @version 1.0 
 * @date June 20 2021
 */
function addOperator() {
    const operatorsContainer = document.getElementById("operators")
    const operatorCardHTML =
        `
            <div id="${dispatch.numTrucks}" class="operator empty">
            <div class="operator_container">
                <span class="operator_name" onclick="openOperatorModal(${dispatch.numTrucks})">Add Operator</span>
            </div>
            <div class="equipment">
                <div class="truck">
                    <label></label>
                    <select class="truck">
                        <option value="default">Truck</option>
                        <option value="2-axle">2-axle</option>
                        <option value="3-axle">3-axle</option>
                    </select>
                </div>
                <div class="trailer">
                    <label></label>
                    <select class="truck">
                        <option value="default">Trailer</option>
                        <option value="2-axle-pony">2-axle Pony</option>
                        <option value="3-axle-pony">3-axle Pony</option>
                        <option value="4-axle-transfer">4-axle Transfer</option>
                        <option value="4-axle-end-dump">4-axle End Dump</option>
                    </select>
                </div>
            </div>
            <div class="start_time">
                <input type="time">
            </div>
            <span class="user_id"></span>
            <span class="error"></span>
            </div>
        `
    operatorsContainer.insertAdjacentHTML('beforeend', operatorCardHTML);
    dispatch.numTrucks++;
    if (dispatch.numTrucks >= 0) { numTrucks.innerHTML = dispatch.numTrucks }

}


/**
 * This fucntion will remove an oeprator card with the largest integers ID
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 20 2021
 */
function removeOperator() {
    if (dispatch.numTrucks > 0) { dispatch.numTrucks-- }
    const operatorsContainer = document.getElementById("" + dispatch.numTrucks)
    operatorsContainer.remove();
    if (dispatch.numTrucks >= 0) { numTrucks.innerHTML = dispatch.numTrucks }
}


/**
 * This function is responsible for adding an operator to a spot. 
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
 * This function is responsible for sending a et request to the server. 
 * The server will return an obj containing current users employees
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
const getEmployees = () => {
    $.ajax({
        url: "get_employees",
        type: "GET",
        dataType: "JSON",
        success: (data) => {
            console.log(data);
            const employeesContainer = document.getElementById("employees");
            const spotIndex = document.getElementById("spot_index").innerHTML;
            for (let i = 0; i < data.result.length; i++) {
                let div = document.createElement("div");
                div.setAttribute('class', "employee");

                let name = document.createElement("h3");
                name.innerText = data.result[i].fName + " " + data.result[i].lName;

                div.appendChild(name);

                div.addEventListener("click", function () {
                    fillSpot(
                        data.result[i].id,
                        data.result[i].fName,
                        data.result[i].lName,
                        "employee"
                    )
                })
                employeesContainer.appendChild(div);


            }
        },
        error: (err) => {
            console.log("Error", err);
        }
    })
}

getEmployees();

/**
 * This function is responsible for adding an operator to a spot in a the dispatch 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
const fillSpot = (id, fName, lName, type, company) => {
    const index = document.getElementById("spot_index").innerHTML;
    const spot = document.getElementById(index);

    console.log(type);

    console.log(index);

    if (type == "employee") {
        spot.querySelector(".operator_name").innerHTML = fName + " " + lName;
        spot.querySelector(".user_id").innerHTML = id;
        spot.className = "operator filled";
    }

    if (type == "operator") {
        spot.querySelector(".operator_name").innerHTML = company;
        spot.querySelector(".user_id").innerHTML = id;
        spot.className = "operator filled";
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

    const operators_tab = document.getElementById('operator_tab');
    const employees_tab = document.getElementById('employee_tab');

    operators.style.display = "none";
    employees.style.display = "block";

    operators_tab.style.backgroundColor = "rgb(255, 255, 255)";
    employees_tab.style.backgroundColor = "rgb(196, 196, 196)";
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

    const operators_tab = document.getElementById('operator_tab');
    const employees_tab = document.getElementById('employee_tab');

    operators.style.display = "block";
    employees.style.display = "none";

    operators_tab.style.backgroundColor = "rgb(196, 196, 196)";
    employees_tab.style.backgroundColor = "rgb(255, 255, 255)";
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
function saveDispatch(url) {
    let dispatch = getDispatch();
    console.log(dispatch);
    sessionStorage.setItem('dispatch', JSON.stringify(dispatch));
    window.location.href = url;
}


/**
 * This function will get all dispatch data and return a JSON obj
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
function getDispatch() {
    const operators = getOperators();

    let obj = {
        contractor: contractor.innerHTML,
        loadLocation: loadLocation.innerHTML,
        dumpLocation: dumpLocation.innerHTML,
        date: date.innerHTML,
        supplier: dispatch.supplier,
        reciever: dispatch.reciever,
        material: dispatch.material,
        numTrucks: numTrucks.innerHTML,
        notes: notes.innerHTML,
        operators: operators
    }
    return obj;
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
    for (let i = 0; i < numTrucks.innerHTML; i++) {
        const spot = document.getElementById(i);
        const userId = spot.querySelector('.user_id').innerHTML;
        obj[i] = {
            id: spot.querySelector('.user_id').innerHTML,
            equipment: {
                truck: spot.querySelector('.equipment .truck select').value,
                trailer: spot.querySelector('.equipment .trailer select').value,
            },
            startTime: spot.querySelector('.start_time input').value,
            name: spot.querySelector('.operator_container .operator_name').innerHTML
        }
    }
    return obj;
}


/**
 * This function collects dispatch data, verifies it , saves it to session storage
 * then redirects to preview page
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021 
 */
function next(url) {
    const dispatch = getDispatch();
    if (verifyOperators(dispatch.operators)) {
        sessionStorage.setItem('dispatch', JSON.stringify(dispatch))
        window.location.href = url;
    } else {
        console.log("error")
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
    let isValid = true

    for (let i = 0; i < numTrucks.innerHTML; i++) {
        const spot = document.getElementById(i);
        error = spot.querySelector(".error");
        error.innerHTML = ""

        if (operators[i].id != "") {
            console.log("Im Alive");
            if (operators[i].equipment.truck == "default") {
                error.innerHTML += "Truck type must be selected.";
                error.style.display = "block"
                isValid = false;
            }

            if (operators[i].startTime == "") {
                error.innerHTML += " Must select a start time.";
                error.style.display = "block"
                isValid = false;
            }
        }

        for (let j = 0; j < numTrucks.innerHTML; j++) {
            if (operators[i].id == operators[j].id && i != j) {
                error.innerHTML = "Operator has already been selected."
                isValid = false;
            }
        }

    }
    return isValid;
}