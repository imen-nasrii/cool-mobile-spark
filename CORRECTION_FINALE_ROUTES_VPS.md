# Correction Finale Routes VPS

## Commandes pour corriger routes.ts et objectStorage

```bash
# 1. Restaurer routes.ts depuis git
git checkout HEAD -- server/routes.ts

# 2. Vérifier que routes.ts est correct
tail -5 server/routes.ts

# 3. Ajouter les routes multer à la bonne place
sed -i '/return httpServer;/i\
\
  \/\/ Local file upload with multer for VPS\
  const multer = (await import("multer")).default;\
  const upload = multer({ storage: multer.memoryStorage() });\
  \
  app.post("\/api\/objects\/upload\/:objectId", authenticateToken, upload.single("file"), async (req: any, res: any) => {\
    try {\
      console.log("VPS multer upload from:", req.user?.id);\
      if (!req.file) return res.status(400).json({ error: "No file" });\
      const { objectStorageService } = await import(".\/objectStorage");\
      const filePath = await objectStorageService.saveUploadedFile(req.params.objectId, req.file.buffer, req.file.mimetype);\
      console.log("VPS upload success:", filePath);\
      res.json({ success: true, path: filePath, url: filePath });\
    } catch (error: any) {\
      console.error("VPS upload error:", error);\
      res.status(500).json({ error: error.message });\
    }\
  });' server/routes.ts

# 4. Build et test final
npm run build
pm2 restart tomati-hamdi
sleep 3
pm2 logs tomati-hamdi --lines 5
```