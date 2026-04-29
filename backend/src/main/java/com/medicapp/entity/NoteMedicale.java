package com.medicapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "note_medicale")
public class NoteMedicale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dossier_id", nullable = false)
    private DossierPatient dossier;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    @Column(name = "date_creation", nullable = false, insertable = false, updatable = false)
    private Instant dateCreation;

    protected NoteMedicale() {
    }

    public NoteMedicale(DossierPatient dossier, String contenu) {
        this.dossier = dossier;
        this.contenu = contenu;
    }

    public Long getId() {
        return id;
    }

    public DossierPatient getDossier() {
        return dossier;
    }

    public String getContenu() {
        return contenu;
    }

    public Instant getDateCreation() {
        return dateCreation;
    }
}
