/**
 * This function resets all errors in jobs 
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 30 2021
 */
function resetErrors() {
    console.log("Jello");
    const errors = document.querySelectorAll(".error");
    errors.forEach((err) => {
        err.innerHTML = ""
    })
}
