/**
 * This file is responsible for managing server request and unpdating html depending on return
 * @author Ravinder Shokar
 * @version 1.0
 * @date Jun 1 2021
 */
"use strict";

$(document).ready(() => {
	const editButton = document.querySelector('.edit');

	if (editButton !== null) {
		const cancel = document.querySelector(".cancel");
		const delete_button = document.getElementById("delete")

		editButton.addEventListener("click", openEditEmp)

		cancel.addEventListener("click", (e) => {
			e.preventDefault();
			cancelEdit();
		})

		/**
		 * This event listner opens the cofrimation dialog box. 
		 */
		delete_button.addEventListener('click', (e) => {
			const conf = document.getElementById("confirmation_modal");
			const empFname = document.querySelector('.user_name');
			document.getElementById("confirmation_text").innerHTML = `Are you sure you want to delete ${empFname.innerText}`
			e.preventDefault();
			conf.style.display = "block"
		})

		/**
		 * This event listner opens the cofrimation dialog box. 
		 */

		const confYes = document.getElementById("confirmation_yes")
		confYes.addEventListener('click', (e) => {
			let url = new URL(window.location.href);
			deleteEmp(url.searchParams.get("id"));
		})

		/**
		 * This event listner closes the cofrimation dialog box. 
		 */
		const confNo = document.getElementById("confirmation_no")
		confNo.addEventListener('click', (e) => {
			conf.style.display = "none";
		})
	}
})

/**
 * Closes edit form and displays emp info
 * @date Aug 29 2021
 * @version 1.0 
 */
function cancelEdit() {
	const editButton = document.querySelector('.edit');
	const form = document.querySelector(".edit_form");
	const empDetails = document.querySelector(".user_details");

	empDetails.style.display = "grid";
	editButton.style.display = "grid";
	form.style.display = "none";
}

/**
 * Open edit form and closes emp infor
 * @date Aug 29 2021
 * @version 1.0 
 */
function openEditEmp() {
	const editButton = document.querySelector('.edit');
	const form = document.querySelector(".edit_form");
	const empDetails = document.querySelector(".user_details");

	editButton.style.display = "none";
	empDetails.style.display = "none";
	form.style.display = "block";
}

/**
 * This function is responsible for returning the add employee form data
 * @author Ravinder Shokar
 * @version 1.0
 * @date June 1 2021
 */
function getFormData() {
	let p = document.querySelector(".password").value.trim();
	let pass = (p === "" ? undefined : p);
	return {
		fName: document.querySelector(".fName").value.trim(),
		lName: document.querySelector(".lName").value.trim(),
		email: document.querySelector(".email").value.trim(),
		phone: document.querySelector(".phone").value.trim(),
		password: pass,
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
				document.querySelector(".email-error").innerHTML = "Email Already Exist";
				isValid = false
			}
			console.log(data)
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


/**
 * Gets emlpoyees data, verifies it, and the submits to server.
 * @version 1.0
 * @date Aug 29 2021
 */
function submitEmployee() {
	//Reset Errors
	resetErrors();
	let emp = getFormData();

	if (validateUser(emp)) {
		registerEmployee(emp);
	}
}


/**
 * Gets data and sends to server to edit emp
 * @date Aug 29 2021
 * @version 1.0 
 */
function editEmp() {
	let emp = getFormData();

	resetErrors();
	console.log(emp)
	if (validateUser(emp)) {
		submitEditEmployee(emp)
			.then(data => {
				console.log(data)
				document.querySelector(".user_name").innerHTML = emp.fName + " " + emp.lName;
				document.querySelector(".user_phone").innerHTML = emp.phone;
				document.querySelector(".user_email").innerHTML = emp.email;
				cancelEdit();
			})
			.catch(e => {
				console.log(e)
			})
	}
}


/**
 * Makes ajax call to edit employee
 * @date Aug 29 2021 
 * @version 1.0
 * @param { JSON } data
 * @return { Promise } resolves if succesfull ajax call
 */
function submitEditEmployee(d) {
	d["empId"] = new URL(window.location.href).searchParams.get("id");
	return new Promise((res, rej) => {
		$.ajax({
			url: "update_employee",
			type: "POST",
			dataType: "JSON",
			data: d,
			success: data => {
				if (data.status === "success") {
					res(data)
				} else if (data.status === "error") {
					rej(data.err)
				}
			},
			error: e => {
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
