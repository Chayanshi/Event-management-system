
const EMAIL = sessionStorage.getItem("verifiedEmail")
const TOKEN = sessionStorage.getItem('token')
const BASE_URL = 'https://py-infinityadmin.mobiloitte.io/app'
const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    // 'Content-Type': 'application/json'
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
    window.location.href = '/';

}

document.getElementById('add_brand').addEventListener('submit', async(e)=>{
    e.preventDefault();
    api_url = `${BASE_URL}/CreateBrand/`
    const formData  = new FormData();
    const brandName = document.getElementById('brandName').value;
    const brandImage = document.getElementById('brandImage');
    if(brandName.trim !== "" && brandImage.isDefaultNamespace.length>0) 
    {
        formData.append('brand_name',brandName)
        formData.append('brand_Image', brandImage.files[0])
        try{
            const response = await fetch(api_url, {
                method: 'POST',
                body: formData,
                headers : headers
            });

            if (response.ok) {
                const responseData = await response.json();
                // console.log(responseData)
                if (responseData.status === 201) {
                    // alert("brand added successfully")
                    window.location.href = '/brand_manage';
                    // You can also redirect or perform other actions as needed.
                }  else {
                    // alert('Failed to add Brand. Please try again.');
                }
            } else {
                // console.error('Failed to add Brand. Server returned an error.');
            }
        } catch (error) {
            // console.error('Error adding Brand:', error);
        }
    } else {
        // alert("Please fill in all required fields.");
    }
})





