import { Injectable, inject } from '@angular/core';
import { CvDataService } from './cv-data.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfOptions {
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  quality?: number;
  filename?: string;
  includeImages?: boolean;
  watermark?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {
  private cvDataService = inject(CvDataService);

  /**
   * Generate PDF from current CV data
   */
  async generateCV(options: PdfOptions = {}): Promise<void> {
    const {
      format = 'a4',
      orientation = 'portrait',
      quality = 1.0,
      filename = 'Lubomir_Dobrovodsky_CV.pdf',
      includeImages = true,
      watermark = false
    } = options;

    try {
      // Create new PDF document
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      // Set document properties
      this.setDocumentProperties(pdf);

      // Generate PDF content
      await this.generatePdfContent(pdf, { includeImages, watermark, quality });

      // Save the PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  /**
   * Generate PDF from HTML element (for full website capture)
   */
  async generateFromElement(element: HTMLElement, options: PdfOptions = {}): Promise<void> {
    const {
      format = 'a4',
      orientation = 'portrait',
      quality = 0.8,
      filename = 'Lubomir_Dobrovodsky_CV.pdf'
    } = options;

    try {
      // Create canvas from HTML element
      const canvas = await html2canvas(element, {
        scale: quality,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a0a0a', // Dark background matching the theme
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      // Calculate PDF dimensions
      const imgWidth = format === 'a4' ? 210 : 216; // A4 or Letter width in mm
      const pageHeight = format === 'a4' ? 297 : 279; // A4 or Letter height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      this.setDocumentProperties(pdf);

      let position = 0;

      // Add pages as needed
      while (heightLeft >= 0) {
        pdf.addImage(
          canvas.toDataURL('image/jpeg', quality),
          'JPEG',
          0,
          position,
          imgWidth,
          imgHeight
        );

        heightLeft -= pageHeight;

        if (heightLeft > 0) {
          pdf.addPage();
          position = -pageHeight;
        }
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF from element:', error);
      throw new Error('Failed to generate PDF from webpage. Please try again.');
    }
  }

  /**
   * Set PDF document properties
   */
  private setDocumentProperties(pdf: jsPDF): void {
    const personalInfo = this.cvDataService.personalInfo();

    pdf.setProperties({
      title: `${personalInfo.name} - CV`,
      subject: 'Curriculum Vitae',
      author: personalInfo.name,
      keywords: 'CV, Resume, Software Engineer, Angular, TypeScript',
      creator: 'Lubomir of Slavigrad Chronicles CV Website'
    });
  }

  /**
   * Generate structured PDF content
   */
  private async generatePdfContent(pdf: jsPDF, options: { includeImages: boolean; watermark: boolean; quality: number }): Promise<void> {
    const personalInfo = this.cvDataService.personalInfo();
    const experiences = this.cvDataService.experiences();
    const projects = this.cvDataService.projects();
    const skills = this.cvDataService.skills();

    let yPosition = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Header Section
    yPosition = this.addHeader(pdf, personalInfo, yPosition, contentWidth, margin);

    // Professional Summary
    yPosition = this.addSection(pdf, 'Professional Summary', personalInfo.summary || 'Experienced software engineer with expertise in modern web technologies.', yPosition, contentWidth, margin);

    // Experience Section
    yPosition = this.addExperienceSection(pdf, experiences, yPosition, contentWidth, margin, pageHeight);

    // Skills Section
    yPosition = this.addSkillsSection(pdf, skills, yPosition, contentWidth, margin, pageHeight);

    // Projects Section
    yPosition = this.addProjectsSection(pdf, projects, yPosition, contentWidth, margin, pageHeight);

    // Add watermark if requested
    if (options.watermark) {
      this.addWatermark(pdf);
    }

    // Add footer
    this.addFooter(pdf, personalInfo);
  }

  /**
   * Add header section with personal information
   */
  private addHeader(pdf: jsPDF, personalInfo: any, yPosition: number, contentWidth: number, margin: number): number {
    // Name
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246); // Primary blue color
    pdf.text(personalInfo.name, margin, yPosition);
    yPosition += 10;

    // Title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(139, 92, 246); // Secondary purple color
    pdf.text(personalInfo.title, margin, yPosition);
    yPosition += 8;

    // Contact Information
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    const contactInfo = [
      `📧 ${personalInfo.email}`,
      `📱 ${personalInfo.phone}`,
      `📍 ${personalInfo.location}`,
      `🌐 ${personalInfo.website || 'lubomir-slavigrad.dev'}`
    ];

    contactInfo.forEach((info, index) => {
      pdf.text(info, margin + (index % 2) * (contentWidth / 2), yPosition + Math.floor(index / 2) * 5);
    });

    yPosition += 15;

    // Add separator line
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, margin + contentWidth, yPosition);
    yPosition += 10;

    return yPosition;
  }

  /**
   * Add a section with title and content
   */
  private addSection(pdf: jsPDF, title: string, content: string, yPosition: number, contentWidth: number, margin: number): number {
    // Section title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246);
    pdf.text(title, margin, yPosition);
    yPosition += 8;

    // Section content
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);

    const lines = pdf.splitTextToSize(content, contentWidth);
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * 4 + 8;

    return yPosition;
  }

  /**
   * Add experience section
   */
  private addExperienceSection(pdf: jsPDF, experiences: any[], yPosition: number, contentWidth: number, margin: number, pageHeight: number): number {
    yPosition = this.checkPageBreak(pdf, yPosition, pageHeight, 30);

    // Section title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246);
    pdf.text('Professional Experience', margin, yPosition);
    yPosition += 10;

    experiences.forEach((exp) => {
      yPosition = this.checkPageBreak(pdf, yPosition, pageHeight, 25);

      // Company and position
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 40);
      pdf.text(`${exp.position} at ${exp.company}`, margin, yPosition);
      yPosition += 6;

      // Duration and location
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const duration = `${this.formatDate(exp.startDate)} - ${exp.current ? 'Present' : this.formatDate(exp.endDate)}`;
      pdf.text(`${duration} | ${exp.location}`, margin, yPosition);
      yPosition += 6;

      // Description
      pdf.setTextColor(60, 60, 60);
      const descLines = pdf.splitTextToSize(exp.description, contentWidth);
      pdf.text(descLines, margin, yPosition);
      yPosition += descLines.length * 4 + 4;

      // Technologies
      if (exp.technologies && exp.technologies.length > 0) {
        pdf.setFontSize(9);
        pdf.setTextColor(139, 92, 246);
        pdf.text(`Technologies: ${exp.technologies.join(', ')}`, margin, yPosition);
        yPosition += 8;
      }
    });

    return yPosition;
  }

  /**
   * Add skills section
   */
  private addSkillsSection(pdf: jsPDF, skills: any[], yPosition: number, contentWidth: number, margin: number, pageHeight: number): number {
    yPosition = this.checkPageBreak(pdf, yPosition, pageHeight, 30);

    // Section title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246);
    pdf.text('Technical Skills', margin, yPosition);
    yPosition += 10;

    // Group skills by category
    const skillsByCategory = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(skillsByCategory).forEach(([category, categorySkills]) => {
      yPosition = this.checkPageBreak(pdf, yPosition, pageHeight, 15);

      // Category title
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 40);
      pdf.text(category.charAt(0).toUpperCase() + category.slice(1), margin, yPosition);
      yPosition += 6;

      // Skills list
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      const skillsText = (categorySkills as any[]).map((skill: any) => `${skill.name} (${skill.level})`).join(', ');
      const skillLines = pdf.splitTextToSize(skillsText, contentWidth);
      pdf.text(skillLines, margin, yPosition);
      yPosition += skillLines.length * 4 + 6;
    });

    return yPosition;
  }

  /**
   * Add projects section
   */
  private addProjectsSection(pdf: jsPDF, projects: any[], yPosition: number, contentWidth: number, margin: number, pageHeight: number): number {
    yPosition = this.checkPageBreak(pdf, yPosition, pageHeight, 30);

    // Section title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246);
    pdf.text('Featured Projects', margin, yPosition);
    yPosition += 10;

    projects.slice(0, 4).forEach((project) => { // Limit to top 4 projects
      yPosition = this.checkPageBreak(pdf, yPosition, pageHeight, 20);

      // Project name
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 40);
      pdf.text(project.name, margin, yPosition);
      yPosition += 6;

      // Description
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      const descLines = pdf.splitTextToSize(project.description, contentWidth);
      pdf.text(descLines, margin, yPosition);
      yPosition += descLines.length * 4 + 4;

      // Technologies
      if (project.technologies && project.technologies.length > 0) {
        pdf.setFontSize(9);
        pdf.setTextColor(139, 92, 246);
        pdf.text(`Technologies: ${project.technologies.join(', ')}`, margin, yPosition);
        yPosition += 8;
      }
    });

    return yPosition;
  }

  /**
   * Check if page break is needed
   */
  private checkPageBreak(pdf: jsPDF, yPosition: number, pageHeight: number, requiredSpace: number): number {
    if (yPosition + requiredSpace > pageHeight - 20) {
      pdf.addPage();
      return 20;
    }
    return yPosition;
  }

  /**
   * Add watermark
   */
  private addWatermark(pdf: jsPDF): void {
    const pageCount = pdf.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(50);
      pdf.setTextColor(200, 200, 200, 0.1);
      pdf.text('LUBOMIR OF SLAVIGRAD', 50, 150, { angle: 45 });
    }
  }

  /**
   * Add footer to all pages
   */
  private addFooter(pdf: jsPDF, personalInfo: any): void {
    const pageCount = pdf.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `${personalInfo.name} - CV | Generated on ${new Date().toLocaleDateString()}`,
        20,
        pdf.internal.pageSize.getHeight() - 10
      );
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pdf.internal.pageSize.getWidth() - 40,
        pdf.internal.pageSize.getHeight() - 10
      );
    }
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric'
    }).format(date);
  }
}
