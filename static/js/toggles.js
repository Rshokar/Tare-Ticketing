/**
 * Toggles billing address on contractor page
 * @version 1.0 
 * @date Aug 31 2021
 */
function toggleBillingAdress() {
    const userDetail = document.querySelector(".user_details_billing");
    const editForm = document.querySelector(".edit_address_form");

    document.getElementById("autocomplete").removeAttribute("autocomplete")

    if (userDetail.style.display === "" || userDetail.style.display === "grid") {
        initAutocomplete()
        userDetail.style.display = "none";
        editForm.style.display = "block";
    } else {
        userDetail.style.display = "grid";
        editForm.style.display = "none";
    }
}

/**
 * Toggles the display of user infromation and form
 * @version 1.0 
 * @date Aug 31 2021
 */
function toggleUserInformation() {
    const UD = document.querySelector(".user_details");
    const UE = document.querySelector(".edit_user_form");

    if (UE.style.display === "none" || UE.style.display === "") {
        UD.style.display = "none";
        UE.style.display = "block"
    } else if (UE.style.display === "block") {
        UD.style.display = "grid";
        UE.style.display = "none"
    }
}

