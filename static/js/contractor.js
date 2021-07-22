/**
 * This function is responsible for showing and hiding contractor rates
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 12 2021
 */
function toggleContractorRates() {
    const rates = document.getElementById("contractor_rates");

    if (rates.style.display == "none") {
        rates.style.display = "block"
    } else {
        rates.style.display = "none"
    }

}

/**
 * This function is resonsible for showing and hiding operators rates
 * @author Ravidner Shokar 
 * @version 1.0 
 * @date July 12 2021 
 */
function toggleOperatorRates() {
    const rates = document.getElementById("operator_rates");
    if (rates.style.display == "none") {
        rates.style.display = "block"
    } else {
        rates.style.display = "none"
    }
}


/**
 * This function is responsible for editing operators rates
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 17 2021
 */
function saveOperatorRates() {
    const confModal = document.getElementById("confirmation_modal");
    const confText = document.getElementById("confirmation_text");
    const confYes = document.getElementById("confirmation_yes");

    confYes.addEventListener("click", closeConfModals);
    confYes.style.display = "block";
    confYes.innerHTML = "Okay";

    displayConfirmationModal();

    let url = window.location.href;
    let query = new URL(url);
    let contractor = query.searchParams.get("contractor");

    const rates = getOperatorRates();

    if (verifyRates(rates)) {
        $.ajax({
            url: "/update_operator_rates",
            dataType: "JSON",
            type: "POST",
            data: { rates, contractor },
            success: (data) => {
                console.log(data);
                if (data.status == "success") {
                    confText.innerHTML = data.message;
                    confText.style.color = "green";
                    confYes.style.display = "block";
                } else {
                    confText.innerHTML = data.message;
                    confText.style.color = "red";
                    confYes.style.display = "block";
                }
            },
            error: (err) => {
                confText.innerHTML = "Error Saving Rates";
                confText.style.color = "red";
                confYes.style.display = "block";

            }
        })

    } else {
        confYes.style.display = "block";
        confYes.innerHTML = "Okay";
        confText.innerHTML = "Rates Cannot be less than zero";
        confText.style.color = "red";

        confYes.addEventListener("click", closeConfModals)
    }
}


/**
 * This function is responsible for getting all operators rates. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 17 2021 
 */
function getOperatorRates() {
    return {
        tonnage: document.querySelector("#operator_rates .tonnage_rate input").value,
        perLoad: document.querySelector("#operator_rates .per_load_rate input").value,
        t: document.querySelector("#operator_rates .tandem input").value,
        t2p: document.querySelector("#operator_rates .tandem_2_pup input").value,
        t3p: document.querySelector("#operator_rates .tandem_3_pup input").value,
        t3tf: document.querySelector("#operator_rates .tandem_3_transfer input").value,
        t4tf: document.querySelector("#operator_rates .tandem_4_transfer input").value,
        t4ed: document.querySelector("#operator_rates .tandem_4_end_dump input").value,
        tri: document.querySelector("#operator_rates .tri input").value,
        tri2p: document.querySelector("#operator_rates .tri_2_pony input").value,
        tri3p: document.querySelector("#operator_rates .tri_3_pony input").value,
        tri3tf: document.querySelector("#operator_rates .tri_4_transfer input").value,
        tri4tf: document.querySelector("#operator_rates .tri_4_transfer input").value,
        tri4ed: document.querySelector("#operator_rates .tri_4_end_dumo input").value,
    }
}

/**
 * This function is responsible for editing contractor rates
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 17 2021
 */
function saveContractorRates() {
    const confModal = document.getElementById("confirmation_modal");
    const confText = document.getElementById("confirmation_text");
    const confYes = document.getElementById("confirmation_yes");

    confYes.addEventListener("click", closeConfModals);
    confYes.innerHTML = "Okay";

    displayConfirmationModal()

    let url = window.location.href;
    let query = new URL(url);
    let contractor = query.searchParams.get("contractor");

    const rates = getContractorRates();

    if (verifyRates(rates)) {
        $.ajax({
            url: "/update_contractor_rates",
            dataType: "JSON",
            type: "POST",
            data: { rates, contractor },
            success: (data) => {
                console.log(data);
                if (data.status == "success") {
                    confText.innerHTML = data.message;
                    confText.style.color = "green";
                    confYes.style.display = "block";
                } else {
                    confText.innerHTML = data.message;
                    confText.style.color = "red";
                    confYes.style.display = "block";
                }
            },
            error: (err) => {
                confText.innerHTML = "Error Saving Rates";
                confText.style.color = "red";
                confYes.style.display = "block";
            }
        })

    } else {
        confYes.style.display = "block";
        confYes.innerHTML = "Okay";
        confText.innerHTML = "Rates Cannot be less than zero";
        confText.style.color = "red";

        confYes.addEventListener("click", closeConfModals)
    }

}


/**
 * This function is responsible for getting all contractor rates. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 17 2021 
 */
function getContractorRates() {
    return {
        t: document.querySelector("#contractor_rates .tandem input").value,
        t2p: document.querySelector("#contractor_rates .tandem_2_pup input").value,
        t3p: document.querySelector("#contractor_rates .tandem_3_pup input").value,
        t3tf: document.querySelector("#contractor_rates .tandem_3_transfer input").value,
        t4tf: document.querySelector("#contractor_rates .tandem_4_transfer input").value,
        t4ed: document.querySelector("#contractor_rates .tandem_4_end_dump input").value,
        tri: document.querySelector("#contractor_rates .tri input").value,
        tri2p: document.querySelector("#contractor_rates .tri_2_pony input").value,
        tri3p: document.querySelector("#contractor_rates .tri_3_pony input").value,
        tri3tf: document.querySelector("#contractor_rates .tri_4_transfer input").value,
        tri4tf: document.querySelector("#contractor_rates .tri_4_transfer input").value,
        tri4ed: document.querySelector("#contractor_rates .tri_4_end_dumo input").value,
    }
}

/**
 * This function displays the confirmation modal while making ajax call
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 17 2021 
 */
function displayConfirmationModal() {
    const confModal = document.getElementById("confirmation_modal");
    const confText = document.getElementById("confirmation_text");
    const confYes = document.getElementById("confirmation_yes");
    const confNo = document.getElementById("confirmation_no");

    confModal.style.display = "block";
    confText.innerHTML = "Saving Rates";
    confYes.style.display = "none";
    confNo.style.display = "none";
}

/**
 * This function is responsible for verifying rate
 * @author Ravinder Shokar 
 * @version 1.0
 * @date July 17 2021
 */
function verifyRates(rates) {
    if (
        rates.t < 0 ||
        rates.t2p < 0 ||
        rates.t3p < 0 ||
        rates.t3tf < 0 ||
        rates.t4tf < 0 ||
        rates.tonnage < 0 ||
        rates.tri < 0 ||
        rates.tri2p < 0 ||
        rates.tri3p < 0 ||
        rates.tri3tf < 0 ||
        rates.tri4ed < 0 ||
        rates.tri4tf < 0 ||
        rates.perLoad < 0
    ) {
        return false;
    } else {
        return true;
    }
}

/**
 * This function is responsible for closing confirmation modal 
 * @auhtor Ravinder Shokar 
 * @version 1.0
 * @date July 17 2021
 */
function closeConfModals() {
    const confText = document.getElementById("confirmation_text");
    const confModal = document.getElementById("confirmation_modal");
    confModal.style.display = "none";
    confText.style.color = "black";
}