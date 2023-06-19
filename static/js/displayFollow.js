const urlParams = new URLSearchParams(window.location.search);
const idT = urlParams.get('id')
const container = document.getElementById('followerUserContainer')
const followerPart1 = document.getElementById('followerPart1')
const followerPart2 = document.getElementById('followerPart2')

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

const cookieObj = new URLSearchParams(document.cookie.replaceAll("&", "%26").replaceAll("; ", "&"))
window.onload = CookieCheck();

function CookieCheck() {
    if (cookieObj.get("login") == "true") {
        loadAllFollow();
        setConnectedPP(parseInt(getCookie("id")))
    } else {
        location.href = "/login"
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

followerPart1.addEventListener('click', () => {
    loadAllFollowing();
})

followerPart2.addEventListener('click', () => {
    loadAllFollow();
})

document.getElementById('followerBackButton').addEventListener('click', () => {
    history.back()
})

function followAUser(idUserToFollow) {
    let btn = document.getElementById(idUserToFollow)

    if (btn.classList.contains("unfollowUserBtn")) {
        btn.innerHTML = "✅Follow"
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

function loadTopPseudo() {
    fetch(`/api/getUserData?id=${idT}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data) {
                document.getElementById('followerUserPseudo').innerHTML = `${data.Pseudo}`
                document.getElementById('followerUserUsername').innerHTML = `${data.Username}`
            }
        })
}

function loadAllFollow() {
    container.innerHTML = ""
    followerPart2.style.color = "blue"
    followerPart1.style.color = "white"

    loadTopPseudo()

    fetch(`/api/displayFollow?id=${idT}`)
        .then(response => response.json())
        .then(data => {

            if (data == null) {
                const newDiv = document.createElement('div')
                newDiv.style.width = "100%"
                newDiv.innerHTML = "Aucun abonnement"
                newDiv.classList.add('flex')
                newDiv.style.color = "white"
                newDiv.style.fontWeight = "bold"
                container.appendChild(newDiv)
                return
            }

            console.log(data);

            data.reverse()
            data.forEach(values => {
                container.innerHTML += `
                    <div class="followerUserData">
                        <div class="followerDisplayData">
                            <div class="followerProfilePicture" style="background-image: url('${values.ProfilePicture}')" onclick="location.href='/profile?id=${values.Id}'"></div>
                            <div class="followerNameContainer">
                                <div class="followerUserPseudo" onclick="location.href='/profile?id=${values.Id}'">${values.Pseudo}</div>
                                <div class="followerUserUsername" onclick="location.href='/profile?id=${values.Id}'">${values.Username}</div>
                            </div>
                        </div>
                        <div class="followerSubsContainer">
                            <!-- Follow Button -->
                            <div class="profileSubsUser">
                                <div class="unfollowUserBtn" onclick="followAUser(${values.Id})" id="${values.Id}"></div>
                            </div>
                        </div>
                    </div>
                    <!-- Bio -->
                    <div class="followerUserBio">
                        ${values.Bio}
                    </div>
                `

                const credentials = {
                    IdAuthor: parseInt(cookieObj.get("id")),
                    IdUserToFollow: parseInt(values.Id)
                };

                console.log(credentials);

                fetch('/api/isFollowing', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                })
                    .then(response => response.json())
                    .then(data => {
                        let btn = document.getElementById(values.Id)

                        if (parseInt(values.Id) == parseInt(cookieObj.get('id'))) {
                            btn.classList.add('editBtn')
                            btn.style.display = "none"
                            btn.classList.remove("unfollowUserBtn")
                            btn.classList.remove("followUserBtn")
                        } else {
                            if (data) {
                                btn.innerHTML = "✅Follow"
                                btn.classList.add('followUserBtn')
                                btn.classList.remove("unfollowUserBtn")
                            } else {
                                btn.innerHTML = "Follow"
                                btn.classList.remove('followUserBtn')
                                btn.classList.add("unfollowUserBtn")
                            }
                        }
                    })
            });
        })
}

function loadAllFollowing() {
    container.innerHTML = ""
    followerPart1.style.color = "blue"
    followerPart2.style.color = "white"

    fetch(`/api/displayFollowing?id=${idT}`)
        .then(response => response.json())
        .then(data => {

            if (data == null) {
                const newDiv = document.createElement('div')
                newDiv.style.width = "100%"
                newDiv.innerHTML = "Aucun abonné"
                newDiv.classList.add('flex')
                newDiv.style.color = "white"
                newDiv.style.fontWeight = "bold"
                container.appendChild(newDiv)
                return
            }

            data.reverse()
            data.forEach(values => {
                container.innerHTML += `
                    <div class="followerUserData">
                        <div class="followerDisplayData">
                            <div class="followerProfilePicture" style="background-image: url('${values.ProfilePicture}')" onclick="location.href='/profile?id=${values.Id}'"></div>
                            <div class="followerNameContainer">
                                <div class="followerUserPseudo" onclick="location.href='/profile?id=${values.Id}'">${values.Pseudo}</div>
                                <div class="followerUserUsername" onclick="location.href='/profile?id=${values.Id}'">${values.Username}</div>
                            </div>
                        </div>
                        <div class="followerSubsContainer">
                            <!-- Follow Button -->
                            <div class="profileSubsUser">
                                <div class="unfollowUserBtn" onclick="followAUser(${values.Id})" id="${values.Id}"></div>
                            </div>
                        </div>
                    </div>
                    <!-- Bio -->
                    <div class="followerUserBio">
                        ${values.Bio}
                    </div>
                `

                const credentials = {
                    IdAuthor: parseInt(cookieObj.get("id")),
                    IdUserToFollow: parseInt(values.Id)
                };

                console.log(credentials);

                fetch('/api/isFollowing', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                })
                    .then(response => response.json())
                    .then(data => {
                        let btn = document.getElementById(values.Id)

                        if (parseInt(values.Id) == parseInt(cookieObj.get('id'))) {
                            btn.style.display = "none"
                            btn.classList.add('editBtn')
                            btn.classList.remove("unfollowUserBtn")
                            btn.classList.remove("followUserBtn")
                        } else {
                            if (data) {
                                btn.innerHTML = "✅Follow"
                                btn.classList.add('followUserBtn')
                                btn.classList.remove("unfollowUserBtn")
                            } else {
                                btn.innerHTML = "Follow"
                                btn.classList.remove('followUserBtn')
                                btn.classList.add("unfollowUserBtn")
                            }
                        }
                    })
            });

        })
}

function displayProfilePage() {
    location.href = `/profile?id=${parseInt(getCookie("id"))}`
}

function disconnect() {
    document.cookie = "login=false";
    location.href = '/login';
}

function showContainer() {
    postcontainer.style.display = "flex";
    document.getElementById("menu__toggle").checked = false
    blurdiv.style.display = "none"
}