document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form values
    const traccarUrl = document.getElementById('traccar_url').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const file = document.getElementById('file').files[0];

    if (file) {
        // Read the file
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            processCSV(text, traccarUrl, username, password);
        };
        reader.readAsText(file);
    }
});

function processCSV(csvData, traccarUrl, username, password) {
    // Convert CSV to JSON (Assuming CSV is comma-separated and the first row contains headers)
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});
    });

    // Process each row
    data.forEach(row => {
        createDevice(row, traccarUrl, username, password);
    });
}

function createDevice(row, traccarUrl, username, password) {
    const url = `https://${traccarUrl}/api/devices`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(username + ':' + password)
    };

    let attributes = {};
    try {
        attributes = JSON.parse(row.attributes || "{}");
    } catch (error) {
        console.error("Failed to parse attributes:", error);
    }

    const data = {
        name: row.name,
        uniqueId: row.uniqueId,
        status: row.status,
        disabled: ['true', '1', 't', 'y', 'yes'].includes(row.disabled.toLowerCase()),
        lastUpdate: row.lastUpdate, // Ensure this is in ISO 8601 format or converted appropriately
        positionId: row.positionId ? parseInt(row.positionId) : null,
        groupId: row.groupId ? parseInt(row.groupId) : null,
        phone: row.phone,
        model: row.model,
        contact: row.contact,
        category: row.category,
    };

    fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(json => {
        console.log(`Device ${row.name} created successfully.`, json);
        document.getElementById('result').innerHTML += `<p>Device ${row.name} created successfully.</p>`;
    })
    .catch(error => {
        console.log(`Failed to create device ${row.name}. Error: ${error}`);
        document.getElementById('result').innerHTML += `<p>Failed to create device ${row.name}. Error: ${error}</p>`;
    });
}
