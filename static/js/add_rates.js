const dispatch = JSON.parse(sessionStorage.getItem('dispatch'));

/**
 * This function will save the dispatch and then redirect to the the passed in 
 * URL 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
function back(url) {
    window.location.href = url;
}

/**
 * This funtion gather rate data and saves it to local storage.
 * @author Ravinder Shokar 
 * @version 1.1 
 * @date July 18 2021 
 */
function next(url) {
    const hourly = document.getElementById("hourly_check");
    const perLoad = document.getElementById("per_load_check");
    const tonnage = document.getElementById("tonnage_check");

    let rates;
    let fee;

    dispatch["rates"] = {};

    if (hourly.checked) {
        dispatch.rates["hourly"] = getHourlyRates();
    } else {
        if (perLoad.checked) {
            rates = getPerLoadRates()
            fee = document.querySelector("#per_load_rates .operator_rate .rate").value
            if (rates) {
                dispatch.rates["perLoad"] = {
                    fee,
                    rates,
                }
            } else {
                return
            }
        }

        if (tonnage.checked) {
            console.log("Get Tonnage Rate")
            rates = getTonnageRates();
            fee = document.querySelector("#tonnage_rates .operator_rate .rate").value
            if (rates) {
                dispatch.rates["tonnage"] = {
                    fee,
                    rates,
                }
            } else {
                return
            }
        }
    }

    sessionStorage.setItem("dispatch", JSON.stringify(dispatch));
    console.log(dispatch)
    window.location.href = url;
}

/**
 * This function is responsible for getting hourly rates
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 18 2021 
 * @return {hourlyRates} containing hourly rates by equipment. 
 */
function getHourlyRates() {
    return {
        t: document.querySelector("#hourly_rates .tandem input").value,
        t2p: document.querySelector("#hourly_rates .tandem_2_pup input").value,
        t3p: document.querySelector("#hourly_rates .tandem_3_pup input").value,
        t3tf: document.querySelector("#hourly_rates .tandem_3_transfer input").value,
        t4tf: document.querySelector("#hourly_rates .tandem_4_transfer input").value,
        t4ed: document.querySelector("#hourly_rates .tandem_4_end_dump input").value,
        tri: document.querySelector("#hourly_rates .tri input").value,
        tri2p: document.querySelector("#hourly_rates .tri_2_pony input").value,
        tri3p: document.querySelector("#hourly_rates .tri_3_pony input").value,
        tri3tf: document.querySelector("#hourly_rates .tri_3_transfer input").value,
        tri4tf: document.querySelector("#hourly_rates .tri_4_transfer input").value,
        tri4ed: document.querySelector("#hourly_rates .tri_4_end_dumo input").value
    }
}

/**
 * This function is responsible for getting and verifying per load rates rates
 * @author Ravinder Shokar
 * @version 1.0 
 * @date july 22 2021 
 */
function getPerLoadRates() {
    const type = "per_load";
    const rates = getRatesList(type);
    return rates;
}

/**
 * This function is responsible for getting and verifying tonnage rates rates
 * @author Ravinder Shokar
 * @version 1.0 
 * @date July 22 2021 
 */
function getTonnageRates() {
    const type = "tonnage";
    const rates = getRatesList(type)
    return rates;
}

/**
 * This function collects rates and returns a list
 * @author Ravinder Shokar 
 * @vesrion 1.0 
 * @date July 22 2021 
 * @param type Type of rate to be collected.
 */
function getRatesList(type) {
    const per = document.getElementById("per_load_rates");
    const ton = document.getElementById("tonnage_rates");

    let elements;
    let rates = [];
    let obj = {}

    if (type == "per_load") {
        elements = per.querySelectorAll(".input_rate");
    } else {
        elements = ton.querySelectorAll(".input_rate")
    }

    for (let i = 0; i < elements.length; i++) {
        obj = {
            r: parseFloat(elements[i].querySelector(".rate").value.trim()).toFixed(2),
            d: elements[i].querySelector(".dump").value.trim(),
            l: elements[i].querySelector(".load").value.trim(),
        }

        if (validateRate(obj)) {
            rates.push(obj);
        } else {
            return false;
        }
    }

    if (checkDuplicateRates(rates)) {
        return rates
    } else {
        return false
    }
}


/**
 * This function is responsible for validating a rate. This function will display 
 * the error to the HTML 
 * @author Ravinder Shokar 
 * @vesrion 1.0 
 * @date July 22 2021
 * @param rate a json OBJ the container rate, dump, and load
 */
function validateRate(rate) {
    const modal = document.getElementById("confirmation_modal");
    const modalTxt = document.getElementById("confirmation_text");
    const modalYes = document.getElementById("confirmation_yes");
    const modalNo = document.getElementById("confirmation_no");

    if (rate.r < 0) {
        modalTxt.innerHTML = "Rates cannot be less than zero";
        modalTxt.style.color = "red"
        modalNo.style.display = "none";
        modalYes.innerHTML = "Okay";
        modal.style.display = "block";

        modalYes.addEventListener("click", () => {
            document.querySelector(".modal").style.display = "none";
        })
        return false
    } else if (rate.l == "" || rate.d == "") {
        modalTxt.innerHTML = "Dump and load locations cannot be left empty";
        modalTxt.style.color = "red"
        modalNo.style.display = "none";
        modalYes.innerHTML = "Okay";
        modal.style.display = "block";

        modalYes.addEventListener("click", () => {
            document.querySelector(".modal").style.display = "none";
        })

        return false
    }

    return true
}

/**
 * This function checks for duplicate rates. If false displays errorto HTML
 * @author Ravinder Shokar
 * @version 1.0 
 * @date July 22 2021
 * @rates a array of rates
 */
function checkDuplicateRates(rates) {
    const modal = document.getElementById("confirmation_modal");
    const modalTxt = document.getElementById("confirmation_text");
    const modalYes = document.getElementById("confirmation_yes");
    const modalNo = document.getElementById("confirmation_no");

    for (let i = 0; i < rates.length; i++) {
        for (let j = i + 1; j < rates.length; j++) {
            if (rates[i].l == rates[j].l && rates[i].d == rates[j].d) {

                modalTxt.innerHTML = "Cannot have duplicate load and dump locations";
                modalTxt.style.color = "red";

                modalYes.innerHTML = "Okay";
                modalNo.style.display = "none";
                modal.style.display = "block";

                modalYes.addEventListener("click", () => {
                    document.querySelector(".modal").style.display = "none";
                })

                return false
            }
        }
    }
    return true
}



/**
 * This function is meant to toggle hourly rates.
 * If hourly is selected per load and tonnage will be de selected. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 17 2021
 */
function toggleHourlyRates() {
    const hourly = document.getElementById("hourly_check");
    const perLoad = document.getElementById("per_load_check");
    const tonnage = document.getElementById("tonnage_check");

    if (perLoad.checked || tonnage.checked) {
        perLoad.checked = false;
        tonnage.checked = false;

        closeTonnagePerload();
    }

    if (hourly.checked) {
        document.getElementById("hourly_rates").style.display = "block"
    } else {
        document.getElementById("hourly_rates").style.display = "none"
    }
}

/**
 * This function is responsible for closing per load and tonnage rates
 * @author Ravinder Shokar 
 * @vesrion 1.0 
 * @date July 17 2021 
 */
function closeTonnagePerload() {
    document.getElementById("tonnage_rates").style.display = "none";
    document.getElementById("per_load_rates").style.display = "none";
}

/**
 * This function is meant to toggle PerLoad rates
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 17 2021
 */
function togglePerLoadRates() {
    const hourly = document.getElementById("hourly_check");
    const perLoad = document.getElementById("per_load_check");
    const tonnage = document.getElementById("tonnage_check");

    if (hourly.checked) {
        document.getElementById("hourly_rates").style.display = "none";
        hourly.checked = false
    }

    if (perLoad.checked) {
        document.getElementById("per_load_rates").style.display = "block";
    } else {
        document.getElementById("per_load_rates").style.display = "none";
    }
}

/**
 * This function is meant to toggle hourly rates
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 17 2021
 */
function toggleTonnageRates() {
    const hourly = document.getElementById("hourly_check");
    const perLoad = document.getElementById("per_load_check");
    const tonnage = document.getElementById("tonnage_check");

    if (hourly.checked) {
        document.getElementById("hourly_rates").style.display = "none";
        hourly.checked = false
    }

    if (tonnage.checked) {
        document.getElementById("tonnage_rates").style.display = "block";
    } else {
        document.getElementById("tonnage_rates").style.display = "none";
    }
}



/**
 * This function is responsible for updating hourly rates in the DOM 
 * @author Ravinder Shokar
 * @version 1.0 
 * @date July 18 2021 
 * @param rates JSON object containing hourly rates
 */
function updateHourlyRates(rates) {
    document.querySelector("#hourly_rates .tandem input").value = rates.t;
    document.querySelector("#hourly_rates .tandem_2_pup input").value = rates.t2p;
    document.querySelector("#hourly_rates .tandem_3_pup input").value = rates.t3p;
    document.querySelector("#hourly_rates .tandem_3_transfer input").value = rates.t3tf;
    document.querySelector("#hourly_rates .tandem_4_transfer input").value = rates.t4tf;
    document.querySelector("#hourly_rates .tandem_4_end_dump input").value = rates.t4ed;
    document.querySelector("#hourly_rates .tri input").value = rates.tri;
    document.querySelector("#hourly_rates .tri_2_pony input").value = rates.tri2p;
    document.querySelector("#hourly_rates .tri_3_pony input").value = rates.tri3p;
    document.querySelector("#hourly_rates .tri_3_transfer input").value = rates.tri3tf;
    document.querySelector("#hourly_rates .tri_4_transfer input").value = rates.tri4tf;
    document.querySelector("#hourly_rates .tri_4_end_dumo input").value = rates.tri4ed;
}

/**
 * This function adds rates to the HTML.
 * @author Ravinder Shokar 
 * @version 1.0
 * @date July 20 2021
 * @param type which type of rate to be added. Tonnage / Per Load 
 * @param obj optional variable with rate data.
 */
function addRate(type, obj) {
    const ton = document.getElementById("tonnage_rates");
    const per = document.getElementById("per_load_rates");
    const rate = document.createElement("div");


    // HTML ID. Put in class.
    let i;

    if (type == "per_load") {
        const button = document.querySelector("#per_load_rates .add_rate");

        rate.setAttribute("class", "per_load_rate input_rate");
        rate.innerHTML = getRateHTML(obj);

        per.insertBefore(rate, button);

    } else {
        const button = document.querySelector("#tonnage_rates .add_rate");

        rate.setAttribute("class", "tonnage_rate input_rate");
        rate.innerHTML = getRateHTML(obj);

        ton.insertBefore(rate, button);
    }

    rate.querySelector("button").addEventListener("click", (e) => {
        e.path[1].remove();
    });
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
    if (rate == undefined) {
        return `
        <span class="mb-2">Contractor Rate</span>
        <input type="number" class="form-control mb-2 rate" value="0" >
    
        <span class="mb-2">Load</span>
        <input type="text" class="form-control mb-2 load" value="${dispatch.loadLocation}">
    
        <span class="mb-2">Dump</span>
        <input type="text" class="form-control mb-2 dump" value="${dispatch.dumpLocation}">
    
        <button type="button" class="btn btn-danger remove_rate">Remove Rate</button>
        `
    } else {
        return `
        <span class="mb-2">Contractor Rate</span>
        <input type="number" class="form-control mb-2 rate" value="${rate.r}" >
    
        <span class="mb-2">Load</span>
        <input type="text" class="form-control mb-2 load" value="${rate.l}">
    
        <span class="mb-2">Dump</span>
        <input type="text" class="form-control mb-2 dump" value="${rate.d}">
    
        <button type="button" class="btn btn-danger remove_rate">Remove Rate</button>
        `
    }

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

    console.log(dispatch)

    contractor.innerHTML = dispatch.contractor;
    loadLocation.innerHTML = dispatch.loadLocation + "<p class='ticket_text'>Load</p>";
    dumpLocation.innerHTML = dispatch.dumpLocation + "<p class='ticket_text'>Dump</p>";
    date.innerHTML = dispatch.date;
    supplier.innerHTML = "Supplier: " + dispatch.supplier;
    reciever.innerHTML = "Reciever: " + dispatch.reciever;
    material.innerHTML = "Material: " + dispatch.material;
    numTrucks.innerHTML = "<i class='fas fa-truck'></i><span id='number_of_trucks'>" + dispatch.numTrucks + "</span>";
    notes.innerHTML = dispatch.notes;

    //Update rates
    const hourly = document.getElementById("hourly_check");
    const perLoad = document.getElementById("per_load_check");
    const tonnage = document.getElementById("tonnage_check");

    if (dispatch.rates != undefined || dispatch.rates == {}) {
        if (dispatch.rates.hourly != undefined) {
            hourly.checked = true;
            updateHourlyRates(dispatch.rates.hourly);
            toggleHourlyRates()
        } else {
            if (dispatch.rates.perLoad != undefined) {
                perLoad.checked = true;
                document.querySelector("#per_load_rates .operator_rate input").value = dispatch.rates.perLoad.fee;
                dispatch.rates.perLoad.rates.forEach((rate) => {
                    addRate("per_load", rate)
                })
                togglePerLoadRates()
            }

            if (dispatch.rates.tonnage != undefined) {
                tonnage.checked = true;
                document.querySelector("#tonnage_rates .operator_rate input").value = dispatch.rates.tonnage.fee;
                dispatch.rates.tonnage.rates.forEach((rate) => {
                    addRate("tonnage", rate)
                })
                toggleTonnageRates()
            }
        }
    }
})