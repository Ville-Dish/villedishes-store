declare module "jspdf" {
  interface AutoTableOptions {
    startY?: number;
    head?: string[][];
    body?: (string | number)[][];
    theme?: string;
    headStyles?: {
      fillColor?: number[];
      textColor?: number;
      fontSize?: number;
      fontStyle?: string;
    };
    bodyStyles?: {
      textColor?: number;
      fontSize?: number;
    };
    alternateRowStyles?: {
      fillColor?: number[];
    };
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  }

  interface AutoTableResult {
    finalY: number;
  }

  interface jsPDF {
    autoTable: {
      (options: AutoTableOptions): AutoTableResult;
      previous?: AutoTableResult;
    };
  }
}
