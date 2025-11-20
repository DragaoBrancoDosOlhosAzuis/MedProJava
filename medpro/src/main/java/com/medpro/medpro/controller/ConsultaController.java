package com.medpro.medpro.controller;

import com.medpro.medpro.model.dto.DadosAgendamentoConsulta;
import com.medpro.medpro.model.dto.DadosCancelamentoConsulta;
import com.medpro.medpro.model.dto.DadosDetalhamentoConsulta;
import com.medpro.medpro.model.entity.Consulta;
import com.medpro.medpro.model.entity.Medico;
import com.medpro.medpro.model.entity.Paciente;
import com.medpro.medpro.repository.ConsultaRepository;
import com.medpro.medpro.repository.MedicoRepository;
import com.medpro.medpro.repository.PacienteRepository;
import com.medpro.medpro.service.ConsultaService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("consultas")
public class ConsultaController {

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private ConsultaService consultaService;

    @PostMapping
    @Transactional
    public ResponseEntity<DadosDetalhamentoConsulta> agendar(
            @RequestBody @Valid DadosAgendamentoConsulta dados,
            UriComponentsBuilder uriBuilder) {
        
        // Validar regras de negócio
        consultaService.validarAgendamento(dados.idPaciente(), dados.idMedico(), dados.dataHora());

        // Buscar paciente
        Paciente paciente = pacienteRepository.findById(dados.idPaciente())
                .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado"));

        // Buscar médico ou escolher um disponível
        Medico medico = null;
        if (dados.idMedico() != null) {
            medico = medicoRepository.findById(dados.idMedico())
                    .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado"));
        } else {
            medico = consultaService.escolherMedicoDisponivel(dados.dataHora());
        }

        // Criar e salvar consulta
        Consulta consulta = new Consulta(paciente, medico, dados.dataHora());
        consultaRepository.save(consulta);

        var uri = uriBuilder.path("/consultas/{id}").buildAndExpand(consulta.getId()).toUri();
        return ResponseEntity.created(uri).body(new DadosDetalhamentoConsulta(consulta));
    }

    @DeleteMapping
    @Transactional
    public ResponseEntity<Void> cancelar(@RequestBody @Valid DadosCancelamentoConsulta dados) {
        Consulta consulta = consultaRepository.findById(dados.idConsulta())
                .orElseThrow(() -> new IllegalArgumentException("Consulta não encontrada"));

        consultaService.validarCancelamento(consulta, dados.motivo());
        consulta.cancelar(dados.motivo());

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<DadosDetalhamentoConsulta>> listar() {
        var consultas = consultaRepository.findAll()
                .stream()
                .map(DadosDetalhamentoConsulta::new)
                .toList();
        return ResponseEntity.ok(consultas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DadosDetalhamentoConsulta> detalhar(@PathVariable Long id) {
        var consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Consulta não encontrada"));
        return ResponseEntity.ok(new DadosDetalhamentoConsulta(consulta));
    }
}