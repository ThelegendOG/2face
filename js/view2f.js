const MARKER = "2f-zone";
let currentBlob = null;
let currentExt = ".jpg";

function toggleViewPass() {
    const p = document.getElementById('viewPass');
    p.type = p.type === 'password' ? 'text' : 'password';
}

document.getElementById('showBtn').addEventListener('click', async () => {
    const file = document.getElementById('fileInput').files[0];
    const userPwd = document.getElementById('viewPass').value;
    const errorMsg = document.getElementById('errorMsg');
    const resultArea = document.getElementById('resultArea');
    const mediaContainer = document.getElementById('mediaContainer');

    // Reset
    errorMsg.style.display = 'none';
    resultArea.style.display = 'none';
    mediaContainer.innerHTML = '';

    if (!file) {
        errorMsg.innerText = "Please select a file first.";
        errorMsg.style.display = 'block';
        return;
    }

    try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const mBytes = new TextEncoder().encode(MARKER);

        // 1. Find Marker
        let idx = -1;
        for (let i = 0; i < bytes.length - mBytes.length; i++) {
            if (bytes.slice(i, i + mBytes.length).every((v, k) => v === mBytes[k])) {
                idx = i;
                break;
            }
        }

        if (idx === -1) throw new Error("No 2Face data found in this image.");

        // 2. Extract Metadata (Password | Extension | Data)
        const afterMarker = bytes.slice(idx + mBytes.length);
        const decoder = new TextDecoder();
        
        // Find separators '|'
        // Logic: Pass|Ext|Data
        let firstSep = -1;
        let secondSep = -1;

        for(let i=0; i<200; i++) { // Search first 200 bytes
            if(afterMarker[i] === 124) { // 124 is '|'
                if(firstSep === -1) firstSep = i;
                else {
                    secondSep = i;
                    break;
                }
            }
        }

        if(firstSep === -1 || secondSep === -1) throw new Error("File corrupted or old version.");

        const storedPass = decoder.decode(afterMarker.slice(0, firstSep));
        const storedExt = decoder.decode(afterMarker.slice(firstSep + 1, secondSep));
        
        // 3. Check Password
        if (storedPass !== "" && storedPass !== userPwd) {
            throw new Error("Wrong Password! Access Denied.");
        }

        // 4. Create Blob
        const secretData = afterMarker.slice(secondSep + 1);
        
        // Determine MIME type based on extension
        let mime = 'application/octet-stream';
        if(storedExt.match(/jpg|jpeg|png|gif/)) mime = 'image/jpeg';
        if(storedExt.match(/mp4|webm/)) mime = 'video/mp4';
        if(storedExt.match(/pdf/)) mime = 'application/pdf';

        currentBlob = new Blob([secretData], { type: mime });
        currentExt = storedExt;

        // 5. Display Content
        if (mime.startsWith('image')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(currentBlob);
            img.style.maxWidth = '100%';
            img.style.borderRadius = '10px';
            mediaContainer.appendChild(img);
        } else if (mime.startsWith('video')) {
            const vid = document.createElement('video');
            vid.src = URL.createObjectURL(currentBlob);
            vid.controls = true;
            vid.style.maxWidth = '100%';
            mediaContainer.appendChild(vid);
        } else {
            mediaContainer.innerHTML = `<p style="padding:10px; background:#334155; border-radius:8px;">📄 Document (${storedExt}) ready to download.</p>`;
        }

        resultArea.style.display = 'block';

    } catch (e) {
        errorMsg.innerText = e.message;
        errorMsg.style.display = 'block';
    }
});

// Download Handler
document.getElementById('dlBtn').onclick = () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(currentBlob);
    link.download = "Secret_File" + currentExt;
    link.click();
};

// Share Handler
document.getElementById('shareBtn').onclick = async () => {
    if (navigator.share && currentBlob) {
        const file = new File([currentBlob], "Secret_File" + currentExt, { type: currentBlob.type });
        try {
            await navigator.share({
                files: [file],
                title: 'Secret Revealed',
                text: 'Here is the hidden file from 2Face.'
            });
        } catch (err) { console.log("Share skipped"); }
    } else {
        alert("Share not supported on this browser/device.");
    }
};

