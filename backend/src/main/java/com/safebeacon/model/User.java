package com.safebeacon.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true)
    private String guardianCode;

    private String password;

    @Column(unique = true)
    private String phone;

    @Column(nullable = false)
    private String name;

    private String profilePicture;

    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider;

    private Boolean isVerified = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private Double lastLatitude;
    private Double lastLongitude;
    private LocalDateTime lastLocationUpdate;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_guardians", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "guardian_id"))
    private java.util.Set<User> guardians = new java.util.HashSet<>();

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToMany(mappedBy = "guardians", fetch = FetchType.EAGER)
    private java.util.Set<User> protectedUsers = new java.util.HashSet<>();

    public enum AuthProvider {
        JWT, GOOGLE
    }
}
