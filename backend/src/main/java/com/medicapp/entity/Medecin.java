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
@Table(name = "medecins")
public class Medecin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 120)
    private String specialite;

    @Column(name = "numero_ordre", nullable = false, unique = true, length = 80)
    private String numeroOrdre;

    protected Medecin() {
    }

    public Medecin(User user, String specialite, String numeroOrdre) {
        this.user = user;
        this.specialite = specialite;
        this.numeroOrdre = numeroOrdre;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getSpecialite() {
        return specialite;
    }

    public String getNumeroOrdre() {
        return numeroOrdre;
    }
}
