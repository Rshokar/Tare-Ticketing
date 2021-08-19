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
    const fileModal = document.getElementById("file_type_modal");
    const txt = document.getElementById('text')
    const yes = document.getElementById("yes");
    document.getElementById("no").addEventListener("click", closeModals);
    if (validateInvoiceQuery(query)) {
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

        submitQuery(query, modal)
            .then(data => {
                modal.modal.style.display = "none";
                txt.innerHTML = data.message;
                yes.setAttribute("onclick", `downloadInvoice('${data.result.inv._id}')`)
                fileModal.style.display = "block";
            })
            .catch(e => {
                modal.modal.style.display = "none";
                console.log(e);
                if (e.err.code === "form") {
                    modal.txt.innerHTML = e.err.message;
                }

                modal.txt.style.color = "red"
                modal.yes.style.display = "block";
                modal.yes.addEventListener("click", closeModals)

            })
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

    return query = {
        start: start.value.trim() + "T" + "00:00",
        finish: finish.value + "T" + "00:00",
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

    console.log(q);
    let isValid = true;

    resetErrors();

    if (q.finish === ""
        || q.start === ""
        || q.customer === ""
        || (q.type !== "operator" && q.type !== "contractor" && q.type !== "dispatcher")) {
        document.getElementById("form_error").innerHTML = "Fill in all required fields."
        return false
    }
    return isValid;
}

/**
 * Post request to server with search query
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 2 2021
 * @param { JSON } q invoice query
 * @param { JSON } modal JSON object containin confirmation modal elements
 */
function submitQuery(q) {
    return new Promise((res, rej) => {
        $.ajax({
            url: "/build_invoice",
            type: "POST",
            dateType: "JSON",
            data: q,
            success: (data) => {
                if (data.status === "success") {
                    res(data)
                } else {
                    rej(data)
                }
            },
            error: (err) => {
                rej({
                    status: "error",
                    err: {
                        code: "form",
                        message: "Error connecting to servers. Please try again later."
                    }
                })
            }
        })
    })






}

/**
 * Opens a new tab which will start the downloading the inovices
 * @author Ravinder Shokar
 * @version 1.0 
 * @date Aug 12 2021
 * @param { String } id Inovice Id
 */
function downloadInvoice(id) {
    const pdf = document.getElementById("pdf_check").checked;
    const csv = document.getElementById("csv_check").checked;

    if (!pdf && !csv) {
        document.getElementById("file_format_error").innerHTML = "Please select a file type";
    } else {
        document.getElementById("text").innerHTML = "If a file did not begin downloading, try again or come back later";
        document.getElementById("yes").innerHTML = "Try Again";

        let url = "/download?id=" + id;
        url = url + (pdf ? "&pdf=true" : "&pdf=false");
        url = url + (csv ? "&csv=true" : "&cssv=false");

        var popout = window.open(url)
        window.setTimeout(function () {
            popout.close();
        }, 2000);
    }
}

$(document).ready(() => {
    const start = document.getElementById("start_date");
    const finish = document.getElementById("finish_date");

    start.addEventListener("change", (e) => {
        let d = new Date(e.target.value);
        finish.min = d.toJSON().split('T')[0];
    })

    const pdf = document.getElementById("pdf_check");
    const csv = document.getElementById("csv_check");

    pdf.addEventListener("change", (e) => {
        if (!e.target.checked && !csv.checked) {
            csv.checked = true;
        }
    })

    csv.addEventListener("change", (e) => {
        if (!e.target.checked && !pdf.checked) {
            pdf.checked = true;
        }
    })
})
