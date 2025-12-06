package com.safebeacon.repository;

import com.safebeacon.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    Optional<User> findByGuardianCode(String guardianCode);

    boolean existsByEmail(String email);

    boolean existsByGuardianCode(String guardianCode);

    boolean existsByPhone(String phone);
}
