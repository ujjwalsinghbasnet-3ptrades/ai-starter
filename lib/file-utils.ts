import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export const extractPdfText = async (file: File): Promise<string> => {
  const typedArray = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument(typedArray).promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const pageText = textContent.items.map((item: any) => item.str).join(" ");

    fullText = `${fullText}${pageText}\n`;
  }

  return fullText;
};

export const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve((reader.result as string) || "");
    };

    reader.onerror = (error) => {
      reject(`Failed to read file: ${error}`);
    };

    reader.readAsText(file);
  });
};
