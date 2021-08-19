'use strict';

/**
 * This function is responsible for gathering and validation form data, then saving it 
 * to session storage
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 13 2021
 */
function next(url) {
    let dispatch = sessionStorage.getItem('dispatch');
    let data = getDispatchFormData();

    const edit = new URL(window.location.href).searchParams.get("edit");
    url = url + "?contractor=" + data.contractor.replace("&", "%26");
    url += (edit ? "&edit=true" : "");

    if (dispatch == null || dispatch == "") {
        if (validateDispatch(data)) {
            sessionStorage.setItem('dispatch', JSON.stringify(data));
            window.location.href = url;
        }
    } else {
        dispatch = JSON.parse(dispatch);
        if (validateDispatch(data)) {
            data["_id"] = (dispatch._id !== undefined ? dispatch._id : "")
            data["operators"] = (dispatch.operators !== undefined ? dispatch.operators : [])
            data["rates"] = (dispatch.rates !== undefined ? dispatch.rates : [])
            data["status"] = (dispatch.status !== undefined ? dispatch.status : {})
            sessionStorage.setItem('dispatch', JSON.stringify(data));
            window.location.href = url;
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
        numTrucks: (numTrucks.value == "" ? 0 : Math.trunc(numTrucks.value)),
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
        const numTrucksError = document.getElementById('num_trucks_error');
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

function showReciever() {
    let checkReciever = document.getElementById("reciever_check");
    let reciever = document.getElementById("reciever");

    change(reciever, checkReciever.checked)
}

function showSupplier() {
    let checkSupplier = document.getElementById("supplier_check");
    let supplier = document.getElementById("supplier");

    change(supplier, checkSupplier.checked)
}

function showMaterial() {
    let checkMaterial = document.getElementById("material_check");
    let material = document.getElementById("material");

    change(material, checkMaterial.checked)

}

function change(div, bool) {
    if (bool) {
        div.style.display = 'block';
        div.scrollIntoView()
        div.focus();
    } else {
        div.style.display = "none"
    }
}

/**
 * This function deletes the saved dispatch from sesssion storage and 
 * redirects the user to the dashboard 
 * @author Ravinder Shokar 
 * @version 1.1 
 * @date Aug 17 2021
 * @param { String } url 
 */
function exit(url) {
    sessionStorage.removeItem("dispatch");
    console.log("hello");
    window.location.href = url;
}

/**
 * This function disables inputes dependent dispatch status
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 13 2021
 * @param { JSON } d Dispatch ticket
 */
function disableInputs(d) {

    document.getElementById("num_trucks").disabled = true;
    document.getElementById("add_contractor").style.display = "none"

    const contractor = document.getElementById("contractor");
    const date = document.getElementById("date");
    const loadLocation = document.getElementById("load_location");
    const dumpLocation = document.getElementById("dump_location");
    const notes = document.getElementById("notes");
    const reciever = document.querySelector("#reciever input");
    const supplier = document.querySelector("#supplier input");
    const material = document.querySelector("#material input");

    const s = d.status

    if ((s.sent > 0 || s.confirmed > 0) && s.active === 0 && s.complete === 0) {
        contractor.disabled = true;
    } else if (s.active > 0) {
        contractor.disabled = true;
        date.disabled = true;
        loadLocation.disabled = true;
        dumpLocation.disabled = true;
    } else if (s.sent === 0 && s.confirmed === 0 && s.active === 0 & s.complete > 0) {
        contractor.disabled = true;
        date.disabled = true;
        loadLocation.disabled = true;
        dumpLocation.disabled = true;
        notes.disabled = true;
        reciever.disabled = true;
        supplier.disabled = true;
        material.disabled = true;
    }
}



$(document).ready(async () => {

    var updateDispatchForm = (disp, savedDispatch) => {
        const materialCheck = document.getElementById("material_check")
        const supplierCheck = document.getElementById("supplier_check")
        const recieverCheck = document.getElementById("reciever_check")

        const contractor = document.getElementById("contractor");
        const date = document.getElementById("date");
        const loadLocation = document.getElementById("load_location");
        const dumpLocation = document.getElementById("dump_location");
        const numTrucks = document.getElementById("num_trucks");
        const notes = document.getElementById("notes");
        const reciever = document.querySelector("#reciever input");
        const supplier = document.querySelector("#supplier input");
        const material = document.querySelector("#material input");

        contractor.value = disp.contractor;
        date.value = (savedDispatch ? savedDispatch.date : disp.date);
        loadLocation.value = (savedDispatch ? savedDispatch.loadLocation : disp.loadLocation);
        dumpLocation.value = (savedDispatch ? savedDispatch.dumpLocation : disp.dumpLocation);
        numTrucks.value = (savedDispatch ? savedDispatch.numTrucks : disp.numTrucks);
        notes.value = (savedDispatch ? savedDispatch.notes : disp.notes);
        reciever.value = (savedDispatch ? savedDispatch.reciever : disp.reciever);
        supplier.value = (savedDispatch ? savedDispatch.supplier : disp.supplier);
        material.value = (savedDispatch ? savedDispatch.material : disp.material);

        if (disp.reciever !== "") {
            recieverCheck.checked = true;
            showReciever();
        }
        if (disp.supplier !== "") {
            supplierCheck.checked = true;
            showSupplier();
        }
        if (disp.material !== "") {
            materialCheck.checked = true;
            showMaterial();
        }
    }

    const redirectToDispatch = (id) => {
        const URL = "/dispatch?id=" + id;
        document.getElementById("exit").setAttribute("onclick", `exit('${URL}')`)
    }

    const url = new URL(window.location.href);
    const edit = url.searchParams.get("edit");
    const newDispatch = url.searchParams.get("new");

    let savedDispatch, dispId, disp, date;

    if (newDispatch) {
        sessionStorage.removeItem('dispatch')
    } else if (sessionStorage.getItem('dispatch')) {
        savedDispatch = JSON.parse(sessionStorage.getItem('dispatch'));
    }

    if (edit) {
        document.getElementById("title").innerHTML = "Edit Dispatch"
        dispId = url.searchParams.get("dispId");

        // Change exit redirect to point to dspatch ticket.
        redirectToDispatch(dispId);

        try {
            disp = await getDispatch(dispId);
            disableInputs(disp);
            if (!savedDispatch) { sessionStorage.setItem('dispatch', JSON.stringify(disp)); }
            date = new Date(disp.date)
            disp.date = date.getFullYear() + "-" + ((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1) + "-" + date.getDate();
            updateDispatchForm(disp, savedDispatch);
        } catch (e) {
            console.log(e);
        }
    } else {
        if (savedDispatch != "" && savedDispatch != null && savedDispatch != undefined) {
            savedDispatch = JSON.parse(savedDispatch);
            updateDispatchForm(savedDispatch)
        }
    }
})