import { BarcodeFormat } from "@zxing/library";

export interface BarcodeFormatInfo {
  value: BarcodeFormat;
  label: string;
  description: string;
}

export const SUPPORTED_FORMATS: BarcodeFormatInfo[] = [
  { value: BarcodeFormat.QR_CODE, label: "QR Code", description: "2D matrix barcode" },
  { value: BarcodeFormat.EAN_13, label: "EAN-13", description: "European Article Number (13 digits)" },
  { value: BarcodeFormat.EAN_8, label: "EAN-8", description: "European Article Number (8 digits)" },
  { value: BarcodeFormat.UPC_A, label: "UPC-A", description: "Universal Product Code (12 digits)" },
  { value: BarcodeFormat.UPC_E, label: "UPC-E", description: "Universal Product Code (compressed)" },
  { value: BarcodeFormat.CODE_128, label: "Code 128", description: "High-density linear barcode" },
  { value: BarcodeFormat.CODE_39, label: "Code 39", description: "Alphanumeric linear barcode" },
  { value: BarcodeFormat.CODE_93, label: "Code 93", description: "Improved Code 39" },
  { value: BarcodeFormat.ITF, label: "ITF", description: "Interleaved 2 of 5" },
  { value: BarcodeFormat.CODABAR, label: "Codabar", description: "Numeric linear barcode" },
  { value: BarcodeFormat.DATA_MATRIX, label: "Data Matrix", description: "2D matrix barcode" },
  { value: BarcodeFormat.AZTEC, label: "Aztec", description: "2D matrix barcode" },
  { value: BarcodeFormat.PDF_417, label: "PDF 417", description: "Stacked linear barcode" },
];

export const ALL_FORMATS = SUPPORTED_FORMATS.map((f) => f.value);

export function getFormatLabel(format: BarcodeFormat): string {
  const info = SUPPORTED_FORMATS.find((f) => f.value === format);
  return info?.label ?? BarcodeFormat[format] ?? "Unknown";
}

export function getFormatDescription(format: BarcodeFormat): string {
  const info = SUPPORTED_FORMATS.find((f) => f.value === format);
  return info?.description ?? "";
}
