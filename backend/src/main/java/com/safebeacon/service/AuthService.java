package com.safebeacon.service;

import com.safebeacon.dto.LoginRequest;
import com.safebeacon.dto.RegisterRequest;
import com.safebeacon.dto.AuthResponse;
import com.safebeacon.dto.UserDto;
import com.safebeacon.model.User;
import com.safebeacon.repository.UserRepository;
import com.safebeacon.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAuthProvider(User.AuthProvider.JWT);
        user.setIsVerified(false);

        user.setIsVerified(false);
        user.setGuardianCode(generateUniqueGuardianCode());

        user = userRepository.save(user);

        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        UserDto userDto = mapToDto(user);

        return new AuthResponse(accessToken, refreshToken, userDto);
    }

    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        // Get user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        UserDto userDto = mapToDto(user);

        return new AuthResponse(accessToken, refreshToken, userDto);
    }

    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
    }

    private UserDto mapToDto(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPhone(),
                user.getProfilePicture(),
                user.getGuardianCode(),
                user.getAuthProvider().name(),
                user.getLastLatitude(),
                user.getLastLongitude(),
                user.getLastLocationUpdate() != null ? user.getLastLocationUpdate().toString() : null);
    }

    private String generateUniqueGuardianCode() {
        Random random = new Random();
        String code;
        do {
            code = String.format("%06d", random.nextInt(1000000));
        } while (userRepository.existsByGuardianCode(code));
        return code;
    }
}
