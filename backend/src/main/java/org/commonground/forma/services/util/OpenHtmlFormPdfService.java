package org.commonground.forma.services.util;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

import org.commonground.forma.model.form.fields.Form;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.util.Locale;

@Service
public class OpenHtmlFormPdfService implements FormPdfService {

    public OpenHtmlFormPdfService() {
    }

    @Override
    public byte[] generateFormPdf(Form form) throws Exception {

        String processedHtml = "<html></html>";

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(processedHtml, "/");
            builder.toStream(os);
            builder.run();
            
            return os.toByteArray();
        }
    }

}