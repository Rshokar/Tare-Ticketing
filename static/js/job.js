/**
 * This file is meant to manage adding and editing load tickets. 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 30 2021  
 */

/**
 * This function returns the current date time
 * @param { String } type date, date_time, time
 * @returns DateTime string YYYY-MM-DDTHH:MM
 */
const now = (type) => {
  const date = new Date();

  let x;

  if (type === "date_time") {
    x = date.toLocaleDateString({ weekday: 'numeric', year: 'numeric', day: 'numeric' }).replace(/\//g, "-")
      + "T" + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } else if (type === "date") {
    x = date.toLocaleDateString({ weekday: 'numeric', year: 'numeric', day: 'numeric' })
  } else if (type === "time") {
    x = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  console.log(x);
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
  modalLoadTime.value = now("time");
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
  const t = document.getElementById("dump_time");
  const d = document.getElementById("dump_date");

  let [date, time] = now("date_time").split("T");
  d.value = date;
  t.value = time;

  resetErrors();

  modal.style.display = "block";

  window.setTimeout(function () {
    t.focus()
  }, 0);

}

/**
 * This function is responsible for making an ajaz call that will create a load ticket
 * @author Ravinder Shokar 
 * @verison 1.1
 * @date July 24 2021
 * @param { Boolean } h is hourly job
 * @param { Boolean } l is perLoad job
 * @param { Boolean } t is tonnage job
 */
function createLoadTicket(h, p, t) {
  const modal = document.getElementById("new_load_ticket_modal");
  const loadContainer = document.getElementById("load_tickets");
  const button = document.querySelector("#positive_button_container .new_load_ticket");
  const loadDiv = document.createElement("div");

  const obj = getActiveLoadData(h, p, t);

  if (verifyActiveLoadTicket(obj)) {
    submitActiveLoadTicket(obj)
      .then((data) => {
        console.log(data);
        updateDumpLocations(
          data.job,
          data.loadId, data.job.loadTickets[data.loadId].type === "ton",
          data.job.loadTickets[data.loadId].type === "load",
          data.job.loadTickets[data.loadId].loadLocation)
        successModal(data.message);
        loadDiv.setAttribute("class", "load_ticket active");
        loadDiv.setAttribute("id", data.loadId)
        loadContainer.appendChild(loadDiv);

        let html = buildActiveLoadTicket(data.job, data.loadId);

        loadDiv.innerHTML = html;
        button.setAttribute('onclick', 'openFinishLoadModal()');
        button.innerHTML = "Finish Load Ticket";
      })
      .catch((err) => {
        displayErrorMessage(err);
      })
  }
}

/**
 * Builds load ticket
 * @param { JSON } j job ticket.
 * @param { Number } i load ticket id.
 * 
 */
function buildActiveLoadTicket(j, i) {
  console.log(i);
  let startTime = new Date(j.loadTickets[i].loadTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  console.log(startTime);

  return `
  <div class="times">
    <div class="load_time">
      <span>Load: ${startTime}</span>
    </div>
    <div class="dump_time">
    <span>Dump: </span>
    </div>

  </div>
  <div class="weight">
    <span>${j.loadTickets[i].tonnage}</span>
    <span>${j.loadTickets[i].material}</span>
  </div>

  <div class="load_details">
    <div class="load_location">
      <span>Load: ${j.loadTickets[i].loadLocation}</span>
    </div>
    <div class="dump_location">
      <span>Dump:</span>
    </div>
  </div>
  <div class="edit_load"><a href="/edit_load?id=${j._id}&loadId=${i}"><i class="fas fa-edit" onclick="editLoadTicket(${i})"></i></div>
`
}

/**
 * Get active Load ticket data 
 * @param { Boolean } h is hourly job
 * @param { Boolean } l is perLoad job
 * @param { Boolean } t is tonnage job
 * @returns { JSON } load data
 */
function getActiveLoadData(h, p, t) {
  const loadTime = document.getElementById("load_time");
  const loadDate = document.getElementById("load_date");
  const loadMaterial = document.getElementById("material_input");
  const loadtonnage = document.getElementById('tonnage_input');

  const urlParams = new URL(window.location.href);
  const jobId = urlParams.searchParams.get("id");

  let loadLocation, load, time, date, material, tonnage, type, isTon, isLoad;

  if ((!p && t) || (p && !t)) {
    loadLocation = document.getElementById("load_locations");
    if (p) { type = "load"; };
    if (t) { type = "ton"; };
  } else {
    isTon = document.getElementById("tonnage_check").checked;
    isLoad = document.getElementById("load_check").checked;
    if (h) { loadLocation = document.getElementById("load_locations") };
    if (p && t) {
      loadLocation = (isTon ? document.getElementById("tonnage_load_locations") : document.getElementById("per_load_locations"))
    }
  }

  if (h || (p && t)) { type = (isTon ? "ton" : "load") };

  return {
    loadLocation: loadLocation.value.trim(),
    loadTime: loadDate.value.trim() + "T" + loadTime.value.trim(),
    material: loadMaterial.value.trim(),
    tonnage: parseFloat(loadtonnage.value).toFixed(2),
    status: "active",
    type,
    jobId,
  }
}

/**
 * Function gathers dump dateTime, dump location and jobId
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 9 2021
 */
function getFinishLoadData() {
  const time = document.getElementById("dump_time").value;
  const date = document.getElementById("dump_date").value;
  const dumpLocation = document.getElementById("dump_locations").value;

  return { dumpTime: date + 'T' + time, dumpLocation }
}


/**
 * Gets load data
 * @author Ravinder Shokar 
 * @version 1.0
 * @date Aug 9 2021
 * @param { Boolean } p if job is paid perLoad
 * @param { Boolean } t if job is paid tonnage
 * @param { Boolean } h if job is paid hourly
 */
function getLoadData(h, p, t) {
  let active, finish;
  active = getActiveLoadData(h, p, t);
  finish = getFinishLoadData();

  return {
    ...active,
    ...finish,
  }
}



/**
 * This function is responsible for verifying an active load ticket. Making sure it has
 * the correct values
 * @author Ravinder Shokar 
 * @version 1.1
 * @date Aug 5 2021
 * @param loadTicket JSON obj containing load details. 
 * @returns { Boolean } if ticket is valid
 */
function verifyActiveLoadTicket(loadTicket) {
  const formError = document.getElementById('form_error');
  const loadLocationError = document.getElementById("load_location_error");
  const loadTimeError = document.getElementById("load_time_error");
  const loadMaterialError = document.getElementById("material_error");
  const tonnageError = document.getElementById("tonnage_error");

  resetErrors();

  const d = new Date();
  let isValid = true;

  let [date, time] = loadTicket.loadTime.split("T")

  // const hours = loadTicket.loadTime.substring(0, 2);
  // const minutes = loadTicket.loadTime.substring(3, 5);

  if (loadTicket.loadLocation == "default" ||
    loadTicket.material == "" ||
    (loadTicket.type !== "load" && (loadTicket.tonnage === 0 || loadTicket.tonnage === "NaN") ||
      date === "" || time === "")) {
    isValid = false;
    formError.innerHTML = "Required fields can not be left empty or on default state.";
  } else if (loadTicket.loadLocation.length < 2) {
    isValid = false;
    loadLocationError.innerHTML = "Load Location must be greater than two characters.";
  } else if (loadTicket.tonnage <= 0 && loadTicket.type === "ton") {
    isValid = false;
    tonnageError.innerHTML = "Must be greater than or equal to 0."
  }
  // else if (hours < date.getHours() || (hours < date.getHours() && minuets < date.getMinutes())) {
  //     isValid = false;
  //     loadTimeError.innerHTML = "Cannot crete load ticket in the past."
  // }
  return isValid;
}

/**
 * Ajax call to submit active load ticket
 * @author Ravinder Shokar
 * @version 1.0
 * @date Aug 5 2021 
 * @param ticket Load Ticket
 * @reutns { Promise }
 */
function submitActiveLoadTicket(ticket) {
  return new Promise((res, rej) => {
    $.ajax({
      url: "/submit_load_ticket",
      type: "POST",
      dateTyep: "JSON",
      data: ticket,
      success: (data) => {
        if (data.status === "success") {
          res(data);
        } else {
          rej(data);
        }

      },
      error: (err) => {
        rej({
          status: "error",
          err: {
            code: "request",
            message: "Error connecting to server."
          }
        })
      }
    })
  })

}

/**
 * This function is resposible for finishing a load ticket.
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 1 2021
 * @param {} errors 
 */
function finishLoadTicket() {
  const button = document.querySelector("#positive_button_container button");
  const urlParams = new URL(window.location.href);
  const jobId = urlParams.searchParams.get("id");

  obj = getFinishLoadData();
  obj["jobId"] = jobId;

  if (verifyFinishLoadTicket(obj)) {
    submitFinishedLoadTicket(obj)
      .then(data => {
        console.log(data);
        successModal(data.message);
        const modal = document.getElementById("finish_load_ticket_modal");
        const loadTicket = document.getElementById(data.loadId);
        const dumpTime = loadTicket.querySelector(".times .dump_time span");
        const dumpLocation = loadTicket.querySelector(".load_details .dump_location span");

        dumpTime.innerHTML = "Dump: " +
          new Date(data.job.loadTickets[data.loadId].dumpTime)
            .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        dumpLocation.innerHTML = "Dump: " + data.job.loadTickets[data.loadId].dumpLocation;

        button.setAttribute('onclick', 'openNewLoadModal()');
        button.innerHTML = "Add Load Ticket";
        loadTicket.setAttribute("class", "load_ticket complete");
      })
      .catch(e => {
        if (e.err.code === "form") {
          document.getElementById("finish_load_ticket_error").innerHTML = e.err.message;
        }
        displayErrorMessage(e);
      })
  }
}

/**
 * Displays conf modal
 * @author Ravinder Shokar
 * @version 1.0
 * @date Aug 6 2021
 * @param { String } m message to be displayed
 */
function successModal(m) {
  let modal;
  const o = {
    txtColor: "green",
    text: m,
    buttons: {
      y: true,
      n: false,
    },
    yText: "Okay",
  }

  modal = newModal(o);
  modal.yes.addEventListener("click", closeModals);
  modal.modal.style.display = "block";
}

/**
 * This function is responsible for making a post request to complete a load ticket
 * Requires the job Id to sent in the body
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 1 2021
 * @param { JSON } t { dumpTime, dumpLocation }
 */
function submitFinishedLoadTicket(t) {
  return new Promise((res, rej) => {
    $.ajax({
      url: "/finish_load_ticket",
      dataType: "JSON",
      type: "POST",
      data: t,
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
            message: "Error connecting to server."
          }
        })
      }
    })
  })
}

/**
 * This function is responsible for verrifying the dump location and dump time
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 5 2021 
 * @param { JSON } t finished ticket details
 * @return { Boolean } true if isValid
 */
function verifyFinishLoadTicket(t) {
  const dumpLocationError = document.getElementById("dump_location_error");
  const formError = document.getElementById("finish_load_ticket_error");

  isValid = true;
  resetErrors();

  if (t.time === "" || t.date === "" || (t.dumpLocation == "default" || t.dumpLocation === "")) {
    formError.innerText = "Required fields can not be left empty or on default state";
    isValid = false;
  } else if (t.dumpLocation.length < 2) {
    dumpLocationError.innerHTML = "Must be larger than 2 characters";
    isValid = false;
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
    dumpTime: now("date_time")
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
  const date = document.getElementById("sign_off_date");
  const time = document.getElementById("sign_off_time");

  modal.style.display = "block";
  date.value = now("date");
  time.value = now("time")

}

/**
 * This function is responsible for disabling tonnage input and switching checbox values
 * @author Ravinder Shokar 
* @version 1.1 
* @date Aug 5 2021
* @param { Boolean } i Boolean value to swtich select fields or not. 
 */
function disableTonnageInput(i) {
  const query = new URL(window.location.href);
  const loadId = query.searchParams.get("loadId");
  const lCheck = document.getElementById("load_check");
  const tCheck = document.getElementById("tonnage_check");

  if (i) {
    const perLoadLocations = document.getElementById("per_load_locations");
    const tonnageLocations = document.getElementById("tonnage_load_locations");
    if (loadId !== null) {
      console.log("It worked")
      getJob()
        .then(job => {
          updateDumpLocations(job, loadId, false, true, perLoadLocations.value)
        });
    }


    perLoadLocations.style.display = "block";
    tonnageLocations.style.display = "none";

    resetLoadTicketForm();
  }

  $("#tonnage_input").attr('disabled', true);

  lCheck.checked = true;
  tCheck.checked = false
}

/**
* This functino is responsible for enabling tonnage input and switching checkbox values 
* @author Ravinder Shokar 
* @version 1.1 
* @date Aug 5 2021
* @param { Boolean } i Boolean value to swtich select fields or not. 
*/
function enableTonnageInput(i) {
  const query = new URL(window.location.href);
  const loadId = query.searchParams.get("loadId");
  const lCheck = document.getElementById("load_check");
  const tCheck = document.getElementById("tonnage_check");

  if (i) {
    const perLoadLocations = document.getElementById("per_load_locations");
    const tonnageLocations = document.getElementById("tonnage_load_locations");
    perLoadLocations.style.display = "none";
    tonnageLocations.style.display = "block";

    if (loadId !== null) {
      console.log("It worked")
      getJob()
        .then(job => {
          updateDumpLocations(job, loadId, true, false, tonnageLocations.value)
        });
    }

    resetLoadTicketForm();
  }

  $("#tonnage_input").attr('disabled', false);

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
  let html = ""
  let dumpLocations = [];

  if (selectField !== undefined) {
    if (isTon) {
      rates = job.rates.tonnage.rates;
      for (let i = 0; i < rates.length; i++) {
        if (rates[i].l == load || load == "default") {
          dumpLocations.push(rates[i].d);
        }
      }

    } else if (isLoad) {
      rates = job.rates.perLoad.rates;
      for (let i = 0; i < rates.length; i++) {
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
  material.value = "";
}

/**
 * Gets a job ticket from DB. Get Job id from 
 * URL
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 27 2021
 * @returns { Promise } res if gets a ticket, rej if error
 */
function getJob() {
  return new Promise((resolve, reject) => {
    const query = new URL(window.location.href);
    const jobId = query.searchParams.get("id");

    $.ajax({
      url: "get_job",
      dataType: "JSON",
      type: "GET",
      data: { jobId },
      success: (data) => {
        if (data.status == "success") {
          resolve(data.job);
        } else {
          reject()
        }
      },
      error: (err) => {
        reject()
      }
    })
  })
}


/**
 * Displays erros to html fomrs
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 9 2021
 * @param { JSON } e error
 */
function displayErrorMessage(e) {
  console.log(e)
  code = e.err.code;
  message = e.err.message;
  if (code === "load_dateTime") {
    document.getElementById("load_time_error").innerHTML = message;
  } else if (code === "form") {
    document.getElementById("form_error").innerHTML = message;
  } else if (code === "load") {
    document.getElementById("load_location_error").innerHTML = message;
  } else if (code === "tonnage") {
    document.getElementById("tonnage_error").innerHTML = message;
  } else if (code === "dump_dateTime") {
    document.getElementById("dump_time_error").innerHTML = message;
  } else if (code === "form") {
    document.getElementById("finish_load_ticket_error").innerHTML = message;
  } else if (code === "dump") {
    document.getElementById("dump_location_error").innerHTML = message;
  }
}