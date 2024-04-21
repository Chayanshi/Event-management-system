const EMAIL = sessionStorage.getItem("verifiedEmail");
const TOKEN = sessionStorage.getItem("token");
const BASE_URL = 'https://py-infinityadmin.mobiloitte.io/app';
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function fetchData(apiUrl, titleInputId, contentTextareaId) {
    try {
        const response = await fetch(apiUrl,{
            headers:headers,
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        if (responseData && responseData.Response) {
            const titleInput = document.getElementById(titleInputId);
            const contentTextarea = document.getElementById(contentTextareaId);
            titleInput.value = responseData.Response.title;
            contentTextarea.value = responseData.Response.content;
        } else {
            console.error('API response does not contain valid data:', responseData);
        }
    } catch (error) {
        console.error(`Error fetching data from the API: ${error.message}`);
    }
}


async function fetchDataforedit(apiUrl, titleInputId, contentTextareaId) {
    try {
        const response = await fetch(apiUrl,{
            headers:headers,
        }); // Replace with your actual API URL
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();

        // Check if the API response contains valid data
        if (responseData && responseData.Response) {
            const titleInput = document.getElementById(titleInputId);
            const contentTextarea = document.getElementById(contentTextareaId);

            // Populate the form fields with data from the API
            titleInput.value = responseData.Response.title;
            contentTextarea.value = responseData.Response.content;
        } else {
            console.error('API response does not contain valid data:', responseData);
        }
    } catch (error) {
        console.error(`Error fetching data from the API: ${error.message}`);
    }
}


document.addEventListener('DOMContentLoaded', function () {
    // Call the function to fetch and populate form fields for the Privacy Policy page
    fetchData(`${BASE_URL}StaticContentView_privacy/`, 'privacyTitle', 'privacyContent');
    fetchDataforedit(`${BASE_URL}/StaticContentView_privacy/`, 'privacyTitle', 'privacyStatement');
    // Call the function to fetch and populate form fields for the Terms and Conditions page
    fetchData(`${BASE_URL}/StaticContentView_terms/`, 'termsTitle', 'termsContent');
    fetchDataforedit(`${BASE_URL}/StaticContentView_terms/`, 'termsTitle', 'TermsStatement');
});

document.addEventListener('DOMContentLoaded', function () {
    // Function to handle form submission
    async function handleSubmitforterms(event) {
        event.preventDefault();

        const titleInput = document.getElementById('termsTitle');
        const contentTextarea = document.getElementById('TermsStatement');
        

        const updatedData = {
            title: titleInput.value,
            content: contentTextarea.value
        };

        try {
            const response = await fetch(`${BASE_URL}/StaticContentView_terms/`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            window.location.href = `/termscondition`;

            // alert("Form submitted successfully!");
            // console.log('Data updated successfully!');
        } catch (error) {
            console.error(`Error updating data: ${error.message}`);
        }
    }

    const form = document.querySelector('form');
    form.addEventListener('submit', handleSubmitforterms);
});



document.addEventListener('DOMContentLoaded', function () {
    // Function to handle form submission
    async function handleSubmitforprivacy(event) {
        event.preventDefault();

        const titleInput = document.getElementById('privacyTitle');
        const contentTextarea = document.getElementById('privacyStatement');
        

        const updatedData = {
            title: titleInput.value,
            content: contentTextarea.value
        };

        try {
            const response = await fetch(`${BASE_URL}/StaticContentView_privacy/`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            window.location.href = `/privacypolicy`;
            // alert("Form submitted successfully!");
            // console.log('Data updated successfully!');
        } catch (error) {
            console.error(`Error updating data: ${error.message}`);
        }
    }

    const form = document.querySelector('form');
    form.addEventListener('submit', handleSubmitforprivacy);
});



