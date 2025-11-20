package com.medpro.medpro.model.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record DadosAgendamentoConsulta(
    @NotNull
    Long idPaciente,
    
    Long idMedico, // Opcional - se null, sistema escolhe médico disponível
    
    @NotNull
    @Future
    LocalDateTime dataHora
) {}