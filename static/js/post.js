let postcontainer = document.getElementById("postcontainer");
let commcontainer = document.getElementById("commcontainer");
let editcontainer = document.getElementById("editcontainer");
let hidearea = document.getElementById("hidearea");
let commhidearea = document.getElementById("commhidearea");
let edithidearea = document.getElementById("edithidearea");
let textarea = document.getElementById("textarea");
let commtextarea = document.getElementById("commtextarea");
let edittextarea = document.getElementById("edittextarea");
let sendbtn = document.getElementById("sendbtn");
let sendcomm = document.getElementById("sendcommbtn");
let sendEditBtn = document.getElementById("sendeditbtn");

function isTweetLiked(idAuthor, idTweet) {
    fetch(`/api/displayUserLikeTable?id=${idAuthor}`)
    .then(response => response.json())
    .then(data => {
        data.forEach(values => {
            if(idAuthor == values.IdAuthor && idTweet == values.IdTweet) {
                document.getElementById(`checklike-${values.IdTweet}`).checked = true;
            }
        });
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des données', error);
    });
}

function backslashNToBR(text) {
	text = text.replace(/\n/g, "<br>");
	return text;
}

function writeComment(tweetId) {
	console.log(tweetId);
	commcontainer.style.display = "flex";

	sendcomm.addEventListener("click", () => {

		let username = "Inconnu";
		fetch(`/api/getUserData?id=${parseInt(getCookie("id"))}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
		})
			.then(response => response.json())
			.then(data => {
				if (data) {
					username = data.Username;

					const credentials = {
						IdAuthor: parseInt(getCookie("id")),
						NameAuthor: username,
						Message: backslashNToBR(commtextarea.value),
						IdTweet: tweetId
					};
					console.log(credentials);
					fetch('/api/createComment', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(credentials)
					})
						.then(response => {
							if (response.ok) {
								console.log('Réponse envoyée');
								location.reload()
							} else {
								console.error("Echec de l'envoi");
							}
						})
						.catch(error => {
							console.error('Erreur lors de la connexion', error);
						});
				} else {
					console.error("Echec de la récupération d'username");
				}
			})
			.catch(error => {
				console.error('Erreur lors de la connexion', error);
			});
	});
	// let commentbtn = document
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

hidearea.addEventListener("click", () => {
	postcontainer.style.display = "none";
});

commhidearea.addEventListener("click", () => {
	commcontainer.style.display = "none";
});

edithidearea.addEventListener("click", () => {
	editcontainer.style.display = "none";
});

function disconnect() {
	document.cookie = "login=false";
	location.href = '/login';
}

sendbtn.addEventListener("click", () => {
	let username = "Inconnu";
	fetch(`/api/getUserData?id=${parseInt(getCookie("id"))}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		},
	})
		.then(response => response.json())
		.then(data => {
			if (data) {
				console.log(data);
				username = data.Username;
				console.log('username Récupéré :');
				console.log(username);
				const credentials = {
					IdAuthor: parseInt(getCookie("id")),
					NameAuthor: username,
					Message: backslashNToBR(textarea.value)
				};

				fetch('/api/createTweet', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(credentials)
				})
					.then(response => {
						if (response.ok) {
							console.log('Tweet envoyé');
							location.reload()
						} else {
							console.error("Echec de l'envoi");
						}
					})
					.catch(error => {
						console.error('Erreur lors de la connexion', error);
					});
			} else {
				console.error("Echec de la récupération d'username");
			}
		})
		.catch(error => {
			console.error('Erreur lors de la connexion', error);
		});
});

function showContainer() {
	postcontainer.style.display = "flex";
	document.getElementById("menu__toggle").checked = false
	blurdiv.style.display = "none"
}

function editTweet(tweetId) {
	console.log("EDITERRRRR");
	editcontainer.style.display = "flex";

	sendEditBtn.addEventListener("click", () => {
		console.log("ENVOYER EDITERRRRR");
		const credentials = {
			TweetId: tweetId,
			NewMessage: backslashNToBR(edittextarea.value) + "<br><br><i>(Post édité)</i>"
		};
		fetch('/api/updateTweet', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(credentials)
		})
		location.reload()
	})
}
