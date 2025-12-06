package com.safebeacon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private String profilePicture;
    private String guardianCode;
    private String authProvider;
    private Double lastLatitude;
    private Double lastLongitude;
    private String lastLocationUpdate;
}
