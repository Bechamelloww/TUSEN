let profileBtn = document.getElementById("profileBtn")
let profileBtnC = document.getElementById("profileBtnC")
let profileContainer = document.getElementById('profileContainer')
let editprofilehidearea = document.getElementById("editprofilehidearea");
let editprofilecontainer = document.getElementById("editprofilecontainer")
let editprofilepicturetextarea = document.getElementById("editprofilepicturetextarea")
let editprofiletextarea = document.getElementById("editprofiletextarea")
let editprofilebiotextarea = document.getElementById("editprofilebiotextarea")
let sendeditprofilebtn = document.getElementById("sendeditprofilebtn")

const urlParams = new URLSearchParams(window.location.search);
const idT = urlParams.get('id')

const cookieObj = new URLSearchParams(document.cookie.replaceAll("&", "%26").replaceAll("; ", "&"))

window.onload = CookieCheck();

function CookieCheck() {
	if (cookieObj.get("login") != "true") {
		location.href = "/login"
	} else {
		displayProfile()
	}
}

function likeATweet(tweetId) {
	let likecount = document.getElementById("like-" + tweetId)
	if (document.getElementById("checklike-" + tweetId).checked) {
		const credentials = {
			IdTweet: tweetId,
			IdAuthor: parseInt(getCookie("id"))
		};
		fetch('/api/likeATweet', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(credentials)
		})
		likecount.innerHTML = parseInt(likecount.innerHTML) + 1
	} else {
		const credentials = {
			IdTweet: tweetId,
			IdAuthor: parseInt(getCookie("id"))
		};
		fetch('/api/dislikeATweet', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(credentials)
		})
		likecount.innerHTML = parseInt(likecount.innerHTML) - 1
	}
}

function likeATweet(tweetId) {
	let likecount = document.getElementById("like-" + tweetId)
	if (document.getElementById("checklike-" + tweetId).checked) {
		const credentials = {
			IdTweet: tweetId,
			IdAuthor: parseInt(getCookie("id"))
		};
		fetch('/api/likeATweet', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(credentials)
		})
		likecount.innerHTML = parseInt(likecount.innerHTML) + 1
	} else {
		const credentials = {
			IdTweet: tweetId,
			IdAuthor: parseInt(getCookie("id"))
		};
		fetch('/api/dislikeATweet', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(credentials)
		})
		likecount.innerHTML = parseInt(likecount.innerHTML) - 1
	}
}

function followAUser(idUserToFollow) {
	let btn = document.getElementById(idUserToFollow)

	if (btn.classList.contains("unfollowUserBtn")) {
		btn.innerHTML = "✅ Follow"
		btn.classList.add('followUserBtn')
		btn.classList.remove("unfollowUserBtn")

		const credentials = {
			IdAuthor: parseInt(cookieObj.get("id")),
			IdUserToFollow: parseInt(idUserToFollow)
		};

		fetch('/api/followAUser', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(credentials)
		})
	} else {
		btn.innerHTML = "Follow"
		btn.classList.remove('followUserBtn')
		btn.classList.add("unfollowUserBtn")

		const credentials = {
			IdAuthor: parseInt(cookieObj.get("id")),
			IdUserToFollow: parseInt(idUserToFollow)
		};

		fetch('/api/unfollowAUser', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(credentials)
		})
	}
}

function setConnectedPP(userId) {
	fetch(`/api/getUserData?id=${userId}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		},
	})
		.then(response => response.json())
		.then(data => {
			if (data) {
				profileBtn.innerHTML = `
				<img src=${data.ProfilePicture} alt="" height="35" width="35">
				<span>Profil</span>
				`
				profileBtnC.innerHTML = `
				<img src=${data.ProfilePicture} alt="" height="35" width="35">
				<span>Profil</span>
				`
			}
		})
}

function displayProfilePage() {
	location.href = `/profile?id=${parseInt(getCookie("id"))}`
}

function generateRandomColor() {
	let couleur = '#';

	for (let i = 0; i < 6; i++) {
		let valeur = Math.floor(Math.random() * 16);
		couleur += valeur.toString(16);
	}

	return couleur;
}

function isColorDark(hexColor) {
	hexColor = hexColor.replace("#", "");

	const r = parseInt(hexColor.substr(0, 2), 16);
	const g = parseInt(hexColor.substr(2, 2), 16);
	const b = parseInt(hexColor.substr(4, 2), 16);

	const brightness = Math.sqrt(
		0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b)
	);

	return brightness < 100;
}

function calculateTimeDifference(dateString) {
	let now = new Date();
	let offset = 0; // Décalage horaire en heures (dans ce cas, -4 heures)
	let utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
	let parisTime = new Date(utc + (offset * 60 * 60 * 1000));
	let parts = dateString.split(/\/| |:/);
	let formattedDate = new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4], parts[5]);
	let difference = parisTime - formattedDate;

	let seconds = Math.floor(difference / 1000) % 60;
	let minutes = Math.floor(difference / 1000 / 60) % 60;
	let hours = Math.floor(difference / 1000 / 60 / 60) % 24;
	let days = Math.floor(difference / 1000 / 60 / 60 / 24);

	let result = "";

	if (days > 0) {
		result += days + "j";
	}
	if (hours > 0) {
		result += hours + "h";
	}
	if (minutes > 0 && seconds === 0) {
		result += minutes + "min";
	}
	if (minutes > 0 && seconds > 0) {
		result += minutes + "min";
	}
	if (seconds > 0 && minutes === 0) {
		result += seconds + "s";
	}

	if (minutes > 0 && seconds > 0) {
		result = result.replace(/(\d+)s/, '');
	}

	if (hours > 0 && (minutes > 0 || seconds > 0)) {
		result = result.replace(/(\d+)min/, '');
		result = result.replace(/(\d+)s/, '');
	}

	return result;
}

function displayProfile() {
	fetch(`/api/getUserFullData?id=${idT}`)
		.then(response => response.json())
		.then(data => {
			if (data == null) {
				console.log('ERROR !!!');
			}
			let randomColor = generateRandomColor()
			editprofiletextarea.defaultValue = `${data.Pseudo}`
			editprofilepicturetextarea.defaultValue = `${data.ProfilePicture}`
			editprofilebiotextarea.defaultValue = `${data.Bio}`
			profileContainer.innerHTML = `
                <div class="bannerTopContainer">
                    <div class="nameBanner">${data.Pseudo}</div>
                    <div class="nbTweetBanner">2.3M tweets</div>
                </div>

                <!-- Banner -->
                <div class="profileBannerArea" style="background-color: ${randomColor}"></div>
        
                <!-- Image -->
                <div class="profilePictureArea" style="background-image: url(${data.ProfilePicture})"></div>
        
                <!-- Image -->
                <div class="profileSubsUser">
                    <div class="unfollowUserBtn flex" onclick="followAUser(${idT})" id="${idT}"></div>
                </div>
        
                <div class="profileUserData">
                    <div class="profilePseudo">${data.Pseudo}</div>
                    <div class="profileUsername">${data.Username}</div>
                    <div class="profileBio">${data.Bio}</div>
                    <div class="areaFollower">
                    <div class="numberFollower" onclick="location.href='/follower?id=${data.Id}'"><span class="boldNumber">${data.NbFollower}</span> followers</div>
                    <div class="numberFollowing" onclick="location.href='/follower?id=${data.Id}'"><span class="boldNumber">${data.NbFollowing}</span> following</div>
                    </div>
                </div>
        
                <hr class="separation" style="height: 1px;">
        
                <!-- Stats -->
                <div class="profileNavigationContainer">
                    <div class="tweetButton buttonProfileNav" style="color: ${randomColor};" id="tweetButton" onclick="makeBlueTexte('tweetButton', 'answerButton', 'likeButton', '${randomColor}'), displayTweet()">Tweets</div>
                    <div class="answerButton buttonProfileNav" id="answerButton" onclick="makeBlueTexte('answerButton', 'tweetButton', 'likeButton', '${randomColor}'), displayAnswer()">Answers</div>
                    <div class="likeButton buttonProfileNav" id="likeButton" onclick="makeBlueTexte('likeButton', 'tweetButton', 'answerButton', '${randomColor}'), displayLikes()">Likes</div>
                </div>
        
                <hr class="separation" style="height: 0.5px;">
        
                <div class="profileStatsArea" id="profileStatsArea">
                </div>
            `

			if (isColorDark(randomColor) && parseInt(idT) == parseInt(cookieObj.get('id'))) {
				console.log("COULEUR FONCEE");
				document.getElementById(`${idT}`).style.color = "white"
			} else {
				document.getElementById(`${idT}`).style.color = "black"
				console.log("COULEUR CLAIRE");
			}
			const credentials = {
				IdAuthor: parseInt(cookieObj.get("id")),
				IdUserToFollow: parseInt(idT)
			};


			console.log(credentials);
			let btn = document.getElementById(idT)

			if (parseInt(idT) == parseInt(cookieObj.get('id'))) {
				btn.innerHTML = "Edit"
				btn.classList.add('editBtnProfile')
				btn.classList.remove("unfollowUserBtn")
				btn.classList.remove("followUserBtn")
				btn.style.backgroundColor = randomColor
				btn.onclick = function () { editProfile() }
			} else {
				fetch('/api/isFollowing', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(credentials)
				})
					.then(response => response.json())
					.then(data => {
						if (data) {
							btn.innerHTML = "✅ Follow"
							btn.classList.add('followUserBtn')
							btn.classList.remove("unfollowUserBtn")
						} else {
							btn.innerHTML = "Follow"
							btn.classList.remove('followUserBtn')
							btn.classList.add("unfollowUserBtn")
						}
					})
			}

			displayTweet()
			setConnectedPP(parseInt(getCookie("id")))
		})
		.catch(error => {
			console.error('Erreur lors de la récupération des données', error);
		});
}

function handleProfileClick(tweetId) {
	location.href = `/tweet?id=${tweetId}`;
}

function makeBlueTexte(id, hide1, hide2, randomColor) {
	document.getElementById(id).style.color = randomColor
	document.getElementById(hide1).style.color = "white"
	document.getElementById(hide2).style.color = "white"
}

function displayTweet() {
	let bodyContainer = document.getElementById('profileStatsArea')

	bodyContainer.innerHTML = ""

	fetch(`/api/displayAllTweetFromUser?id=${idT}`)
		.then(response => response.json())
		.then(data => {

			if (data == null) {
				let noTweet = document.createElement("div")
				noTweet.classList.add('noTitle')
				noTweet.innerHTML = "No Tweet"
				bodyContainer.appendChild(noTweet)
				return
			}

			data.reverse()
			data.forEach(values => {
				let editBtn = ``
				if (values.ExtraData.profilePicture != "") {
					profile_picture = values.ExtraData.profilePicture
				}
				if (values.authorId == parseInt(getCookie("id"))) {
					editBtn = `<button class="editBtn" id="editBtn-${values.tweetId}" onclick="editTweet(${values.tweetId})"><img src="../static/ressources/img/edit-button.png"></button>`
				}
				let difference = calculateTimeDifference(values.date);
				isTweetLiked(parseInt(getCookie("id")), values.tweetId)
				// FETCH USERDATA AVEC COOKIE ID
				bodyContainer.innerHTML += `
                    <div class="profile" style="background: rgba(54, 54, 54, 0.368)" id="${values.tweetId}">
                        ${editBtn}
                        <div class="profile__image">
                        </div>
                        <div class="profile__infos">
						<div class="hidearea2" id="hidearea" onclick="handleProfileClick('${values.tweetId}')"></div>
                            <div class="profile__name">
								<img src="${values.ExtraData.profilePicture}" onclick="location.href='/profile?id=${values.authorId}'">
								<span class="profile__age2">${values.authorName}</span>
								<span class="profile__age">${values.ExtraData.username}</span>
                                <span class="dateDisplay">${difference}</span>
							</div>
                            <div class="profile__description">${values.message}</div>
                            <div class="reactions">
                            <a href="#" class='circle-button' id="commentBtn-${values.tweetId}" onclick="writeComment(${values.tweetId})">
                                <img src="../static/ressources/img/comment-regular.png" alt="" srcset="">
                            </a>
							<div class="nbLikes flex" id="comms-${values.tweetId}">${values.nbComments}</div>
                            <div class="con-like">
                                <input title="like" type="checkbox" class="like" onclick="likeATweet(${values.tweetId})" id="checklike-${values.tweetId}">
                                <div class="checkmark">
                                    <svg viewBox="0 0 24 24" class="outline" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z">
                                        </path>
                                    </svg>
                                    <svg viewBox="0 0 24 24" class="filled" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z">
                                        </path>
                                    </svg>
                                    <svg class="celebrate" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                                        <polygon points="10,10 20,20" class="poly"></polygon>
                                        <polygon points="10,50 20,50" class="poly"></polygon>
                                        <polygon points="20,80 30,70" class="poly"></polygon>
                                        <polygon points="90,10 80,20" class="poly"></polygon>
                                        <polygon points="90,50 80,50" class="poly"></polygon>
                                        <polygon points="80,80 70,70" class="poly"></polygon>
                                    </svg>
                                </div>
                            </div>
                            <div class="nbLikes" id="like-${values.tweetId}">${values.nbLikes}</div>
                            </div>
                        </div>
                    </div>
                `;

			});
		})
		.catch(error => {
			console.error('Erreur lors de la récupération des données', error);
		});
}

function displayAnswer() {
	let bodyContainer = document.getElementById('profileStatsArea')

	bodyContainer.innerHTML = ""

	fetch(`/api/displayAllAnswerFromUser?id=${idT}`)
		.then(response => response.json())
		.then(data => {

			if (data == null) {
				let noAnswer = document.createElement("div")
				noAnswer.classList.add('noTitle')
				noAnswer.innerHTML = "No Answer"
				bodyContainer.appendChild(noAnswer)
				return
			}

			// data.reverse()
			console.log(data);
			data.reverse()
			data.forEach(values => {
				isTweetLiked(parseInt(getCookie("id")), values.tweetId)
				let editBtn = ``
				if (values.authorId == parseInt(getCookie("id"))) {
					editBtn = `<button class="editBtn" id="editBtn-${values.tweetId}" onclick="editTweet(${values.tweetId})"><img src="../static/ressources/img/edit-button.png"></button>`
				}

				let difference = calculateTimeDifference(values.date);

				// FETCH USERDATA AVEC COOKIE ID
				bodyContainer.innerHTML += `
                    <div class="profile" style="background: rgba(54, 54, 54, 0.368)" id="${values.tweetId}">
                        ${editBtn}
                        <div class="profile__image">
                        </div>
                        <div class="profile__infos">
						<div class="hidearea2" id="hidearea" onclick="handleProfileClick('${values.tweetId}')"></div>
                            <div class="profile__name">
								<img src="${values.ExtraData.profilePicture}" onclick="location.href='/profile?id=${values.authorId}'">
								<span class="profile__age2">${values.authorName}</span>
								<span class="profile__age">${values.ExtraData.username}</span>
                                <span class="dateDisplay">${difference}</span>
							</div>
                            <div class="profile__description">${values.message}</div>
                            <div class="reactions">
                            <a href="#" class='circle-button' id="commentBtn-${values.tweetId}" onclick="writeComment(${values.tweetId})">
                                <img src="../static/ressources/img/comment-regular.png" alt="" srcset="">
                            </a>
							<div class="nbLikes flex" id="comms-${values.tweetId}">${values.nbComments}</div>
                            <div class="con-like">
                                <input title="like" type="checkbox" class="like" onclick="likeATweet(${values.tweetId})" id="checklike-${values.tweetId}">
                                <div class="checkmark">
                                    <svg viewBox="0 0 24 24" class="outline" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z">
                                        </path>
                                    </svg>
                                    <svg viewBox="0 0 24 24" class="filled" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z">
                                        </path>
                                    </svg>
                                    <svg class="celebrate" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                                        <polygon points="10,10 20,20" class="poly"></polygon>
                                        <polygon points="10,50 20,50" class="poly"></polygon>
                                        <polygon points="20,80 30,70" class="poly"></polygon>
                                        <polygon points="90,10 80,20" class="poly"></polygon>
                                        <polygon points="90,50 80,50" class="poly"></polygon>
                                        <polygon points="80,80 70,70" class="poly"></polygon>
                                    </svg>
                                </div>
                            </div>
                            <div class="nbLikes" id="like-${values.tweetId}">${values.nbLikes}</div>
                            </div>
                        </div>
                    </div>
                `;

			});
		})
		.catch(error => {
			console.error('Erreur lors de la récupération des données', error);
		});
}

function displayLikes() {
	let bodyContainer = document.getElementById('profileStatsArea')
	bodyContainer.innerHTML = ""

	fetch(`/api/displayAllLikeFromUser?id=${idT}`)
		.then(response => response.json())
		.then(data => {

			if (data == null) {
				let noTweet = document.createElement("div")
				noTweet.classList.add('noTitle')
				noTweet.innerHTML = "No Like"
				bodyContainer.appendChild(noTweet)
				return
			}

			data.reverse()
			data.forEach(values => {
				isTweetLiked(parseInt(getCookie("id")), values.TweetId)
				let editBtn = ``
				if (values.AuthorId == parseInt(getCookie("id"))) {
					editBtn = `<button class="editBtn" id="editBtn-${values.TweetId}" onclick="editTweet(${values.TweetId})"><img src="../static/ressources/img/edit-button.png"></button>`
				}
				let difference = calculateTimeDifference(values.Date);

				bodyContainer.innerHTML += `
                    <div class="profile" style="background: rgba(54, 54, 54, 0.368)" id="${values.TweetId}">
                        ${editBtn}
                    <div class="profile__image">
                        </div>
                        <div class="profile__infos">
                        <div class="hidearea2" id="hidearea" onclick="handleProfileClick('${values.TweetId}')"></div>
                            <div class="profile__name">
                                <img src="${values.ProfilePicture}">
                                <span class="profile__age2">${values.Pseudo}</span>
                                <span class="profile__age">${values.Username}</span>
                                <span class="dateDisplay">${difference}</span>
                            </div>
                            <div class="profile__description">${values.Message}</div>
                            <div class="reactions">
                            <a href="#" class='circle-button' id="commentBtn-${values.TweetId}" onclick="writeComment(${values.TweetId})">
                                <img src="../static/ressources/img/comment-regular.png" alt="" srcset="">
                            </a>
                            <div class="nbLikes flex" id="comms-${values.TweetId}">${values.Nbcomments}</div>
                            <div class="con-like">
                                <input title="like" type="checkbox" class="like" onclick="likeATweet(${values.TweetId})" id="checklike-${values.TweetId}">
                                <div class="checkmark">
                                    <svg viewBox="0 0 24 24" class="outline" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z">
                                        </path>
                                    </svg>
                                    <svg viewBox="0 0 24 24" class="filled" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z">
                                        </path>
                                    </svg>
                                    <svg class="celebrate" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                                        <polygon points="10,10 20,20" class="poly"></polygon>
                                        <polygon points="10,50 20,50" class="poly"></polygon>
                                        <polygon points="20,80 30,70" class="poly"></polygon>
                                        <polygon points="90,10 80,20" class="poly"></polygon>
                                        <polygon points="90,50 80,50" class="poly"></polygon>
                                        <polygon points="80,80 70,70" class="poly"></polygon>
                                    </svg>
                                </div>
                            </div>
                            <div class="nbLikes" id="like-${values.TweetId}">${values.Nblikes}</div>
                        </div>
                    </div>
                `;

			});
		})
		.catch(error => {
			console.error('Erreur lors de la récupération des données', error);
		});
}

edithidearea.addEventListener("click", () => {
	editcontainer.style.display = "none";
});

editprofilehidearea.addEventListener("click", () => {
	editprofilecontainer.style.display = "none";
});

sendeditprofilebtn.addEventListener("click", () => {
	const credentials = {
		AuthorId: parseInt(getCookie("id")),
		Pseudo: editprofiletextarea.value,
		Bio: editprofilebiotextarea.value,
		ProfilePicture: editprofilepicturetextarea.value
	};
	console.log(credentials);
	fetch('/api/updateProfile', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(credentials)
	})
		.then(response => {
			if (response.ok) {
				console.log('Modif envoyée');
				location.reload()
			} else {
				console.error("Echec de l'envoi");
			}
		})
		.catch(error => {
			console.error('Erreur lors de la connexion', error);
		});
});

function editProfile() {
	console.log("HERE");
	editprofilecontainer.style.display = "flex";
}