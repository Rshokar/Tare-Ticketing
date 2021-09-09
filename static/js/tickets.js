/**
 * Hides and shows the date and contractor search
 * @version 1.0 
 * @date Aug 23 2021
 */
function toggleTicketQuery() {
    const DOWN = '<i class="fas fa-chevron-down"></i>';
    const UP = '<i class="fas fa-chevron-up"></i>';
    const LOGO = document.querySelector("#search_button button");

    const Q = document.getElementById("query");

    if (Q.style.display === "none") {
        LOGO.innerHTML = UP
        Q.style.display = "block"
    } else {
        LOGO.innerHTML = DOWN
        Q.style.display = "none"
    }
}


/**
 * Makes a query for jobs or dispatches depending on which ticket 
 * container is visible
 * @version 1.0
 * @date AUg 23 2021
 * 
 */
function makeQuery() {
    let query = getQuery();
    if (verifyQuery(query)) {
        console.log(query)
        getTickets(query)
            .then(tickets => {
                genTicketsHTML(tickets, query.type);
            })
            .catch(e => {
                console.log(e)
            })
    }
}

/**
 * Empties ticket container, and displays tickets passed in 
 * in job container or dispath container depending on type 
 * passed in
 * @param {*} tic { JSON } can pass in Job or Dispatch Object 
 * @param {*} t  { String } type of ticket being displayed
 */
function genTicketsHTML(tic, t) {
    const D = "dispatch"
    const J = "job"

    let container, htmlGenerator;
    if (t === D) {
        container = document.getElementById("dispatch_container")
        htmlGenerator = getDispatchHTML;
    }
    else if (t === J) {
        container = document.getElementById("job_container")
        htmlGenerator = getJobHTML;
    }

    container.innerHTML = "";

    for (let i = 0; i < tic.length; i++) {
        container.innerHTML += htmlGenerator(tic[i]);
    }
}

/**
 * Gets ticket query data 
 * @version 1.0 
 * @date Aug 23 2021
 * @return JSON obj with { dateRange, contractor, type }
 */
function getQuery() {
    const J = document.getElementById("job_container");
    const TIME = 'T00:00'
    const D = "default"
    const START = (document.getElementById("start").value === "" ? undefined : document.getElementById("start").value + TIME)
    const FINISH = (document.getElementById("finish").value === "" ? undefined : document.getElementById("finish").value + TIME)
    const C = (document.querySelector("#contractor select").value === D ? undefined : document.querySelector("#contractor select").value)

    return {
        type: (J.style.display === "block" ? "job" : "dispatch"),
        contractor: C,
        dateRange: { start: START, finish: FINISH }
    }
}

/**
 * Verifies a query
 * @version 1.0
 * @date Aug 23 2021
 * @param { JSON } q 
 * @return { Boolen } True if valid
 */
function verifyQuery(q) {
    const qError = document.querySelector("#query span");
    qError.innerHTML = "";

    if (q.dateRange.start === "" && q.dateRange.finish !== "") {
        qError.innerHTML = "Must select a start of date range."
        return false;
    } else if (!q.contractor && !q.dateRange.start && !q.dateRange.finish) {
        return false;
    }
    return true;
}


/**
 * Ajax call to get tickets
 * @param { JSON } q ticket query 
 */
function getTickets(q) {
    return new Promise((res, rej) => {
        $.ajax({
            url: "/query_tickets",
            type: "GET",
            dataType: "JSON",
            data: q,
            success: data => {
                console.log(data)
                if (data.status === "success") {
                    res(data.results);
                } else if (data.status === "error") {
                    if (data.err.code === "no_tickets") {
                        noTickets(q.type);
                    }
                }
            },
            error: e => {
                console.log(e)
                rej({
                    code: "form",
                    message: "Error connecting to server."
                })
            }
        })
    })
}


/**
 * Resets the tickets displayed
 * @version 1.0
 * @date Aug 27 2021
 */
function reset() {
    const J = document.getElementById("job_container")
    const TYPE = (J.style.display === "block" ? "job" : "dispatch")
    console.log("Hello")
    $.ajax({
        url: "/get_recent_tickets",
        type: "GET",
        dataType: "JSON",
        data: { type: TYPE },
        success: data => {
            if (data.status === "success") {
                console.log(data.result)
                genTicketsHTML(data.results, TYPE);
            } else if (data.status === "error") {
                console.log(data)
            }
        },
        error: err => {
            console.log(err)
        }
    })
}

/**
 * Displays no tickets found message with reset button 
 * @version 1.0
 * @date Aug 29 2021
 * @param { String } container which container is message being displayed too
 * can be dispatch or job
 */
function noTickets(container) {
    const J = "job";
    const D = "dispatch"

    let cont

    if (container === D) {
        cont = document.getElementById("dispatch_container")
    } else {
        cont = document.getElementById("job_container");
    }

    cont.innerHTML = getHTML(container);

    function getHTML(type) {
        let str = (type === "dispatch" ? "Dispatch" : "Job")

        return `
        <div class="no_tickets">
            <h1>No ${str} Tickets</h1>
            <span>
                <button type="button" class="btn btn-primary" onclick="reset()">
                Reset
                </button>
            </span>
        </div>
        `
    }
}

$(document).ready(() => {
    const START = document.getElementById("start");
    START.addEventListener("change", (e) => {
        const FINISH = document.getElementById("finish");

        $("#finish")

        FINISH.value;
        FINISH.setAttribute("min", e.target.value)
    })

    const SEARCH = document.querySelector("#search_button input");
    SEARCH.addEventListener("keyup", async (e) => {
        const DISPATCHER = "dispatcher";
        const JOB = "job";

        let jobDisplay = getStyle("job_container", "display");
        let isDisp = (jobDisplay !== "none" ? false : true);
        let type = (isDisp ? DISPATCHER : JOB);
        searchTickets(e.target.value, type);

        function getStyle(id, name) {
            console.log(id);
            var element = document.getElementById(id);
            return element.currentStyle ? element.currentStyle[name] : window.getComputedStyle ? window.getComputedStyle(element, null).getPropertyValue(name) : null;
        }
    })
})