import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { S3Client, GetObjectCommand, GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { IncomingMessage } from 'http';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
    }
});

app.get('/audio/:key', async (req: Request, res: Response) => {
    const key = req.params.key as string;
    const bucketName = process.env.S3_BUCKET_NAME;

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key
        });

        const response: GetObjectCommandOutput = await s3Client.send(command);

        // Set appropriate headers for audio streaming
        res.set({
            'Content-Type': response.ContentType || 'audio/mpeg',
            'Content-Length': response.ContentLength?.toString(),
            'Accept-Ranges': 'bytes'
        });

        // Current versions of @aws-sdk/client-s3 return a ReadableStream in `Body` for Node.js
        // We can pipe it to the response.
        if (response.Body instanceof IncomingMessage) {
            response.Body.pipe(res);
        } else {
            // Handle other stream types if necessary, though simpler standard Node stream is common
            (response.Body as any).pipe(res);
        }

    } catch (error: any) {
        console.error('Error fetching object from S3:', error);
        if (error.name === 'NoSuchKey') {
            res.status(404).send('Audio file not found');
        } else {
            res.status(500).send('Error streaming audio');
        }
    }
});

app.listen(port, () => {
    console.log(`TypeScript Server is running on port ${port}`);
});
