package com.rentease.dto;

import lombok.Data;

@Data
public class ChangePasswordRequest {
	
	private String currentPassword;
	private String newPassword;
	private String confirmPassword;

}
