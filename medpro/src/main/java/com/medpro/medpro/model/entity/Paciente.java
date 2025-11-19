package com.medpro.medpro.model.entity;

import com.medpro.medpro.model.dto.DadosAtualizacaoPaciente;
import com.medpro.medpro.model.dto.DadosCadastroPaciente;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pacientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Paciente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nome;
    private String email;
    private String telefone;
    private String cpf;

    @Embedded
    private Endereco endereco;

    private boolean ativo;
    
    public Paciente(DadosCadastroPaciente dados) {
        this.ativo = true;
        this.nome = dados.nome();
        this.email = dados.email();
        this.telefone = dados.telefone();
        this.cpf = dados.cpf();
        this.endereco = new Endereco(dados.endereco());
    }

    public void atualizarInformacoes(DadosAtualizacaoPaciente dados) {
        if (dados.email() != null) {
            if (dados.email().isBlank())
                throw new IllegalArgumentException("Email não pode estar em branco.");
            this.nome = dados.email();
        }
        if (dados.cpf() != null) {
            if (dados.cpf().isBlank())
                throw new IllegalArgumentException("CPF não pode estar em branco.");
            this.telefone = dados.cpf();
        }
    }

    public void excluir(){
        this.ativo = false;
    }
}
