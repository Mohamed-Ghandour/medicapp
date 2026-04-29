INSERT INTO chatbot_service (nom) VALUES ('MedicApp Assistant')
ON CONFLICT (nom) DO NOTHING;
