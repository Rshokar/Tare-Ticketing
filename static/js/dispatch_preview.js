
/**
 * This function is responsible for submiting a dispatch by 
 * making a post request to the Server
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
function submitDispatch() {
    const confirmation = document.getElementById("confirmation_modal");
    const confYes = document.getElementById("confirmation_yes");
    const confNo = document.getElementById("confirmation_no");
    const confText = document.getElementById("confirmation_text");

    confYes.style.display = "none";
    confNo.style.display = "none";
    confText.innerHTML = "Submiting dispatch....";

    confirmation.style.display = "block";

    $.ajax({
        url: "/submit_dispatch",
        type: "POST",
        dataType: "JSON",
        data: JSON.parse(sessionStorage.getItem('dispatch')),
        success: (data) => {

            console.log(data);
            if (data.status == "success") {
                confText.innerHTML = "Created Dispatch."
                confText.style.color = "green";
                sessionStorage.setItem('dispatch', "");
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 2000);
            } else if (data.status == "error") {
                confText.innerText = data.message;
                confText.style.color = "red";
                confYes.style.display = "block";
                confYes.innerHTML = "Okay";
                confYes.addEventListener("click", closeModals);
            }
        },
        error: (err) => {
            confText.innerHTML = "Error Creating Dispatch. Try agina later.";
            setTimeout(() => {
                confirmation.style = "none";
            }, 2000)
            console.log(err);
        }
    })

}

/**
 * This function is responsible for closing all modals on the page
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 1 2021 
 */
const closeModals = () => {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
        modal.style.display = "none";
    })
}


/**
 * This function is resposible for adding spots to a dispatch.
 */
function addOperatorCards() {

    const dispatch = JSON.parse(sessionStorage.getItem('dispatch'))

    let numTrucks = dispatch.numTrucks;
    let operators = dispatch.operators;
    const operatorsContainer = document.getElementById("operators")

    for (let i = 0; i < numTrucks; i++) {
        let name;
        let id;
        let startTime = (operators[i].startTime == "" ? "Not Defined" : operators[i].startTime);
        let truck = operators[i].equipment.truck;
        let trailer = (operators[i].equipment.trailer == "default" ? "" : operators[i].equipment.trailer);
        let status;

        if (operators[i] != undefined && operators[i].id != "") {
            name = operators[i].name;
            id = operators[i].id;
            status = "filled"
        } else {
            name = "Add Operator";
            id = "";
            status = "empty"
        }

        const operatorCardHTML =
            `
                    <div id="${i}"class="operator ${status}">
                        <div class="operator_container">
                        <span class="operator_name">${name}</span>
                        </div>
                        <div class="equipment">
                            <div class="truck">
                            ${truck}
                            </div>
                            <div class="trailer">
                            ${trailer}
                            </div>
                        </div>
                        <div class="start_time">
                         ${startTime}
                        </div>
                        <span class="user_id">${id}</span>
                        <span class="error"></span>
                    </div>
                `
        operatorsContainer.insertAdjacentHTML('beforeend', operatorCardHTML);
    }
}

addOperatorCards();

/**
 * This function is responsible for showing the operator
 * rates tab
 * @author Ravinder Shokar 
 * @vesrion 1.0 
 * @date July 18 2021
 */
function showOperators() {
    const rates = document.getElementById("rates");
    const operators = document.getElementById("operators");

    if (operators.style.display == "none") {
        operators.style.display = "block";
        rates.style.display = "none";
    }
}

/**
 * This function is responsible for populating the hourly rates 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 17 2021
 * @param rates JSON containing hourly rates
 */
function renderHourly(rates) {
    hourly = document.getElementById("hourly")

    hourly.querySelector("#hourly_rates .tandem .rate").innerHTML = rates.t;
    hourly.querySelector("#hourly_rates .tandem_2_pup .rate").innerHTML = rates.t2p;
    hourly.querySelector("#hourly_rates .tandem_3_pup .rate").innerHTML = rates.t3p;
    hourly.querySelector("#hourly_rates .tandem_3_transfer .rate").innerHTML = rates.t3tf;
    hourly.querySelector("#hourly_rates .tandem_4_transfer .rate").innerHTML = rates.t4tf;
    hourly.querySelector("#hourly_rates .tandem_4_end_dump .rate").innerHTML = rates.t4ed;
    hourly.querySelector("#hourly_rates .tri .rate").innerHTML = rates.tri;
    hourly.querySelector("#hourly_rates .tri_2_pony .rate").innerHTML = rates.tri2p;
    hourly.querySelector("#hourly_rates .tri_3_pony .rate").innerHTML = rates.tri3p;
    hourly.querySelector("#hourly_rates .tri_3_transfer .rate").innerHTML = rates.tri3tf;
    hourly.querySelector("#hourly_rates .tri_4_transfer .rate").innerHTML = rates.tri4tf;
    hourly.querySelector("#hourly_rates .tri_4_end_dumo .rate").innerHTML = rates.tri4ed;


    document.getElementById("hourly_rates").style.display = "block"
    hourly.style.display = "block";
}

/**
 * This function is responsible for populating the perload rates 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 17 2021
 * @param rates JSON containing perLoad rates
 */
function renderPerLoad(rates) {
    perLoad = document.getElementById("per_load")
    perLoad.querySelector("#per_load_rates .contractor_rate .rate").innerHTML = rates.contractor;
    perLoad.querySelector("#per_load_rates .operator_rate .rate").innerHTML = rates.operator;

    document.getElementById("per_load_rates").style.display = "block"
    perLoad.style.display = "block"
}


/**
 * This function is resposible for populating the tonnage rates
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 17 2021
 * @param rates JSON containing perLoad rates
 */
function renderTonnage(rates) {
    tonnage = document.getElementById("tonnage")
    tonnage.querySelector("#tonnage_rates .contractor_rate .rate").innerHTML = rates.contractor;
    tonnage.querySelector("#tonnage_rates .operator_rate .rate").innerHTML = rates.operator;

    document.getElementById("tonnage_rates").style.display = "block"
    tonnage.style.display = "block"
}


/**
 * This function is responsible for showing the rates tab
 * @author Ravinder Shokar 
 * @verion 1.0 
 * @date July 17 2021
 */
function showRates() {
    const rates = document.getElementById("rates");
    const operators = document.getElementById("operators");

    if (rates.style.display == "none") {
        rates.style.display = "block";
        operators.style.display = "none";
    }
}

$(document).ready(() => {
    const dispatch = JSON.parse(sessionStorage.getItem('dispatch'))

    console.log(dispatch)

    const contractor = document.getElementById("contractor");
    const loadLocation = document.getElementById("load");
    const dumpLocation = document.getElementById("dump");
    const date = document.getElementById("date");
    const supplier = document.getElementById("supplier");
    const reciever = document.getElementById("reciever");
    const material = document.getElementById("material");
    const numTrucks = document.getElementById("num-trucks");
    const notes = document.getElementById("notes");

    contractor.innerHTML = dispatch.contractor;
    loadLocation.innerHTML = dispatch.loadLocation + "<p class='ticket_text'>Load</p>";
    dumpLocation.innerHTML = dispatch.dumpLocation + "<p class='ticket_text'>Dump</p>"
    date.innerHTML = dispatch.date;
    supplier.innerHTML = "Supplier: " + dispatch.supplier;
    reciever.innerHTML = "Reciever: " + dispatch.reciever;
    material.innerHTML = "Material: " + dispatch.material;
    numTrucks.innerHTML = "<i class='fas fa-truck'></i><span id='number_of_trucks'>" + dispatch.numTrucks + "</span>";
    notes.innerHTML = dispatch.notes;

    if (dispatch.rates != undefined) {
        if (dispatch.rates.hourly != undefined) {
            renderHourly(dispatch.rates.hourly);
        } else {
            if (dispatch.rates.perLoad != undefined) {
                renderPerLoad(dispatch.rates.perLoad);
            }

            if (dispatch.rates.tonnage != undefined) {
                renderTonnage(dispatch.rates.tonnage);
            }
        }
    }
})

