package com.safebeacon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SafeBeaconApplication {
    public static void main(String[] args) {
        SpringApplication.run(SafeBeaconApplication.class, args);
    }
}
