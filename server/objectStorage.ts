import { Response } from "express";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

// Service Object Storage local pour VPS
export class ObjectStorageService {
  private uploadsDir: string;

  constructor() {
    // Create uploads directory in the project root
    this.uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  getPrivateObjectDir(): string {
    return this.uploadsDir;
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const objectId = randomUUID();
    // Return a local upload endpoint instead of external URL
    return `/api/objects/upload/${objectId}`;
  }

  async saveUploadedFile(objectId: string, buffer: Buffer, mimeType: string): Promise<string> {
    const extension = this.getExtensionFromMimeType(mimeType);
    const filename = `${objectId}${extension}`;
    const filePath = path.join(this.uploadsDir, filename);
    
    fs.writeFileSync(filePath, buffer);
    
    // Return the URL path to access the file
    return `/api/objects/${objectId}${extension}`;
  }

  private getExtensionFromMimeType(mimeType: string): string {
    const extensions: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp'
    };
    return extensions[mimeType] || '.jpg';
  }

  async getObjectEntityFile(objectPath: string): Promise<any> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const filename = objectPath.replace("/objects/", "");
    const filePath = path.join(this.uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new ObjectNotFoundError();
    }
    
    return {
      path: filePath,
      filename: filename
    };
  }

  normalizeObjectEntityPath(rawPath: string): string {
    // For local storage, just return the path as is
    return rawPath;
  }

  async downloadObject(file: any, res: Response, cacheTtlSec: number = 3600) {
    try {
      const filePath = file.path;
      
      if (!fs.existsSync(filePath)) {
        throw new ObjectNotFoundError();
      }

      const stats = fs.statSync(filePath);
      const ext = path.extname(file.filename).toLowerCase();
      const mimeType = this.getMimeTypeFromExtension(ext);

      res.set({
        "Content-Type": mimeType,
        "Content-Length": stats.size.toString(),
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
      });

      const stream = fs.createReadStream(filePath);
      
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (error instanceof ObjectNotFoundError) {
        res.status(404).json({ error: "File not found" });
      } else {
        if (!res.headersSent) {
          res.status(500).json({ error: "Error downloading file" });
        }
      }
    }
  }

  private getMimeTypeFromExtension(ext: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

export const objectStorageService = new ObjectStorageService();

function parseObjectPath(fullPath: string) {
  return { bucketName: "", objectName: fullPath };
}

export { parseObjectPath };