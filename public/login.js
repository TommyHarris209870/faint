
async function checkAuthentication() {

    try {

        const response =
            await fetch("/api/auth/me");


        if (!response.ok) {

            window.location.href =
                "/login.html";

            return false;

        }


        const data =
            await response.json();


        if (!data.authenticated) {

            window.location.href =
                "/login.html";

            return false;

        }


        console.log(
            "Logged in as:",
            data.moderator.username
        );


        return true;

    }

    catch (error) {

        console.error(error);

        window.location.href =
            "/login.html";

        return false;

    }

}

const loginForm =
    document.getElementById("login-form");

const loginError =
    document.getElementById("login-error");


loginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const username =
            document.getElementById("username").value;

        const password =
            document.getElementById("password").value;


        try {

            const response =
                await fetch("/api/auth/login", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        username: username,

                        password: password

                    })

                });


            const data =
                await response.json();


            if (!response.ok) {

                loginError.textContent =
                    data.error || "Login failed";

                return;

            }


                window.location.href = "/dashboard";

        }

        catch (error) {

            console.error(error);

            loginError.textContent =
                "Unable to connect to server.";

        }

    }
);