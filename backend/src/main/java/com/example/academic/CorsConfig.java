package com.example.academic;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Allow the GitHub Pages client to read the API and the news feed. */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    private static final String GITHUB_PAGES_ORIGIN = "https://ywjang.github.io";

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(GITHUB_PAGES_ORIGIN)
                .allowedMethods("GET", "HEAD", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type")
                .maxAge(3600);

        // The news feed is not under /api; it needs its own CORS mapping.
        registry.addMapping("/news-feed")
                .allowedOrigins(GITHUB_PAGES_ORIGIN)
                .allowedMethods("GET", "HEAD", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type")
                .maxAge(3600);
    }
}
