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
@Table(name = "chatbot_interaction")
public class ChatbotInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_id", nullable = false)
    private ChatbotServiceEntity service;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reponse;

    @Column(name = "date_interaction", nullable = false, insertable = false, updatable = false)
    private Instant dateInteraction;

    protected ChatbotInteraction() {
    }

    public ChatbotInteraction(ChatbotServiceEntity service, User user, String question, String reponse) {
        this.service = service;
        this.user = user;
        this.question = question;
        this.reponse = reponse;
    }

    public Long getId() { return id; }
    public ChatbotServiceEntity getService() { return service; }
    public User getUser() { return user; }
    public String getQuestion() { return question; }
    public String getReponse() { return reponse; }
    public Instant getDateInteraction() { return dateInteraction; }
}
