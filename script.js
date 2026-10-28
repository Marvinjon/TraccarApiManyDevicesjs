document.getElementById('file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) {
        hidePreview();
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        displayCSVPreview(event.target.result);
    };
    reader.readAsText(file);
});

document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const traccarUrl = document.getElementById('traccar_url').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const preview = document.getElementById('csvPreview');

    if (preview.hidden) {
        return;
    }

    const rows = getEditedRowsFromPreview();
    rows.forEach(row => {
        createDevice(row, traccarUrl, username, password);
    });
});

function parseCSV(csvData) {
    const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) {
        return { headers: [], rows: [] };
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header] = (values[index] || '').trim();
            return obj;
        }, {});
    });

    return { headers, rows };
}

function displayCSVPreview(csvData) {
    const { headers, rows } = parseCSV(csvData);
    const preview = document.getElementById('csvPreview');
    const table = document.getElementById('previewTable');
    const count = document.getElementById('previewCount');

    if (headers.length === 0) {
        hidePreview();
        return;
    }

    let html = '<thead><tr>';
    headers.forEach(header => {
        html += `<th data-header="${escapeHtml(header)}">${escapeHtml(header)}</th>`;
    });
    html += '</tr></thead><tbody>';

    rows.forEach(row => {
        html += '<tr>';
        headers.forEach(header => {
            const value = row[header] || '';
            html += `<td><input type="text" data-field="${escapeHtml(header)}" value="${escapeHtml(value)}"></td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';

    table.innerHTML = html;
    count.textContent = `${rows.length} device${rows.length === 1 ? '' : 's'} found. Edit any field below, then click Upload.`;
    preview.hidden = false;
}

function getEditedRowsFromPreview() {
    const table = document.getElementById('previewTable');
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.dataset.header);
    const rows = [];

    table.querySelectorAll('tbody tr').forEach(tr => {
        const row = {};
        headers.forEach(header => {
            const input = tr.querySelector(`input[data-field="${CSS.escape(header)}"]`);
            row[header] = input ? input.value.trim() : '';
        });
        rows.push(row);
    });

    return rows;
}

function hidePreview() {
    document.getElementById('csvPreview').hidden = true;
    document.getElementById('previewTable').innerHTML = '';
    document.getElementById('previewCount').textContent = '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function normalizeTraccarUrl(traccarUrl) {
    const trimmed = traccarUrl.trim().replace(/\/+$/, '');
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    return `https://${trimmed}`;
}

function createDevice(row, traccarUrl, username, password) {
    let attributes = {};
    try {
        attributes = JSON.parse(row.attributes || "{}");
    } catch (error) {
        console.error("Failed to parse attributes:", error);
    }

    const device = {
        name: row.name,
        uniqueId: row.uniqueId,
        status: row.status,
        disabled: ['true', '1', 't', 'y', 'yes'].includes((row.disabled || '').toLowerCase()),
        lastUpdate: row.lastUpdate, // Ensure this is in ISO 8601 format or converted appropriately
        positionId: row.positionId ? parseInt(row.positionId) : null,
        groupId: row.groupId ? parseInt(row.groupId) : null,
        phone: row.phone,
        model: row.model,
        contact: row.contact,
        category: row.category,
        attributes: attributes,
    };

    // Browser → Traccar is blocked by CORS. On Netlify we proxy via a function.
    const useProxy = window.location.protocol !== 'file:';
    const request = useProxy
        ? fetch('/.netlify/functions/create-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                traccarUrl: normalizeTraccarUrl(traccarUrl),
                username,
                password,
                device,
            }),
        })
        : fetch(`${normalizeTraccarUrl(traccarUrl)}/api/devices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Basic ' + btoa(username + ':' + password),
            },
            body: JSON.stringify(device),
        });

    request
    .then(async response => {
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
            const message = json.message || json.error || `HTTP error! status: ${response.status}`;
            throw new Error(message);
        }
        return json;
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
