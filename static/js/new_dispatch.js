/**
 * This file is responsible for the creation of a dispatch
 * @author Ravinder Shokar
 * @version 1.0
 * @date June 15 2021
 */
'use strict';

/**
 * This function is responsible for gathering and validation form data, then saving it 
 * to session storage
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 16 2021
 */
function next(url) {
    let dispatch = sessionStorage.getItem('dispatch');
    let data = getDispatchFormData();
    console.log(data);
    console.log(url + "?contractor=" + data.contractor)

    if (dispatch == null || dispatch == "") {
        if (validateDispatch(data)) {
            sessionStorage.setItem('dispatch', JSON.stringify(data));
            window.location.href = url + "?contractor=" + data.contractor;
        }
    } else {
        dispatch = JSON.parse(dispatch);
        if (validateDispatch(data)) {
            if (dispatch.opreators != undefined) {
                data['operators'] = dispatch.operators;
            }
            if (dispatch.rates != undefined) {
                data["rates"] = dispatch.rates;
            }
            sessionStorage.setItem('dispatch', JSON.stringify(data));
            window.location.href = url + "?contractor=" + data.contractor;
        }
    }

}

/**
 * THis function will get and return all form data 
 * @author Ravinder Shokar
 * @version 1.0 
 * @date June 16 2021 
 * @return and {} obj with dispatch details
 */
function getDispatchFormData() {
    let contractor = document.getElementById("contractor");
    let date = document.getElementById("date");
    let loadLocation = document.getElementById("load_location");
    let dumpLocation = document.getElementById("dump_location");
    let numTrucks = document.getElementById("num_trucks");
    let notes = document.getElementById("notes");
    let reciever = document.querySelector("#reciever input");
    let supplier = document.querySelector("#supplier input");
    let material = document.querySelector("#material input");

    return {
        contractor: contractor.value.trim(),
        date: date.value.trim(),
        loadLocation: loadLocation.value.trim(),
        dumpLocation: dumpLocation.value.trim(),
        numTrucks: numTrucks.value,
        notes: notes.value.trim(),
        reciever: reciever.value.trim(),
        supplier: supplier.value.trim(),
        material: material.value.trim()
    }
}


/**
 * This function will validate the dispatch
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 16 2021 
 * @return true if dispatch is valid
 */
function validateDispatch(data) {
    let isValid = true;

    let date = new Date();

    let currentDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    let dispatchDate = data.date;


    resetErrors();

    if (data.contractor == ""
        || data.date == ""
        || data.dumpLocation == ""
        || data.loadLocation == ""
    ) {
        const formError = document.getElementById('form-error');
        formError.innerHTML = "Rerquired Fields must not be left empty"
        return false;
    }

    if (data.contractor == "Select A Contractor") {
        const contractorError = document.getElementById('contractor-error');
        contractorError.innerHTML = "Must select a valid contractor";
        isValid = false;
    }

    if (data.numTrucks < 0) {
        const numTrucksError = document.getElementById('num-trucks-error');
        numTrucksError.innerHTML = "Number of trucks must be greater or equal than zero";
        isValid = false;
    }

    if (data.loadLocation.length < 2) {
        const loadLocationError = document.getElementById('load-location-error');
        loadLocationError.innerHTML = "Load Location must be longer than two characters";
        isValid = false;
    }

    if (data.dumpLocation.length < 2) {
        const dumpLocationError = document.getElementById('dump-location-error');
        dumpLocationError.innerHTML = "Dump Location must be longer than two characters";
        isValid = false;
    }

    if (data.reciever.length > 0 && data.reciever.length < 2) {
        const recieverError = document.getElementById('reciever-error');
        recieverError.innerHTML = "Reciever must be longer than two characters";
        isValid = false;
    }

    if (data.supplier.length > 0 && data.supplier.length < 2) {
        const supplierError = document.getElementById('supplier-error');
        supplierError.innerHTML = "Supplier must be longer than two characters";
        isValid = false;
    }

    if (data.material.length > 0 && data.material.length < 2) {
        const materialError = document.getElementById('material-error');
        materialError.innerHTML = "Material must be longer than two characters";
        isValid = false;
    }


    return isValid;
}

/**
 * THis function resets all erros on the new dispatch form
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 16 2021 
 */
function resetErrors() {
    const errors = document.querySelectorAll(".error");
    for (let i = 0; i < errors.length; i++) {
        errors[i].innerHTML = ""
    }

}

/**
 * This function deletes the saved dispatch from sesssion storage and 
 * redirects the user to the dashboard 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 16 2021
 */
function exit() {
    sessionStorage.removeItem("dispatch");
    window.location.href = "/dashboard";
}

$(document).ready(() => {
    let dispatch = sessionStorage.getItem('dispatch');


    let contractor = document.getElementById("contractor");
    let date = document.getElementById("date");
    let loadLocation = document.getElementById("load_location");
    let dumpLocation = document.getElementById("dump_location");
    let numTrucks = document.getElementById("num_trucks");
    let notes = document.getElementById("notes");
    let reciever = document.querySelector("#reciever input");
    let supplier = document.querySelector("#supplier input");
    let material = document.querySelector("#material input");

    if (dispatch != "" && dispatch != null) {
        dispatch = JSON.parse(dispatch);
        contractor.value = dispatch.contractor;
        date.value = dispatch.date;
        loadLocation.value = dispatch.loadLocation;
        dumpLocation.value = dispatch.dumpLocation;
        numTrucks.value = dispatch.numTrucks;
        notes.value = dispatch.notes;
        reciever.value = dispatch.reciever;
        supplier.value = dispatch.supplier;
        material.value = dispatch.material;
    }
})