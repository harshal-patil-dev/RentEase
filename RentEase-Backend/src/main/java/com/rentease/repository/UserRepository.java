package com.rentease.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rentease.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer>{
	
	boolean existsByEmail(String email);
	
	boolean existsByPhone(String email);
	
	Optional<User> findByEmail(String email);
	
	Optional<User> findByPhone(String phone);

}
