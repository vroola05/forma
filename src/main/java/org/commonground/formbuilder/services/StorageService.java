package org.commonground.formbuilder.services;

import io.awspring.cloud.s3.S3Resource;
import io.awspring.cloud.s3.S3Template;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.InputStream;

@Service
public class StorageService {

    private final S3Template s3Template;
    private final String bucketTemp;
    private final String bucketStored;
    private final String bucketPublic;

    public StorageService(S3Template s3Template, 
        @Value("${storage.bucket-temp}") String bucketTemp,
                          @Value("${storage.bucket-stored}") String bucketStored,
                          @Value("${storage.bucket-public}") String bucketPublic
    ) {
        this.s3Template = s3Template;
        this.bucketTemp = bucketTemp;
        this.bucketStored = bucketStored;
        this.bucketPublic = bucketPublic;
    }

    private void upload(String bucket, String key, InputStream inputStream) {
        s3Template.upload(bucket, key, inputStream);
    }

    private S3Resource download(String bucket, String key) {
        return s3Template.download(bucket, key);
    }

    private void delete(String bucket, String key) {
        s3Template.deleteObject(bucket, key);
    }

    public void uploadTempFile(String key, InputStream inputStream) {
        this.upload(this.bucketTemp, key, inputStream);
    }

    public S3Resource downloadTempFile(String key) {
        return s3Template.download(this.bucketTemp, key);
    }

    public void deleteTempFile(String key) {
        s3Template.deleteObject(this.bucketTemp, key);
    }

    public void uploadPublicAsset(String key, InputStream inputStream) {
        this.upload(this.bucketTemp, key, inputStream);
    }

    public S3Resource downloadPublicAsset(String key) {
        return s3Template.download(this.bucketTemp, key);
    }

    public void deletePublicAsset(String key) {
        s3Template.deleteObject(this.bucketTemp, key);
    }

    public void uploadStoredFile(String key, InputStream inputStream) {
        this.upload(this.bucketStored, key, inputStream);
    }

    public S3Resource downloadStoredFile(String key) {
        return s3Template.download(this.bucketStored, key);
    }

    public void deleteStoredFile(String key) {
        s3Template.deleteObject(this.bucketStored, key);
    }
}
