package com.example.academic;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
@Repository public class AcademicRepository {
 private final JdbcTemplate jdbc;
 public AcademicRepository(JdbcTemplate jdbc){this.jdbc=jdbc;}
 public List<Map<String,Object>> rows(String sql,Object... args){return jdbc.queryForList(sql,args);}
 public long count(String sql,Object... args){return jdbc.queryForObject(sql,Long.class,args);}
 public int update(String sql,Object... args){return jdbc.update(sql,args);}
}
