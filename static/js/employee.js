/**
 * This file is responsible for managing server request and unpdating html depending on return
 * @author Ravinder Shokar
 * @version 1.0
 * @date Jun 1 2021
 */
"use strict";


//Error container 
const fNameErr = document.getElementById("fName-error");
const lNameErr = document.getElementById("lName-error");
const emailErr = document.getElementById("email-error");
const phoneErr = document.getElementById("phone-error");
const passwordErr = document.getElementById("password-error");
const companyErr = document.getElementById("company-error");
const formErr = document.getElementById("error");


//Inputs
const fName = document.getElementById("fName");
const lName = document.getElementById("lName");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const company = document.getElementById("company");
const password = document.getElementById("password");

//Current User Data
const empFname = document.getElementById('emp_name');


//Submit button
const submit = document.getElementById("submit");

//Delete button
const delete_button = document.getElementById("delete_button");



//Get all form errors
const errors = document.querySelectorAll(".error");

console.log(errors);

$(document).ready(() => {

	//Confirmation Modal
	const conf = document.getElementById("confirmation_modal");
	const confText = document.getElementById("confirmation_text");
	const confYes = document.getElementById("confirmation_yes")
	const confNo = document.getElementById("confirmation_no")

	/**
	 * THis function is responsible for making the ajax a call and calling the correct function
	 * @author Ravinder Shokar 
	 * @version 1.0 
	 * @date June 1 2021 
	 */
	submit.addEventListener("click", () => {

		//Reset Errors
		resetErr();

		let data = getFormData();

		console.log(data);

		if (validateForm(data)) {
			registerEmployee(data);
		}
	})

	/**
	 * This event listner opens the cofrimation dialog box. 
	 */
	if (delete_button != null) {
		confText.innerHTML =
			`
		Are you sure you want to delete ${empFname.innerText}
		`
		delete_button.addEventListener('click', (e) => {
			console.log("I have been clicked")
			e.preventDefault();
			conf.style.display = "block"
		})
	}

	/**
	 * This event listner opens the cofrimation dialog box. 
	 */
	if (confYes != null) {
		confYes.addEventListener('click', (e) => {
			let url = new URL(window.location.href);
			deleteEmp(url.searchParams.get("id"));
		})
	}

	/**
	 * This event listner closes the cofrimation dialog box. 
	 */
	if (confNo != null) {
		confNo.addEventListener('click', (e) => {
			conf.style.display = "none";
		})
	}
})

/**
 * This function resets errors on the add employee form
 * @author Ravinder Shokar 
 * @version 1.0 
 * @date June 6 2021
 *  
 */
function resetErr() {
	for (let i = 0; i < errors.length; i++) {
		errors[i].innerHTML = ""
	}
}

/**
 * This function is responsible for returning the add employee form data
 * @author Ravinder Shokar
 * @version 1.0
 * @date June 1 2021
 */
function getFormData() {
	let obj = {
		fName: fName.value.trim(),
		lName: lName.value.trim(),
		email: email.value.trim(),
		phone: phone.value.trim(),
		company: company.value.trim(),
		secretSauce: password.value.trim(),
	}
	return obj;
}

/**
 * This function is responsible for validating the form data
 * @author Ravinder Shokar
 * @version 1.0
 * @date Jun 1 2021
 */
function validateForm(data) {
	let isValid = true

	if (data.fName == ""
		|| data.lName == ""
		|| data.email == ""
		|| data.phone == ""
		|| data.password == ""
	) {
		formErr.innerHTML = "Inputs Cannot Be Empty"
		return false
	}


	if (data.fName.length < 2) {
		fNameErr.innerHTML = "First Name must be longer than two characters."
		isValid = false
	}

	if (data.lName.length < 2) {
		lNameErr.innerHTML = "Last Name must be longer than two characters."
		isValid = false
	}

	if (!(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email))) {
		emailErr.innerHTML = "Invalid Email"
		isValid = false
	}

	console.log(data.secretSauce)
	if (!/^(?=.*\d{1,})(?=.*[a-z]{1,})(?=.*[A-Z]{1,})(?=.*[a-zA-Z]{1,}).{8,}$/.test(data.secretSauce)) {
		passwordErr.innerHTML = "Invalid Passowrd."
		isValid = false
	}

	if (!/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(data.phone)) {
		phoneErr.innerHTML = "Invalid Phone Number."
		isValid = false
	}

	if (isValid) {
		return true
	} else {
		return false
	}

}


/**
 * This function will make an ajax call to the server that will delte an employee. 
 * @author Ravinder Shokar 
 * @version 1.0
 * @date Jun 7 2021
 */
function deleteEmp(empID) {
	$.ajax({
		url: "delete_employee",
		type: "POST",
		dataType: "JSON",
		data: { empID },
		success: (data) => {
			console.log("Nice ajax call")
			console.log(data)
			if (data.status == "success") {
				window.location.replace("/employees");
			}
		},
		error: (err) => {
			console.log("An error occured")
		}
	})
}

/**
 * This function will post emp data to server to be registred with currently logged in user. 
 * @author Ravinder Shokar
 * @version 1.0 
 * @date Jun 7 2021
 * @param {emp} data of emp being registerd 
 */
function registerEmployee(data) {
	$.ajax({
		url: "register_employee",
		type: "POST",
		dataType: "JSON",
		data: data,
		success: (data) => {
			let isValid = true;

			if (data.message == "email-exist") {
				emailErr.innerHTML = "Email Already Exist";
				isValid = false
			}
			console.log(data);
			console.log(isValid)
			if (isValid) {
				window.location.href = "/employees";
			}
		},
		error: (err) => {
			console.log("I did not.....make it..... kill me!!!!!!!!!!", err);
		}
	})
}