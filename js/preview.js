// preview.js
export async function updatePreview() {
    const pdfBlob = await window.generatePDF();
    if (!pdfBlob) {
        console.error("ไม่สามารถสร้าง PDF Blob ได้");
        return;
    }
  
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const pdfViewer = await pdfjsLib.getDocument(pdfUrl).promise;
    const numPages = pdfViewer.numPages;
  
    const container = document.getElementById("pdfPreviewContainer");
    if (!container) {
        console.error("ไม่พบ pdfPreviewContainer");
        return;
    }
    container.innerHTML = "";
  
    const containerWidth = document.querySelector('.preview-container').clientWidth - 20;
    const a4Width = 595.28;
    const scale = containerWidth / a4Width;
    const devicePixelRatio = window.devicePixelRatio || 1;
  
    for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
        const page = await pdfViewer.getPage(pageNumber);
        const viewport = page.getViewport({ scale: scale });
  
        const canvas = document.createElement("canvas");
        canvas.id = `pdfPreviewPage${pageNumber}`;
        canvas.className = "pdf-preview-page";
        container.appendChild(canvas);
  
        const context = canvas.getContext("2d");
        canvas.width = viewport.width * devicePixelRatio;
        canvas.height = viewport.height * devicePixelRatio;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        canvas.style.marginBottom = "10px";
  
        context.save();
        if (page.rotate === 90 || page.rotate === 270) {
            context.translate(canvas.width / devicePixelRatio, 0);
            context.rotate(Math.PI / 2);
        } else if (page.rotate === 180) {
            context.translate(canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);
            context.rotate(Math.PI);
        }
        context.scale(devicePixelRatio, devicePixelRatio);
  
        await page.render({
            canvasContext: context,
            viewport: viewport,
        }).promise;
  
        context.restore();
    }
  
    URL.revokeObjectURL(pdfUrl);
  
    const previewContainer = document.querySelector('.preview-container');
    previewContainer.scrollTop = 0;
  }
  
  export function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  export async function downloadPDF() {
    const pdfBlob = await window.generatePDF();
    if (pdfBlob) {
        saveAs(pdfBlob, "ComplaintForm.pdf");
        console.log("PDF Downloaded Successfully");
    }
  }