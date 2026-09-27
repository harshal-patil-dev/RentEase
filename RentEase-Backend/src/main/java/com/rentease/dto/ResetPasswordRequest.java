package com.rentease.dto;

import lombok.Data;

@Data
public class ResetPasswordRequest {

	private String email;
	private String resetToken;
	private String newPassword;
	private String confirmPassword;
}