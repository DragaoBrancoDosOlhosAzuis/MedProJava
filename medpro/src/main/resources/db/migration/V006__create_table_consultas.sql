-- Tabela de Consultas
CREATE TABLE consultas (
    id BIGINT NOT NULL AUTO_INCREMENT,
    paciente_id BIGINT NOT NULL,
    medico_id BIGINT,
    data_hora DATETIME NOT NULL,
    ativa BOOLEAN DEFAULT TRUE,
    motivo_cancelamento VARCHAR(100),
    
    PRIMARY KEY (id),
    
    -- Foreign Keys
    CONSTRAINT fk_consulta_paciente 
        FOREIGN KEY (paciente_id) 
        REFERENCES pacientes(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
        
    CONSTRAINT fk_consulta_medico 
        FOREIGN KEY (medico_id) 
        REFERENCES medicos(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);

-- Índices para melhor performance
CREATE INDEX idx_consulta_paciente_data ON consultas(paciente_id, data_hora);
CREATE INDEX idx_consulta_medico_data ON consultas(medico_id, data_hora);
CREATE INDEX idx_consulta_data ON consultas(data_hora);