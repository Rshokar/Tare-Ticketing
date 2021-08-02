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

}


$(document).ready(() => {
    const start = document.getElementById("start_date");
    const finish = document.getElementById("finish_date");


    start.addEventListener("change", (e) => {
        let d = new Date(e.path[0].value);
        finish.min = d.toJSON().split('T')[0];
    })
})
