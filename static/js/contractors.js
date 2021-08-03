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
    const modal = document.getElementById("new_contractor_modal");
    const modalInput = modal.querySelector("input");

    const confModal = document.getElementById("confirmation_modal");
    const confText = document.getElementById("confirmation_text");
    const confYes = document.getElementById("confirmation_yes");
    const confNo = document.getElementById("confirmation_no");

    const contractorContainer = document.getElementById("contractors");

    $.ajax({
        url: "/add_contractor",
        dataType: "JSON",
        type: "POST",
        data: { contractor: modalInput.value },
        success: (data) => {
            console.log(data)

            if (data.status == "success") {
                confYes.style.display = "none";
                confNo.style.display = "none";
                confText.innerHTML = data.message;
                confText.style.color = "green";
                confModal.style.display = "block";

                const contractor = document.createElement("div");
                contractor.setAttribute("class", "employee");

                contractorContainer.appendChild(contractor);

                let html =
                    `
                        <a href="/contractor?contractor=${modalInput.value}">
                            <h3>
                            ${modalInput.value}
                            </h3>
                        </a>
                        `

                contractor.innerHTML = html;

                console.log("/contractor?contractor=" + modalInput.value);

                setTimeout(() => {
                    window.location.replace("/contractor?contractor=" + modalInput.value);
                }, 2000);

            } else {
                confYes.addEventListener("click", closeModals);
                confYes.innerHTML = "Okay";
                confNo.style.display = "none";
                confText.innerHTML = data.message;
                confText.style.color = "red"
                confModal.style.display = "block";
                confYes.focus();

                modalInput.value = ""
            }
        },
        error: (err) => {
            confYes.addEventListener("click", closeModals);
            confYes.innerHTML = "Okay";
            confNo.style.display = "none";
            confText.innerHTML = "Error Adding Contractor.";
            confModal.style.display = "block";

            modalInput.value = ""
        }
    })
}
