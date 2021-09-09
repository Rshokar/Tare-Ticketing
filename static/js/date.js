/**
 * This function returns the current date time
 * @param { String } type date, date_time, time
 * @returns DateTime string YYYY-MM-DDTHH:MM
 */
const now = (type, date) => {
    var getDate = (d) => {
        return d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1) + "-" + (d.getDate() < 10 ? "0" : "") + d.getDate()
    }

    if (!date) {
        date = new Date();
    }

    let x;
    if (type === "date_time") {
        x = getDate(date) + "T" + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (type === "date") {
        x = getDate(date)
    } else if (type === "time") {
        x = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    }
    console.log(x);
    return x
}