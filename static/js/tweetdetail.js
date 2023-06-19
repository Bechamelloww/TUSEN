let tweets = document.querySelector(".profiles")
let profiless = "";
const urlParams = new URLSearchParams(window.location.search);
const idT = urlParams.get('id')
let profileBtn = document.getElementById("profileBtn")
let profileBtnC = document.getElementById("profileBtnC")


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

function checkCookieExists(cookieName) {
    return document.cookie.includes(cookieName);
}

function handleProfileClick(tweetId) {
    console.log("Clicked profile ID:", tweetId);
    location.href = `/tweet?id=${tweetId}`
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

const cookieObj = new URLSearchParams(document.cookie.replaceAll("&", "%26").replaceAll("; ", "&"))

window.onload = CookieCheck();

function CookieCheck() {
    if (cookieObj.get("login") == "true") {
        loadTweets();
    } else {
        location.href = "/login"
    }
}

function loadTweets() {
    fetch(`/api/allComment?id=${idT}`)
        .then(response => response.json())
        .then(data => {
            isTweetLiked(parseInt(getCookie("id")), data[0].tweetId)
            let editBtn = ``
            let profile_picture = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
            let username = "@inconnu"
            if (data[0].ExtraData.profilePicture != "") {
                profile_picture = data[0].ExtraData.profilePicture
            }
            if (data[0].ExtraData.username != "") {
                username = data[0].ExtraData.username
            }
            if (data[0].authorId == parseInt(getCookie("id"))) {
                editBtn = `<button class="editBtn" id="editBtn-${data[0].tweetId}" onclick="editTweet(${data[0].tweetId})"><img src="../static/ressources/img/edit-button.png"></button>`
            }

            let difference = calculateTimeDifference(data[0].date);

            profiless += `
                    <a href="#" class='circlee-button flex' id="backBtn" onclick="history.back()">
                        <img class="flex" src="../static/ressources/img/fleche-petite-gauchewhite.png" alt="">
                    </a>
                    <div class="profile" id="${data[0].tweetId}" >
                        ${editBtn}
                        <div class="profile__image">
                        </div>
                        <div class="profile__infos">
						<div class="hidearea2" id="hidearea" onclick="handleProfileClick('${data[0].tweetId}')"></div>
                            <div class="profile__name">
								<img src=${profile_picture} onclick="location.href='/profile?id=${data[0].authorId}'">
								<span class="profile__age2">${username}</span>
								<span class="profile__age">${data[0].authorName}</span>
                                <span class="dateDisplay">${difference}</span>
							</div>
                            <div class="profile__description">${data[0].message}</div>
                            <div class="reactions">
                            <a href="#" class='circle-button' id="commentBtn-${data[0].tweetId}" onclick="writeComment(${data[0].tweetId})">
                                <img src="../static/ressources/img/comment-regular.png" alt="">
                            </a>
                            <div class="nbLikes flex" id="comms-${data[0].tweetId}">${data[0].nbComments}</div>
                            <div class="con-like">
                                <input title="like" type="checkbox" class="like" onclick="likeATweet(${data[0].tweetId})" id="checklike-${data[0].tweetId}">
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
                            <div class="nbLikes" id="like-${data[0].tweetId}">${data[0].nbLikes}</div>
                            </div>
                        </div>
                    </div>
                    <hr class="rephr">
                `;
            profile_picture = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
            if (data[1] != null) {
                data[1].reverse()
                data[1].forEach(values => {
                    isTweetLiked(parseInt(getCookie("id")), values.tweetId)
                    editBtn = ``
                    profile_picture = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                    username = "@inconnu"
                    if (values.ExtraData.profilePicture != "") {
                        profile_picture = values.ExtraData.profilePicture
                    }
                    if (values.ExtraData.username != "") {
                        username = values.ExtraData.username
                    }
                    if (values.authorId == parseInt(getCookie("id"))) {
                        editBtn = `<button class="editBtn" id="editBtn-${values.tweetId}" onclick="editTweet(${values.tweetId})"><img src="../static/ressources/img/edit-button.png"></button>`
                    }

                    let difference = calculateTimeDifference(values.date);
                    console.log(values);

                    // console.log(values);
                    profiless += `
                        <div class="commentcontainer flex">
                            <div class="profile2" id="${values.tweetId}" >
                    ${editBtn}
                            <div class="profile__image">
                            </div>
                            <div class="profile__infos">
                            <div class="hidearea2" id="hidearea" onclick="handleProfileClick('${values.tweetId}')"></div>
                                <div class="profile__name">
                                    <img src=${profile_picture} onclick="location.href='/profile?id=${values.authorId}'">
                                    <span class="profile__age2">${values.authorName}</span>
                                    <span class="profile__age">${username}</span>
                                    <span class="dateDisplay">${difference}</span>
                                </div>
                                <div class="profile__description">${values.message}</div>
                                <div class="reactions">
                                <a href="#" class='circle-button' id="commentBtn-${values.tweetId}" onclick="writeComment(${values.tweetId})">
                                    <img src="../static/ressources/img/comment-regular.png" alt="">
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
                    </div>
                `;
                });
                profile_picture = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
            }
            tweets.innerHTML = profiless;
            setConnectedPP(parseInt(getCookie("id")))
        })

        .catch(error => {
            console.error('Erreur lors de la récupération des données', error);
        });
}
