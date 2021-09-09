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
 * Get dispatch ticket
 * @author Ravinder Shokar
 * @version 1.0
 * @date Aug 13 2021
 * @param { String } id dispatch id
 */
function getDispatch(id) {
    return new Promise((res, rej) => {
        $.ajax({
            url: "/get_dispatch",
            dataType: "JSON",
            type: "GET",
            data: { id },
            success: data => {
                if (data.status === "success") {
                    res(data.result);
                } else {
                    rej(data);
                }
            },
            error: err => {
                rej(err);
            }
        })
    })
}


/**
 * Creates the HTML for a dispatch ticket
 * @version 1.0 
 * @date Aug 24 2021
 * @param { Dispatch } d dispatch ticket
 */
function getDispatchHTML(d) {
    return `
    <div class="dispatch complete">
        <a href="/dispatch?id=${d._id}">
            <h2>
            ${d.contractor}
            </h2>
        </a>
        <span class="address">
            ${d.loadLocation}
        </span>
        <div class="status">
            <div>
                <i class="fas fa-exclamation-circle"></i>
                ${d.status.empty}
            </div>
            <div>
                <i class="far fa-paper-plane"></i>
                ${d.status.sent}
            </div>
            <div>
                <i class="far fa-calendar-check"></i>
                ${d.status.confirmed}
            </div>
            <div>
                <i class="fas fa-spinner"></i>
                ${d.status.active}
            </div>
            <div>
                <i class="fas fa-calendar-check"></i>
                ${d.status.complete}
            </div>
        </div>
        <div class="num-trucks">
            <i class="fas fa-truck"></i>
            ${d.numTrucks}
        </div>
    </div>
    `
}


/**
 * Generators Job ticket HTML
 * @version 1.0 
 * @date Aug 24 2021
 * @param { Job } j job ticket
 */
function getJobHTML(j) {
    return `
    <div class="job ${j.status}">
        <a href="/job?id=${j._id}">
            <h2>
                ${j.contractor}
            </h2>
        </a>
        <h5>
            ${j.operator.name}
        </h5>
        <div class="equipment">
            <div id="truck">
                <span>
                    ${j.equipment.truck}
                </span>
            </div>
            <div id="trailer">
                <span>
                ${(j.equipment.trailer !== "default" ? j.equipment.trailer : "")}
                </span >
            </div >
        </div >
    <div class="start_time">
        <span>
            ${new Date(j.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </span>
    </div>
    </div >
    `
}


