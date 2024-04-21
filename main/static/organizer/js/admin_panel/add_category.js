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


document.addEventListener("DOMContentLoaded", function () {
    const categoryForm = document.getElementById("categoryForm");

    categoryForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const categoryName = document.getElementById("categoryName").value;
        const categoryType = document.getElementById("Category_type").value;

        // console.log('Category_name:', categoryName); // Add this line for debugging
        // console.log('Category_type:', categoryType); // Add this line for debugging

        const data = {
            type: categoryType,
            Category_name: categoryName,
        };

        fetch(`${BASE_URL}/Add_category/`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add category');
            }
            return response.json();
        })
        .then(result => {
            // Handle success, e.g., show a success message or redirect to a new page
            window.location.href = '/category_manage';
            // console.log('Category added successfully:', result);
        })
        .catch(error => {
            // Handle error, e.g., display an error message
            // console.error('Error adding category:', error);
        });
    });
});


