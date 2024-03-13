document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const traccarUrl = document.getElementById('traccar_url').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const fileInput = document.getElementById('file');

    if (fileInput.files.length > 0) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const csv = e.target.result;
            // Convert CSV to JSON here, or prepare data as needed for Traccar API
            // This is a simplified example; you may need a CSV parsing library
            const lines = csv.split('\n').map(line => line.split(','));
            console.log(lines); // Log for demonstration; implement actual logic

            // Example: Make API request to Traccar for each device
            // You'll need to adjust this according to Traccar's API and your CSV structure
            lines.forEach(line => {
                // Construct device data from line array
                const deviceData = {
                    // Fill in with actual data mapping
                };

                // Make the API request to Traccar
                // Example: postDevice(traccarUrl, username, password, deviceData);
            });
        };

        reader.readAsText(fileInput.files[0]);
    }
});

// Example function to POST device data to Traccar
function postDevice(url, username, password, data) {
    const fullUrl = `https://${url}/api/devices`;
    fetch(fullUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(username + ":" + password)
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        // Handle success response
    })
    .catch((error) => {
        console.error('Error:', error);
        // Handle errors
    });
}
