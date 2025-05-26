document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#login-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const form =e.target;
        const formData = new FormData(form);

        const formDataObj = {};
        formData.forEach((value, key) => {
            formDataObj[key] = value;
        });

        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formDataObj)
        });

        if (!response.ok) {
            alert("Login failed");
            return;
        }

        console.log("Login successful");
        window.location.href = "/";
    });
});