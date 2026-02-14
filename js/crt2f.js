// --- CONSTANTS & CONFIGURATION ---
const MARKER = "2f-zone"; // The unique signature to identify 2Face files

// --- UI INTERACTION: TOGGLE PASSWORD VISIBILITY ---
const togglePassBtn = document.querySelector('.btn-alt'); // Assuming the eye button has this class or use ID if specific
if(togglePassBtn) {
    togglePassBtn.onclick = function() {
        const p = document.getElementById('passInput');
        if (p.type === 'password') {
            p.type = 'text';
            this.innerText = 'Hide'; // Update icon/text
        } else {
            p.type = 'password';
            this.innerText = 'show'; // Reset icon
        }
    };
}

// --- STRICT FILE VALIDATION (Devs 0.1 Fix) ---
// Prevents users from selecting unsupported file types like .exe, .apk, etc.
const secretInput = document.getElementById('secretFile');

secretInput.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;

    // Allowed MIME Types
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const allowedPDFType = 'application/pdf';

    // Validation Logic
    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);
    const isPDF = file.type === allowedPDFType;

    // Check if the selected file matches our allowed criteria
    if (!isImage && !isVideo && !isPDF) {
        alert("CRITICAL ERROR: Unsupported File Format!\nOnly Images, Videos, and PDFs are allowed.");
        
        // Reset the input field to null so the invalid file is discarded
        this.value = ""; 
        console.error("Invalid file rejected: " + file.type);
        return;
    }

    console.log("File Verified for Processing: " + file.type);
});

// --- MAIN GENERATION LOGIC ---
document.getElementById('genBtn').addEventListener('click', async () => {
    // 1. Get Elements
    const coverInput = document.getElementById('coverFile');
    const secretInput = document.getElementById('secretFile');
    const pwd = document.getElementById('passInput').value || ""; // Default to empty string if null

    const cover = coverInput.files[0];
    const secret = secretInput.files[0];

    // 2. Basic Validation
    if (!cover || !secret) {
        return alert("Error: Please select both a Cover Image and a Secret File.");
    }

    // 3. UI Updates (Progress Bar)
    const pBar = document.getElementById('progressBar');
    const pContainer = document.getElementById('progressContainer');
    const status = document.getElementById('statusText');
    
    pContainer.style.display = 'block';
    status.innerText = "Initializing Process...";
    pBar.style.width = "10%";

    try {
        // 4. Read Cover Image
        status.innerText = "Reading Cover Image...";
        const coverBuf = await readFileAsync(cover);
        pBar.style.width = "40%";

        // 5. Read Secret File
        status.innerText = "Reading Secret Data...";
        const secretBuf = await readFileAsync(secret);
        
        // 6. Metadata Construction
        // We need to store the File Extension so we can restore it later.
        // Logic: Extract extension -> Lowercase -> Add dot if missing
        const originalName = secret.name;
        const fileExt = "." + originalName.split('.').pop().toLowerCase();
        
        // Construct the Metadata String: 
        // Format: MARKER + PASSWORD + | + EXTENSION + |
        // Example: "2f-zoneMyPass|.pdf|"
        const metaString = MARKER + pwd + "|" + fileExt + "|";
        const metaBuf = new TextEncoder().encode(metaString);

        pBar.style.width = "70%";
        status.innerText = "Stitching Binary Data...";

        // 7. Binary Merging
        // The final Blob consists of: [Cover Bytes] + [Metadata Bytes] + [Secret Bytes]
        const finalBlob = new Blob([coverBuf, metaBuf, secretBuf], { type: 'image/jpeg' });

        // 8. Generate Filename (Obfuscation)
        // Make it look like a standard camera image: IMG_YYYYMMDD_HHMMSS.jpg
        const date = new Date();
        const timestamp = date.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const filename = `IMG_${timestamp}.jpg`;

        pBar.style.width = "90%";
        status.innerText = "Finalizing...";

        // 9. Trigger Download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(finalBlob);
        link.download = filename;
        document.body.appendChild(link); // Append to body for Firefox support
        link.click();
        document.body.removeChild(link); // Clean up

        // 10. Success State
        pBar.style.width = "100%";
        status.innerText = "Success! File Downloaded.";
        console.log("2Face File Generated Successfully: " + filename);

    } catch (e) {
        // Error Handling
        console.error("Generation Failed:", e);
        alert("Process Failed: " + e.message);
        pContainer.style.display = 'none'; // Hide progress bar on error
        status.innerText = "Error occurred.";
    }
});

// --- HELPER FUNCTION: ASYNC FILE READER ---
// Converts a File object into an ArrayBuffer
function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(new Error("File Read Error: " + err));
        reader.readAsArrayBuffer(file);
    });
}
// --- DYNAMIC FILE TYPE SELECTOR (Devs 0.1 Update) ---
const fileTypeSelector = document.getElementById('fileType');
const secretInput = document.getElementById('secretFile');

fileTypeSelector.addEventListener('change', function() {
    const selectedType = this.value;

    // Dynamically change the 'accept' attribute based on user choice
    if (selectedType === 'image') {
        // This will open the Image Gallery/Photos specifically on most phones
        secretInput.setAttribute('accept', 'image/*');
        console.log("Mode: Image Only Selection");
    } 
    else if (selectedType === 'video') {
        secretInput.setAttribute('accept', 'video/*');
        console.log("Mode: Video Only Selection");
    } 
    else if (selectedType === 'pdf') {
        secretInput.setAttribute('accept', '.pdf, application/pdf');
        console.log("Mode: PDF Only Selection");
    }
    
    // Clear the previous selection to avoid format mismatch
    secretInput.value = ""; 
});

// --- UPDATED STRICT VALIDATION (English Only) ---
secretInput.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;

    const selectedType = fileTypeSelector.value;
    let isValid = false;

    // Strict Type Checking based on Dropdown Selection
    if (selectedType === 'image' && file.type.startsWith('image/')) {
        isValid = true;
    } else if (selectedType === 'video' && file.type.startsWith('video/')) {
        isValid = true;
    } else if (selectedType === 'pdf' && file.type === 'application/pdf') {
        isValid = true;
    }

    if (!isValid) {
        alert("CRITICAL ERROR: File format does not match the selected Type (" + selectedType.toUpperCase() + ")!");
        this.value = ""; // Reset input
        return;
    }

    console.log("File Verified for VixM Project: " + file.type);
});
