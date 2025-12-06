package com.safebeacon.controller;

import com.safebeacon.dto.UserDto;
import com.safebeacon.model.User;
import com.safebeacon.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/guardians")
public class GuardianController {

        @Autowired
        private UserRepository userRepository;

        @GetMapping("/search")
        public ResponseEntity<List<UserDto>> searchUsers(@RequestParam String query) {
                // Search by 6-digit guardian code
                return userRepository.findByGuardianCode(query)
                                .map(user -> List.of(mapToDto(user)))
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.ok(List.of()));
        }

        @PostMapping("/{guardianId}")
        public ResponseEntity<?> addGuardian(@PathVariable Long guardianId, Authentication authentication) {
                String email = authentication.getName();
                User currentUser = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Current user not found"));

                if (currentUser.getId().equals(guardianId)) {
                        return ResponseEntity.badRequest().body("Cannot add yourself as guardian");
                }

                User guardian = userRepository.findById(guardianId)
                                .orElseThrow(() -> new RuntimeException("Guardian not found"));

                System.out.println("Adding guardian: " + guardian.getEmail() + " to user: " + currentUser.getEmail());
                boolean added = currentUser.getGuardians().add(guardian);
                System.out.println("Set.add result: " + added);

                userRepository.save(currentUser);
                System.out.println("Saved currentUser. Guardians count: " + currentUser.getGuardians().size());

                return ResponseEntity.ok().build();
        }

        @DeleteMapping("/{guardianId}")
        public ResponseEntity<?> removeGuardian(@PathVariable Long guardianId, Authentication authentication) {
                String email = authentication.getName();
                User currentUser = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Current user not found"));

                User guardian = userRepository.findById(guardianId)
                                .orElseThrow(() -> new RuntimeException("Guardian not found"));

                currentUser.getGuardians().remove(guardian);
                userRepository.save(currentUser);

                return ResponseEntity.ok().build();
        }

        @GetMapping
        public ResponseEntity<Set<UserDto>> getMyGuardians(Authentication authentication) {
                String email = authentication.getName();
                User currentUser = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Current user not found"));

                System.out.println("Fetching guardians for: " + email);
                System.out.println("Found guardians count: " + currentUser.getGuardians().size());

                Set<UserDto> validators = currentUser.getGuardians().stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toSet());

                System.out.println("Returning DTOs: " + validators.size());

                return ResponseEntity.ok(validators);
        }

        @GetMapping("/protecting")
        public ResponseEntity<Set<UserDto>> getProtectingUsers(Authentication authentication) {
                String email = authentication.getName();
                User currentUser = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Current user not found"));

                Set<UserDto> protecting = currentUser.getProtectedUsers().stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toSet());

                return ResponseEntity.ok(protecting);
        }

        private UserDto mapToDto(User user) {
                return new UserDto(
                                user.getId(),
                                user.getEmail(),
                                user.getName(),
                                user.getPhone(),
                                user.getProfilePicture(),
                                user.getGuardianCode(),
                                user.getAuthProvider() != null ? user.getAuthProvider().name() : null,
                                user.getLastLatitude(),
                                user.getLastLongitude(),
                                user.getLastLocationUpdate() != null ? user.getLastLocationUpdate().toString() : null);
        }
}
