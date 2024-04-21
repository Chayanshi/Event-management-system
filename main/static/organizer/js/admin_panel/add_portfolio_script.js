

const EMAIL = sessionStorage.getItem("verifiedEmail");
const TOKEN = sessionStorage.getItem('token');
const BASE_URL = 'https://py-infinityadmin.mobiloitte.io/app';
const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    // 'Content-Type': 'application/json',
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




// Function to fetch category data from the GET API
async function fetchCategoriesFromAPI() {
    try {
        const response = await fetch(`${BASE_URL}/get_portfolio_category/`, {
            method: "GET",
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok (Status: ${response.status})`);
        }

        const responseData = await response.json();

        if (responseData.Response && Array.isArray(responseData.Response)) {
            const categoryData = responseData.Response;
            const categorySelect = document.getElementById('portfolio_Category');
            
            categorySelect.innerHTML = ''; // Clear existing options
            
            categoryData.forEach(category => {
                const option = document.createElement('option');
                option.value = category.sr_no;
                option.textContent = category.Category_name;
                categorySelect.appendChild(option);
                
                // Log category to console for debugging
                // console.log(`Category: ${category.Category_name}, ID: ${category.sr_no}`);
            });
        } else {
            console.error('API response does not contain a valid category array:', responseData);
        }
    } catch (error) {
        console.error(`Error fetching category data from the API: ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    fetchCategoriesFromAPI();
});

// Form submission handler
document.getElementById('portfolioForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    // console.log('Form submitted');
    const apiUrl = `${BASE_URL}/Add_New_Portfolio/`;
    const formData = new FormData();
    const portfolioImageInput = document.getElementById('portfolioImage');
    const portfolioName = document.getElementById('portfolio_Name').value;
    const portfolioCategory = document.getElementById('portfolio_Category').value;

    if (portfolioName.trim() !== "" && portfolioCategory.trim() !== "" && portfolioImageInput.files.length > 0) {
        formData.append('Portfolio_Name', portfolioName);
        formData.append('Portfolio_Category', portfolioCategory);
        formData.append('Portfolio_Image', portfolioImageInput.files[0]);

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
                headers: headers
            });

            if (response.ok) {
                const responseData = await response.json();
                // console.log('Server response:', responseData);
                if (responseData.status==201) {
                    // alert('Portfolio added successfully');
                    window.location.href = `/portfolio_manage`;
                    // You can also redirect or perform other actions as needed.
                } else {
                    // alert('Failed to add portfolio. Please try again.');
                }
            } else {
                console.error('Failed to add portfolio. Server returned an error.');
            }
        } catch (error) {
            console.error('Error adding portfolio:', error);
        }
    } else {
        alert("Please fill in all required fields.");
    }
});
