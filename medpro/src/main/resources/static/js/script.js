const API_BASE = window.location.origin;

function mostrarMensagem(texto, tipo = "sucesso") {
  const div = document.getElementById("mensagem");
  div.textContent = texto;
  div.className = tipo;
  setTimeout(() => (div.textContent = ""), 3000);
}

async function fazerRequisicao(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro completo:", errorText);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    mostrarMensagem("Erro: " + error.message, "erro");
    throw error;
  }
}

// Médicos
document.getElementById("formMedico").addEventListener("submit", async (e) => {
  e.preventDefault();

  const medico = {
    nome: document.getElementById("medicoNome").value,
    email: document.getElementById("medicoEmail").value,
    telefone: document.getElementById("medicoTelefone").value,
    crm: document.getElementById("medicoCrm").value,
    especialidade: document.getElementById("medicoEspecialidade").value,
    endereco: {
      logradouro: "Rua Teste",
      bairro: "Centro",
      cep: "12345678",
      cidade: "São Paulo",
      uf: "SP",
    },
  };

  try {
    await fazerRequisicao("medicos", {
      method: "POST",
      body: JSON.stringify(medico),
    });
    mostrarMensagem("Médico cadastrado!");
    e.target.reset();
  } catch (error) {
    // Erro já tratado
  }
});

async function listarMedicos() {
  try {
    const response = await fazerRequisicao("medicos?size=50");
    const lista = document.getElementById("listaMedicos");

    lista.innerHTML = response.content
      .map(
        (medico) => `
            <div class="item ${!medico.ativo ? "inativo" : ""}">
                <strong>${medico.nome}</strong> - ${medico.especialidade}<br>
                CRM: ${medico.crm} | Email: ${medico.email}<br>
                <button onclick="excluirMedico(${medico.id})">Excluir</button>
            </div>
        `
      )
      .join("");
  } catch (error) {
    // Erro já tratado
  }
}

async function excluirMedico(id) {
  if (!confirm("Excluir médico?")) return;
  try {
    await fazerRequisicao(`medicos/${id}`, { method: "DELETE" });
    mostrarMensagem("Médico excluído!");
    listarMedicos();
  } catch (error) {
    // Erro já tratado
  }
}

// Pacientes
document
  .getElementById("formPaciente")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const paciente = {
      nome: document.getElementById("pacienteNome").value,
      email: document.getElementById("pacienteEmail").value,
      telefone: document.getElementById("pacienteTelefone").value,
      cpf: document.getElementById("pacienteCpf").value,
      endereco: {
        logradouro: "Rua Teste",
        bairro: "Centro",
        cep: "12345678",
        cidade: "São Paulo",
        uf: "SP",
      },
    };

    try {
      await fazerRequisicao("pacientes", {
        method: "POST",
        body: JSON.stringify(paciente),
      });
      mostrarMensagem("Paciente cadastrado!");
      e.target.reset();
    } catch (error) {
      // Erro já tratado
    }
  });

async function listarPacientes() {
  try {
    const response = await fazerRequisicao("pacientes?size=50");
    const lista = document.getElementById("listaPacientes");

    lista.innerHTML = response.content
      .map(
        (paciente) => `
            <div class="item ${!paciente.ativo ? "inativo" : ""}">
                <strong>${paciente.nome}</strong><br>
                CPF: ${paciente.cpf} | Email: ${paciente.email}<br>
                <button onclick="excluirPaciente(${
                  paciente.id
                })">Excluir</button>
            </div>
        `
      )
      .join("");
  } catch (error) {
    // Erro já tratado
  }
}

async function excluirPaciente(id) {
  if (!confirm("Excluir paciente?")) return;
  try {
    await fazerRequisicao(`pacientes/${id}`, { method: "DELETE" });
    mostrarMensagem("Paciente excluído!");
    listarPacientes();
  } catch (error) {
    // Erro já tratado
  }
}

// Consultas
async function carregarDadosConsulta() {
  try {
    // Carregar pacientes
    const pacientes = await fazerRequisicao("pacientes?size=100");
    const selectPaciente = document.getElementById("consultaPaciente");
    selectPaciente.innerHTML =
      '<option value="">Selecione paciente</option>' +
      pacientes.content
        .filter((p) => p.ativo)
        .map((p) => `<option value="${p.id}">${p.nome}</option>`)
        .join("");

    // Carregar médicos
    const medicos = await fazerRequisicao("medicos?size=100");
    const selectMedico = document.getElementById("consultaMedico");
    selectMedico.innerHTML =
      '<option value="">Selecione médico (opcional)</option>' +
      medicos.content
        .filter((m) => m.ativo)
        .map((m) => `<option value="${m.id}">${m.nome}</option>`)
        .join("");

    // Carregar consultas para cancelamento
    const consultas = await fazerRequisicao("consultas");
    const selectCancelar = document.getElementById("cancelarConsulta");
    selectCancelar.innerHTML =
      '<option value="">Selecione consulta</option>' +
      consultas
        .filter((c) => c.ativa)
        .map(
          (c) =>
            `<option value="${c.id}">Consulta ${c.id} - ${c.nomePaciente}</option>`
        )
        .join("");
  } catch (error) {
    // Erro já tratado
  }
}

document
  .getElementById("formAgendarConsulta")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const agendamento = {
      idPaciente: parseInt(document.getElementById("consultaPaciente").value),
      idMedico: document.getElementById("consultaMedico").value
        ? parseInt(document.getElementById("consultaMedico").value)
        : null,
      dataHora: document.getElementById("consultaDataHora").value,
    };

    try {
      await fazerRequisicao("consultas", {
        method: "POST",
        body: JSON.stringify(agendamento),
      });
      mostrarMensagem("Consulta agendada!");
      e.target.reset();
      carregarDadosConsulta();
      listarConsultas();
    } catch (error) {
      // Erro já tratado
    }
  });

document
  .getElementById("formCancelarConsulta")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const cancelamento = {
      idConsulta: parseInt(document.getElementById("cancelarConsulta").value),
      motivo: document.getElementById("motivoCancelamento").value,
    };

    if (!confirm("Cancelar consulta?")) return;

    try {
      await fazerRequisicao("consultas", {
        method: "DELETE",
        body: JSON.stringify(cancelamento),
      });
      mostrarMensagem("Consulta cancelada!");
      e.target.reset();
      carregarDadosConsulta();
      listarConsultas();
    } catch (error) {
      // Erro já tratado
    }
  });

async function listarConsultas() {
  try {
    const consultas = await fazerRequisicao("consultas");
    const lista = document.getElementById("listaConsultas");

    lista.innerHTML = consultas
      .map(
        (consulta) => `
            <div class="item ${consulta.ativa ? "" : "inativo"}">
                <strong>Consulta ${consultas.id}</strong><br>
                Paciente: ${consulta.nomePaciente}<br>
                Médico: ${consulta.nomeMedico || "Não definido"}<br>
                Data: ${new Date(consulta.dataHora).toLocaleString("pt-BR")}<br>
                Status: ${consulta.ativa ? "Ativa" : "Cancelada"}
            </div>
        `
      )
      .join("");
  } catch (error) {
    // Erro já tratado
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  carregarDadosConsulta();
  listarMedicos();
  listarPacientes();
  listarConsultas();
});
