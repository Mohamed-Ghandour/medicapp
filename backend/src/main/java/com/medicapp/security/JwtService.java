package com.medicapp.security;

import com.medicapp.entity.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_TYP = "typ";
    private static final String TYP_REFRESH = "refresh";

    private final JwtProperties props;
    private final SecretKey key;

    public JwtService(JwtProperties props) {
        this.props = props;
        this.key = Keys.hmacShaKeyFor(props.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String createAccessToken(Authentication auth) {
        UserDetails user = (UserDetails) auth.getPrincipal();
        String role = user.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse(UserRole.PATIENT.name());
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(props.accessTokenMinutes() * 60);
        return Jwts.builder()
                .subject(user.getUsername())
                .claim(CLAIM_ROLE, role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key)
                .compact();
    }

    public String createRefreshToken(String username) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(props.refreshTokenDays() * 24 * 60 * 60);
        return Jwts.builder()
                .subject(username)
                .claim(CLAIM_TYP, TYP_REFRESH)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key)
                .compact();
    }

    public String parseRefreshUsername(String refreshToken) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(refreshToken)
                .getPayload();
        if (!TYP_REFRESH.equals(claims.get(CLAIM_TYP, String.class))) {
            throw new IllegalArgumentException("Invalid refresh token");
        }
        return claims.getSubject();
    }

    public String parseAccessUsername(String accessToken) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(accessToken)
                .getPayload();
        if (claims.get(CLAIM_TYP) != null) {
            throw new IllegalArgumentException("Invalid access token");
        }
        return claims.getSubject();
    }

    public long accessTokenTtlSeconds() {
        return props.accessTokenMinutes() * 60;
    }
}
