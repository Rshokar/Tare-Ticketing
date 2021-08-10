/**
 * This function is responsible for making a post request to the 
 * server with validated data from the html form
 * @author Ravinder Shokar 
 * @version 1.1 
 * @date Aug 9 2021
 * @param loadId is the id of the load ticket
 * @param p { Boolean } if job is paid perLoad
 * @param t { Boolean } if job is paid tonnage
 * @param h { Boolean } if job is paid hourly
 */
function editLoadTicket(loadId, loadStatus, p, t, h) {
    let m, o, code, message, temp, obj;
    resetErrors();

    if (loadStatus == "active") {
        obj = getActiveLoadData(h, p, t);
        obj.status = loadStatus;
        if (verifyActiveLoadTicket(obj)) {
            submitEditedLoadTicket(obj)
                .then(data => {
                    modalThenRedirect(data.message, 2000, "/job?id=" + obj.jobId);
                })
                .catch(e => {
                    displayErrorMessage(e);
                })
        }
    } else if (loadStatus == "complete") {
        obj = getLoadData(h, p, t);
        console.log(obj);
        obj.status = loadStatus;
        if (verifyCompleteLoadTicket(obj) && verifyActiveLoadTicket(obj)) {
            submitEditedLoadTicket(obj)
                .then(data => {
                    modalThenRedirect(data.message, 2000, "/job?id=" + obj.jobId);
                })
                .catch(e => {
                    displayErrorMessage(e);
                })
        }
    }
}


/**
 * Gets completed load tickete data
 * @author Ravinder Shokar 
 * @version 1.0
 * @date Aug 9 2021

 */
function getCompletedLoadData(p, t, h) {
    const isTon = document.getElementById("tonnage_check").checked;
    const isLoad = document.getElementById("load_check").checked;

    const time = document.getElementById("load_time").value;
    const date = document.getElementById("load_date").value;
    const mat = document.getElementById("material_input").value;
    const ton = document.getElementById("tonnage_input").value;
    const dumpDate = document.getElementById("dump_date").value;
    const dumpTime = document.getElementById('dump_time').value;

    let loadLocation;
    if ((!h && !p && t) || (!h && p && !t) || (h && !p && !t)) {
        loadLocation = document.getElementById("load_locations");
    } else {
        loadLocation = (isTon ? document.getElementById("tonnage_load_locations") : document.getElementById("per_load_locations"));
    }

    let obj = {
        loadLocation: loadLocation.value,
        loadTime: date.value + "T" + time.value,
        material: mat.value,
        tonnage: parseFloat(ton.value).toFixed(2),
        type: (isTon ? "ton" : "load"),
        dumpLocation: document.getElementById('dump_locations').value,
        dumpTime: dumpTime + "T" + dumpDate,
    }
    return obj;
}


/**
 * This function is responsible for verifying an complete load ticket. Making sure it has
 * the corrext values
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 2 2021
 */
function verifyCompleteLoadTicket(loadTicket) {
    console.log(loadTicket)
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

    if (loadTicket.loadLocation == "default" ||
        loadTicket.material == "" ||
        (loadTicket.type != "load" && (loadTicket.tonnage == 0 || loadTicket.tonnage == "NaN"))) {
        isValid = false;
        formError.innerHTML = "Required fields can not be left empty or on default state";
    } else if (loadTicket.loadLocation.length < 2) {
        isValid = false;
        loadLocationError.innerHTML = "Load Location must be greater than two characters";
    } else if (loadTicket.dumpLocation.length < 2) {
        isValid = false;
        dumpLocationError.innerHTML = "Dump Location must be greater than two characters";
    } else if (loadTicket.type != "load" && loadTicket.tonnage < 10) {
        isValid = false;
        tonnageError.innerHTML = "Must be a positive number greater than 10."
    } else if (loadTicket.dumpTime < loadTicket.loadTime) {
        isValid = false;
        dumpTimeError.innerHTML = "Dump time cannot be before load time."
    }
    // else if (hours < date.getHours() || (hours < date.getHours() && minuets < date.getMinutes())) {
    //     isValid = false;
    //     loadTimeError.innerHTML = "Cannot crete load ticket in the past."
    // }
    return isValid;
}

/**
 * This function is responsible for sending a post request to edit 
 * a load ticket. 
 * @author Ravidner Shokar 
 * @version 1.0 
 * @date July 2 2021 
 */
function submitEditedLoadTicket(loadTicket) {
    return new Promise((res, rej) => {
        const query = new URL(window.location.href);
        const loadId = query.searchParams.get("loadId");

        const obj = { loadTicket, loadId }
        $.ajax({
            url: "/edit_load",
            type: "POST",
            dataType: "JSON",
            data: obj,
            success: (data) => {
                if (data.status == "success") {
                    res(data);
                } else {
                    rej(data);
                }
            },
            error: (err) => {
                rej({
                    status: "error",
                    err: {
                        code: "request",
                        message: "Error connecting to server."
                    }
                })
            }
        })
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
    const jobId = query.searchParams.get("id");
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



$(document).ready(() => {
    const pLoad = document.getElementById("per_load_locations");
    const tLoad = document.getElementById("tonnage_load_locations");
    const load = document.getElementById("load_locations");

    if (pLoad) { pLoad.addEventListener("change", (e) => { updateDumpLocationListner(e); }) };
    if (tLoad) { tLoad.addEventListener("change", (e) => { updateDumpLocationListner(e); }) };
    if (load) { load.addEventListener("change", (e) => { updateDumpLocationListner(e); }) };
})


/**
 * Updates the dump location if the load location has changed. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 8 2021
 * @param { Evemt } e 
 */
const updateDumpLocationListner = (e) => {
    const query = new URL(window.location.href);
    const loadId = query.searchParams.get("loadId");

    const isTon = document.getElementById("tonnage_check").checked;
    const isLoad = document.getElementById("load_check").checked

    getJob()
        .then(job => {
            updateDumpLocations(job, loadId, isTon, isLoad, e.target.value)
        });
}
