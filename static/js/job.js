/**
 * This file is meant to manage adding and editing load tickets. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 30 2021  
 */

/**
 * This function returns the current date time
 * @returns DateTime string YYYY-MM-DDTHH:MM
 */
const now = () => {
  const date = new Date()
  let x = date.getFullYear()
    + "-" + (date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1)
    + "-" + (date.getDate() < 10 ? "0" : "") + date.getDate()
    + "T" + (date.getHours() < 10 ? "0" : "") + date.getHours()
    + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes()



  return x
}

/**
 * This function will open the new_load_ticket modal
 * @author Ravidner Shokar
 * @version 1.0
 * @date June 30 2021
 */
function openNewLoadModal() {
  const modal = document.getElementById("new_load_ticket_modal");
  const modalLoadTime = document.getElementById("load_time");
  const modalLoadMaterial = document.getElementById("material_input");
  const modalTonnage = document.getElementById("tonnage_input");

  const loadLocation = document.querySelector("#load div").innerHTML;
  const material = (document.querySelector("#material") === null ? "" : document.querySelector("#material span").innerHTML.trim());

  modalLoadMaterial.value = material;
  modalLoadTime.value = now();
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

  modalDumpTime.value = now();

  resetErrors();

  modal.style.display = "block";

  window.setTimeout(function () {
    modalDumpTime.focus()
  }, 0);

}
/**
 * This function is responsible for making an ajaz call that will create a load ticket
 * @author Ravinder Shokar 
 * @verison 1.1
 * @date July 24 2021
 */
function createLoadTicket() {

  const modal = document.getElementById("new_load_ticket_modal");
  const modalLoadLocation = document.getElementById("load_location");
  const modalLoadTime = document.getElementById("load_time");
  const modalLoadMaterial = document.getElementById("material_input");
  const modalTonnage = document.getElementById('tonnage_input');
  const loadContainer = document.getElementById("load_tickets");
  const button = document.querySelector("#positive_button_container .new_load_ticket");
  const loadDiv = document.createElement("div");

  // Job ID
  const queryString = window.location.href;
  const urlParams = new URL(queryString);
  const jobId = urlParams.searchParams.get("id");

  const isTon = document.getElementById("tonnage_check").checked;
  const isLoad = document.getElementById("load_check").checked;

  const obj = {
    jobId: jobId,
    loadLocation: (isTon ? document.getElementById("tonnage_load_locations").value : document.getElementById("per_load_load_locations").value),
    loadTime: modalLoadTime.value.trim(),
    material: modalLoadMaterial.value.trim(),
    tonnage: parseFloat(modalTonnage.value).toFixed(2),
    type: (isTon ? "ton" : "load"),
  }

  if (verifyCreateLoadTicket(obj)) {
    $.ajax({
      url: "/add_load_ticket",
      type: "POST",
      dateTyep: "JSON",
      data: obj,
      success: (data) => {
        if (data.status == "success") {

          loadDiv.setAttribute("class", "load_ticket active");
          loadDiv.setAttribute("id", data.ticketId)

          loadContainer.appendChild(loadDiv);

          let startTime = new Date(obj.loadTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          console.log(startTime)

          let html =
            `
                      <div class="times">
                        <div class="load_time">
                          <span>Load: ${startTime}</span>
                        </div>
                        <div class="dump_time">
                        <span>Dump: </span>
                        </div>

                      </div>
                      <div class="weight">
                        <span>${data.job.loadTickets[data.ticketId].tonnage}</span>
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
                      <div class="edit_load"><a href="/edit_load?id=${jobId}&loadId=${data.ticketId}"><i class="fas fa-edit" onclick="editLoadTicket(${data.ticketId})"></i></div>
                      `

          loadDiv.innerHTML = html;
          button.setAttribute('onclick', 'openFinishLoadModal()');
          button.innerHTML = "Finish Load Ticket";

          modal.style.display = "none";

        } else {
          console.log(data);
        }

      },
      error: (err) => {
        console.log(err);
      }
    })
  }
}

/**
 * This function is responsible for verifying a load ticket. Making sure it has
 * the correct values
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 30 2021
 * @param loadTicket JSON obj containing load details. 
 */
function verifyCreateLoadTicket(loadTicket) {
  console.log(loadTicket);
  const lCheck = document.getElementById("load_check");

  const formError = document.getElementById('create_load_ticket_error');
  const loadLocationError = document.getElementById("load_location_error");
  const loadTimeError = document.getElementById("load_time_error");
  const loadMaterialError = document.getElementById("load_materail_error");
  const tonnageError = document.getElementById("tonnage_error");

  resetErrors();

  const date = new Date();
  let isValid = true;

  // const hours = loadTicket.loadTime.substring(0, 2);
  // const minutes = loadTicket.loadTime.substring(3, 5);\

  if (loadTicket.loadLocation == "default" ||
    loadTicket.material == "" ||
    (loadTicket.type != "load" && (loadTicket.tonnage == 0 || loadTicket.tonnage == "NaN"))) {
    isValid = false;
    formError.innerHTML = "Required fields can not be left empty or on default state";
  } else if (loadTicket.loadLocation.length < 2) {
    isValid = false;
    loadLocationError.innerHTML = "Load Location must be greater than two characters";
  } else if (loadTicket.tonnage < 10 && !lCheck.checked) {
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
  const modalDumpLocation = document.getElementById("dump_locations");

  const obj = {
    dumpTime: modalDumpTime.value,
    dumpLocation: modalDumpLocation.value,
  }

  resetErrors();

  if (verifyFinishLoadTicket(obj)) {
    submitFinishedTicket(obj)
  }
}

/**
 * This function is responsible for making a post request to complete a load ticket
 * Requires the job Id to sent in the body
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 1 2021
 * @param finishDetails JSON { dumpTime, dumpLocation }
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

        dumpTime.innerHTML = "Dump: " +
          new Date(finishDetails.dumpTime)
            .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        dumpLocation.innerHTML = "Dump: " + finishDetails.dumpLocation;

        button.setAttribute('onclick', 'openNewLoadModal()');
        button.innerHTML = "Add Load Ticket";


        loadTicket.setAttribute("class", "load_ticket complete");

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

  if (loadTicket.dumpTime == "" || loadTicket.dumpLocation == "default") {
    formError.innerText = "Required fields can not be left empty or on default state";
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
 * This function is responsible for quickly finishing a load ticket
 * This function gets the default dump location and current time and finishes 
 * the load ticket.
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 1 2021 
 */
function quickDump() {
  const dumpLocation = document.querySelector(".dump").innerHTML.trim();

  const obj = {
    dumpLocation: dumpLocation,
    dumpTime: now()
  }

  submitFinishedTicket(obj);
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
  const signOff = document.getElementById("sign_off_time");

  modal.style.display = "block";
  signOff.value = now();
}

/**
 * This function is responsible for disabling tonnage input and switching checbox values
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 24 2021
 */
function disableTonnageInput() {
  const lCheck = document.getElementById("load_check");
  const tCheck = document.getElementById("tonnage_check");
  const tonnage = document.getElementById("tonnage_input");

  const perLoadLocations = document.getElementById("per_load_load_locations");
  const tonnageLocations = document.getElementById("tonnage_load_locations");

  $("#tonnage_input").attr('disabled', true);

  resetLoadTicketForm();

  perLoadLocations.style.display = "block";
  tonnageLocations.style.display = "none";

  lCheck.checked = true;
  tCheck.checked = false
}

/**
* This functino is responsible for enabling tonnage input and switching checkbox values 
* @author Ravinder Shokar 
* @version 1.0 
* @date July 24 2021
*/
function enableTonnageInput() {
  const lCheck = document.getElementById("load_check");
  const tCheck = document.getElementById("tonnage_check");
  const tonnage = document.getElementById("tonnage_input");

  const perLoadLocations = document.getElementById("per_load_load_locations");
  const tonnageLocations = document.getElementById("tonnage_load_locations");

  $("#tonnage_input").attr('disabled', false);

  resetLoadTicketForm();


  perLoadLocations.style.display = "none";
  tonnageLocations.style.display = "block";

  lCheck.checked = false;
  tCheck.checked = true;
}


/**
 * This function is responsible for updating dumpLocation dependent on the load 
 * location 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 27 2021
 * @param job Job ticket
 * @param id Optional param. Id of the loadticket insside of the job ticket
 * @param isTon Boolean value to see if ticket has been turned into a tonnage ticket
 * @param isLoad Boolean value to see if ticket has been turned into a load ticket
 */
function updateDumpLocations(job, id, isTon, isLoad, loadLocation) {
  const ton = "ton";
  const per = "load";
  const ticket = (id != undefined ? job.loadTickets[id] : undefined);
  const load = loadLocation;
  const selectField = document.getElementById("dump_locations");

  let rates;
  let html = '<option value="default">Dump Locations</option>';
  let dumpLocations = [];

  if (selectField != undefined) {
    if (isTon) {
      rates = job.rates.tonnage.rates;
      for (let i = 0; i < rates.length; i++) {
        console.log("Rate", rates[i])
        if (rates[i].l == load || load == "default") {
          dumpLocations.push(rates[i].d);
        }
      }

    } else if (isLoad) {
      rates = job.rates.perLoad.rates;
      for (let i = 0; i < rates.length; i++) {
        console.log("Rate", rates[i])
        if (rates[i].l == load || load == "default") {
          dumpLocations.push(rates[i].d);
        }
      }
    }

    //Remove Duplicates
    for (let i = 0; i < dumpLocations.length; i++) {
      for (let j = i + 1; j < dumpLocations.length; j++) {
        if (dumpLocations[i] == dumpLocations[j]) {
          dumpLocations.splice(j, j)
        }
      }
    }


    console.log(dumpLocations)
    for (let i = 0; i < dumpLocations.length; i++) {
      html += `
      <option value="${dumpLocations[i]}" >${dumpLocations[i]}</option>
      `
    }
    selectField.innerHTML = html;
  }
}


/**
 * This function resets the load/dump location material and tonnage. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 28 2021
 * @version 1.0 
 */
function resetLoadTicketForm() {
  const dump = document.getElementById("dump_locations");
  const ton = document.getElementById("per_load_load_locations");
  const load = document.getElementById("tonnage_load_locations");
  const tonnage = document.getElementById("tonnage_input");
  const material = document.getElementById("material_input");


  tonnage.value = "0";
  material.value = ""
  ton.value = "default";
  load.value = "default";

  if (dump != undefined) {
    dump.value = "default";
  }
}