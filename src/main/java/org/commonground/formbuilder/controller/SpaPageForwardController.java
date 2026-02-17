package org.commonground.formbuilder.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaPageForwardController {
    
    @RequestMapping("/page/**")
    public String forwardToIndex() {
        return "forward:/index.html";
    }

    // @RequestMapping("/builder")
    // public String forwardToBuilder() {
    //     return "forward:/builder.html";
    // }

    // @RequestMapping("/form-builder/page/**")
    // public String forwardToBuilderPage() {
    //     return "forward:/builder.html";
    // }
}
