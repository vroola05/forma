package org.commonground.forma.config;

import java.io.IOException;

import org.commonground.forma.config.tenant.SecurityTenantInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final SecurityTenantInterceptor tenantInterceptor;

    public WebConfig(SecurityTenantInterceptor tenantInterceptor) {
        this.tenantInterceptor = tenantInterceptor;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/{tenantSlug}/admin/**")
                .addResourceLocations("classpath:/static/admin/")
                .resourceChain(true)
                .addResolver(new SpaResourceResolver());

        registry.addResourceHandler("/{tenantSlug}/page/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new SpaResourceResolver());
    }

    private static class SpaResourceResolver extends PathResourceResolver {
        @Override
        protected Resource getResource(String resourcePath, Resource location) throws IOException {
            Resource requestedResource = location.createRelative(resourcePath);

            if (requestedResource.exists() && requestedResource.isReadable()) {
                return requestedResource;
            }

            if (!resourcePath.contains(".")) {
                return location.createRelative("index.html");
            }

            return null;
        }
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(tenantInterceptor)
                .addPathPatterns("/{tenantSlug}/api/**")
                .excludePathPatterns(AppConstants.PUBLIC_MATCHERS)
                .excludePathPatterns(
                    "/system/page/**",
                    "/system/admin",
                    "/system/admin/page/**",
                    "/{tenantSlug}/page/**",
                    "/{tenantSlug}/admin",
                    "/{tenantSlug}/admin/page/**");
    }
}
