import { S3 } from 'aws-sdk';

export class S3service {
  async getS3() {
    return new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_LOCATION,
    });
  }

  // used for single image/video upload
  async s3_upload(file, path, mimetype) {
    const s3 = await this.getS3();

    // console.log('process.env.AWS_BUCKET: ', process.env.AWS_BUCKET);
    // console.log('process.env.AWS_ACCESS_KEY_ID: ', process.env.AWS_ACCESS_KEY_ID);
    // console.log('process.env.AWS_SECRET_ACCESS_KEY: ', process.env.AWS_SECRET_ACCESS_KEY);
    // console.log('process.env.AWS_LOCATION: ', process.env.AWS_LOCATION);

    const contentType = mimetype
    // const path = Date.now() + "/" + userId;
    // const profilePictureBinary = Buffer.from(file, 'binary');
    // const contentType = determineMimeType(profilePictureBinary) || 'application/octet-stream';

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET, //'puremoon',
      Key: path,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read',
      ContentDisposition: 'inline',
    };
    try {
      let s3Response = await s3.upload(uploadParams).promise()
      // console.log("response...", s3Response);
      // return s3Response.Location;
      return {
        status: true,
        message: 'Uploaded Successfully',
        data: s3Response.Location,
      };
      // const paramss = {
      //   Bucket: 'puremoon',
      //   Key: path,
      //   Expires: 3600, // URL expiration time in seconds (1 hour in this example)
      //   // Additional optional parameters can be added here
      // };
      // const preSignedUrl = s3.getSignedUrl("getObject", paramss);
      // return {
      //   status: true,
      //   data: preSignedUrl,
      // };

    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  // used for multiple image/Video upload
  async s3_uploadMulti(file, path, mimetype) {
    const s3 = await this.getS3();

    const contentType = mimetype

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET, //'puremoon',
      Key: path,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read',
      ContentDisposition: 'inline',
    };
    try {
      let s3Response = await s3.upload(uploadParams).promise()
      return s3Response.Location

    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  async s3_deleteObject(payload) {
    const s3 = await this.getS3();

    // Specify the bucket name and object key (path) to delete
    const bucketName = process.env.AWS_BUCKET;
    const objectKey = payload?.key; // This is the path of the object you want to delete

    // Set the parameters for the deleteObject operation
    const params = {
      Bucket: bucketName,
      Key: objectKey,
    };

    // Delete the object from S3
    try {
      // Delete the object from S3
      const data = await s3.deleteObject(params).promise();

      // console.log('presignedUrlDelete: success s3 service');
      return {
        status: true,
        message: 'Deleted Successfully'
      };
    } catch (err) {
      console.log(err);
      // console.log('presignedUrlDelete: failed s3 service');
      return {
        status: false,
        message: 'Not Deleted'
      };
    }
  }

  async s3Upload(base64Image, userId) {
    const s3 = await this.getS3();

    // Decode base64 image to binary data
    const binaryData = Buffer.from(base64Image.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64');

    // Determine MIME type
    // const mimeType = fileType(binaryData)?.mime || 'application/octet-stream';

    // Generate path with file extension
    // const fileExtension = mimeType.split('/').pop();
    // const path = `public/${userId}/image.${fileExtension}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET, //'puremoon',
      // Key: path,
      // Body: file,
      // ContentType: mimeType,
      ACL: 'public-read',
      ContentDisposition: 'inline',
    };

    try {
      // let s3Response = await s3.upload(uploadParams).promise()
      // console.log("response...", s3Response);
      // return s3Response.Location;

    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }

  }

    // Generate a presigned URL for downloading a file
    async getPresignedUrl(fileKey: string): Promise<string> {
      const s3 = await this.getS3();
            const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: fileKey,
      };
      try {
        await s3.headObject(params).promise();
        const urlParams = {
          Bucket: process.env.AWS_BUCKET,
          Key: fileKey,
          Expires: 60 * 5,
          ResponseContentDisposition: 'attachment' 
        };
        return s3.getSignedUrl('getObject', urlParams);
      } catch (error) {
        if (error.code === 'NotFound') {
            return null;
        } else {
          throw new Error(`Error checking file existence: ${error.message}`);
        }
      }
    }
}

function determineMimeType(buffer) {
  const signatures = [
    { hex: "89504e470d0a1a0a", mime: "image/png" },
    { hex: "474946383961", mime: "image/gif" },
    { hex: "474946383761", mime: "image/gif" },
    { hex: "ffd8ffe000104a464946", mime: "image/jpeg" },
    { hex: "ffd8ffe1001845786966", mime: "image/jpeg" },
    // Add more MIME types as needed
  ];

  // Convert buffer to a hexadecimal string
  const hexString = buffer.toString("hex", 0, 8);

  // Check the first 8 bytes against known signatures
  for (const signature of signatures) {
    console.log('signature: ', signature);
    console.log('hexString: ', hexString);
    if (hexString.startsWith(signature.hex)) {
      return signature.mime;
    }
  }

  return 'application/octet-stream';
}

