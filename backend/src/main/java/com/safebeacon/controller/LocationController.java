package com.safebeacon.controller;

import com.safebeacon.dto.LocationRequest;
import com.safebeacon.model.User;
import com.safebeacon.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class LocationController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserRepository userRepository;

    @MessageMapping("/location")
    public void sendLocation(@Payload LocationRequest location, Principal principal) {
        if (principal == null) {
            System.out.println("Received location update but Principal is NULL. Ignoring.");
            return;
        }
        String email = principal.getName();
        System.out.println("Received location update from: " + email + " -> " + location.getLatitude() + ", "
                + location.getLongitude());

        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            // Update last known location
            user.setLastLatitude(location.getLatitude());
            user.setLastLongitude(location.getLongitude());
            user.setLastLocationUpdate(java.time.LocalDateTime.now());
            userRepository.save(user);

            // Broadcast location to a specific topic for this user
            // Guardians will subscribe to /topic/location/{userId}
            messagingTemplate.convertAndSend("/topic/location/" + user.getId(), location);
        } else {
            System.out.println("User not found for email: " + email);
        }
    }
}
