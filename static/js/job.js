/**
 * This file is meant to manage adding and editing load tickets. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 30 2021  
 */


/**
 * This function will open the new_load_ticket modal
 * @author Ravidner Shokar
 * @version 1.0
 * @date July 30 2021
 */
function openNewLoadModal() {

  const modal = document.getElementById("new_load_ticket_modal");
  const modalLoadLocation = document.getElementById("load_location");
  const modalLoadTime = document.getElementById("load_time");
  const modalLoadMaterial = document.getElementById("load_material");
  const modalTonnage = document.getElementById("tonnage")


  const loadLocation = document.querySelector(".load_location").innerHTML;
  const material = document.querySelector(".material").innerHTML;

  const date = new Date()

  const now = date.getHours() + ":" + ((date.getMinutes() < 10 ? "0" : '') + date.getMinutes());

  modalLoadLocation.value = loadLocation;
  modalLoadMaterial.value = material;
  modalLoadTime.value = now;
  modalTonnage.value = 0.00;


  resetErrors();

  window.setTimeout(function () {
    modalLoadMaterial.focus()
  }, 0);


  modal.style.display = "block";
}


/**
 * This function is responsible for opening the finish load modal
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 1 2021
 */
function openFinishLoadModal() {
  const modal = document.getElementById("finish_load_ticket_modal");
  const modalDumpTime = document.getElementById("dump_time");
  const modalDumpLocation = document.getElementById("dump_location");

  const dumpLocation = document.querySelector(".dump_location").innerHTML;

  const date = new Date();
  const now = date.getHours() + ":" + ((date.getMinutes() < 10 ? "0" : "") + date.getMinutes());

  modalDumpTime.value = now;
  modalDumpLocation.value = dumpLocation;


  resetErrors();

  modal.style.display = "block";

  window.setTimeout(function () {
    modalDumpTime.focus()
  }, 0);

}
/**
 * This function is responsible for making an ajaz call that will create a load ticket
 * @author Ravinder Shokar 
 * @verison 1.0 
 * @date July 30 2021 
 */
function createLoadTicket() {

  // Add Load Ticket Modal
  const modal = document.getElementById("new_load_ticket_modal");
  const modalLoadLocation = document.getElementById("load_location");
  const modalLoadTime = document.getElementById("load_time");
  const modalLoadMaterial = document.getElementById("load_material");
  const modalTonnage = document.getElementById('tonnage');


  // Job ID
  const queryString = window.location.href;
  const urlParams = new URL(queryString);
  const jobId = urlParams.searchParams.get("id");


  const obj = {
    jobId: jobId,
    loadLocation: modalLoadLocation.value.trim(),
    loadTime: modalLoadTime.value.trim(),
    material: modalLoadMaterial.value.trim(),
    tonnage: parseFloat(modalTonnage.value).toFixed(2),
  }

  console.log(obj);


  if (verifyCreateLoadTIcket(obj)) {
    $.ajax({
      url: "/add_load_ticket",
      type: "POST",
      dateTyep: "JSON",
      data: obj,
      success: (data) => {
        if (data.status == "success") {
          const loadContainer = document.getElementById("load_ticket");
          const button = document.querySelector("#positive_button_container .new_load_ticket");
          const loadDiv = document.createElement("div");

          loadDiv.setAttribute("class", "load active");
          loadDiv.setAttribute("id", data.ticketId)

          loadContainer.appendChild(loadDiv);

          let html =
            `
                    <div class="times">
                      <div class="load_time">
                        <span>Load: ${obj.loadTime}</span>
                      </div>
                      <div class="dump_time">
                        <button id="dump_load" onclick="quickDump()">Dump</button>
                      </div>

                    </div>
                    <div class="weight">
                      <span>${obj.tonnage}</span>
                      <span>${obj.material}</span>
                    </div>

                    <div class="load_details">
                      <div class="load_location">
                        <span>Load: ${obj.loadLocation}</span>
                      </div>
                      <div class="dump_location">
                        <span>Dump:</span>
                      </div>
                    </div>
                    <div class="edit_load"><a href="/edit_load?jobId=${jobId}&loadId=${data.ticketId}"><i class="fas fa-edit" onclick="editLoadTicket(${data.ticketId})"></i></div>
                    `

          loadDiv.innerHTML = html;
          button.setAttribute('onclick', 'openFinishLoadModal()');
          button.innerHTML = "Finish Load Ticket";

          modal.style.display = "none";

        }
        console.log(data);
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
}

/**
 * This function is responsible for verifying a load ticket. Making sure it has
 * the corrext values
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 30 2021
 */
function verifyCreateLoadTIcket(loadTicket) {
  const formError = document.getElementById('create_load_ticket_error');
  const loadLocationError = document.getElementById("load_location_error");
  const loadTimeError = document.getElementById("load_time_error");
  const loadMaterialError = document.getElementById("load_materail_error");
  const tonnageError = document.getElementById("tonnage_error");

  resetErrors();

  const date = new Date();
  let isValid = true;

  // const hours = loadTicket.loadTime.substring(0, 2);
  // const minutes = loadTicket.loadTime.substring(3, 5);

  if (loadTicket.loadLocation == "" || loadTicket.loadTime == "" || loadTicket.material == "") {
    isValid = false;
    formError.innerHTML = "Fields can not be left empty";
  } else if (loadTicket.loadLocation.length < 2) {
    isValid = false;
    loadLocationError.innerHTML = "Load Location must be greater than two characters";
  } else if (loadTicket.tonnage < 0) {
    isValid = false;
    tonnageError.innerHTML = "Must be a positive number."
  }
  // else if (hours < date.getHours() || (hours < date.getHours() && minuets < date.getMinutes())) {
  //     isValid = false;
  //     loadTimeError.innerHTML = "Cannot crete load ticket in the past."
  // }
  return isValid;
}

/**
 * This function is resposible for finishing a load ticket.
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 1 2021
 * @param {} errors 
 */
function finishLoadTicket() {
  const modal = document.getElementById("finish_load_ticket_modal");
  const modalDumpTime = document.getElementById("dump_time");
  const modalDumpLocation = document.getElementById("dump_location");

  const obj = {
    dumpTime: modalDumpTime.value,
    dumpLocation: modalDumpLocation.value,
  }

  resetErrors();

  if (verifyFinishLoadTicket(obj)) {
    submitFinishedTicket(obj);
  }
}

/**
 * This function is responsible for making a post request to complete a load ticket
 * Requires the job Id to sent in the body
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 1 2021
 */
function submitFinishedTicket(finishDetails) {
  const dumpTimeError = document.getElementById("dump_time_error");
  const button = document.querySelector("#positive_button_container .new_load_ticket");

  const url = window.location.href;
  const urlParams = new URL(url);
  const jobId = urlParams.searchParams.get("id");

  finishDetails["jobId"] = jobId;

  $.ajax({
    url: "/finish_load_ticket",
    dataType: "JSON",
    type: "POST",
    data: finishDetails,
    success: (data) => {
      console.log(data);
      if (data.status == "success") {
        const modal = document.getElementById("finish_load_ticket_modal");
        const loadTicket = document.getElementById(data.result.loadTicketId);
        const dumpTime = loadTicket.querySelector(".times .dump_time");
        const dumpLocation = loadTicket.querySelector(".load_details .dump_location");

        dumpTime.innerHTML = "Dump: " + finishDetails.dumpTime;
        dumpLocation.innerHTML = "Dump: " + finishDetails.dumpLocation;

        button.setAttribute('onclick', 'openNewLoadModal()');
        button.innerHTML = "Add Load Ticket";


        loadTicket.setAttribute("class", "load complete");

        closeModals();

        console.log(data);
      } else if (data.status == "error") {
        if (data.type == "past_dump_time") {
          dumpTimeError.innerHTML = "Cannot have a dump time before load time."
        }
      }

    },
    error: (err) => {
      console.log(err);
    }
  })
}

/**
 * This function is responsible for verrifying the dump location and dump time
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 1 2021 
 * @params { dumpLocation, dumpTime } loadTicket 
 */
function verifyFinishLoadTicket(loadTicket) {
  const dumpLocationError = document.getElementById("dump_location_error");
  const dumpTimeError = document.getElementById("dump_time_error");
  const formError = document.getElementById("finish_load_ticket_error");


  isValid = true;

  if (loadTicket.dumpTime == "" || loadTicket.dumpLocation == "") {
    formError.innerText = "Fields cannot be left empty";
    isValid = false;
  } else {
    if (loadTicket.dumpLocation.length < 2) {
      dumpLocationError.innerHTML = "Must be larger than 2 characters";
      isValid = false;
    }
  }

  return isValid;
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

/**
 * This function is responsible for quickly finishing a load ticket
 * This function gets the default dump location and current time and finishes 
 * the load ticket.
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 1 2021 
 */
function quickDump() {
  const dumpLocation = document.querySelector(".dump_location").innerHTML;

  const date = new Date();
  const now = date.getHours() + ":" + ((date.getMinutes() < 10 ? "0" : "") + date.getMinutes());

  const obj = {
    dumpLocation: dumpLocation,
    dumpTime: now
  }


  submitFinishedTicket(obj);
}



/**
 * This function resets all errors in jobs 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 30 2021
 * @param {} errors array of erros to be reset
 */
function resetErrors() {
  const errors = document.querySelectorAll(".error");

  errors.forEach((err, index) => {
    err.innerHTML = ""
  })
}

/**
 * This function is responsible for closing all modals on the page
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 1 2021 
 */
const closeModals = () => {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    modal.style.display = "none";
  })
}


