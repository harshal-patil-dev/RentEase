package com.rentease.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rentease.dto.ChangePasswordRequest;
import com.rentease.dto.LoginRequest;
import com.rentease.dto.ResetPasswordRequest;
import com.rentease.dto.VerifyOtpRequest;
import com.rentease.entity.User;
import com.rentease.service.UserService;

@RestController
public class UserController {

	@Autowired
	private UserService userService;

	@GetMapping("/user")
	public String User() {
		return "Hi Harsh";
	}

	@PostMapping("/api/users/register")
	public Map<String, Object> register(@RequestBody User user) {
		return userService.register(user);
	}

	@PostMapping("/api/users/login")
	public Map<String, Object> login(@RequestBody LoginRequest LoginRequest) {
		return userService.login(LoginRequest);
	}

	@GetMapping("/profile")
	public User profile(Authentication authentication) {
		String email = authentication.getName();
		return userService.getProfile(email);
	}

	@PutMapping("/profile")
	public Map<String, Object> profile(Authentication authentication, @RequestBody User user) {
		String email = authentication.getName();
		return userService.updateProfile(email, user);
	}

	@PutMapping("/change-password")
	public Map<String, Object> changePassword(Authentication authentication,
			@RequestBody ChangePasswordRequest request) {
		String email = authentication.getName();
		return userService.changePassword(email, request);
	}

	@PostMapping("/forgot-password")
	public Map<String, Object> forgotPassword(@RequestParam String email) {
		return userService.forgotPassword(email);
	}

	@PostMapping("/verify-otp")
	public Map<String, Object> verifyOtp(@RequestBody VerifyOtpRequest request) {
		return userService.verifyOtp(request);
	}

	@PostMapping("/reset-password")
	public Map<String, Object> resetPassword(@RequestBody ResetPasswordRequest request) {
		return userService.resetPassword(request);
	}

}
