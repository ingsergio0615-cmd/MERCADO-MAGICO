import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LevelReport {
  level: number;
  name: string;
  stars: number;
}

export const generateMagicReport = (chefName: string, levels: LevelReport[], isIndividual: boolean = false) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Background decoration (simple border)
  doc.setDrawColor(244, 164, 96); // baked-brown equivalent
  doc.setLineWidth(2);
  doc.rect(10, 10, 190, 277);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(139, 69, 19); // Brown
  const title = isIndividual ? "RECONOCIMIENTO MÁGICO" : "DIPLOMA MÁGICO";
  doc.text(title, 105, 40, { align: 'center' });

  // Subtitle
  doc.setFontSize(16);
  doc.text(isIndividual ? `Nivel: ${levels[0].name}` : "DEL MERCADO DE FRACCIONES", 105, 50, { align: 'center' });

  // Recognition text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Este diploma se otorga con orgullo a:", 105, 75, { align: 'center' });

  // Chef Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(234, 88, 12); // Primary orange
  doc.text(chefName.toUpperCase(), 105, 95, { align: 'center' });

  // Achievement text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Por completar con éxito sus misiones en el Mercado Mágico", 105, 115, { align: 'center' });
  doc.text("y dominar el poder de las fracciones.", 105, 122, { align: 'center' });

  // Level stats table
  const tableData = levels.map(l => [
    `Nivel ${l.level}: ${l.name}`,
    "⭐".repeat(l.stars)
  ]);

  autoTable(doc, {
    startY: 140,
    head: [['Tienda Visitada', 'Estrellas Logradas']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [234, 88, 12], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 12, cellPadding: 5 },
    margin: { left: 40, right: 40 }
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || 140;
  doc.setFontSize(12);
  doc.setTextColor(150, 150, 150);
  const date = new Date().toLocaleDateString();
  doc.text(`Fecha: ${date}`, 105, finalY + 20, { align: 'center' });

  doc.setFont("helvetica", "italic");
  doc.text("¡Sigue cocinando magia con los números!", 105, finalY + 30, { align: 'center' });

  // Save the PDF
  const filename = isIndividual 
    ? `Logro_${levels[0].name.replace(/\s+/g, '_')}_${chefName}.pdf`
    : `Diploma_Magico_${chefName}.pdf`;
  doc.save(filename);
};
