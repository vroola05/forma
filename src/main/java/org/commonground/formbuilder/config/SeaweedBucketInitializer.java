package org.commonground.formbuilder.config;

import lombok.extern.slf4j.Slf4j;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.BucketAlreadyExistsException;
import software.amazon.awssdk.services.s3.model.BucketAlreadyOwnedByYouException;
import software.amazon.awssdk.services.s3.model.BucketLifecycleConfiguration;
import software.amazon.awssdk.services.s3.model.ExpirationStatus;
import software.amazon.awssdk.services.s3.model.LifecycleExpiration;
import software.amazon.awssdk.services.s3.model.LifecycleRule;
import software.amazon.awssdk.services.s3.model.LifecycleRuleFilter;
import software.amazon.awssdk.services.s3.model.PutBucketLifecycleConfigurationRequest;

import java.net.URI;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class SeaweedBucketInitializer {

    @Value("${spring.cloud.aws.credentials.access-key}")
    private String accessKey;

    @Value("${spring.cloud.aws.credentials.secret-key}")
    private String secretKey;

    @Value("${spring.cloud.aws.s3.endpoint}")
    private String s3Endpoint;

    @Bean
    public S3Client s3Client() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
                accessKey, 
                secretKey
        );

        return S3Client.builder()
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .endpointOverride(URI.create(s3Endpoint))
                .region(Region.US_EAST_1)
                .forcePathStyle(true)
                .build();
    }
    
    @Bean
    public CommandLineRunner initBucket(

            S3Client s3Client,
            @Value("${storage.bucket-temp}") String tempBucket,
            @Value("${storage.bucket-stored}") String storedBucket,
            @Value("${storage.bucket-public}") String publicBucket) {
        return args -> {
            createBucket(s3Client, tempBucket, 1);
            createBucket(s3Client, storedBucket, 30);
            createBucket(s3Client, publicBucket, null);

        };
    }


    private boolean bucketExists(S3Client s3Client, String bucketName) {
        return s3Client.listBuckets().buckets().stream()
                .anyMatch(b -> {
                    return b.name().equals(bucketName);
                });
    }

    private void createBucket(S3Client s3Client, String bucketName, Integer daysToKeep) {
        if (!bucketExists(s3Client, bucketName)) {
            try {
                s3Client.createBucket(b -> b.bucket(bucketName));

                if (daysToKeep != null) {
                    LifecycleRule rule = LifecycleRule.builder()
                            .id("auto-delete-after-" + daysToKeep + "-days")
                            .status(ExpirationStatus.ENABLED)
                            .filter(LifecycleRuleFilter.builder().prefix("").build()) // Geldt voor de hele bucket
                            .expiration(LifecycleExpiration.builder().days(daysToKeep).build())
                            .build();

                    BucketLifecycleConfiguration lifecycleConfig = BucketLifecycleConfiguration.builder()
                            .rules(Collections.singletonList(rule))
                            .build();

                    PutBucketLifecycleConfigurationRequest request = PutBucketLifecycleConfigurationRequest.builder()
                            .bucket(bucketName)
                            .lifecycleConfiguration(lifecycleConfig)
                            .build();

                    s3Client.putBucketLifecycleConfiguration(request);
                    log.info("SeaweedBucket bucket {} has been created with a lifecycle of {}.", bucketName, daysToKeep);
                } else {
                    log.info("SeaweedBucket bucket {} has been created.", bucketName);
                }
                
            } catch (BucketAlreadyExistsException | BucketAlreadyOwnedByYouException e) {
                // Als SeaweedFS zegt dat hij al bestaat, negeren we de fout en gaan we door
            }
        }
    }

}
