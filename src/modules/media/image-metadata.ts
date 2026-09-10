import type { AllowedImageMimeType } from "./config";

type ImageMetadata = {
  mimeType: AllowedImageMimeType;
  width: number;
  height: number;
};

export function extractImageMetadata(buffer: Buffer): ImageMetadata | null {
  return readJpegMetadata(buffer) ?? readPngMetadata(buffer) ?? readWebpMetadata(buffer);
}

function readPngMetadata(buffer: Buffer): ImageMetadata | null {
  if (
    buffer.length < 24 ||
    buffer[0] !== 0x89 ||
    buffer.toString("ascii", 1, 4) !== "PNG" ||
    buffer.toString("ascii", 12, 16) !== "IHDR"
  ) {
    return null;
  }

  return {
    mimeType: "image/png",
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function readJpegMetadata(buffer: Buffer): ImageMetadata | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];

    if (marker === 0xd9 || marker === 0xda) {
      break;
    }

    const length = buffer.readUInt16BE(offset + 2);
    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isStartOfFrame && offset + 8 < buffer.length) {
      return {
        mimeType: "image/jpeg",
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + length;
  }

  return null;
}

function readWebpMetadata(buffer: Buffer): ImageMetadata | null {
  if (
    buffer.length < 30 ||
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WEBP"
  ) {
    return null;
  }

  const chunk = buffer.toString("ascii", 12, 16);

  if (chunk === "VP8X" && buffer.length >= 30) {
    return {
      mimeType: "image/webp",
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }

  if (chunk === "VP8 " && buffer.length >= 30) {
    return {
      mimeType: "image/webp",
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  if (chunk === "VP8L" && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);

    return {
      mimeType: "image/webp",
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  return null;
}
