# Solution Finale - Upload VPS

## Commandes à exécuter directement sur le VPS

```bash
# 1. Supprimer l'ancien fichier corrompu
rm server/objectStorage.ts

# 2. Créer le nouveau fichier complet
cat << 'EOF' > server/objectStorage.ts
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

export class ObjectStorageService {
  private uploadsDir: string;

  constructor() {
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
    return `/api/objects/upload/${objectId}`;
  }

  async saveUploadedFile(objectId: string, buffer: Buffer, mimeType: string): Promise<string> {
    const extensions: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp'
    };
    const extension = extensions[mimeType] || '.jpg';
    const filename = `${objectId}${extension}`;
    const filePath = path.join(this.uploadsDir, filename);
    
    fs.writeFileSync(filePath, buffer);
    return `/api/objects/${objectId}${extension}`;
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
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };
      const mimeType = mimeTypes[ext] || 'application/octet-stream';

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
      } else if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }
}

export const objectStorageService = new ObjectStorageService();

function parseObjectPath(fullPath: string) {
  return { bucketName: "", objectName: fullPath };
}

export { parseObjectPath };
EOF

# 3. Vérifier que le fichier est complet
wc -l server/objectStorage.ts
tail -5 server/objectStorage.ts

# 4. Ajouter les routes multer dans routes.ts
grep -n "app.post.*objects.*upload" server/routes.ts | head -1 | cut -d: -f1 | xargs -I {} sed -i '{}a\
\
  // Direct file upload route with multer for VPS\
  const multer = (await import("multer")).default;\
  const upload = multer({ storage: multer.memoryStorage() });\
  \
  app.post("/api/objects/upload/:objectId", authenticateToken, upload.single("file"), async (req: any, res: any) => {\
    try {\
      console.log("Direct upload request from user:", req.user?.id);\
      \
      if (!req.file) {\
        return res.status(400).json({ error: "No file provided" });\
      }\
      \
      const objectId = req.params.objectId;\
      const { objectStorageService } = await import("./objectStorage");\
      \
      const filePath = await objectStorageService.saveUploadedFile(\
        objectId,\
        req.file.buffer,\
        req.file.mimetype\
      );\
      \
      console.log("File uploaded successfully:", filePath);\
      res.json({ \
        success: true,\
        path: filePath,\
        url: filePath\
      });\
    } catch (error: any) {\
      console.error("Error in direct upload:", error);\
      res.status(500).json({ error: error.message });\
    }\
  });' server/routes.ts

# 5. Build final
npm run build
pm2 restart tomati-hamdi

# 6. Test immédiat
sleep 3
pm2 logs tomati-hamdi --lines 5
curl -I https://tomati.org/api/objects/upload
```

Ces commandes créeront le système d'upload fonctionnel définitivement.