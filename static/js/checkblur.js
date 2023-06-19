let blurdiv = document.getElementById("blurdiv")

function BlurWhenChecked() {
    if (document.getElementById("menu__toggle").checked) {
        console.log("BLURRRRRR");
        blurdiv.style.display="block"
    } else {
        blurdiv.style.display="none"
    }
}

function stopBlur() {
    document.getElementById("menu__toggle").checked = false
    blurdiv.style.display="none"
}