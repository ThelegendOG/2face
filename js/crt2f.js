document.getElementById('togglePass').onclick = function() {
    const p = document.getElementById('passInput');
    if (p.type === 'password') {
        p.type = 'text';
        this.innerText = 'Hide';
    } else {
        p.type = 'password';
        this.innerText = 'Show';
    }
};

document.getElementById('genBtn').addEventListener('click', async () => {
    const f1 = document.getElementById('face1').files[0];
    const f2 = document.getElementById('face2').files[0];
    const pwd = document.getElementById('passInput').value;

    if (!f1 || !f2) return alert("Select both images!");

    const buf1 = await f1.arrayBuffer();
    const buf2 = await f2.arrayBuffer();
    const mBuf = new TextEncoder().encode("2f-zone" + pwd + "|");

    const finalBlob = new Blob([buf1, mBuf, buf2], { type: 'image/jpeg' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(finalBlob);
    link.download = "2Face_File.jpg";
    link.click();
});
;
