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

    const time = document.getElementById("sign_off_time").value.trim();
    const date = document.getElementById("sign_off_date").value.trim();

    const signOffTime = date + "T" + time;
    const url = window.location.href;
    const query = new URL(url);
    const jobId = query.searchParams.get('id');

    if (verifySignOff(signOffTime)) {
        submitSignOff(jobId, signOffTime);
    }
}

/**
 * Changes tickets status to complete
 * @author Ravinder Shokar
 * @date Aug 2 2021
 * @param { String } jobId job ticket Id
 * @param { Date } time job finish time
 */
function submitSignOff(jobId, signOffTime) {
    const options = { yText: "Okay", buttons: { y: false, n: false }, txt: "Updating Status....." }
    const modal = newModal(options);

    modal.modal.style.display = "block";
    modal.yes.addEventListener("click", closeModals);

    $.ajax({
        url: "/complete_job_ticket",
        type: "POST",
        dataType: "JSON",
        data: { jobId, signOffTime },
        success: (data) => {
            if (data.status == "success") {
                const dispatchContainer = document.getElementById("ticket_preview");
                const editButton = document.querySelectorAll(".edit_load");

                dispatchContainer.setAttribute("class", "dispatch complete");

                editButton.forEach((edit) => {
                    edit.remove();
                })
                document.getElementById("positive_button_container").remove();
                document.getElementById("negative_button_container").remove();

                modal.txt.innerHTML = "Status has been updated.";
                modal.yes.style.display = "block";
            } else {
                modal.txt.innerHTML = data.message;
                modal.txt.style.color = "red"
                modal.yes.style.display = "block";
            }
        },
        error: (err) => {
            modal.txt.innerHTML = "Error calling server";
            modal.txt.style.color = "red"
            modal.yes.style.display = "block";
        }

    })
}



/**
 * This function is meant for verifying a signoff time
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 3 2021
 * @param { String } dateTime yyyy-mm-ddThh:mm:ss
 */
function verifySignOff(dateTime) {
    [date, time] = dateTime.split("T");
    resetErrors();
    const signOffError = document.getElementById("sign_off_error");
    if (date === "" || time === "") {
        signOffError.innerHTML = "Field Cannot be left empty";
        return false;
    }

    return true;
}