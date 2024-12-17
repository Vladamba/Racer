export async function getRecords() {
    return fetch('http://localhost:3000/api/records')
        .then(response => response.json())
        .catch(error => {
            return [];
        });
}

export function addRecord(time) {
    fetch('http://localhost:3000/api/records', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ time: time })
    });
}
