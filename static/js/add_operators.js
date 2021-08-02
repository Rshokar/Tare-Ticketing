

const dispatch = JSON.parse(sessionStorage.getItem('dispatch'))

console.log(dispatch)
/**
 * This function is resposible for displaying saved operators to the html.
 */
function addOperatorCards() {
    let numTrucks = dispatch.numTrucks;
    let operators = dispatch.operators;
    const operatorsContainer = document.getElementById("operators");

    let startTime = dispatch.date + "T00:00";
    let name = "Add Operator";
    let status = "empty";
    let id = "";

    let truck;
    let trailer;

    if (operators != undefined) {
        for (let i = 0; i < numTrucks; i++) {
            if (operators[i] != undefined && operators[i].id != "") {
                name = operators[i].name;
                id = operators[i].id;
                startTime = (operators[i].startTime == undefined ? startTime : operators[i].startTime);
                [truck, trailer] = getEquipmentHTML(operators[i].equipment)
                status = "filled"
            } else if (operators[i] != undefined) {
                startTime = (operators[i].startTime == undefined ? startTime : operators[i].startTime);
                [truck, trailer] = getEquipmentHTML(operators[i].equipment);
            } else {
                [truck, trailer] = getEquipmentHTML();
            }

            let obj = {
                id: i,
                start: startTime,
                status: status,
                userId: id,
                name: name,
                truck,
                trailer,
            }



            const operatorCardHTML = buildOperatorCard(obj);

            operatorsContainer.insertAdjacentHTML('beforeend', operatorCardHTML);
        }
    } else {

        [truck, trailer] = getEquipmentHTML();
        for (let i = 0; i < numTrucks; i++) {
            let obj = {
                id: i,
                start: startTime,
                status: status,
                userId: id,
                name: name,
                truck,
                trailer,
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
        if (e.truck != "Tandem" && e.trailer == "default") {
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
    let startTime = dispatch.date + 'T00:00:00'
    const [truck, trailer] = getEquipmentHTML();

    const obj = {
        id: dispatch.numTrucks,
        start: dispatch.date + "T00:00",
        status: "empty",
        userId: "",
        name: "Add Operator",
        truck,
        trailer,
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
    console.log(obj);
    return `
    <div id="${obj.id}"class="operator ${obj.status}">
        <div class="operator_container">
        <span class="operator_name" onclick="openOperatorModal(${obj.id})">${obj.name}</span>
        </div>
        <div class="equipment">
            <div class="truck">
                <label></label>
                <select class="truck">
                    ${obj.truck}
                </select>
            </div>
            <div class="trailer">
                <label></label>
                <select class="truck">
                    ${obj.trailer}
                </select>
            </div>
        </div>
        <div class="start_time">
            <input type="datetime-local" value="${obj.start}" min="${obj.start}"}>
        </div>
        <span class="user_id">${obj.userId}</span>
        <span class="error"></span>
    </div>
`
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
function back(url) {
    let dispatch = getDispatch();
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
    dispatch["operators"] = getOperators();
    return dispatch
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
        var status = "sent";

        if (userId == "") {
            status = "empty";
        }


        obj[i] = {
            id: userId,
            equipment: {
                truck: spot.querySelector('.equipment .truck select').value,
                trailer: spot.querySelector('.equipment .trailer select').value,
            },
            startTime: spot.querySelector('.start_time input').value,
            name: spot.querySelector('.operator_container .operator_name').innerHTML,
            status
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
    let dispatch = getDispatch();
    console.log(dispatch)
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

    for (let i = 0; i < dispatch.numTrucks; i++) {
        const spot = document.getElementById(i);
        const error = spot.querySelector(".error")
        error.innerHTML = "";

        if (operators[i].id != "") {
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

        for (let j = i + 1; j < dispatch.numTrucks; j++) {
            if (operators[i].id != "" && operators[i].id == operators[j].id) {
                error.innerHTML = "Operator has already been selected."
                isValid = false;
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

    document.getElementById("exit").setAttribute("onclick", `back('/add_rates?contractor=${dispatch.contractor}')`);


    contractor.innerHTML = dispatch.contractor;
    loadLocation.innerHTML = dispatch.loadLocation + "<p class='ticket_text'>Load</p>";
    dumpLocation.innerHTML = dispatch.dumpLocation + "<p class='ticket_text'>Dump</p>";
    date.innerHTML = dispatch.date;
    supplier.innerHTML = "Supplier: " + dispatch.supplier;
    reciever.innerHTML = "Reciever: " + dispatch.reciever;
    material.innerHTML = "Material: " + dispatch.material;
    numTrucks.innerHTML = "<i class='fas fa-truck'></i><span id='number_of_trucks'>" + dispatch.numTrucks + "</span><span id='plus' onclick='addOperator()'> + </span>/<span id='minus' onclick='removeOperator()'> - </span>";
    notes.innerHTML = dispatch.notes;
})