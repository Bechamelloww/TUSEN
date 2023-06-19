let nameInput = document.querySelector("#name");
let pwdInput = document.querySelector("#password");
let mailInput = document.querySelector("#email");
let profilep = document.querySelector("#profilep");
let mdpverif = false;

function validateMDP() {
	let msg;
	let str = document.getElementById("password").value;
	if (str.match(/[0-9]/g) &&
		str.match(/[A-Z]/g) &&
		str.match(/[a-z]/g) &&
		str.match(/[^a-zA-Z\d]/g) &&
		str.length >= 6) {

		msg = "<p style='color:green'>Mot de passe fort.</p>";
		mdpverif = true;
	}
	else {
		mdpverif = false;
		msg = "<p style='color:red'>Mot de passe faible.</p>";

	}
	document.getElementById("msg").innerHTML = msg;
}

function getCookie(cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

window.onload = CookieCheck();

function CookieCheck() {
	console.log();
	if (getCookie("login") == "true") {
		location.href = "/"
	} else {
		console.log("HAHAHAHA");
	}
}

document.getElementById("submit").addEventListener("click", e => {
	validateMDP()
	console.log("ENVOYER");

	let profile_picture = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"

	console.log(typeof profilep.value);

	console.log("SALUT" + profilep.value.length);
	if (profilep.value.length != 0) {
		console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAA");
		profile_picture = profilep.value
	}

	console.log("PROFILEP :" + profile_picture);
	if (mdpverif == true) {
		const credentials = {
			email: mailInput.value,
			pseudo: nameInput.value,
			password: pwdInput.value,
			profilepicture: profile_picture
		};
		console.log(credentials);
		console.log(mdpverif)
		fetch('/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},

			body: JSON.stringify(credentials)
		}).then(response => {
			if (response.ok) {
				console.log('Connexion réussie');
				location.href = "/login"
			} else {
				console.error('Échec de la connexion');
			}
		})
			.catch(error => {
				console.error('Erreur lors de la connexion', error);
			});
	}
})