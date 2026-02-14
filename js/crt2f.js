const MARKER = "2f-zone";

function togglePass() {
    const p = document.getElementById('passInput');
    p.type = p.type === 'password' ? 'text' : 'password';
}

document.getElementById('genBtn').addEventListener('click', async () => {
    const cover = document.getElementById('coverFile').files[0];
    const secret = document.getElementById('secretFile').files[0];
    const pwd = document.getElementById('passInput').value;
    
    if (!cover || !secret) return alert("Please select both files!");

    // UI Updates
    const pBar = document.getElementById('progressBar');
    const pContainer = document.getElementById('progressContainer');
    const status = document.getElementById('statusText');
    
    pContainer.style.display = 'block';
    status.innerText = "Reading files...";
    pBar.style.width = "10%";

    try {
        // Read Cover
        const coverBuf = await readFileAsync(cover);
        pBar.style.width = "40%";
        status.innerText = "Encrypting secret...";

        // Read Secret
        const secretBuf = await readFileAsync(secret);
        
        // Get Extension (e.g., .pdf, .mp4)
        const fileExt = "." + secret.name.split('.').pop();
        
        // Create Metadata: Password + Separator + Extension + Separator
        // Structure: 2f-zone + PASSWORD + | + EXTENSION + |
        const metaString = MARKER + pwd + "|" + fileExt + "|";
        const metaBuf = new TextEncoder().encode(metaString);

        pBar.style.width = "80%";
        status.innerText = "Merging binary data...";

        // Merge: [Cover] [Meta] [Secret]
        const finalBlob = new Blob([coverBuf, metaBuf, secretBuf], { type: 'image/jpeg' });

        // Generate Filename: IMG_YYYYMMDD_Time.jpg
        const date = new Date();
        const timestamp = date.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const filename = `IMG_${timestamp}.jpg`;

        // Download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(finalBlob);
        link.download = filename;
        link.click();

        pBar.style.width = "100%";
        status.innerText = "Done! Downloading...";

    } catch (e) {
        alert("Error: " + e.message);
        pContainer.style.display = 'none';
    }
});

// Helper for Async Reading
function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

