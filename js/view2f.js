document.getElementById('toggleViewPass').onclick = function() {
    const p = document.getElementById('viewPass');
    p.type = p.type === 'password' ? 'text' : 'password';
    this.innerText = p.type === 'password' ? 'Show' : 'Hide';
};

document.getElementById('showBtn').addEventListener('click', async () => {
    const file = document.getElementById('fileInput').files[0];
    const userPwd = document.getElementById('viewPass').value;
    
    if (!file) return alert("Please select a file!");

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const marker = "2f-zone";
    const mBytes = new TextEncoder().encode(marker);

    let idx = -1;
    for (let i = 0; i < bytes.length - mBytes.length; i++) {
        if (bytes.slice(i, i + mBytes.length).every((v, k) => v === mBytes[k])) {
            idx = i;
            break;
        }
    }

    if (idx === -1) return alert("No 2Face file found!");

    // Extract password and data
    const afterMarker = bytes.slice(idx + mBytes.length);
    const decoder = new TextDecoder();
    
    // Find separator '|' to get stored password
    let sepIdx = -1;
    for(let i=0; i < 100; i++) { // search first 100 bytes for '|'
        if (afterMarker[i] === 124) { // 124 is ASCII for '|'
            sepIdx = i;
            break;
        }
    }

    const storedPass = decoder.decode(afterMarker.slice(0, sepIdx));

    if (storedPass !== "" && storedPass !== userPwd) {
        return alert("Wrong Password! Access Denied.");
    }

    // Success: Extract and Show Secret Face
    const secretData = afterMarker.slice(sepIdx + 1);
    const blob = new Blob([secretData]);
    document.getElementById('resImg').src = URL.createObjectURL(blob);
    document.getElementById('outputArea').style.display = 'block';
});
;
