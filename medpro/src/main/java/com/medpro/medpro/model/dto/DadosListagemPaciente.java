package com.medpro.medpro.model.dto;

import com.medpro.medpro.model.entity.Paciente;

public record DadosListagemPaciente(
    Long id,
    String nome, 
    String email, 
    String cpf,
    String telefone,
    Boolean ativo) {
    
    public DadosListagemPaciente(Paciente paciente){
        this(
            paciente.getId(),
            paciente.getNome(),
            paciente.getEmail(),
            paciente.getCpf(),
            paciente.getTelefone(),
            paciente.isAtivo()
        );
    }
}