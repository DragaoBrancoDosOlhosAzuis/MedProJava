package com.medpro.medpro.model.dto;

import com.medpro.medpro.enums.MotivoCancelamento;
import com.medpro.medpro.model.entity.Consulta;
import java.time.LocalDateTime;

public record DadosDetalhamentoConsulta(
    Long id,
    Long idPaciente,
    String nomePaciente,
    Long idMedico,
    String nomeMedico,
    LocalDateTime dataHora,
    Boolean ativa,
    MotivoCancelamento motivoCancelamento
) {
    public DadosDetalhamentoConsulta(Consulta consulta) {
        this(
            consulta.getId(),
            consulta.getPaciente().getId(),
            consulta.getPaciente().getNome(),
            consulta.getMedico() != null ? consulta.getMedico().getId() : null,
            consulta.getMedico() != null ? consulta.getMedico().getNome() : null,
            consulta.getDataHora(),
            consulta.getAtiva(),
            consulta.getMotivoCancelamento()
        );
    }
}