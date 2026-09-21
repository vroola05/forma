package org.commonground.forma.services.util;

import org.commonground.forma.model.form.fields.Form;

public interface FormPdfService {
    byte[] generateFormPdf(Form form) throws Exception;
}
