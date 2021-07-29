/**
 * This js files is responsible for managing ticket status. 
 * This file includes the functions bellow 
 * 
 * confirmJobTicket()
 * activateJobTicket()
 * declineJobTicket()
 * cancelJobTicket()
 * signOffJobTicket()
 * 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 26 2021
 */
"use_strict";


/**
 * This function is responsible for accepting a Job Ticket
 * A ticket ID must be located in the URL for this function to 
 * operate properly
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 26 2021 
 */
function confirmJobTicket() {
    const queryString = window.location.href;
    const urlParams = new URL(queryString);
    const jobId = urlParams.searchParams.get("id");

    const positiveButton = document.getElementById("positive_button_container");
    const negativeButton = document.getElementById("negative_button_container");

    const confModal = document.getElementById("confirmation_modal")
    const confYes = document.getElementById("confirmation_yes");
    const confNo = document.getElementById("confirmation_no");
    const confText = document.getElementById("confirmation_text")

    const dispatchContainer = document.getElementById("ticket_preview")

    confYes.addEventListener("click", () => {
        confModal.style.display = "none";
    });


    $.ajax({
        url: "/confirm_job_ticket",
        type: "POST",
        dataType: "JSON",
        data: { jobId },
        success: (data) => {
            console.log(data);
            if (data.status == "success") {

                dispatchContainer.setAttribute("class", "dispatch confirmed");

                confText.innerHTML = "Job has been confirmed";
                confNo.style.display = "none";
                confYes.innerText = "Okay";
                confModal.style.display = "block";

                positiveButton.innerHTML = '<button class="new_load_ticket" onclick="activateJobTicket()">Activate</button>';
                negativeButton.innerHTML = '<button class="new_load_ticket" onclick="cancelJobTicket()">Cancel Job</button>';


            } else if (data.status == "error") {
                confText.innerHTML = "Error confirming Job. Try again later";
                confNo.style.display = "none";
                confYes.innerText = "Okay";
                confModal.style.display = "block";

            }
        },
        error: (err) => {
            confText.innerHTML = "Error confirming Job. Try again later";
            confNo.style.display = "none";
            confYes.innerText = "Okay";
            confModal.style.display = "block";

            console.log(err);
        }
    })

}


/**
 * This function is responsible for activating a Job Ticket 
 * A ticket ID must be located in the URL for this function operate properly
 * A ticket can only be activated 15 mins beofre a job start time
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 26 2021
 */
function activateJobTicket() {

    const startTime = document.getElementById("num-trucks").innerHTML.trim();

    const timeDiff = Math.abs(new Date() - new Date(startTime))

    const queryString = window.location.href;
    const urlParams = new URL(queryString);
    const jobId = urlParams.searchParams.get("id");

    const positiveButton = document.getElementById("positive_button_container");
    const negativeButton = document.getElementById("negative_button_container");

    const confModal = document.getElementById("confirmation_modal")
    const confYes = document.getElementById("confirmation_yes");
    const confNo = document.getElementById("confirmation_no");
    const confText = document.getElementById("confirmation_text");

    const dispatchContainer = document.getElementById("ticket_preview")

    confYes.addEventListener("click", () => {
        confModal.style.display = "none";
    });


    $.ajax({
        url: "/activate_job_ticket",
        type: "POST",
        dataType: "JSON",
        data: { jobId },
        success: (data) => {

            if (data.status == "success") {

                dispatchContainer.setAttribute("class", "dispatch active");

                confYes.innerHTML = "Okay";
                confText.innerHTML = "Job has been activated";
                confNo.style.display = "none";
                confModal.style.display = "block";

                positiveButton.innerHTML = '<button class="new_load_ticket" onclick=openNewLoadModal()>Add Load Ticket</button>';
                negativeButton.innerHTML = '<button class="new_load_ticket" onclick="openSignOffModal()">Sign Off</button>';

            } else if (data.status == "error") {

                confText.innerHTML = "Error activaing the Job. Try again later";
                confNo.style.display = "none";
                confYes.innerText = "Okay";
                confModal.style.display = "block";

            }
        },
        error: (err) => {

            confText.innerHTML = "Error confirming Job. Try again later";
            confNo.style.display = "none";
            confYes.innerText = "Okay";
            confModal.style.display = "block";

            console.log(err);
        }
    })
}


/**
 * This function is responsible for finishing a job ticket. This means 
 * sending a post request that will change the status to complete. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date July 3 2021 
 */
const signOff = () => {

    const signOffTime = document.getElementById("sign_off_time").value.trim();
    const startTime = document.getElementById("num-trucks").innerHTML.trim();

    console.log(startTime);
    console.log(signOffTime);

    const confModal = document.getElementById("confirmation_modal");
    const confYes = document.getElementById("confirmation_yes");
    const confText = document.getElementById("confirmation_text");
    const confNo = document.getElementById("confirmation_no");

    const url = window.location.href;
    const query = new URL(url);
    const jobId = query.searchParams.get('id');

    const dispatchContainer = document.getElementById("ticket_preview")

    if (verifySignOff(startTime, signOffTime)) {
        $.ajax({
            url: "/complete_job_ticket",
            type: "POST",
            dataType: "JSON",
            data: { jobId, signOffTime },
            success: (data) => {
                console.log(data);
                if (data.status == "success") {

                    dispatchContainer.setAttribute("class", "dispatch complete");

                    const editButton = document.querySelectorAll(".edit_load");

                    editButton.forEach((edit) => {
                        edit.remove();
                    })
                    document.getElementById("positive_button_container").remove();
                    document.getElementById("negative_button_container").remove();

                    confModal.style.display = "block";
                    confYes.style.display = "none";
                    confNo.innerHTML = "Okay";
                    confNo.style.display = "block";
                    confText.innerHTML = "Status updated";

                    confNo.addEventListener("click", closeModals);

                } else {
                    confModal.style.display = "block";
                    confYes.style.display = "none";
                    confNo.innerHTML = "Okay";
                    confNo.style.display = "block";
                    confText.innerHTML = data.message;

                    confNo.addEventListener("click", closeModals);

                }
            },
            error: (err) => {
                console.log(err);
            }

        })
    }
}


/**
 * This function is meant for verifying a signoff time
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 3 2021
 */
function verifySignOff(startTime, signOffTime) {
    resetErrors();
    const signOffError = document.getElementById("sign_off_error");
    if (signOffTime == "") {
        signOffError.innerHTML = "Field Cannot be left empty";
        return false;
    }


    if (signOffTime < startTime) {
        signOffError.innerHTML = "Canot have signoff time before start time";
        return false;
    }

    return true;
}