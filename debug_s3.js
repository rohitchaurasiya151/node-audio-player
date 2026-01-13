require('dotenv').config();
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function testConnection() {
    console.log('Testing S3 Connection...');
    console.log(`Region: ${process.env.AWS_REGION}`);
    console.log(`Bucket: ${process.env.S3_BUCKET_NAME}`);

    try {
        const command = new ListObjectsV2Command({
            Bucket: process.env.S3_BUCKET_NAME,
            MaxKeys: 5
        });

        const response = await s3Client.send(command);
        console.log('Success! Connection established.');
        console.log('Files found in bucket:');
        if (response.Contents) {
            response.Contents.forEach(file => {
                console.log(` - ${file.Key}`);
            });
        } else {
            console.log(' - No files found in bucket.');
        }

    } catch (error) {
        console.error('Connection Failed!');
        console.error('Error Code:', error.name);
        console.error('Error Message:', error.message);
    }
}

testConnection();
