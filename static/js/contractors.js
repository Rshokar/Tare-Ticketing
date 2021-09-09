/**
 * This function is responsible for operning the addContractor Modal
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 17 2021 
 */
function addContractor() {
    const modal = document.getElementById("new_contractor_modal");
    modal.style.display = "block";
}


/**
 * This function is responsible for closing new contractor modal and resets input
 * @author Ravidner Shokar 
 * @version 1. 0
 * @date July 17 2021
 */
function closeAddContractorModal() {
    const modal = document.getElementById("new_contractor_modal");
    const modalInput = modal.querySelector("input");
    modalInput.value = "";
    modal.style.display = "none";
}

/**
 * This function submits a contractor name to the server. If an contractor with that 
 * name already exist an error will be returned.
 * @author Ravidner Shokar
 * @version 1.0
 * @date July 17 2021
 */
function submitContractor() {
    cont = document.querySelector("#search_button input").value;

    const confModal = document.getElementById("confirmation_modal");
    const confText = document.getElementById("confirmation_text");
    const confYes = document.getElementById("confirmation_yes");
    const confNo = document.getElementById("confirmation_no");

    const contractorContainer = document.getElementById("contractors");

    confYes.innerHTML = "Okay";
    confYes.addEventListener("click", closeModals);
    confNo.style.display = "none";

    $.ajax({
        url: "/add_contractor",
        dataType: "JSON",
        type: "POST",
        data: { cont },
        success: (data) => {
            console.log(data)

            if (data.status == "success") {
                confYes.style.display = "none";

                confText.innerHTML = data.message;
                confText.style.color = "green";
                confModal.style.display = "block";

                const contractor = document.createElement("div");
                contractor.setAttribute("class", "employee");

                contractorContainer.appendChild(contractor);

                let html =
                    `
                        <a href="/contractor?contractor=${cont}">
                            <h3>
                            ${cont}
                            </h3>
                        </a>
                        `
                contractor.innerHTML = html;

                setTimeout(() => {
                    window.location.replace("/contractor?contractor=" + cont);
                }, 2000);

            } else {
                confText.innerHTML = data.message;
                confText.style.color = "red"
                confModal.style.display = "block";
                confYes.focus();
            }
        },
        error: (err) => {
            confText.innerHTML = "Error Adding Contractor.";
            confModal.style.display = "block";
        }
    })
}
