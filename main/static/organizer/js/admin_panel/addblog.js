
const EMAIL = sessionStorage.getItem("verifiedEmail");
const TOKEN = sessionStorage.getItem("token");
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



function fetchCategories() {
    fetch(`${BASE_URL}/get_blog_category/`, {
        headers: headers,
    })
        .then(response => response.json())
        .then(data => {
            allCategories = data.Response;
            const dropdown = document.getElementById('categoryDropdown');

            allCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.sr_no;
                option.textContent = category.Category_name;
                option.style.backgroundColor = "white";
                dropdown.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

window.onload = fetchCategories;

document.getElementById('add_blog').addEventListener("submit", async (e) => {
    e.preventDefault();

    const apiUrl = `${BASE_URL}/CreateBlog/`;
    const formData = new FormData();
    const blogImageInput = document.getElementById('blogImage');
    const blogTitle = document.getElementById('blogTitle').value;
    const blogAuthor = document.getElementById('blogAuthor').value;
    const blogDescription = document.getElementById('blogDescription').value;
    const blogCategory = document.getElementById('categoryDropdown').value;

    if (
        blogAuthor.trim() !== "" &&
        blogTitle.trim() !== "" &&
        blogDescription.trim() !== "" &&
        blogCategory.trim() !== "" &&
        blogImageInput.files.length > 0
    ) {
        formData.append('Blog_Title', blogTitle);
        formData.append('Blog_Author', blogAuthor);
        formData.append('Blog_Description', blogDescription);
        formData.append('Blog_Category_srno', blogCategory);
        formData.append('Blog_Image', blogImageInput.files[0]);

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
                headers: headers,
            });

            const responseText = await response.text(); // Get the response text

            if (response.ok) {
                try {
                    const responseData = JSON.parse(responseText); // Try parsing the response as JSON
                    // console.log(responseData);

                    if (responseData.status === 200) {
                        window.location.href = '/blog_manage';
                        // You can also redirect or perform other actions as needed.
                    } else {
                        alert('Failed to add blog. Please try again.');
                    }
                } catch (jsonError) {
                    console.error('Failed to parse JSON response:', jsonError);
                }
            } else {
                console.error('Failed to add blog. Server returned an error. Status:', response.status);
                console.error('Response Text:', responseText);
            }
        } catch (error) {
            console.error('Error adding portfolio:', error);
        }
    } else {
        alert("Please fill in all required fields.");
    }
});
