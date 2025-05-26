document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#register-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const form =e.target;
        const formData = new FormData(form);

        const formDataObj = {};
        formData.forEach((value, key) => {
            formDataObj[key] = value;
        });

        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formDataObj)
        });

        if (!response.ok) {
            alert("Registration failed");
            return;
        }

        console.log('Registration successful');
        window.location.href = "/";
    });
});