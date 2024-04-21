const EMAIL = sessionStorage.getItem("verifiedEmail");
const TOKEN = sessionStorage.getItem("token");
const BASE_URL = 'https://py-infinityadmin.mobiloitte.io/app';
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

    // Redirect to the home page after 2 seconds
//     setTimeout(() => {
//         // Replace '/' with the URL you want to redirect to
//         window.location.href = '/';
//     }, 2000);
// }

async function getUserDataByEmail() {
    data ={
        "email" : EMAIL,
    }
    return fetch(`${BASE_URL}/ProfileData/`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching user data:', error);
            throw error;
        });
}

// Function to populate the form fields with user data
async function populateForm(userData) {
    document.getElementById('serviceName').value = userData.full_name; 
    document.getElementById('email').value = userData.email; 
    const existingImage = userData.Images; 
    if (existingImage) {
        const imageElement = document.getElementById('profile_image'); // Corrected the id
        imageElement.src = existingImage;
    }
}
// Fetch user data and populate the form when the page loads
getUserDataByEmail(email)
    .then(userData => {
        populateForm(userData);
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
    });


    const imageInput = document.getElementById('image');
    const profileImage = document.getElementById('profile_image');
    
    imageInput.addEventListener('change', () => {
        const selectedImage = imageInput.files[0];
        if (selectedImage) {
            const imageURL = URL.createObjectURL(selectedImage);
            profileImage.src = imageURL;
        } else {
            // Handle case where no image is selected (optional)
            profileImage.src = ''; // Clear the image if no file is selected
        }
    });


// Handle form submission


// profileForm.addEventListener('submit' ,async(e)=>{
//     e.preventDefault()
//     getUserDataByEmail(email)
//     .then(async userData=>{
//         const id = userData.id
    
//     if(id){
//         const formData = new FormData()
//         const name = document.getElementById('serviceName').value
//         const email = document.getElementById('email').value  
//         const image = document.getElementById('image')

//         formData.append("email", email)
//         formData.append("full_name", name)
//         if(image.files.length > 0){
//             formData.append("Images", image.files[0])
//         }
//         const token = sessionStorage.getItem('token')
//         const headers ={
//             "Authorization" : `Bearer ${token}`,
//         }
//         const response = await fetch(`http://172.16.12.253:8000/main/ProfileDataUpdate/${id}/`,{
//             method: 'PUT',
//             body:formData,
//             headers: headers
//         })
//         const responseData = await response.json()
//         if(response.ok){
//             alert("Profile updated successfully")
//         }
//         else{
//             alert("profile didn't updated")
//         }

//     }
//     else{
//         alert("Id not avilable")
//     }
// })
// })


const profileForm = document.getElementById('profileForm');

// profileForm.addEventListener('submit', async (e) => {
//     e.preventDefault();

//     try {
//         const userData = await getUserDataByEmail();
//         const id = userData.id;
//         const formData = new FormData();

//         if (id) {
            
//             const name = document.getElementById('serviceName').value;
//             const email = document.getElementById('email').value;
//             const image = document.getElementById('image');
//             formData.append('full_name',name)
//             formData.append('email',email)


//             if (image.files.length > 0) {
//                 formData.append("Images", image.files[0]);
//             }
//             // const formData ={
//             //     "full_name" : name,
//             //     "email":email,
//             //     "Images" : image,
//             // }

//             // formData.append("email", email);
//             // formData.append("full_name", String(name));

            
            
//             const response = await fetch(`${BASE_URL}/ProfileDataUpdate/${id}/`, {
//                 method: 'PUT',
//                 body: formData,
//                 headers: {
//                     Authorization: `Bearer ${TOKEN}`,

//                 },
//             });

//             const responseData = await response.json();

//             if (response.ok) {
//                 alert("Profile updated successfully");
//             } else {
//                 alert("Profile didn't update");
//             }
//         } else {
//             alert("Id not available");
//         }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// });



profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const userData = await getUserDataByEmail();
        const id = userData.id;
        const formData = new FormData(profileForm); // Create a new FormData object

        if (id) {
            const name = document.getElementById('serviceName').value;
            const email = document.getElementById('email').value;
            const image = document.getElementById('image').files[0]; // Get the selected image file

            formData.append('full_name', name);
            formData.append('email', email);
            if (image) {
                formData.append("Images", image);
            }
            // console.log('Image:', image);

            const response = await fetch(`${BASE_URL}/ProfileDataUpdate/${id}/`, {
                method: 'PUT',
                body: formData,
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                },
            });

            const responseData = await response.json();

            if (response.ok) {
                showSuccessPopup()
                    setTimeout(function () {
                    window.location.href = `/admin_dashboard`;
                }, 2000);
                // alert("Profile updated successfully");
            } else {
                alert("Profile didn't update");
            }
        } else {
            alert("Id not available");
        }
    } catch (error) {
        console.error('Error:', error);
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