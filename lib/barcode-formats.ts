export type BarcodeFormatName =
  | "QRCode"
  | "EAN13"
  | "EAN8"
  | "UPCA"
  | "UPCE"
  | "Code128"
  | "Code39"
  | "Code93"
  | "ITF"
  | "Codabar"
  | "DataMatrix"
  | "Aztec"
  | "PDF417"
  | "DataBar"
  | "DataBarExp"
  | "Telepen"
  | "MaxiCode"
  | "RMQRCode";

export interface BarcodeFormatInfo {
  value: BarcodeFormatName;
  label: string;
  description: string;
}

export const SUPPORTED_FORMATS: BarcodeFormatInfo[] = [
  { value: "QRCode", label: "QR Code", description: "2D matrix barcode" },
  { value: "EAN13", label: "EAN-13", description: "European Article Number (13 digits)" },
  { value: "EAN8", label: "EAN-8", description: "European Article Number (8 digits)" },
  { value: "UPCA", label: "UPC-A", description: "Universal Product Code (12 digits)" },
  { value: "UPCE", label: "UPC-E", description: "Universal Product Code (compressed)" },
  { value: "Code128", label: "Code 128", description: "High-density linear barcode" },
  { value: "Code39", label: "Code 39", description: "Alphanumeric linear barcode" },
  { value: "Code93", label: "Code 93", description: "Improved Code 39" },
  { value: "ITF", label: "ITF", description: "Interleaved 2 of 5" },
  { value: "Codabar", label: "Codabar", description: "Numeric linear barcode" },
  { value: "DataMatrix", label: "Data Matrix", description: "2D matrix barcode" },
  { value: "Aztec", label: "Aztec", description: "2D matrix barcode" },
  { value: "PDF417", label: "PDF 417", description: "Stacked linear barcode" },
  { value: "DataBar", label: "DataBar", description: "GS1 DataBar barcode" },
  { value: "Telepen", label: "Telepen", description: "Linear barcode" },
  { value: "MaxiCode", label: "MaxiCode", description: "2D barcode (UPS)" },
  { value: "RMQRCode", label: "rMQR Code", description: "Rectangular Micro QR Code" },
];

export const ALL_FORMATS: BarcodeFormatName[] = SUPPORTED_FORMATS.map((f) => f.value);

export function getFormatLabel(format: string): string {
  const info = SUPPORTED_FORMATS.find((f) => f.value === format);
  return info?.label ?? format ?? "Unknown";
}

export function getFormatDescription(format: string): string {
  const info = SUPPORTED_FORMATS.find((f) => f.value === format);
  return info?.description ?? "";
}
