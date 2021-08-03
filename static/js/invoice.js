/**
 * This file is responsible for submitting a query for an invoice
 * and clarifyin route rates
 * @author Ravinder Shokar
 * @date Aug 2 2021
 * @vesrsion 1.0 
 */


/**
 * This function is responsible for submiting a query to build an invoice
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date AUg 2 2021
 */
function submitInvoiceQuery() {
    const query = getQueryData();
    const str = "Creating Invoice"

    const options = {
        txtColor: "green",
        text: "Building Invoice....",
        buttons: {
            y: false,
            n: false,
        },
        yText: "Okay",
    }

    const modal = newModal(options);

    modal.modal.style.display = "block";

    if (validateInvoiceQuery(query)) {
        submitQuery(query, modal);
    }
}

/**
 * This function get invouce query data
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 2 2021
 */
function getQueryData() {
    const start = document.getElementById("start_date");
    const finish = document.getElementById("finish_date");

    const oper = document.querySelector("#operator input");
    const cont = document.querySelector("#contractor select");

    const opCheck = document.getElementById("operator_check");
    const cotCheck = document.getElementById("contractor_check");

    return query = {
        start: start.value,
        finish: finish.value,
        type: (opCheck.checked ? "operator" : "contractor"),
        customer: (opCheck.checked ? oper.value : cont.value),
    }
}

/**
 * Verify query
 * @author Ravinder Shokar
 * @version 1.0
 * @date Aug 2 2021 
 * @param { JSON } q Invoice Query
 */
function validateInvoiceQuery(q) {
    let isValid = true;

    resetErrors();

    if (q.finish === ""
        || q.start === ""
        || q.customer === ""
        || (q.type !== "operator" && q.type !== "contractor" && q.type !== "dispatcher")) {
        document.getElementById("form_error").innerHTML = "Fill in all required fields."
        isValid = false
    }
    return true;
}

/**
 * Post request to server with search query
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 2 2021
 * @param { JSON } q invoice query
 * @param { JSON } modal JSON object containin confirmation modal elements
 */
function submitQuery(q, modal) {
    if (q === undefined) {
        throw 'Passed in undefined query'
        return;
    }

    $.ajax({
        url: "/build_invoice",
        type: "POST",
        dateType: "JSON",
        data: q,
        success: (data) => {
            console.log(data);
            if (data.status === "success") {
                modal.txt.innerHTML = data.message;
                modal.txt.style.color = "green";
                modal.yes.style.display = "block";
                modal.yes.addEventListener("click", closeModals);
            } else {
                modal.txt.innerHTML = data.message;
                modal.txt.style.color = "red";
                modal.yes.style.display = "block";
                modal.yes.addEventListener("click", closeModals);
            }

        },
        error: (err) => {

        }
    })





}

$(document).ready(() => {
    const start = document.getElementById("start_date");
    const finish = document.getElementById("finish_date");

    start.addEventListener("change", (e) => {
        let d = new Date(e.path[0].value);
        finish.min = d.toJSON().split('T')[0];
    })
})
