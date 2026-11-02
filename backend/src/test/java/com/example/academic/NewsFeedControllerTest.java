package com.example.academic;
import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.concurrent.atomic.*;
import static org.junit.jupiter.api.Assertions.*;
class NewsFeedControllerTest {
 @Test void fixedSourceResponseIsCachedAndExpires(){
  var count=new AtomicInteger();var now=new AtomicLong(1000000);
  Clock clock=new Clock(){public ZoneId getZone(){return ZoneOffset.UTC;}public Clock withZone(ZoneId zone){return this;}public Instant instant(){return Instant.ofEpochMilli(now.get());}};
  var c=new NewsFeedController(()->"<rss><channel><title>뉴스"+count.incrementAndGet()+"</title></channel></rss>",clock);
  assertTrue(c.feed().getBody().contains("뉴스1"));assertTrue(c.feed().getBody().contains("뉴스1"));assertEquals(1,count.get());now.addAndGet(NewsFeedController.CACHE_MS);assertTrue(c.feed().getBody().contains("뉴스2"));assertEquals(2,count.get());assertTrue(c.feed().getHeaders().getContentType().toString().contains("application/rss+xml"));
 }
 @Test void networkFailureAndUnsafeXmlBecome503(){
  var broken=new NewsFeedController(()->{throw new java.io.IOException("private upstream detail");},Clock.systemUTC());var e=broken.feed();assertEquals(503,e.getStatusCode().value());assertFalse(e.getBody().contains("private"));
  var dtd=new NewsFeedController(()->"<!DOCTYPE x><rss><channel/></rss>",Clock.systemUTC());assertEquals(503,dtd.feed().getStatusCode().value());
 }
}
