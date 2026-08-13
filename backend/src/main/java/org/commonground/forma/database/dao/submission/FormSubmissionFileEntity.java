package org.commonground.forma.database.dao.submission;

import java.util.UUID;

import org.commonground.forma.database.dao.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "form_submission_file")
public class FormSubmissionFileEntity extends BaseEntity {
    @Id
    private UUID id;

    @Column(nullable = false)
    private String fileLocation;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileExtension;

    @Column(nullable = false)
    private Long fileSize;

    @Column(nullable = false)
    private String fileContentType;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "form_submission_id",
        updatable = false, 
        nullable = false)
    private FormSubmissionEntity formSubmission;
}
