package com.example.academic;
import java.net.URI;
import java.net.http.*;
import java.time.*;
import java.util.Locale;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestController public class NewsFeedController {
 static final long CACHE_MS=600000;
 @FunctionalInterface interface FeedLoader {String load() throws Exception;}
 private final FeedLoader loader; private final Clock clock;
 private String cached; private long fetchedAt;
 public NewsFeedController(){this(NewsFeedController::download,Clock.systemUTC());}
 NewsFeedController(FeedLoader loader,Clock clock){this.loader=loader;this.clock=clock;}
 private static String download() throws Exception {
  var request=java.net.http.HttpRequest.newBuilder(URI.create("https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko")).timeout(Duration.ofSeconds(10)).header("Accept","application/rss+xml, application/xml").header("User-Agent","AcademicCampusDashboard/1.0").GET().build();
  var response=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).followRedirects(HttpClient.Redirect.NORMAL).build().send(request,HttpResponse.BodyHandlers.ofString(java.nio.charset.StandardCharsets.UTF_8));
  if(response.statusCode()!=200)throw new IllegalStateException("RSS upstream unavailable");return response.body();
 }
 @GetMapping(value="/news-feed",produces="application/rss+xml;charset=UTF-8")
 public synchronized ResponseEntity<String> feed(){
  long now=clock.millis();
  if(cached==null||now-fetchedAt<0||now-fetchedAt>=CACHE_MS){
   try{String body=loader.load();if(body==null||body.length()>2000000||!body.contains("<rss")||!body.contains("<channel")||body.toUpperCase(Locale.ROOT).contains("<!DOCTYPE")||body.toUpperCase(Locale.ROOT).contains("<!ENTITY"))throw new IllegalArgumentException("Invalid RSS");cached=body;fetchedAt=now;}
   catch(Exception e){if(e instanceof InterruptedException)Thread.currentThread().interrupt();return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).contentType(MediaType.TEXT_PLAIN).body("뉴스를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.");}
  }
  return ResponseEntity.ok().contentType(MediaType.parseMediaType("application/rss+xml;charset=UTF-8")).cacheControl(CacheControl.noCache()).body(cached);
 }
}
