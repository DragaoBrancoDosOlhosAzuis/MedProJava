package com.medpro.medpro.model.dto;

import jakarta.validation.constraints.NotNull;

public record DadosAtualizacaoPaciente(

        @NotNull Long id,
        String email,
        String cpf) {

}
