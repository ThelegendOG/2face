const MARKER = "2f-zone";

document.getElementById('showBtn').addEventListener('click', async () => {
    const file = document.getElementById('fileInput').files[0];
    if (!file) return alert("Select a 2F file first!");

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const mBytes = new TextEncoder().encode(MARKER);

    let foundIdx = -1;
    for (let i = 0; i < bytes.length - mBytes.length; i++) {
        if (bytes.slice(i, i + mBytes.length).every((v, k) => v === mBytes[k])) {
            foundIdx = i;
            break;
        }
    }

    if (foundIdx === -1) {
        alert("Error: No 2Face file found!");
    } else {
        const secretData = bytes.slice(foundIdx + mBytes.length);
        const blob = new Blob([secretData]);
        document.getElementById('resImg').src = URL.createObjectURL(blob);
        document.getElementById('outputArea').style.display = 'block';
    }
});
