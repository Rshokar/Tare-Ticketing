
/**
 * This function shows the dispatch details in the DOM. 
 */
function toggleDown() {
    // Get details container and toggle
    const details = document.getElementById("details");
    const ticketPreview = document.getElementById("ticket_preview");
    const toggleUp = document.querySelector("#toggles .up");
    const toggleDown = document.querySelector("#toggles .down");
    const toggle = document.getElementById("toggles");
    const status = document.getElementById("status");

    ticketPreview.style.gridTemplateRows = "30px 25px 50px 50px 150px 30px"
    details.style.display = "block";
    toggleDown.style.display = "none";
    toggleUp.style.display = "block";
    toggle.style.gridRow = "6 / span 1";
    status.style.display = "block";
}

/**
 * This function shows the dispatch details in the DOM. 
 */
function toggleUp() {
    // Get details container and toggle
    const toggle = document.getElementById("toggles");
    const details = document.getElementById("details");
    const toggleUp = document.querySelector("#toggles .up");
    const toggleDown = document.querySelector("#toggles .down");
    const ticketPreview = document.getElementById("ticket_preview");
    const status = document.getElementById("status");


    toggle.style.gridRow = "5 / span 1;"
    ticketPreview.style.gridTemplateRows = "30px 25px 50px 50px 30px"
    details.style.display = "none";
    toggleDown.style.display = "block";
    toggleUp.style.display = "none";
    status.style.display = "none";
}