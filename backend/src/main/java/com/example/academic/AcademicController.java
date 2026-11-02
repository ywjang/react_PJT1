package com.example.academic;
import java.util.*;
import javax.sql.DataSource;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api") public class AcademicController {
 private final AcademicService service; private final DataSource source;
 public AcademicController(AcademicService service,DataSource source){this.service=service;this.source=source;}
 @GetMapping("/system") public Map<String,Object> system() throws Exception {try(var c=source.getConnection()){return Map.of("connected",c.isValid(3),"database",c.getMetaData().getDatabaseProductName(),"mode",c.getMetaData().getDatabaseProductName().equals("Oracle")?"oracle":"demo");}}
 @GetMapping("/dashboard") public Map<String,Object> dashboard(){return service.dashboard();}
 @GetMapping("/academic/{kind}") public Map<String,Object> list(@PathVariable String kind,@RequestParam(defaultValue="")String q,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="10")int size){return service.list(kind,q,page,size);}
 @PostMapping("/academic/{kind}") public Map<String,String> create(@PathVariable String kind,@RequestBody Map<String,Object> body){service.save(kind,body,false);return Map.of("message","등록했습니다.");}
 @PutMapping("/academic/{kind}") public Map<String,String> update(@PathVariable String kind,@RequestBody Map<String,Object> body){service.save(kind,body,true);return Map.of("message","수정했습니다.");}
 @DeleteMapping("/academic/{kind}/{id}") public Map<String,String> delete(@PathVariable String kind,@PathVariable long id,@RequestParam(required=false)Long student){service.delete(kind,id,student);return Map.of("message","삭제했습니다.");}
}
