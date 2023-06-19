let mode = document.getElementById("mode")
let modeC = document.getElementById("modeC")

mode.addEventListener('click', () => {
    console.log("COUCOU");
    if (document.body.classList.contains('dark')) {
        document.body.classList.remove('dark')
        document.body.classList.add('light')
    } else if (document.body.classList.contains('light')){
        document.body.classList.remove('light')
        document.body.classList.add('dark')
    }

    // Change cookie
    if (document.body.classList.contains('dark')) {
        document.cookie = "mode=dark"
    } else if (document.body.classList.contains('light')) {
        document.cookie = "mode=light"
    }
})
document.addEventListener('DOMContentLoaded', () => {
    const cookieObj = new URLSearchParams(document.cookie.replaceAll("&", "%26").replaceAll("; ","&"))

    if (cookieObj.get("mode") == "dark") {
        document.body.classList.remove('light')
        document.body.classList.add('dark')
        mode.checked = true;
        modeC.checked = true;
    } else {
        document.body.classList.remove('dark')
        document.body.classList.add('light')
    }
});

modeC.addEventListener('click', () => {
    console.log("COUCOU");
    if (document.body.classList.contains('dark')) {
        document.body.classList.remove('dark')
        document.body.classList.add('light')
    } else if (document.body.classList.contains('light')){
        document.body.classList.remove('light')
        document.body.classList.add('dark')
    }

    // Change cookie
    if (document.body.classList.contains('dark')) {
        document.cookie = "mode=dark"
    } else if (document.body.classList.contains('light')) {
        document.cookie = "mode=light"
    }
})
document.addEventListener('DOMContentLoaded', () => {
    const cookieObj = new URLSearchParams(document.cookie.replaceAll("&", "%26").replaceAll("; ","&"))

    if (cookieObj.get("mode") == "dark") {
        document.body.classList.remove('light')
        document.body.classList.add('dark')
        mode.checked = true;
        modeC.checked = true;
    } else {
        document.body.classList.remove('dark')
        document.body.classList.add('light')
    }
});