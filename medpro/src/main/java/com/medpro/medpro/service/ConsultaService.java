package com.medpro.medpro.service;

import com.medpro.medpro.enums.MotivoCancelamento;
import com.medpro.medpro.model.entity.Consulta;
import com.medpro.medpro.model.entity.Medico;
import com.medpro.medpro.model.entity.Paciente;
import com.medpro.medpro.repository.ConsultaRepository;
import com.medpro.medpro.repository.MedicoRepository;
import com.medpro.medpro.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Random;

@Service
public class ConsultaService {

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    public void validarAgendamento(Long idPaciente, Long idMedico, LocalDateTime dataHora) {
        // Validar se paciente existe e está ativo
        Paciente paciente = pacienteRepository.findById(idPaciente)
            .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado"));
        if (!paciente.isAtivo()) {
            throw new IllegalArgumentException("Paciente está inativo");
        }

        // Validar horário de funcionamento (segunda a sábado, 07:00 às 19:00)
        validarHorarioFuncionamento(dataHora);

        // Validar antecedência mínima de 30 minutos
        validarAntecedenciaMinima(dataHora);

        // Validar se paciente já tem consulta no mesmo dia
        validarConsultaMesmoDia(paciente, dataHora);

        // Validar médico se foi informado
        if (idMedico != null) {
            Medico medico = medicoRepository.findById(idMedico)
                .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado"));
            if (!medico.isAtivo()) {
                throw new IllegalArgumentException("Médico está inativo");
            }
            validarDisponibilidadeMedico(medico, dataHora);
        }
    }

    public Medico escolherMedicoDisponivel(LocalDateTime dataHora) {
        List<Medico> medicosDisponiveis = consultaRepository.findMedicosDisponiveisPorDataHora(dataHora);
        
        if (medicosDisponiveis.isEmpty()) {
            throw new IllegalArgumentException("Nenhum médico disponível para esta data/hora");
        }

        // Escolhe aleatoriamente entre os médicos disponíveis
        Random random = new Random();
        return medicosDisponiveis.get(random.nextInt(medicosDisponiveis.size()));
    }

    public void validarCancelamento(Consulta consulta, MotivoCancelamento motivo) {
        // Validar se consulta está ativa
        if (!consulta.getAtiva()) {
            throw new IllegalArgumentException("Consulta já está cancelada");
        }

        // Validar antecedência mínima de 24 horas
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime limiteCancelamento = consulta.getDataHora().minusHours(24);
        
        if (agora.isAfter(limiteCancelamento)) {
            throw new IllegalArgumentException("Cancelamento deve ser feito com pelo menos 24 horas de antecedência");
        }

        // Validar motivo (já validado pelo DTO)
        if (motivo == null) {
            throw new IllegalArgumentException("Motivo do cancelamento é obrigatório");
        }
    }

    private void validarHorarioFuncionamento(LocalDateTime dataHora) {
        DayOfWeek diaSemana = dataHora.getDayOfWeek();
        LocalTime horario = dataHora.toLocalTime();

        // Domingo não funciona
        if (diaSemana == DayOfWeek.SUNDAY) {
            throw new IllegalArgumentException("Clínica não funciona aos domingos");
        }

        // Fora do horário comercial
        if (horario.isBefore(LocalTime.of(7, 0)) || horario.isAfter(LocalTime.of(18, 0))) {
            throw new IllegalArgumentException("Horário fora do funcionamento (07:00 às 19:00)");
        }
    }

    private void validarAntecedenciaMinima(LocalDateTime dataHora) {
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime limiteMinimo = agora.plusMinutes(30);
        
        if (dataHora.isBefore(limiteMinimo)) {
            throw new IllegalArgumentException("Agendamento deve ser feito com pelo menos 30 minutos de antecedência");
        }
    }

    private void validarConsultaMesmoDia(Paciente paciente, LocalDateTime dataHora) {
        LocalDateTime inicioDia = dataHora.toLocalDate().atStartOfDay();
        LocalDateTime fimDia = dataHora.toLocalDate().atTime(23, 59, 59);
        
        boolean existeConsulta = consultaRepository.existsByPacienteAndDataHoraBetweenAndAtivaTrue(
            paciente, inicioDia, fimDia);
        
        if (existeConsulta) {
            throw new IllegalArgumentException("Paciente já possui consulta agendada para este dia");
        }
    }

    private void validarDisponibilidadeMedico(Medico medico, LocalDateTime dataHora) {
        boolean medicoOcupado = consultaRepository.existsByMedicoAndDataHoraAndAtivaTrue(medico, dataHora);
        
        if (medicoOcupado) {
            throw new IllegalArgumentException("Médico já possui consulta agendada para este horário");
        }
    }
}