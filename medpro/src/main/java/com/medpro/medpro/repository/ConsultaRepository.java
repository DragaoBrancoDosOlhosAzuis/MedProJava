package com.medpro.medpro.repository;

import com.medpro.medpro.model.entity.Consulta;
import com.medpro.medpro.model.entity.Medico;
import com.medpro.medpro.model.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    boolean existsByPacienteAndDataHoraBetweenAndAtivaTrue(
        Paciente paciente, LocalDateTime primeiroHorario, LocalDateTime ultimoHorario);

    boolean existsByMedicoAndDataHoraAndAtivaTrue(Medico medico, LocalDateTime dataHora);

    @Query("""
        SELECT c FROM Consulta c 
        WHERE c.medico IS NULL 
        AND c.dataHora = :dataHora 
        AND c.ativa = true
    """)
    List<Consulta> findConsultasSemMedicoNaDataHora(@Param("dataHora") LocalDateTime dataHora);

    @Query("""
        SELECT m FROM Medico m 
        WHERE m.ativo = true 
        AND m.especialidade = :especialidade 
        AND m NOT IN (
            SELECT c.medico FROM Consulta c 
            WHERE c.dataHora = :dataHora 
            AND c.ativa = true
        )
    """)
    List<Medico> findMedicosDisponiveisPorEspecialidadeEDataHora(
        @Param("especialidade") String especialidade, 
        @Param("dataHora") LocalDateTime dataHora);

    @Query("""
        SELECT m FROM Medico m 
        WHERE m.ativo = true 
        AND m NOT IN (
            SELECT c.medico FROM Consulta c 
            WHERE c.dataHora = :dataHora 
            AND c.ativa = true
        )
    """)
    List<Medico> findMedicosDisponiveisPorDataHora(@Param("dataHora") LocalDateTime dataHora);
}