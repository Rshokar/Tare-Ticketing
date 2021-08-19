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