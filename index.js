require('dotenv').config();
const express = require('express');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
const port = process.env.PORT || 3000;

// Initialize S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

app.get('/audio/:key', async (req, res) => {
    const key = req.params.key;
    const bucketName = process.env.S3_BUCKET_NAME;

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key
        });

        const response = await s3Client.send(command);

        // Set appropriate headers for audio streaming
        res.set({
            'Content-Type': response.ContentType || 'audio/mpeg',
            'Content-Length': response.ContentLength,
            'Accept-Ranges': 'bytes'
        });

        // Current versions of @aws-sdk/client-s3 return a ReadableStream in `Body` for Node.js
        // We can pipe it to the response.
        response.Body.pipe(res);

    } catch (error) {
        console.error('Error fetching object from S3:', error);
        if (error.name === 'NoSuchKey') {
            res.status(404).send('Audio file not found');
        } else {
            res.status(500).send('Error streaming audio');
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
