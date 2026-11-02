package com.example.academic;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.dao.*;
@RestControllerAdvice public class ApiErrorHandler {
 private ResponseEntity<?> error(int status,String message){return ResponseEntity.status(status).body(Map.of("status",status,"message",message));}
 @ExceptionHandler(ResponseStatusException.class) public ResponseEntity<?> status(ResponseStatusException e){return error(e.getStatusCode().value(),Objects.toString(e.getReason(),"요청을 처리할 수 없습니다."));}
 @ExceptionHandler(IllegalArgumentException.class) public ResponseEntity<?> input(Exception e){return error(400,e.getMessage());}
 @ExceptionHandler({org.springframework.http.converter.HttpMessageNotReadableException.class,org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class}) public ResponseEntity<?> format(Exception e){return error(400,"입력 형식과 숫자 값을 확인하세요.");}
 @ExceptionHandler(DataIntegrityViolationException.class) public ResponseEntity<?> integrity(Exception e){return error(409,"중복 자료, 참조 관계 또는 입력 길이를 확인하세요.");}
 @ExceptionHandler({DataAccessException.class,java.sql.SQLException.class}) public ResponseEntity<?> database(Exception e){return error(503,"데이터베이스에 접근하지 못했습니다. 연결 상태를 확인하세요.");}
 @ExceptionHandler(Exception.class) public ResponseEntity<?> other(Exception e){org.slf4j.LoggerFactory.getLogger(getClass()).error("API failure",e);return error(500,"처리 중 오류가 발생했습니다. 관리자에게 문의하세요.");}
}
