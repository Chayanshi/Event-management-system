const EMAIL = sessionStorage.getItem("verifiedEmail");
const TOKEN = sessionStorage.getItem("token");
const BASE_URL = 'https://py-infinityadmin.mobiloitte.io/app';


// const BASE_URL = 'http://127.0.0.1:8000/app'
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
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


document.addEventListener('DOMContentLoaded', () => {
    // Check if the current page is the blog list page
    const isBlogListPage = document.getElementById('blogTable') !== null;
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            // Get the sr_no from the query parameter
            const sr_no = document.getElementById('sr_no')
            // console.log('Calling submitBlogForm with sr_no:', sr_no);
            submitBlogForm(sr_no);
        });
    } else {
        console.error('Save button not found in the DOM');
    }

    if (isBlogListPage) {
        // Fetch and display the list of blogs
        fetchBlogsFromAPI();
    }else{
        // Get the current page URL
        const currentPageURL = window.location.pathname;

        // Check if it's the view or edit blog page
        if (currentPageURL.includes('/view_blog/')) {
            // Fetch and populate blog details in the view page
            const sr_no = document.getElementById('sr_no').innerText;
            if (sr_no) {
                fetchBlogDetails(sr_no);
            } else {
                console.error('No sr_no found in the query parameter.');
            }
        } else if (currentPageURL.includes('/edit_blog/')) {
            // Fetch and populate blog details in the edit form
            const sr_no = document.getElementById('sr_no').innerText;
            if (sr_no) {
                fetchBlogDetailsForEdit(sr_no);
            } else {
                console.error('No sr_no found in the query parameter.');
            }
        }
    }

    
});


let itemsPerPage = 10; // Set the number of items per page
let currentPage = 1; // Track the current page number
let totalPageCount = 1; // Track the total number of pages
let apiUrl = `${BASE_URL}/GetAllBlogs/?page=${currentPage}&page_size=${itemsPerPage}`;

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageNumbersContainer = document.getElementById('pageNumbers');
const numberofrows = document.getElementById('numberofrows');

// Function to update pagination controls
function updatePaginationControls() {
    pageNumbersContainer.innerHTML = ''; // Clear existing page numbers
    for (let i = 1; i <= totalPageCount; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.dataset.pageNumber = i;
        pageBtn.addEventListener('click', () => {
            const pageNumber = parseInt(pageBtn.dataset.pageNumber);
            if (pageNumber !== currentPage) {
                currentPage = pageNumber;
                apiUrl = `${BASE_URL}/GetAllBlogs/?page=${currentPage}&page_size=${itemsPerPage}`;
                fetchBlogsFromAPI(apiUrl);
            }
        });
        pageNumbersContainer.appendChild(pageBtn);
    }
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPageCount;
}


// Function to fetch data from the GET API for blogs
async function fetchBlogsFromAPI(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            const blogTableBody = document.querySelector('#blogTable');
            blogTableBody.innerHTML = ''; // Clear existing data
            const startingSrNo = (currentPage - 1) * itemsPerPage + 1;

            data.response.Response.results.forEach((blog, index) => {
                const row = document.createElement('tr');
                row.setAttribute('class', "datarow");
                row.innerHTML = `
                    <td>${startingSrNo + index}</td>
                    <td>${blog.Blog_Title}</td>
                    <td>${blog.Blog_Category ? blog.Blog_Category.Category_name : 'N/A'}</td>
                    <td><img src="${blog.Blog_Image}" alt="Blog Image" class="i4" onerror="imageError(this)"></td>
                    <td>${new Date(blog.formatted_created_datetime).toLocaleString()}</td>
                    <td>
                        <i class="fa-solid fa-eye view-blog" data-sr-no="${blog.sr_no}"></i> 
                        <i class="fa-regular fa-pen-to-square edit-blog" data-sr-no="${blog.sr_no}"></i> 
                        <i class="fa-solid fa-trash delete-blog" data-sr-no="${blog.sr_no}"></i>
                    </td>
                `;
                blogTableBody.appendChild(row);
            });
            totalPageCount = data.total_pages;
            updatePaginationControls();


            // Update the "next" and "previous" links if available
            nextBtn.dataset.nextUrl = data.Response.next ? data.Response.next : '';
            prevBtn.dataset.prevUrl = data.Response.previous ? data.Response.previous : '';
        } else {
            console.error('Failed to fetch blogs:', data.message);
        }
    } catch (error) {
        console.error('Error fetching blogs:', error);
    }
}

// Event listener for the "next" button
nextBtn.addEventListener('click', () => {
    if (currentPage < totalPageCount) {
        currentPage++; // Increment the current page number
        apiUrl = `${BASE_URL}/GetAllBlogs/?page=${currentPage}&page_size=${itemsPerPage}`;
        fetchBlogsFromAPI(apiUrl); // Fetch and render data for the next page
    }
});

// Event listener for the "previous" button
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--; // Decrement the current page number
        apiUrl = `${BASE_URL}/GetAllBlogs/?page=${currentPage}&page_size=${itemsPerPage}`;
        fetchBlogsFromAPI(apiUrl); // Fetch and render data for the previous page
    }
});

// Event listener for the number of rows selection
numberofrows.addEventListener('change', () => {
    const selectedValue = numberofrows.value;
    if (selectedValue === 'all') {
        itemsPerPage = totalPageCount * 10; // Set itemsPerPage to total count of blogs
    } else {
        itemsPerPage = parseInt(selectedValue);
    }
    currentPage = 1; // Reset current page to 1 when changing the number of items per page
    apiUrl = `${BASE_URL}/GetAllBlogs/?page=${currentPage}&page_size=${itemsPerPage}`;
    fetchBlogsFromAPI(apiUrl); // Fetch and render data with the updated itemsPerPage
});

// Initial fetch to load the first page
fetchBlogsFromAPI(apiUrl);





function viewBlogDetails(sr_no) {
    // Redirect the user to the view_category.html page with the sr_no as a query parameter
    window.location.href = `/view_blog/${sr_no}`;
}

// Function to handle editing the category
function editBlog(sr_no) {
    window.location.href = `/edit_blog/${sr_no}`;
    // Implement the code to open an edit form or modal, pre-fill with category data, and update the category on save
}            
// Function to fetch and populate blog details in the edit form

async function deleteBlog(sr_no) {
    try {
        // Make an API request to delete the blog based on sr_no
        const deleteBlogResponse = await fetch(`${BASE_URL}/DeleteBlog/${sr_no}/`, {
            method: 'DELETE',
            headers: headers
        });

        if (!deleteBlogResponse.ok) {
            throw new Error('Failed to delete the blog');
        }

        // Redirect to the blog list page after successful deletion
        window.location.href = '/blog_manage'; // Replace with the actual URL of your blog list page
    } catch (error) {
        console.error(`Error deleting the blog: ${error.message}`);
    }
}

// Function to fetch and populate blog details in the view page
async function fetchBlogDetails(sr_no) {
    // console.log('Fetching blog details for sr_no:', sr_no); // Add this line

    try {
        const response = await fetch(`${BASE_URL}/Get_Perticular_blogs/${sr_no}/`,{
            headers:headers,
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        const blogDetails = responseData.Response; // Access the nested Response object
            // console.log(blogDetails)
        // Populate the view page with blog details
        const blogDetailsContainer = document.getElementById('BlogDetails'); // Replace with the actual container ID
        blogDetailsContainer.innerHTML = `
        <p class="view_details"><strong>Blog Image : </strong> <img src="${blogDetails.Blog_Image}" alt="Blog Image" class="img-fluid" style="width:10%;"></p>
        <p class="view_details"><strong>SR No : </strong> ${blogDetails.sr_no}</p>
        <p class="view_details"><strong>Blog Title : </strong> ${blogDetails.Blog_Title}</p>
        <p class="view_details"><strong>Blog Category : </strong> ${blogDetails.Blog_Category.Category_name}</p>
        <p class="view_details"><strong>Blog Author : </strong> ${blogDetails.Blog_Author}</p>
        <p class="view_details"><strong>Blog Description : </strong> ${blogDetails.Blog_Description}</p>
        <p class="view_details"><strong>Formatted Created Datetime : </strong> ${blogDetails.formatted_created_datetime}</p>
        `;
    } catch (error) {
        console.error(`Error fetching blog details: ${error.message}`);
    }
}


async function fetchBlogDetailsForEdit(sr_no) {
    try {
        // Fetch the details of the blog you want to edit
        const response = await fetch(`${BASE_URL}/Get_Perticular_blogs/${sr_no}/`,{
            headers:{
                Authorization: `Bearer ${TOKEN}`,
            },
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (!data.Response || typeof data.Response !== 'object') {
            throw new Error('Invalid or empty response data');
        }



        const blogData = data.Response;

        // Fetch the blog categories for the dropdown
        const categoriesResponse = await fetch(`${BASE_URL}/get_blog_category/`,{
            headers:{
                Authorization: `Bearer ${TOKEN}`,
            },
        });
        if (!categoriesResponse.ok) {
            throw new Error('Failed to fetch blog categories');
        }

        const categoriesData = await categoriesResponse.json();

        // Ensure categoriesData.Response is an array
        if (!Array.isArray(categoriesData.Response)) {
            throw new Error('Invalid categories data format');
        }

        const blogCategories = categoriesData.Response;

        // Get a reference to the editBlogForm
        const editBlogForm = document.getElementById('editBlogForm');

        // Define an array of field names that should be editable
        const editableFields = ['Blog_Title', 'Blog_Author', 'Blog_Description'];
        const hiddenFields=['type']

        // Populate the form fields with the existing data
        editBlogForm.innerHTML = '';

        // Iterate through the blogData and create form fields accordingly
        for (const key in blogData) {
            if (blogData.hasOwnProperty(key) ) {
                if (key === 'Blog_Image') {
                    // Handle the image field with an image tag and file input
                    const imageLabel = document.createElement('label');
                    imageLabel.textContent = 'Blog Image:';
                    editBlogForm.appendChild(imageLabel);

                    const imageContainer = document.createElement('div');
                    imageContainer.classList.add('image-container');

                    // Display the current image
                    const currentImage = document.createElement('img');
                    currentImage.src = blogData[key];
                    currentImage.alt = 'Current Blog Image';
                    currentImage.style.width='20%';
                    currentImage.style.padding='2%';
                    // currentImage.style.height = '50vh'; // Set the height using the 'style' attribute
                    imageContainer.appendChild(currentImage);
                    

                    // Add a file input for changing the image
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.id = 'Blog_Image';
                    fileInput.name = 'Blog_Image';
                    fileInput.style.color='#425743';
                    fileInput.accept = 'image/*'; // Accept only image files
                    imageContainer.appendChild(fileInput);

                    editBlogForm.appendChild(imageContainer);
                } else {
                    const label = document.createElement('label');
                    label.setAttribute('for', key);
                    label.textContent = `${key.replace('_', ' ')}: `;

                    const input = document.createElement('input');
                    input.setAttribute('type', 'text');
                    input.setAttribute('id', key);
                    input.setAttribute('name', key);
                    input.setAttribute('value', blogData[key]);
                    input.className= 'inputbox';

                    // Check if the field should be editable
                    if (editableFields.includes(key)) {
                        input.removeAttribute('readonly');
                    } 
                    else {
                        input.setAttribute('readonly', 'true');
                    }

                    // Append the label and input to the form
                    editBlogForm.appendChild(label);
                    editBlogForm.appendChild(input);
                    editBlogForm.appendChild(document.createElement('br'));
                }
            }
            editBlogForm.appendChild(document.createElement('br'));
        }

        // Create a label and select dropdown for the category
        const categoryLabel = document.createElement('label');
        categoryLabel.setAttribute('for', 'Category');
        categoryLabel.textContent = 'Category: ';

        const categoryDropdown = document.createElement('select');
        categoryDropdown.setAttribute('id', 'Category');
        categoryDropdown.setAttribute('name', 'Category');
        categoryDropdown.style.backgroundColor="#e6f7e3"

        // Populate the blog category dropdown with category options
        blogCategories.forEach((category) => {
            const option = document.createElement('option');
            option.value = category.sr_no; // Set the value to the category's sr_no
            option.textContent = category.Category_name;
            option.style.backgroundColor="#e6f7e3"

            // Check if the option matches the current blog's category
            if (category.sr_no === blogData.Blog_Category.sr_no) {
                option.selected = true;
            }

            categoryDropdown.appendChild(option);
        });

        // Append the category label and dropdown to the form
        editBlogForm.appendChild(categoryLabel);
        editBlogForm.appendChild(categoryDropdown);
        editBlogForm.appendChild(document.createElement('br'));
        editBlogForm.appendChild(document.createElement('br'));

       
        const goback = document.createElement("a");
        goback.textContent = "Go Back";
        goback.href="javascript:history.back()"
        goback.className = "btn";
        goback.style.marginTop="40px";
        goback.style.backgroundColor="#B0D9B1";
        goback.style.color="#425743";
        

        // Create a button for submitting the form
        const saveButton = document.createElement("button");
        saveButton.textContent = "Save Changes";
        saveButton.type = "button";
        saveButton.id = "saveButton";
        saveButton.className = "btn";
        saveButton.style.marginTop="40px";
        saveButton.style.marginLeft="10px";
        saveButton.style.backgroundColor="#B0D9B1";
        saveButton.style.color="#425743";


        // Append the Save Changes button to the form
        editBlogForm.appendChild(goback);
        editBlogForm.appendChild(saveButton);

        // Add an event listener for the Save Changes button
        saveButton.addEventListener('click', () => {
            // Get the sr_no from the query parameter
            const sr_no = document.getElementById('sr_no');
            submitBlogForm(sr_no);
        });
    } catch (error) {
        console.error(`Error fetching blog details for edit: ${error.message}`);
    }
}





// Function to submit the blog form
async function submitBlogForm(sr_no) {
    // console.log(sr_no)

    // console.log('Submit button clicked'); // Add this line for debugging
    // console.log(sr_no)
    const id=document.getElementById('sr_no').innerText;

    try {
        // Get values from form inputs

        const blogTitle = document.getElementById('Blog_Title').value;
        const categorySrNo = document.getElementById('Category').value;
        const blogAuthor = document.getElementById('Blog_Author').value;
        const blogDescription = document.getElementById('Blog_Description').value;

        // Create a new FormData object
        const formData = new FormData();

        // Append form data fields
        formData.append('Blog_Title', blogTitle);
        formData.append('Blog_Category_srno', categorySrNo);
        formData.append('Blog_Author', blogAuthor);
        formData.append('Blog_Description', blogDescription);

        // Get the file input element
        const fileInput = document.getElementById('Blog_Image');
        if (fileInput.files.length > 0) {
            formData.append('Blog_Image', fileInput.files[0]);
        }

        // Make an API request to update the blog details
        const response = await fetch(`${BASE_URL}/UpdateBlog/${id}/`, {
            method: 'PUT',
            body: formData,
            headers:{
                Authorization: `Bearer ${TOKEN}`,
            },
        });

        if (response.ok) {
            window.location.href = `/blog_manage`;
        //     showSuccessPopup();
        //     setTimeout(function () {
        //         window.location.href = `/blog_manage`;
        //  }, 2000);
            // alert('Blog details updated successfully.');
            // Redirect to the home page or handle success as needed
        } else {
            // Handle the error, e.g., display an error message
            const errorElement = document.getElementById('updateError');
            errorElement.textContent = 'Failed to update blog details. Please try again.';
            throw new Error('Failed to update blog details.');
        }
    } catch (error) {
        console.error(`Error submitting blog form: ${error.message}`);
    }
}




function getQueryParam(parameterName) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.get(parameterName);
}
document.addEventListener('click', async (event) => {
    const target = event.target;
    // console.log('Clicked element:', target); 

    if (target.classList.contains('view-blog')) {
        const sr_no = target.getAttribute('data-sr-no');
        viewBlogDetails(sr_no);
    } else if (target.classList.contains('edit-blog')) {
        const sr_no = target.getAttribute('data-sr-no');
        editBlog(sr_no);
    } else if (target.classList.contains('delete-blog')) {
        const sr_no = target.getAttribute('data-sr-no');
        deleteBlog(sr_no);
    }
});

function formatDateToYYYYMMDD(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return null; // Invalid date
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

//search with onkeyup
document.addEventListener('DOMContentLoaded', function () {
    // Get references to the input fields
    const blogTitleInput = document.getElementById('blogTitleInput');
    const blogStartDateInput = document.getElementById('blogStartDateInput');
    const blogEndDateInput = document.getElementById('blogEndDateInput');

    // Attach an event listener to each input field for the 'keyup' event
    blogTitleInput.addEventListener('input', handleBlogSearch);
    blogStartDateInput.addEventListener('change', handleBlogSearch);
    blogEndDateInput.addEventListener('change', handleBlogSearch);

    async function fetchBlogs(blogTitle, startDate, endDate, method = 'POST') {
        try {
            // Create a new FormData object to construct the request body
            const keyword1 = blogTitle || "";
            const fromDate1 = startDate || "";
            const toDate1 = endDate || "";

            const formData = {
                'Blog_Title' : keyword1,
                'start_date' : fromDate1, 
                'end_date' : toDate1,
            }
            // Construct the API URL
            const apiUrl = `${BASE_URL}/Get_unique_Blog/`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers:headers,
            });

            // Check if the response status is OK (200)
            if (response.status === 200) {
                const responseData = await response.json();

                if (responseData && responseData.Response && Array.isArray(responseData.Response)) {
                    const blogTableBody = document.querySelector('#blogTable');
                    blogTableBody.innerHTML = ''; // Clear existing data

                    responseData.Response.forEach((blog, index) => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${blog.Blog_Title}</td>
                            <td>${blog.Blog_Category.Category_name}</td>
                            <td><img src="${blog.Blog_Image}" alt="Blog Image" class="i4"></td>
                            <td class="blogStartDate">${new Date(blog.formatted_created_datetime).toLocaleString()}</td>
                            <td>
                            <i class="fa-solid fa-eye view-blog" data-sr-no="${blog.sr_no}"></i> 
                            <i class="fa-regular fa-pen-to-square edit-blog" data-sr-no="${blog.sr_no}"></i> 
                            <i class="fa-solid fa-trash delete-blog" data-sr-no="${blog.sr_no}"></i>
                            </td>
                        `;
                        blogTableBody.appendChild(row);
                    });
                } else {
                    console.error('No results found or invalid response structure');
                }
            } else {
                console.error('Failed to fetch blogs:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
        }
    }

    // Function to handle the search when any input field changes
    function handleBlogSearch() {
        const blogTitle = blogTitleInput.value;
        const startDate = formatDateToYYYYMMDD(blogStartDateInput.value);
        const endDate = formatDateToYYYYMMDD(blogEndDateInput.value);

        // Call the fetchBlogs function with 'POST' method
        fetchBlogs(blogTitle, startDate, endDate, 'POST');
    }
});


//function to display dialog box
function showSuccessPopup() {
    var popup = document.getElementById("successPopup");
    popup.style.display = "block";
    setTimeout(function () {
      popup.style.display = "none"; 
    }, 2000);
  }
  