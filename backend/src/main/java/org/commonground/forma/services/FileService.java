package org.commonground.forma.services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.apache.tika.Tika;
import org.apache.tika.mime.MimeTypeException;
import org.apache.tika.mime.MimeTypes;
import org.commonground.forma.config.tenant.TenantContext;
import org.commonground.forma.database.dao.definition.FormFieldDefinitionEntity;
import org.commonground.forma.database.dao.definition.properties.FileFieldProperties;
import org.commonground.forma.database.dao.submission.FormSubmissionFileEntity;
import org.commonground.forma.exceptions.FieldValidationException;
import org.commonground.forma.model.form.constants.FieldType;
import org.commonground.forma.model.settings.Tenant;
import org.commonground.forma.services.form.FieldService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CopyObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Service
public class FileService {
    private final FieldService fieldService;
    private final StorageService storageService;
    private final S3Client s3Client;

    private static final String UPLOAD_BASE = "uploads/";

    private static final List<String> BLOCKED_FILE_EXTENSIONS = List.of(
        "php", "phtml", "php3", "php4", "php5", "php7", "php8", "phps", "phar",
            "jsp", "jspx", "jsw", "jsv", "jspf", "wss", "do", "action", "asp",
            "aspx", "ashx", "asmx", "axd", "asax", "ascx", "master", "config",
            "pl", "cgi", "pm", "py", "pyc", "pyd", "pyo", "rb", "rhtml", "cfc",
            "cfm", "go", "exe", "com", "dll", "sys", "drv", "efi", "app", "apk",
            "xapk", "ipa", "jar", "msi", "msp", "mst", "gadget", "cpl", "vxd",
            "ovl", "bat", "cmd", "ps1", "ps1xml", "ps2", "ps2xml", "psc1", "psc2",
            "vbs", "vbe", "vba", "js", "jse", "ws", "wsf", "wsh", "sh", "bash",
            "ksh", "csh", "fish", "zsh", "lnk", "pif", "scr", "reg", "scf", "inf",
            "hta", "html", "htm", "xhtml", "shtml", "stm", "svg", "svgz", "xml",
            "docm", "dotm", "docb", "xlsm", "xltm", "xlam", "xlsb", "pptm", "potm",
            "ppam", "ppsm", "sql", "mdb", "accdb", "sqlite", "db", "htaccess",
            "htpasswd", "env");

    private final Tika tika = new Tika();

    public FileService(
        S3Client s3Client,
        FieldService fieldService,
        StorageService storageService
    ) {
        this.s3Client = s3Client;
        this.fieldService = fieldService;
        this.storageService = storageService;
    }

    public boolean moveDocmentBucket(UUID submissionId, UUID clientSessionId, Long maxFileSize, String storedFilename, FormSubmissionFileEntity formSubmissionFileEntity) {


        Tenant tenant = TenantContext.getTenant();
        if (tenant == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{tenant.error.not_found}");
        }

        try {
            String tempFileLocation = UPLOAD_BASE + tenant.getId() + "/" + clientSessionId + "/" + storedFilename;
            String storedFileLocation = UPLOAD_BASE + tenant.getId() + "/" + submissionId + "/" + storedFilename;

            if (storageService.existsStoredFile(storedFileLocation)) {
                return true;
            }

            HeadObjectResponse headResponse = s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(storageService.getBucketTemp())
                    .key(tempFileLocation)
                    .build());

            if (megabytesToBytes(maxFileSize) > headResponse.contentLength()) {
                return false;
            }
                    

            CopyObjectRequest copyRequest = CopyObjectRequest.builder()
                    .sourceBucket(storageService.getBucketTemp())
                    .sourceKey(tempFileLocation)
                    .destinationBucket(storageService.getBucketStored())
                    .destinationKey(storedFileLocation)
                    .build();

            s3Client.copyObject(copyRequest);

            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(storageService.getBucketTemp())
                    .key(tempFileLocation)
                    .build();

            s3Client.deleteObject(deleteRequest);

            formSubmissionFileEntity.setFileExtension(getExtension(storedFilename));
            formSubmissionFileEntity.setFileLocation(storedFilename);
            formSubmissionFileEntity.setFileSize(headResponse.contentLength());
            formSubmissionFileEntity.setFileContentType(headResponse.contentType());
            
            return true;
        } catch ( S3Exception | SdkClientException _) {
            // 
        }

        return false;
    }

    public Map<String, String> storeFileUploadTemp(
            MultipartFile file,
            UUID clientSessionId,
            UUID uploadFieldId) throws FieldValidationException {

        Tenant tenant = TenantContext.getTenant();
        if (tenant == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "{tenant.error.not_found}");
        }

        if (file.isEmpty()) {
            throw new FieldValidationException("{form.validation.file.error}", file.getOriginalFilename());
        }

        FormFieldDefinitionEntity formFieldDefinitionEntity = this.fieldService.getFormFieldDefinitionEntityById(uploadFieldId);
        if (!FieldType.FILE.equals(FieldType.valueOf(formFieldDefinitionEntity.getType()))) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "{generic.error.internal}");
        }

        FileFieldProperties fieldProperties = (FileFieldProperties)formFieldDefinitionEntity.getProperties();
        List<String> allowedExtensions = new ArrayList<>();
        if (fieldProperties != null) {
            if (fieldProperties.allowedExtensions() != null) {
                allowedExtensions = fieldProperties.allowedExtensions().stream()
                    .filter(ext -> ext != null && !ext.isBlank()).toList();
            }

            if (fieldProperties.maxFileSize() != null && fieldProperties.maxFileSize() > 0) {
                long bytes = file.getSize();
                long maxBytes = megabytesToBytes(fieldProperties.maxFileSize());
                if (bytes > 0 && bytes > maxBytes) {
                    throw new FieldValidationException("{form.validation.file.max.size}", file.getOriginalFilename(), bytesToMegabytes(maxBytes));
                }
            }
        }

        String extension = this.validateFile(file, allowedExtensions);

        String storedFilename = UUID.randomUUID().toString()+ "." + extension;
        String fileLocation = UPLOAD_BASE + tenant.getId() + "/" + clientSessionId + "/" + storedFilename;

        try {
            storageService.uploadTempFile(fileLocation, file.getInputStream());

            Map<String, String> result = new HashMap<>();
            result.put("message", "File has been saved");
            result.put("originalFilename", file.getOriginalFilename());
            result.put("storedFilename", storedFilename);
            
            return result;
        } catch (IOException _) {
            throw new FieldValidationException("{form.validation.file.error}", file.getOriginalFilename());
        }
    }

    /**
     * 
     * @param file
     * @param allowedExtensions
     * @return
     */
    public String validateFile(MultipartFile file, List<String> allowedExtensions) throws FieldValidationException {
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.contains(".")) {
            throw new IllegalArgumentException("Something went wrong.");
        }

        String filenameExtension = getExtension(filename);
        if (filenameExtension.isEmpty() || BLOCKED_FILE_EXTENSIONS.contains(filenameExtension)) {
            throw new FieldValidationException("{form.validation.file.extension.blocked}", file.getOriginalFilename());
        }

        
        try {
            String mimeType = tika.detect(file.getInputStream());

            String officialExtension = MimeTypes.getDefaultMimeTypes()
                    .getRegisteredMimeType(mimeType)
                    .getExtension();
            String extension = officialExtension.replace(".", "").toLowerCase();

            if (!filenameExtension.equals(extension)) {
                throw new FieldValidationException("{form.validation.file.extension.unequal}", file.getOriginalFilename(), filenameExtension, extension);
            }

            if (allowedExtensions != null && !allowedExtensions.isEmpty()) {
                boolean isValidExtension = allowedExtensions.stream()
                        .map(String::toLowerCase)
                        .anyMatch(ext -> ext.equals(extension));

                if (!isValidExtension) {
                    throw new FieldValidationException("{form.validation.file.extension}", file.getOriginalFilename(), String.join(", ", allowedExtensions));
                }
            }
            
            return extension;
        } catch (IOException | MimeTypeException _) {
            throw new FieldValidationException("{form.validation.file.error}", file.getOriginalFilename());
        }
    }

    public String getExtension(String filename) {
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase().trim();
    }

    public static Long megabytesToBytes(Long mb) {
        return mb == null ? 0 : mb * 1024 * 1024;
    }

    public static Long bytesToMegabytes(Long bytes) {
        return bytes == null || bytes == 0 ? 0 : bytes / 1024 / 1024;
    }

}
