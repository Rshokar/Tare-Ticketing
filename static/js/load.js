/**
 * This script is responsible for managing load tickets
 * @author Ravinder Shokar 
 * @version 1.0
 * @date July 2 2021
 */
'use strict';



/**
 * This function is responsible for making a post request to the 
 * server with validated data from the html form
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 2 2021
 * @param loadId is the id of the load ticket
 * @param loadStatus is the status of the load ticket. The functions action
 * is dependent on the load status
 */
function editLoadTicket(loadId, loadStatus) {
    const loadLocation = document.getElementById("load_location");
    const loadTime = document.getElementById("load_time");
    const material = document.getElementById("material_input");
    const tonnage = document.getElementById("tonnage");

    let obj = {}

    resetErrors();

    if (loadStatus == "active") {
        obj = {
            loadLocation: loadLocation.value,
            loadTime: loadTime.value,
            material: material.value,
            tonnage: tonnage.value
        }

        if (verifyActiveLoadTIcket(obj)) {
            submitEditedLoadTicket(obj);
        }
    } else {
        const dumpLocation = document.getElementById('dump_location');
        const dumpTime = document.getElementById('dump_time');

        obj = {
            loadLocation: loadLocation.value,
            dumpLocation: dumpLocation.value,
            loadTime: loadTime.value,
            dumpTime: dumpTime.value,
            material: material.value,
            tonnage: tonnage.value
        }


        if (verifyCompleteLoadTicket(obj)) {
            submitEditedLoadTicket(obj);
        }
    }
}


/**
 * This function is responsible for verifying an active load ticket. Making sure it has
 * the corrext values
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 2 2021
 */
function verifyActiveLoadTIcket(loadTicket) {
    const formError = document.getElementById('form_error');
    const loadLocationError = document.getElementById("load_location_error");
    const loadTimeError = document.getElementById("load_time_error");
    const materialError = document.getElementById("materail_error");
    const tonnageError = document.getElementById("tonnage_error");

    const date = new Date();
    let isValid = true;

    // const hours = loadTicket.loadTime.substring(0, 2);
    // const minutes = loadTicket.loadTime.substring(3, 5);

    if (loadTicket.loadLocation == "" || loadTicket.loadTime == "" || loadTicket.material == "" || loadTicket.tonnage == 0) {
        isValid = false;
        formError.innerHTML = "Fields can not be left empty";
    } else if (loadTicket.loadLocation.length < 2) {
        isValid = false;
        loadLocationError.innerHTML = "Load Location must be greater than two characters";
    } else if (loadTicket.tonnage < 0) {
        isValid = false;
        tonnageError.innerHTML = "Must be a positive number."
    }
    // else if (hours < date.getHours() || (hours < date.getHours() && minuets < date.getMinutes())) {
    //     isValid = false;
    //     loadTimeError.innerHTML = "Cannot crete load ticket in the past."
    // }
    return isValid;
}


/**
 * This function is responsible for verifying an complete load ticket. Making sure it has
 * the corrext values
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 2 2021
 */
function verifyCompleteLoadTicket(loadTicket) {
    const formError = document.getElementById('form_error');
    const loadLocationError = document.getElementById("load_location_error");
    const dumpLocationError = document.getElementById("dump_location_error");
    const loadTimeError = document.getElementById("load_time_error");
    const dumpTimeError = document.getElementById("dump_time_error");
    const materialError = document.getElementById("materail_error");
    const tonnageError = document.getElementById("tonnage_error");

    let isValid = true;

    // const hours = loadTicket.loadTime.substring(0, 2);
    // const minutes = loadTicket.loadTime.substring(3, 5);

    if (loadTicket.loadLocation == "" || loadTicket.loadTime == "" || loadTicket.material == "" || loadTicket.tonnage == 0) {
        isValid = false;
        formError.innerHTML = "Fields can not be left empty";
    } else if (loadTicket.loadLocation.length < 2) {
        isValid = false;
        loadLocationError.innerHTML = "Load Location must be greater than two characters";
    } else if (loadTicket.dumpLocation.length < 2) {
        isValid = false;
        dumpLocationError.innerHTML = "Dump Location must be greater than two characters";
    } else if (loadTicket.tonnage < 0) {
        isValid = false;
        tonnageError.innerHTML = "Must be a positive number."
    } else if (loadTicket.dumpTime < loadTicket.loadTime) {
        isVald = false;
        dumpTimeError.innerHTML = "Dump time cannot be before load time."
    }
    // else if (hours < date.getHours() || (hours < date.getHours() && minuets < date.getMinutes())) {
    //     isValid = false;
    //     loadTimeError.innerHTML = "Cannot crete load ticket in the past."
    // }
    return isValid;
}




/**
 * This function resets all errors in jobs 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 30 2021
 * @param {} errors array of erros to be reset
 */
function resetErrors() {
    const errors = document.querySelectorAll(".error");
    errors.forEach((err, index) => {
        err.innerHTML = ""
    })
}

/**
 * This function is responsible for sending a post request to edit 
 * a load ticket. 
 * @author Ravidner Shokar 
 * @version 1.0 
 * @date July 2 2021 
 */
function submitEditedLoadTicket(loadTicket) {

    const confModal = document.getElementById("confirmation_modal");
    const confText = document.getElementById("confirmation_text");
    const confYes = document.getElementById("confirmation_yes");
    const confNo = document.getElementById("confirmation_no");

    const url = window.location.href;
    const query = new URL(url);
    const jobId = query.searchParams.get("jobId");
    const loadId = query.searchParams.get("loadId");

    const obj = {
        loadTicket,
        jobId,
        loadId
    }

    $.ajax({
        url: "/edit_load",
        type: "POST",
        dataType: "JSON",
        data: obj,
        success: (data) => {
            if (data.status == "success") {
                confText.innerHTML = data.message;
                confYes.innerHTML = "Okay";
                confNo.style.display = "none";

                confModal.style.display = "block";

                confYes.addEventListener("click", () => {
                    window.location.href = "/job?id=" + jobId;
                })
            } else {
                confText.innerHTML = "Failed to update load ticket";
                confYes.innerHTML = "Okay";
                confNo.style.display = "none";

                confModal.style.display = "block";

                confYes.addEventListener("click", () => {
                    confModal.style.display = "none"
                })
            }
            console.log(data);
        },
        error: (err) => {
            confText.innerHTML = "Error updating load ticket. Try again later";
            confYes.innerHTML = "Okay";
            confNo.style.display = "none";

            confModal.style.display = "block";

            confYes.addEventListener("click", () => {
                confModal.style.display = "none"
            })
        }
    })
}

const deleteLoadTicket = () => {
    const confModal = document.getElementById("confirmation_modal");
    const confText = document.getElementById("confirmation_text");
    const confYes = document.getElementById("confirmation_yes");
    const confNo = document.getElementById("confirmation_no");

    confYes.removeEventListener('click', deleteLoadTicket)

    const url = window.location.href;
    const query = new URL(url);
    const jobId = query.searchParams.get("jobId");
    const loadId = query.searchParams.get("loadId")

    console.log(jobId);
    console.log(loadId);


    $.ajax({
        url: "/delete_load_ticket",
        dataType: "JSON",
        type: "POST",
        data: {
            jobId,
            loadId
        },
        success: (data) => {
            if (data.status == "success") {
                confText.innerHTML = data.message;
                confYes.innerHTML = "Okay";
                confNo.style.display = "none";
                confYes.addEventListener("click", () => {
                    window.location.href = "/job?id=" + jobId;
                })
            } else {
                confText.innerHTML = data.message;
                confYes.innerHTML = "Okay";
                confNo.style.display = "none";
                confYes.addEventListener("click", () => {
                    confModal.style.display = "none";
                })
            }
            console.log(data);
        },
        error: (err) => {
            console.log(err);
        }
    })

}


/**
 * This function is responsible for operning up the delete load modal
 * @author Ravinder Shokar
 * @vesrion 1.0
 * @date July 2 2021
 */
function deleteLoadModal() {
    const confModal = document.getElementById("confirmation_modal");
    const confText = document.getElementById("confirmation_text");
    const confYes = document.getElementById("confirmation_yes");
    const confNo = document.getElementById("confirmation_no");

    confText.innerHTML = "Are you sure you want to delete this load ticket.";

    confYes.addEventListener("click", deleteLoadTicket);

    confNo.addEventListener("click", () => {
        confModal.style.display = "none";
    })

    confModal.style.display = "block";
}

