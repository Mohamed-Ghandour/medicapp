package com.medicapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "administrateurs")
public class Administrateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "niveau_acces", nullable = false, length = 50)
    private String niveauAcces;

    protected Administrateur() {
    }

    public Administrateur(User user, String niveauAcces) {
        this.user = user;
        this.niveauAcces = niveauAcces;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getNiveauAcces() {
        return niveauAcces;
    }
}
