/**
 * Builds modal
 * 
 * options {
 *  txtColor,
 *  text,
 *  buttons: {
 *      y: boolean,
 *      n: boolean
 *      }
 *  yText,
 *  nText, 
 *  }
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date Aug 2 2021 
 * @param { JSON } obj options 
 * @return { modal } Modal nodes
 */
function newModal(obj) {
    const modal = document.getElementById("confirmation_modal");
    const txt = document.getElementById("confirmation_text");
    const yes = document.getElementById("confirmation_yes");
    const no = document.getElementById("confirmation_no");


    txt.style.color = (obj.txtColor === undefined ? "black" : obj.txtColor);

    yes.style.display = (obj.buttons.y || obj.buttons === undefined ? "block" : "none");
    no.style.display = (obj.buttons.n || obj.buttons === undefined ? "block" : "none");

    yes.innerHTML = (obj.yText === undefined ? "Yes" : obj.yText);
    no.innerHTML = (obj.yText === undefined ? "No" : obj.nText);

    txt.innerHTML = (obj.text === undefined ? "" : obj.text);

    return {
        modal,
        txt,
        yes,
        no
    }

}

/**
 * This function is responsible for closing all modals on the page
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date July 1 2021 
 */
const closeModals = () => {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
        modal.style.display = "none";
    })
}

