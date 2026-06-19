import { Router, type IRouter } from "express";
import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAuth } from "../middlewares/auth";
import { getR2Client, getR2Bucket, getR2PublicUrl } from "../lib/r2";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Formato no permitido. Usa JPG, PNG, WebP o GIF."));
    }
  },
});

const router: IRouter = Router();

router.post("/", requireAuth, async (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ error: "La imagen no puede superar los 5MB." });
        return;
      }
      res.status(400).json({ error: err.message });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No se envió ningún archivo." });
      return;
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const key = `listings/${crypto.randomUUID()}${ext}`;

    try {
      const r2 = getR2Client();
      await r2.send(
        new PutObjectCommand({
          Bucket: getR2Bucket(),
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        }),
      );

      const publicUrl = `${getR2PublicUrl()}/${key}`;
      res.json({ url: publicUrl });
    } catch (e) {
      req.log.error(e, "Failed to upload to R2");
      res.status(500).json({ error: "Error al subir la imagen." });
    }
  });
});

export default router;
