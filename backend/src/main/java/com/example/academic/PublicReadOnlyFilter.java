package com.example.academic;

import java.io.IOException;
import java.util.Set;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Defense in depth. Public authentication is provided by Caddy basic_auth. */
@Component
@Profile("public")
@Order(Ordered.HIGHEST_PRECEDENCE)
public class PublicReadOnlyFilter extends OncePerRequestFilter {
 private static final Set<String> READ_METHODS=Set.of("GET","HEAD","OPTIONS");
 @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)
   throws ServletException,IOException {
  response.setHeader("Cache-Control","no-store");
  response.setHeader("X-Content-Type-Options","nosniff");
  if(!READ_METHODS.contains(request.getMethod())){
   response.setStatus(403);response.setContentType("application/json;charset=UTF-8");
   response.getWriter().write("{\"code\":\"PUBLIC_READ_ONLY\",\"message\":\"공개 사이트는 조회 전용입니다.\"}");return;
  }
  chain.doFilter(request,response);
 }
}
