$(document).ready(() => {
    const SEARCH = document.getElementById("search");

    SEARCH.addEventListener("keyup", async (e) => {
        const DISPATCHER = "dispatcher";
        const JOB = "job";
        const ISDISP = e.target.parentElement.classList.contains(DISPATCHER)

        let type = (ISDISP ? DISPATCHER : JOB)
        searchTickets(e.target.value, type)
    })
})