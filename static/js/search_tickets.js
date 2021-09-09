/**
 * This file is used to search displayed tickets.
 * 
 */

/**
 * This function will hide tickets that dont match search query;
 * @param { String } q search query
 * @param { String } t type of search. "dispatcher" "job"
 */
const searchTickets = (q, t) => {
    const DISPATCH = "dispatcher";
    const JOB = "job";
    const EMP = "employee";

    let tickets;
    if (t === DISPATCH) {
        tickets = document.querySelectorAll(".dispatch");
        console.log(tickets)
        if (q === "") { tickets.forEach(ticket => { ticket.style.display = "grid" }) }
        else {
            tickets.forEach(ticket => {
                let contractor = ticket.querySelector("a h2");
                let loadLocation = ticket.querySelector(".address");

                contractor = (contractor ? contractor.innerHTML : undefined);
                loadLocation = (loadLocation ? loadLocation.innerHTML : undefined);

                if ((contractor && contractor.includes(q)) || (loadLocation && loadLocation.includes(q))) {
                    ticket.style.display = "grid"
                } else {
                    ticket.style.display = "none"
                }
            })
        }

    } else if (t === JOB) {
        tickets = document.querySelectorAll(".job");
        if (q === "") { tickets.forEach(ticket => { ticket.style.display = "grid" }) }
        else {
            tickets.forEach(ticket => {
                let contractor = ticket.querySelector("a h2");
                let dispatcher = ticket.querySelector("h5");

                contractor = (contractor ? contractor.innerHTML : undefined);
                dispatcher = (dispatcher ? dispatcher.innerHTML : undefined);

                if ((contractor && contractor.includes(q)) || (dispatcher && dispatcher.includes(q))) {
                    ticket.style.display = "grid"
                } else {
                    ticket.style.display = "none"
                }
            })
        }
    } else if (t === EMP) {
        tickets = document.querySelectorAll(".employee");
        if (q === "") { tickets.forEach(ticket => { ticket.style.display = "grid" }) }
        else {
            tickets.forEach(ticket => {
                let emp = ticket.querySelector("a h3").innerHTML;

                if (emp.includes(q)) {
                    ticket.style.display = "grid"
                } else {
                    ticket.style.display = "none"
                }
            })
        }
    }
}