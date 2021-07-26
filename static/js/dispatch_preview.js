
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
 * This function is toggling to left tab
 * @author Ravinder Shokar 
 * @vesrion 1.0 
 * @date July 18 2021
 */
function showOperators() {
    const opTab = document.getElementById("left_tab");
    const rateTab = document.getElementById("right_tab");

    const rates = document.getElementById("rates");
    const operators = document.getElementById("operators");

    if (operators.style.display == "none") {

        rateTab.style.color = "black";
        rateTab.style.backgroundColor = "#CFD8DC";

        opTab.style.backgroundColor = "#004065"
        opTab.style.color = "white"

        rates.style.display = "none";
        operators.style.display = "block";
    }
}

/**
 * This function is responsible for showing the rates tab
 * @author Ravinder Shokar 
 * @verion 1.0 
 * @date July 17 2021
 */
function showRates() {
    const opTab = document.getElementById("left_tab");
    const rateTab = document.getElementById("right_tab");

    const rates = document.getElementById("rates");
    const operators = document.getElementById("operators");


    if (rates.style.display == "none") {

        console.log("Im Alive")

        rateTab.style.backgroundColor = "#004065";
        rateTab.style.color = "white";

        opTab.style.backgroundColor = "#CFD8DC";
        opTab.style.color = "black";

        rates.style.display = "block";
        operators.style.display = "none";
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
 * This function adds rates to the HTML.
 * @author Ravinder Shokar 
 * @version 1.0
 * @date July 20 2021
 * @param type which type of rate to be added. Tonnage / Per Load 
 * @param obj optional variable with rate data.
 */
function addRates(type, rates) {
    const fee = rates.fee;
    const tonnage = document.getElementById("tonnage")
    const perLoad = document.getElementById("per_load")

    const ton = document.getElementById("tonnage_rates");
    const per = document.getElementById("per_load_rates");

    rates = rates.rates;

    let div;

    if (type == "per_load") {
        perLoad.style.display = "block";
        per.style.display = "block"
        per.querySelector(".operator_rate .rate").innerHTML = fee
        for (let i = 0; i < rates.length; i++) {
            div = document.createElement("div");
            div.setAttribute("class", "per_load_rate input_rate");
            div.innerHTML = getRateHTML(rates[i]);
            per.appendChild(div);

        }

    } else {
        tonnage.style.display = "block";
        ton.style.display = "block";
        ton.querySelector(".operator_rate .rate").innerHTML = fee
        for (let i = 0; i < rates.length; i++) {
            div = document.createElement("div");
            div.setAttribute("class", "tonnage_rate input_rate");
            div.innerHTML = getRateHTML(rates[i]);
            ton.appendChild(div);
        }
    }
}

/**
 * This function builds the HTML appropriate for adding a rate
 * @author Ravinder Shokar 
 * @version 1.0
 * @date July 20 2021
 * @param i ID of HTML
 * @param type which type of rate to be added. Tonnage / Per Load 
 * @return HTML with dispatch load and dump filled in. 
 */
function getRateHTML(rate) {
    console.log(rate)
    return `
        <span class="mb-2">Contractor Rate</span>
        <span class="form-control mb-2 rate">${rate.r}</span>
    
        <span class="mb-2">Load</span>
        <span class="form-control mb-2 load">${rate.l}</span>
    
        <span class="mb-2">Dump</span>
        <span class="form-control mb-2 dump">${rate.d}</span>
        `
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
                addRates("per_load", dispatch.rates.perLoad);
            }

            if (dispatch.rates.tonnage != undefined) {
                addRates("tonnage", dispatch.rates.tonnage);
            }
        }
    }
})

