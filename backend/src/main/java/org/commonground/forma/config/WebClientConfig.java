package org.commonground.forma.config;

import javax.net.ssl.SSLException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ClientHttpConnector;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;

import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import reactor.netty.http.client.HttpClient;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;

@Configuration
public class WebClientConfig {
    @Bean
    public WebClient.Builder builder() throws SSLException {
        SslContext sslContext = SslContextBuilder
            .forClient()
            .trustManager(InsecureTrustManagerFactory.INSTANCE)
            .build();
        HttpClient httpClient = HttpClient.create().secure(t -> t.sslContext(sslContext));
        ClientHttpConnector httpConnector = new ReactorClientHttpConnector(httpClient);
        return WebClient.builder().clientConnector(httpConnector);
    }
}
