package org.commonground.forma.model.revisions;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ComparatorForm {
    private ComparatorType change;

    private String name;
    private String label;
    private String valueCurrent;
    private String valueRevision;    
}
