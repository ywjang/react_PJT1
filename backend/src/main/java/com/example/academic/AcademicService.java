package com.example.academic;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
@Service public class AcademicService {
 private final AcademicRepository repo;
 public AcademicService(AcademicRepository repo){this.repo=repo;}
 private static final Map<String,String> TABLE=Map.of("students","STUDENT","subjects","SUBJECT","enrolments","ENROL");
 private static final Map<String,List<String>> FIELDS=Map.of("students",List.of("STU_NO","STU_NAME","STU_DEPT","STU_GRADE","STU_CLASS","STU_GENDER","STU_HEIGHT","STU_WEIGHT"),"subjects",List.of("SUB_NO","SUB_NAME","SUB_PROF","SUB_GRADE","SUB_DEPT"),"enrolments",List.of("SUB_NO","STU_NO","ENR_GRADE"));
 private String table(String kind){if(!TABLE.containsKey(kind))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"관리 항목을 찾을 수 없습니다.");return TABLE.get(kind);}
 public Map<String,Object> dashboard(){long students=repo.count("SELECT COUNT(*) FROM STUDENT");long enrolled=repo.count("SELECT COUNT(*) FROM STUDENT s WHERE EXISTS (SELECT 1 FROM ENROL e WHERE e.STU_NO=s.STU_NO)");return Map.of("students",students,"enrolled",enrolled,"notEnrolled",students-enrolled,"subjects",repo.count("SELECT COUNT(*) FROM SUBJECT"));}
 public Map<String,Object> list(String kind,String q,int page,int size){
  table(kind);if(page<0||size<1||size>100)throw new IllegalArgumentException("페이지와 조회 건수를 확인하세요.");if(q.length()>100)throw new IllegalArgumentException("검색어는 100자 이하입니다.");
  String select,search,order;
  if(kind.equals("students")){select="SELECT s.* FROM STUDENT s";search="TO_CHAR(s.STU_NO)||' '||s.STU_NAME||' '||s.STU_DEPT";order="s.STU_NO";}
  else if(kind.equals("subjects")){select="SELECT s.* FROM SUBJECT s";search="TO_CHAR(s.SUB_NO)||' '||s.SUB_NAME||' '||s.SUB_PROF||' '||s.SUB_DEPT";order="s.SUB_NO";}
  else {select="SELECT e.*,s.STU_NAME,b.SUB_NAME FROM ENROL e LEFT JOIN STUDENT s ON s.STU_NO=e.STU_NO LEFT JOIN SUBJECT b ON b.SUB_NO=e.SUB_NO";search="TO_CHAR(e.STU_NO)||' '||TO_CHAR(e.SUB_NO)||' '||s.STU_NAME||' '||b.SUB_NAME";order="e.STU_NO,e.SUB_NO";}
  String filter=q.isBlank()?"":" WHERE INSTR(LOWER("+search+"),LOWER(?))>0";
  List<Object> args=new ArrayList<>();if(!q.isBlank())args.add(q.trim());
  long total=repo.count("SELECT COUNT(*) FROM ("+select+filter+")",args.toArray());long offset=(long)page*size;args.add(offset+size);args.add(offset);
  var rows=repo.rows("SELECT * FROM (SELECT a.*,ROWNUM PAGE_ROW FROM ("+select+filter+" ORDER BY "+order+") a WHERE ROWNUM<=?) WHERE PAGE_ROW>?",args.toArray());rows.forEach(r->r.remove("PAGE_ROW"));
  return Map.of("content",rows,"totalElements",total,"totalPages",(total+size-1)/size,"page",page,"size",size);
 }
 private Object number(Map<String,Object> b,String key,double min,double max,boolean required){Object v=b.get(key);if(v==null||v.toString().isBlank()){if(required)throw new IllegalArgumentException("필수 숫자 항목을 입력하세요.");return null;}try {double d=Double.parseDouble(v.toString());if(!Double.isFinite(d)||d<min||d>max||(!key.equals("STU_HEIGHT")&&!key.equals("STU_WEIGHT")&&d!=Math.rint(d)))throw new Exception();return d;}catch(Exception ex){throw new IllegalArgumentException("학번·과목번호·학년·성적 또는 신체 정보의 숫자 범위를 확인하세요.");}}
 private String text(Map<String,Object>b,String key,int max){String v=Objects.toString(b.get(key),"").trim();if(v.isEmpty()||v.length()>max)throw new IllegalArgumentException("필수 입력 항목과 글자 수를 확인하세요.");return v;}
 private Map<String,Object> validate(String kind,Map<String,Object> b){table(kind);Map<String,Object> v=new LinkedHashMap<>();
  for(String f:FIELDS.get(kind))v.put(f,switch(f){case "STU_NO"->number(b,f,1,99999999,true);case "SUB_NO"->number(b,f,1,999,true);case "STU_GRADE","SUB_GRADE"->number(b,f,1,4,true);case "ENR_GRADE"->number(b,f,0,100,true);case "STU_HEIGHT"->number(b,f,50,250,false);case "STU_WEIGHT"->number(b,f,10,300,false);case "STU_GENDER"->{String g=Objects.toString(b.get(f),"");if(!Set.of("M","F").contains(g))throw new IllegalArgumentException("성별을 선택하세요.");yield g;}case "STU_CLASS"->text(b,f,1);case "STU_DEPT","SUB_DEPT"->text(b,f,20);default->text(b,f,20);});
  if(kind.equals("enrolments")&&(repo.count("SELECT COUNT(*) FROM STUDENT WHERE STU_NO=?",v.get("STU_NO"))==0||repo.count("SELECT COUNT(*) FROM SUBJECT WHERE SUB_NO=?",v.get("SUB_NO"))==0))throw new IllegalArgumentException("등록된 학생과 과목 번호를 입력하세요.");return v;
 }
 private List<String> keys(String kind){return kind.equals("students")?List.of("STU_NO"):kind.equals("subjects")?List.of("SUB_NO"):List.of("SUB_NO","STU_NO");}
 @Transactional public void save(String kind,Map<String,Object> body,boolean edit){var v=validate(kind,body);String t=table(kind);var keys=keys(kind);String where=String.join(" AND ",keys.stream().map(k->k+"=?").toList());Object[] ids=keys.stream().map(v::get).toArray();
  if(edit){var cols=FIELDS.get(kind).stream().filter(f->!keys.contains(f)).toList();List<Object> args=new ArrayList<>();cols.forEach(f->args.add(v.get(f)));args.addAll(Arrays.asList(ids));if(repo.update("UPDATE "+t+" SET "+String.join(",",cols.stream().map(f->f+"=?").toList())+" WHERE "+where,args.toArray())==0)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"수정할 자료가 없습니다.");}
  else{if(repo.count("SELECT COUNT(*) FROM "+t+" WHERE "+where,ids)>0)throw new ResponseStatusException(HttpStatus.CONFLICT,"이미 등록된 자료입니다.");repo.update("INSERT INTO "+t+" ("+String.join(",",v.keySet())+") VALUES ("+String.join(",",Collections.nCopies(v.size(),"?"))+")",v.values().toArray());}
 }
 @Transactional public void delete(String kind,long first,Long student){String t=table(kind);if(kind.equals("students")&&repo.count("SELECT COUNT(*) FROM ENROL WHERE STU_NO=?",first)>0||kind.equals("subjects")&&repo.count("SELECT COUNT(*) FROM ENROL WHERE SUB_NO=?",first)>0)throw new ResponseStatusException(HttpStatus.CONFLICT,"수강 내역이 있어 삭제할 수 없습니다. 수강 내역을 먼저 확인하세요.");
  int n;if(kind.equals("enrolments")){if(student==null)throw new IllegalArgumentException("학생 번호가 필요합니다.");n=repo.update("DELETE FROM ENROL WHERE SUB_NO=? AND STU_NO=?",first,student);}else n=repo.update("DELETE FROM "+t+" WHERE "+keys(kind).get(0)+"=?",first);
  if(n==0)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"삭제할 자료가 없습니다.");
 }
}
