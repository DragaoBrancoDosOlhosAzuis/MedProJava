package com.medpro.medpro.model.entity;

import com.medpro.medpro.enums.MotivoCancelamento;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "consultas")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_id")
    private Medico medico;

    private LocalDateTime dataHora;
    
    private Boolean ativa;

    @Enumerated(EnumType.STRING)
    private MotivoCancelamento motivoCancelamento;

    public Consulta(Paciente paciente, Medico medico, LocalDateTime dataHora) {
        this.paciente = paciente;
        this.medico = medico;
        this.dataHora = dataHora;
        this.ativa = true;
        this.motivoCancelamento = null;
    }

    public void cancelar(MotivoCancelamento motivo) {
        this.ativa = false;
        this.motivoCancelamento = motivo;
    }
}