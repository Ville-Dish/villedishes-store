import React from "react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";

type GenerateProps = {
  html: React.MutableRefObject<HTMLDivElement>;
  children: React.ReactNode;
};
const GeneratePdf: React.FC<GenerateProps> = ({ html, children }) => {
  const generatePdf = async () => {
    const image = await toPng(html.current, { quality: 0.95 });
    const doc = new jsPDF();

    doc.addImage(image, "JPEG", 5, 22, 200, 160);

    doc.save();
  };
  return <div onClick={generatePdf}>{children}</div>;
};

export default GeneratePdf;
