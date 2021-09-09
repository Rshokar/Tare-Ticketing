/**
 * Edit user details
 * @version 1.0 
 * @date Aug 31 2021
 */
function editUser() {
    let user = getUserData();
    let err;
    resetErrors();
    if (validateUser(user)) {
        submitEditUser(user)
            .then(data => {
                document.querySelector(".password").value = "";
                document.querySelector(".user_name").innerHTML = user.fName + " " + user.lName;
                document.querySelector(".user_phone").innerHTML = user.phone;
                document.querySelector(".user_email").innerHTML = user.email;
                toggleUserInformation();
            })
            .catch(e => {
                err = e.err;
                if (err.code === "email") {
                    document.querySelector(".email-error").innerHTML = err.message;
                }
                console.log(e);
            })
    }
}

/**
 * Gets user data
 * @version 1.0 
 * @date Aug 31 2021
 */
function getUserData() {
    let p = document.querySelector(".password").value.trim();
    return {
        fName: document.querySelector(".fName").value.trim(),
        lName: document.querySelector(".lName").value.trim(),
        phone: document.querySelector(".phone").value.trim(),
        email: document.querySelector(".email").value.trim(),
        password: (p === "" ? undefined : p),
    }
}

/**
 * Validates employee data expect password if = undefined
 * @version 1.1
 * @date Aug 29 2021
 * @param { JSON } u emp data 
 * @return { Boolean } true if valid
 */
function validateUser(u) {
    const fNameErr = document.querySelector(".fName-error");
    const lNameErr = document.querySelector(".lName-error");
    const emailErr = document.querySelector(".email-error");
    const phoneErr = document.querySelector(".phone-error");
    const passwordErr = document.querySelector(".password-error");
    const formErr = document.querySelector(".form-error ");

    if (u.fName == ""
        || u.lName == ""
        || u.email == ""
        || u.phone == ""
    ) {
        formErr.innerHTML = "Inputs Cannot Be Empty"
        return false
    }

    if (u.fName.length < 3 || u.fName.length > 20) {
        fNameErr.innerHTML = "Firt Name must be between 3 - 20."
        return false;
    } else if (!/^[a-zA-Z]{3,}$/.test(u.fName)) {
        fNameErr.innerHTML = "First Name cannot container numbers or special characters."
        return false
    }


    if (u.lName.length < 3 || u.lName.length > 20) {
        lName.innerHTML = "Last Name must be between 3 - 20."
        return false;
    } else if (!/^[a-zA-Z]{3,}$/.test(u.lName)) {
        lNameErr.innerHTML = "Last Name cannot container numbers or special characters."
        return false
    }


    if (!(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(u.email))) {
        emailErr.innerHTML = "Invalid Email"
        return false;
    }

    if (u.password !== undefined &&
        !/^(?=.*\d{1,})(?=.*[a-z]{1,})(?=.*[A-Z]{1,})(?=.*[a-zA-Z]{1,}).{8,}$/.test(u.password)) {
        console.log("Invalid Password")
        passwordErr.innerHTML = "Invalid Passowrd."
        return false;
    }

    if (!/^[0-9]{10}$/.test(u.phone)) {
        phoneErr.innerHTML = "Invalid Phone Number. Must be only 10 digits long"
        return false;
    }

    if (u.phone.length < 10) {
        phoneErr.innerHTML = "Phone number too short."
        return false;
    }

    return true
}

/**
 * Submits user data to server to update currently logged in user
 * @version 1.0 
 * @date Aug 31 2021
 * @param { JSON } user  
 * @return { Promise } promise true if valid 
 */
function submitEditUser(user) {
    return new Promise((res, rej) => {
        $.ajax({
            url: "/update_user",
            dataType: "JSON",
            type: "POST",
            data: user,
            success: data => {
                if (data.status === "success") {
                    res(data)
                } else if (data.status === "error") {
                    rej(data)
                }
            },
            error: e => {
                console.log(e);
                rej({
                    status: "error",
                    err: {
                        code: "form",
                        message: "Error connecting to server."
                    }
                })
            }
        })

    })
}



/**
 * Edits user billing address
 * @version 1.0 
 * @date Aug 31 2021 
 */
function editBillingAddress(t) {
    let address = getAddress();
    resetErrors();
    if (validateAddress(address)) {
        submitAddress(address, t)
            .then((data) => {
                document.querySelector(".user_address").innerHTML = address.address;
                document.querySelector(".user_city").innerHTML = address.city;
                document.querySelector(".user_prov").innerHTML = address.province;
                document.querySelector(".user_country").innerHTML = address.country;
                document.querySelector(".user_zip").innerHTML = address.postal;

                toggleBillingAdress();
            })
            .catch((e) => {
                console.log(e);
            })
    } else { console.log("Invalid Address") }
}



/**
 * Validates address
 * @version 1.0 
 * @date Aug 31 2021
 * @param { JSON } address
 * @returns { Boolean } if valid returns true.
 */
function validateAddress(address) {
    let a = address.address;
    let c = address.country;
    let p = address.province;
    let city = address.city;
    let postal = address.postal;

    if (a === "" || c === "" || p === "" || city === "") {
        document.querySelector(".address-form-error").innerHTML = "Cannot leave required fields empty";
        return false
    }

    return true;
}

/**
 * Gets address data
 * @version 1.0
 * @date Aug 31 2021
 */
function getAddress() {
    return {
        address: document.getElementById("autocomplete").value,
        country: document.getElementById("country").value,
        province: document.getElementById("province").value,
        city: document.getElementById("city").value,
        postal: document.getElementById("post").value,
    }
}

/**
 * submits address to db with name to be updated name
 * @version 1.0 
 * @date Aug 31 2021
 * @param { JSON } a adress
 * @param { String } type user or contractor. Where the address is being 
 * updated. Either a contractor or user address. 
 */
function submitAddress(a, type) {
    return new Promise((res, rej) => {
        let contractor = new URL(window.location.href).searchParams.get("contractor");
        let url = (type === "user" ? "/update_billing_address" : "/update_contractor_billing_address")

        $.ajax({
            url,
            type: "POST",
            dataType: "JSON",
            data: {
                address: a,
                contractor: (contractor ? contractor : undefined)
            },
            success: (data) => {
                if (data.status === "success") {
                    res(data)
                } else if (data.status === "error") {
                    rej(data)
                }
            },
            error: (e) => {
                console.log(e)
                rej({
                    status: "error",
                    err: { code: "form", message: "Error connecting to server." }
                })
            }
        })
    })
}
