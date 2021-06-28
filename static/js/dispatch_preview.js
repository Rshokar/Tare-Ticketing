

let dispatch = JSON.parse(sessionStorage.getItem('dispatch'))

console.log(dispatch)

const contractor = document.querySelector(".dispatch h2");
const loadLocation = document.querySelector(".dispatch .load_location");
const dumpLocation = document.querySelector(".dispatch .dump_location");
const date = document.querySelector(".dispatch .date");
const supplier = document.querySelector(".dispatch .supplier");
const reciever = document.querySelector(".dispatch .reciever");
const material = document.querySelector(".dispatch .material");
const numTrucks = document.querySelector(".dispatch .num-trucks .trucks");
const notes = document.querySelector(".dispatch .notes");

contractor.innerHTML = dispatch.contractor;
loadLocation.innerHTML = dispatch.loadLocation;
dumpLocation.innerHTML = dispatch.dumpLocation;
date.innerHTML = dispatch.date;
supplier.innerHTML = "Supplier: " + dispatch.supplier;
reciever.innerHTML = "Reciever: " + dispatch.reciever;
material.innerHTML = "Material: " + dispatch.material;
numTrucks.innerHTML = dispatch.numTrucks;
notes.innerHTML = dispatch.notes;

/**
 * This function is resposible for adding spots to a dispatch.
 */
function addOperatorCards() {

    let numTrucks = dispatch.numTrucks;
    let operators = dispatch.operators;
    const operatorsContainer = document.getElementById("operators")

    for (let i = 0; i < numTrucks; i++) {
        let name;
        let id;
        let startTime = operators[i].startTime;
        let equipment = operators[i].equipment
        let status;

        if (operators[i].id != "") {
            name = operators[i].name;
            status = "filled"
        } else {
            name = "Empty Spot";
            status = "empty"
        }

        if (operators[i].startTime != "") { startTime = operators[i].startTime }
        if (operators[i].equipment.trailer == "default") { equipment.trailer = "None" }
        if (operators[i].equipment.truck == "default") { equipment.truck = "None" }

        const operatorCardHTML =
            `
                    <div class="operator ${status}">
                        <div class="operator_container">
                        <span class="operator_name">${name}</span>
                        </div>
                        <div class="equipment">
                            <div class="truck">
                                <span class="truck">
                                Equipement: ${equipment.truck}
                                </sapn>
                            </div>
                            <div class="trailer">
                                <span class="truck">
                                ${equipment.trailer}
                                </sapn>
                            </div>
                        </div>
                        <div class="start_time">
                           <span>Start: ${startTime}</span>
                        </div>
                        <span class="user_id">${id}</span>
                        <span class="error"></span>
                    </div>
                `
        operatorsContainer.insertAdjacentHTML('beforeend', operatorCardHTML);
    }
}

addOperatorCards();

/**
 * This function collects dispatch data, verifies it , saves it to session storage
 * then redirects to preview page
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021 
 */
function next(url) {
    const dispatch = getDispatch();
    if (verifyOperators(dispatch.operators)) {
        sessionStorage.setItem('dispatch', JSON.stringify(dispatch))
        window.location.href = url;
    } else {
        console.log("error")
    }
}


/**
 * This function is responsible for submiting a dispatch by 
 * making a post request to the Server
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 21 2021
 */
function submitDispatch() {
    const confirmation = document.getElementById("confirmation_modal");
    const confYes = document.getElementById("confirmation_yes");
    const confNo = document.getElementById("confirmation_no");
    const confText = document.getElementById("confirmation_text");

    confYes.style.display = "none";
    confNo.style.display = "none";
    confText.innerHTML = "Submiting dispatch....";

    confirmation.style.display = "block";

    $.ajax({
        url: "/submit_dispatch",
        type: "POST",
        dataType: "JSON",
        data: JSON.parse(sessionStorage.getItem('dispatch')),
        success: (data) => {

            console.log(data);
            if (data.status == "success") {
                confText.innerHTML = "Created Dispatch."
                confText.style.color = "green";
                sessionStorage.setItem('dispatch', "");
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 2000);
            }
        },
        error: (err) => {
            confText.innerHTML = "Error Creating Dispatch. Try agina later.";
            setTimeout(() => {
                confirmation.style = "none";
            }, 2000)
            console.log(err);
        }
    })

}