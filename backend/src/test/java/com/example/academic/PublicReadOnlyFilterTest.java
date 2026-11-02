package com.example.academic;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import static org.junit.jupiter.api.Assertions.*;

class PublicReadOnlyFilterTest {
 @Test void writesNeverReachControllerOrRepository()throws Exception {
  for(String method:new String[]{"POST","PUT","PATCH","DELETE","TRACE"}){
   var request=new MockHttpServletRequest(method,"/api/academic/students");var response=new MockHttpServletResponse();
   new PublicReadOnlyFilter().doFilter(request,response,(a,b)->fail("write must be blocked before SQL"));
   assertEquals(403,response.getStatus());assertTrue(response.getContentAsString().contains("PUBLIC_READ_ONLY"));
  }
 }
 @Test void readsAndPreflightContinue()throws Exception {
  for(String method:new String[]{"GET","HEAD","OPTIONS"}){
   var response=new MockHttpServletResponse();
   new PublicReadOnlyFilter().doFilter(new MockHttpServletRequest(method,"/api/dashboard"),response,
    (a,b)->((jakarta.servlet.http.HttpServletResponse)b).setStatus(204));
   assertEquals(204,response.getStatus());assertEquals("no-store",response.getHeader("Cache-Control"));
  }
 }
}
