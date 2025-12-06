package com.safebeacon.security;

import com.safebeacon.model.User;
import com.safebeacon.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private JwtTokenProvider tokenProvider;

        @Override
        public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                        Authentication authentication) throws IOException {
                OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

                String email = oAuth2User.getAttribute("email");
                String name = oAuth2User.getAttribute("name");
                String picture = oAuth2User.getAttribute("picture");

                // Create or update user
                User user = userRepository.findByEmail(email)
                                .orElse(new User());

                user.setEmail(email);
                user.setName(name);
                user.setProfilePicture(picture);
                user.setAuthProvider(User.AuthProvider.GOOGLE);
                user.setIsVerified(true);

                userRepository.save(user);

                // Generate JWT tokens
                String accessToken = tokenProvider.generateAccessToken(email);
                String refreshToken = tokenProvider.generateRefreshToken(email);

                // Redirect to mobile app with tokens
                // Use the physical device IP for Expo
                String redirectUrl = String.format("exp://192.168.29.200:8081?accessToken=%s&refreshToken=%s",
                                accessToken, refreshToken);

                getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        }
}
