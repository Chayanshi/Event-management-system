const EMAIL = sessionStorage.getItem("verifiedEmail")
const TOKEN = sessionStorage.getItem('token')
const BASE_URL = 'https://py-infinityadmin.mobiloitte.io/app';
const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
};


if (!TOKEN){
    
    const notification = document.createElement('div');
    notification.textContent = 'Session Expired';
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.backgroundColor = 'red';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);

    // Redirect to the home page after 2 seconds
    setTimeout(() => {
        // Replace '/' with the URL you want to redirect to
        window.location.href = '/';
    }, 2000);
}


document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission behavior

        const questionInput = document.getElementById('Question');
        const answerInput = document.getElementById('Answer');

        // Get the values from the input fields
        const question = questionInput.value;
        const answer = answerInput.value;

        // Create a new FAQ object
        const newFAQ = {
            "question": question,
            "answer": answer
        };

        // Send a POST request to the API
        fetch(`${BASE_URL}/AddFAQView/`, {
            method: 'POST',
            headers : headers,
            body: JSON.stringify(newFAQ)
        })
        .then(response => {
            if (response.ok) {
                // FAQ added successfully, you can handle this as needed
                // console.log('FAQ added successfully');
                window.location.href = '/faq_manage';
                questionInput.value = '';
                answerInput.value = '';
            } else {
                console.error('Failed to add FAQ');
            }
        })
        .catch(error => {
            console.error('Error adding FAQ:', error);
        });
    });
});
