package com.medpro.medpro.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Desabilita CSRF para APIs REST
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/", "/index.html", "/css/**", "/js/**", "/static/**").permitAll()
                .requestMatchers("/medicos/**", "/pacientes/**", "/consultas/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable()) // Desabilita login form
            .httpBasic(httpBasic -> httpBasic.disable()); // Desabilita autenticação básica

        return http.build();
    }
}