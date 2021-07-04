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

    const status = document.getElementById('status');

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

                confText.innerHTML = "Job has been confirmed";
                confNo.style.display = "none";
                confYes.innerText = "Okay";
                confModal.style.display = "block";

                positiveButton.innerHTML = '<button class="new_load_ticket" onclick="activateJobTicket()">Activate</button>';
                negativeButton.innerHTML = '<button class="new_load_ticket" onclick="cancelJobTicket()">Cancel Job</button>';

                status.innerText = "Status: confirmed";


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

    const startTime = document.getElementById("date").innerHTML.trim() + " " + document.getElementById("time").innerHTML.trim();
    const timeDiff = Math.abs(new Date() - new Date(startTime))

    const queryString = window.location.href;
    const urlParams = new URL(queryString);
    const jobId = urlParams.searchParams.get("id");

    const positiveButton = document.getElementById("positive_button_container");
    const negativeButton = document.getElementById("negative_button_container");

    const confModal = document.getElementById("confirmation_modal")
    const confYes = document.getElementById("confirmation_yes");
    const confNo = document.getElementById("confirmation_no");
    const confText = document.getElementById("confirmation_text")

    const status = document.getElementById('status');

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

                console.log("Success")

                confYes.innerHTML = "Okay";
                confText.innerHTML = "Job has been activated";
                confNo.style.display = "none";
                confModal.style.display = "block";

                positiveButton.innerHTML = '<button class="new_load_ticket" onclick=openNewLoadModal()>Add Load Ticket</button>';
                negativeButton.innerHTML = '<button class="new_load_ticket" onclick="openSignOffModal()">Sign Off</button>';

                status.innerHTML = 'Status: active';

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
 * This function opens a confirmation modal before and attaches an
 * eventListner to both the yes and no buttons
 * 
 * yes button = signOff();
 * no button = closeModals();
 * @author Ravinder Shokar
 * @version 1.0
 * @date July 3 2021
 */
function openSignOffModal() {
    const modal = document.getElementById('sign_off_ticket_modal');
    modal.style.display = "block";
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
    const startTime = document.getElementById("time").innerHTML.trim();

    console.log(startTime);
    console.log(signOffTime);

    const confModal = document.getElementById("confirmation_modal");
    const confYes = document.getElementById("confirmation_yes");
    const confText = document.getElementById("confirmation_text");
    const confNo = document.getElementById("confirmation_no");

    const url = window.location.href;
    const query = new URL(url);
    const jobId = query.searchParams.get('id');

    if (verifySignOff(startTime, signOffTime)) {
        $.ajax({
            url: "/complete_job_ticket",
            type: "POST",
            dataType: "JSON",
            data: { jobId, signOffTime },
            success: (data) => {
                console.log(data);
                if (data.status == "success") {
                    const editButton = document.querySelectorAll(".edit_load");

                    editButton.forEach((edit) => {
                        edit.remove();
                    })
                    document.getElementById("positive_button_container").remove();
                    document.getElementById("negative_button_container").remove();
                    document.getElementById("status").innerHTML = "Staus: complete";

                    confModal.style.display = "block";
                    confYes.style.display = "none";
                    confNo.innerHTML = "Okay";
                    confText.innerHTML = "Status updated";

                    confNo.addEventListener("click", closeModals);

                } else {
                    confModal.style.display = "block";
                    confYes.style.display = "none";
                    confNo.innerHTML = "Okay";
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