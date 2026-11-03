package com.example.academic;
import java.net.URI;
import java.net.http.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.jdbc.core.JdbcTemplate;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT) @ActiveProfiles("test")
class AcademicApiTest {
 @LocalServerPort int port; @Autowired JdbcTemplate jdbc;
 final HttpClient client=HttpClient.newHttpClient();
 HttpResponse<String> call(String method,String path,String json)throws Exception{return client.send(HttpRequest.newBuilder(URI.create("http://localhost:"+port+path)).header("Content-Type","application/json").method(method,json==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(json)).build(),HttpResponse.BodyHandlers.ofString());}
 @BeforeEach void setup(){jdbc.execute("DROP ALL OBJECTS");jdbc.execute("CREATE TABLE STUDENT(STU_NO NUMBER(8) PRIMARY KEY,STU_NAME VARCHAR2(20),STU_DEPT VARCHAR2(20),STU_GRADE NUMBER,STU_CLASS VARCHAR2(1),STU_GENDER VARCHAR2(1),STU_HEIGHT NUMBER,STU_WEIGHT NUMBER)");jdbc.execute("CREATE TABLE SUBJECT(SUB_NO NUMBER(3) PRIMARY KEY,SUB_NAME VARCHAR2(20),SUB_PROF VARCHAR2(20),SUB_GRADE NUMBER,SUB_DEPT VARCHAR2(20))");jdbc.execute("CREATE TABLE ENROL(SUB_NO NUMBER REFERENCES SUBJECT(SUB_NO),STU_NO NUMBER REFERENCES STUDENT(STU_NO),ENR_GRADE NUMBER,PRIMARY KEY(SUB_NO,STU_NO))");}
 final String student="{\"STU_NO\":20269999,\"STU_NAME\":\"홍길동\",\"STU_DEPT\":\"컴퓨터정보\",\"STU_GRADE\":2,\"STU_CLASS\":\"A\",\"STU_GENDER\":\"M\"}";
 @Test void crudAndRelatedDeletion()throws Exception {
 assertEquals(200,call("POST","/api/academic/students",student).statusCode());
 assertEquals(409,call("POST","/api/academic/students",student).statusCode());
 assertEquals(200,call("POST","/api/academic/subjects","{\"SUB_NO\":101,\"SUB_NAME\":\"자료구조\",\"SUB_PROF\":\"김교수\",\"SUB_GRADE\":2,\"SUB_DEPT\":\"컴퓨터정보\"}").statusCode());
 String enrol="{\"SUB_NO\":101,\"STU_NO\":20269999,\"ENR_GRADE\":80}";
 assertEquals(200,call("POST","/api/academic/enrolments",enrol).statusCode());
 assertEquals(409,call("DELETE","/api/academic/students/20269999",null).statusCode());
 assertEquals(409,call("DELETE","/api/academic/subjects/101",null).statusCode());
 assertEquals(200,call("PUT","/api/academic/enrolments",enrol.replace("80","95")).statusCode());
 assertTrue(call("GET","/api/academic/enrolments?q=20269999",null).body().contains("홍길동"));
 assertEquals(200,call("DELETE","/api/academic/enrolments/101?student=20269999",null).statusCode());
 assertEquals(200,call("DELETE","/api/academic/students/20269999",null).statusCode());
 assertEquals(404,call("DELETE","/api/academic/students/20269999",null).statusCode());
 }
 @Test void validationAndPagination()throws Exception {
 assertEquals(400,call("POST","/api/academic/students","{}").statusCode());
 assertEquals(400,call("POST","/api/academic/students",student.replace("20269999","1.5")).statusCode());
 assertEquals(400,call("POST","/api/academic/enrolments","{\"SUB_NO\":101,\"STU_NO\":1,\"ENR_GRADE\":101}").statusCode());
 assertEquals(400,call("GET","/api/academic/students?page=-1",null).statusCode());
 assertEquals(404,call("GET","/api/academic/unknown",null).statusCode());
 call("POST","/api/academic/students",student);call("POST","/api/academic/students",student.replace("20269999","20269998"));
 var first=call("GET","/api/academic/students?size=1&page=0",null);var second=call("GET","/api/academic/students?size=1&page=1",null);
 assertEquals(200,first.statusCode());assertTrue(first.body().contains("20269998"));assertFalse(first.body().contains("20269999"));assertTrue(second.body().contains("20269999"));
 assertTrue(call("GET","/api/dashboard",null).body().contains("notEnrolled"));
 }
 @Test void githubPagesCorsHeadersAndPreflight()throws Exception {
  String origin="https://ywjang.github.io";
  for(String path:new String[]{"/api/system","/news-feed"}){
   // Preflight must be allowed without touching the RSS upstream or database.
   var options=client.send(HttpRequest.newBuilder(URI.create("http://localhost:"+port+path))
       .method("OPTIONS",HttpRequest.BodyPublishers.noBody())
       .header("Origin",origin)
       .header("Access-Control-Request-Method","GET")
       .header("Access-Control-Request-Headers","authorization,content-type")
       .build(),HttpResponse.BodyHandlers.ofString());
   assertEquals(200,options.statusCode(),path);
   assertEquals(origin,options.headers().firstValue("Access-Control-Allow-Origin").orElse(null),path);
  }
  var get=client.send(HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/api/system"))
      .header("Origin",origin).GET().build(),HttpResponse.BodyHandlers.ofString());
  assertEquals(200,get.statusCode());
  assertEquals(origin,get.headers().firstValue("Access-Control-Allow-Origin").orElse(null));

  var blocked=client.send(HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/api/system"))
      .method("OPTIONS",HttpRequest.BodyPublishers.noBody())
      .header("Origin","https://example.invalid")
      .header("Access-Control-Request-Method","GET")
      .build(),HttpResponse.BodyHandlers.ofString());
  assertEquals(403,blocked.statusCode());
 }

}
