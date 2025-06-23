    // app/api/struk/upload/route.js
    import { NextResponse } from "next/server";
    import { v4 as uuidv4 } from "uuid";
    import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
    import { cert, getApps, initializeApp } from "firebase-admin/app";
    import { getFirestore } from "firebase-admin/firestore";

    export const runtime = "nodejs";
    export const dynamic = "force-dynamic";

    // 🔐 Inisialisasi Firebase Admin
    if (!getApps().length) {
    initializeApp({
        credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
    }

    const db = getFirestore();

    // ⚙️ Konfigurasi AWS S3 SDK v3
    const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    });

    export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || typeof file === "string") {
        return NextResponse.json({ error: "Invalid file" }, { status: 400 });
        }

        // Validasi tipe file (opsional)
        const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
            { error: "File type not allowed" },
            { status: 400 }
        );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `struk/${Date.now()}_${uuidv4()}_${file.name}`;

        // 📤 Upload ke S3
        await s3.send(
        new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filename,
            Body: buffer,
            ContentType: file.type,
        })
        );

        const image_url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;

        // 📝 Simpan metadata opsional ke Firestore
        await db.collection("struks").add({
        image_url,
        created_at: new Date().toISOString(),
        });

        // ✅ Balikan URL ke client
        return NextResponse.json({
        message: "Struk uploaded successfully",
        image_url,
        });
    } catch (err) {
        console.error("UPLOAD ERROR", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
    }
