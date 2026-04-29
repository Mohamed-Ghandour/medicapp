package com.medicapp.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class RendezVousStatutConverter implements AttributeConverter<RendezVousStatut, String> {

    @Override
    public String convertToDatabaseColumn(RendezVousStatut attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public RendezVousStatut convertToEntityAttribute(String dbData) {
        return dbData == null ? null : RendezVousStatut.valueOf(dbData);
    }
}
