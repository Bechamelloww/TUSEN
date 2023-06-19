let pwdInput = document.querySelector("#password");
let mailInput = document.querySelector("#email");

document.getElementById("submit").addEventListener("click", e => {

    const credentials = {
        email: mailInput.value,
        password: pwdInput.value
    };

    if (mailInput.value && pwdInput.value) {
        console.log("OKé");
    }

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if(data.IdAuthor) {
                document.cookie = "login=true"
                document.cookie = `id=${data.IdAuthor}`
                location.href = "/"
            } else {
                document.cookie = "login=false"
                location.href = "/register"
            }
        })
        .catch(error => {
            document.cookie = "login=false"
            location.href = "/login"
        });
})