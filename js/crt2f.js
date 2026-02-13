const MARKER = "2f-zone";

document.getElementById('genBtn').addEventListener('click', async () => {
    const f1 = document.getElementById('face1').files[0];
    const f2 = document.getElementById('face2').files[0];

    if (!f1 || !f2) {
        alert("Please select both images first!");
        return;
    }

    const buf1 = await f1.arrayBuffer();
    const buf2 = await f2.arrayBuffer();
    const mBuf = new TextEncoder().encode(MARKER);

    const finalBlob = new Blob([buf1, mBuf, buf2], { type: 'image/jpeg' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(finalBlob);
    link.download = "image.jpg";
    link.click();
});
