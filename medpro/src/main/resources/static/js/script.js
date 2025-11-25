const API_BASE = window.location.origin;

function mostrarMensagem(texto, tipo = "sucesso") {
  const div = document.getElementById("mensagem");
  div.textContent = texto;
  div.className = tipo;
  setTimeout(() => {
    div.textContent = "";
    div.className = "";
  }, 5000);
}

async function fazerRequisicao(url, options = {}) {
  try {
    console.log(`Fazendo requisição para: ${url}`, options);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    console.log(`Resposta recebida: ${response.status}`);

    if (!response.ok) {
      let errorText = "Erro desconhecido";
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = response.statusText;
      }
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    if (response.status === 204) {
      console.log("Resposta 204 - No Content");
      return null;
    }

    const data = await response.json();
    console.log("Dados recebidos:", data);
    return data;
  } catch (error) {
    console.error("Erro na requisição:", error);
    mostrarMensagem("Erro: " + error.message, "erro");
    throw error;
  }
}

// Função para debug detalhado
async function debugPacientes() {
  console.log("=== DEBUG DETALHADO PACIENTES ===");
  try {
    const response = await fetch("pacientes?size=100");
    console.log("Status da resposta:", response.status);
    console.log("Headers:", response.headers);

    const text = await response.text();
    console.log("Resposta como texto:", text);

    if (text) {
      const data = JSON.parse(text);
      console.log("Dados parseados:", data);
    }
  } catch (error) {
    console.error("Erro no debug:", error);
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
      logradouro: "Rua das Flores",
      bairro: "Jardim Paulista",
      cep: "01415000",
      cidade: "São Paulo",
      uf: "SP",
      numero: "123",
      complemento: "Sala 45",
    },
  };

  console.log("Cadastrando médico:", medico);

  try {
    const resultado = await fazerRequisicao("medicos", {
      method: "POST",
      body: JSON.stringify(medico),
    });

    mostrarMensagem("Médico cadastrado com sucesso!");
    document.getElementById("formMedico").reset();
    await listarMedicos();
  } catch (error) {
    console.error("Erro no cadastro de médico:", error);
  }
});

async function listarMedicos() {
  try {
    console.log("Carregando lista de médicos...");
    const response = await fazerRequisicao("medicos?size=100");
    const lista = document.getElementById("listaMedicos");

    if (!response.content || response.content.length === 0) {
      lista.innerHTML = '<div class="item">Nenhum médico cadastrado</div>';
      return;
    }

    // DEBUG: Verificar os dados dos médicos
    console.log("DEBUG - Dados dos médicos:", response.content);
    response.content.forEach((medico, index) => {
      console.log(
        `Médico ${index}: id=${medico.id}, nome=${medico.nome}, ativo=${medico.ativo}`
      );
    });

    lista.innerHTML = response.content
      .map((medico) => {
        const ativo = medico.ativo !== undefined ? medico.ativo : true;
        const id = medico.id;

        if (!id) {
          console.error("Médico sem ID:", medico);
          return "";
        }

        return `
            <div class="item ${!ativo ? "inativo" : ""}">
                <strong>${medico.nome}</strong> - ${medico.especialidade}<br>
                <strong>CRM:</strong> ${medico.crm} | <strong>Email:</strong> ${
          medico.email
        }<br>
                <strong>Telefone:</strong> ${medico.telefone}<br>
                <strong>Status:</strong> ${ativo ? "Ativo" : "Inativo"}
                <div style="margin-top: 10px;">
                    <button onclick="detalharMedico(${id})">Detalhar</button>
                    <button class="btn-excluir" onclick="excluirMedico(${id})" ${
          !ativo ? "disabled" : ""
        }>
                        ${ativo ? "Excluir" : "Excluído"}
                    </button>
                </div>
            </div>
          `;
      })
      .join("");

    console.log(`Listados ${response.content.length} médicos`);
  } catch (error) {
    console.error("Erro ao carregar médicos:", error);
    document.getElementById("listaMedicos").innerHTML =
      '<div class="item erro">Erro ao carregar médicos</div>';
  }
}

async function detalharMedico(id) {
  console.log("Detalhando médico com ID:", id, "Tipo:", typeof id);

  if (!id || id === "undefined" || id === "null") {
    mostrarMensagem("Erro: ID do médico inválido", "erro");
    return;
  }

  try {
    const medicoId = typeof id === "string" ? parseInt(id) : id;
    const medico = await fazerRequisicao(`medicos/${medicoId}`);
    alert(
      `Detalhes do Médico:\n\nNome: ${medico.nome}\nEmail: ${
        medico.email
      }\nTelefone: ${medico.telefone}\nCRM: ${medico.crm}\nEspecialidade: ${
        medico.especialidade
      }\nStatus: ${medico.ativo ? "Ativo" : "Inativo"}`
    );
  } catch (error) {
    console.error("Erro ao detalhar médico:", error);
  }
}

async function excluirMedico(id) {
  console.log("Tentando excluir médico com ID:", id, "Tipo:", typeof id);

  if (!id || id === "undefined" || id === "null") {
    mostrarMensagem("Erro: ID do médico inválido", "erro");
    return;
  }

  if (!confirm("Tem certeza que deseja excluir este médico?")) return;

  try {
    const medicoId = typeof id === "string" ? parseInt(id) : id;

    await fazerRequisicao(`medicos/${medicoId}`, {
      method: "DELETE",
    });

    mostrarMensagem("Médico excluído com sucesso!");
    await listarMedicos();
  } catch (error) {
    console.error("Erro ao excluir médico:", error);
    mostrarMensagem("Erro ao excluir médico: " + error.message, "erro");
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
      cpf: document.getElementById("pacienteCpf").value.replace(/\D/g, ""),
      endereco: {
        logradouro: "Avenida Paulista",
        bairro: "Bela Vista",
        cep: "01311000",
        cidade: "São Paulo",
        uf: "SP",
        numero: "1000",
        complemento: "Apartmento 101",
      },
    };

    console.log("Cadastrando paciente:", paciente);

    try {
      const resultado = await fazerRequisicao("pacientes", {
        method: "POST",
        body: JSON.stringify(paciente),
      });

      mostrarMensagem("Paciente cadastrado com sucesso!");
      document.getElementById("formPaciente").reset();
      await listarPacientes();
    } catch (error) {
      console.error("Erro no cadastro de paciente:", error);
    }
  });

async function listarPacientes() {
  try {
    console.log("Carregando lista de pacientes...");

    let response;
    try {
      response = await fazerRequisicao("pacientes?size=100");
    } catch (error) {
      console.log("Tentando endpoint alternativo...");
      response = await fazerRequisicao("pacientes");
    }

    const lista = document.getElementById("listaPacientes");

    let pacientes = [];
    if (response && response.content) {
      pacientes = response.content;
    } else if (Array.isArray(response)) {
      pacientes = response;
    } else if (response && Array.isArray(response.pacientes)) {
      pacientes = response.pacientes;
    }

    if (!pacientes || pacientes.length === 0) {
      lista.innerHTML = '<div class="item">Nenhum paciente cadastrado</div>';
      return;
    }

    console.log("DEBUG - Pacientes encontrados:", pacientes);
    pacientes.forEach((paciente, index) => {
      console.log(`Paciente ${index}:`, {
        id: paciente.id,
        nome: paciente.nome,
        email: paciente.email,
        cpf: paciente.cpf,
        telefone: paciente.telefone,
        ativo: paciente.ativo,
      });
    });

    lista.innerHTML = pacientes
      .map((paciente) => {
        const ativo = paciente.ativo !== undefined ? paciente.ativo : true;
        const telefone = paciente.telefone || "Não informado";
        const id = paciente.id;

        if (!id) {
          console.error("Paciente sem ID:", paciente);
          return "";
        }

        return `
            <div class="item ${!ativo ? "inativo" : ""}">
                <strong>${paciente.nome}</strong><br>
                <strong>CPF:</strong> ${
                  paciente.cpf
                } | <strong>Email:</strong> ${paciente.email}<br>
                <strong>Telefone:</strong> ${telefone}<br>
                <strong>Status:</strong> ${ativo ? "Ativo" : "Inativo"}
                <div style="margin-top: 10px;">
                    <button onclick="detalharPaciente(${id})">Detalhar</button>
                    <button class="btn-excluir" onclick="excluirPaciente(${id})" ${
          !ativo ? "disabled" : ""
        }>
                        ${ativo ? "Excluir" : "Excluído"}
                    </button>
                </div>
            </div>
          `;
      })
      .join("");

    console.log(`Listados ${pacientes.length} pacientes`);
  } catch (error) {
    console.error("Erro ao carregar pacientes:", error);
    document.getElementById("listaPacientes").innerHTML =
      '<div class="item erro">Erro ao carregar pacientes: ' +
      error.message +
      "</div>";
  }
}

async function detalharPaciente(id) {
  console.log("Detalhando paciente com ID:", id, "Tipo:", typeof id);

  if (!id || id === "undefined" || id === "null") {
    mostrarMensagem("Erro: ID do paciente inválido", "erro");
    return;
  }

  try {
    const pacienteId = typeof id === "string" ? parseInt(id) : id;
    const paciente = await fazerRequisicao(`pacientes/${pacienteId}`);
    alert(
      `Detalhes do Paciente:\n\nNome: ${paciente.nome}\nEmail: ${
        paciente.email
      }\nTelefone: ${paciente.telefone}\nCPF: ${paciente.cpf}\nStatus: ${
        paciente.ativo ? "Ativo" : "Inativo"
      }`
    );
  } catch (error) {
    console.error("Erro ao detalhar paciente:", error);
  }
}

async function excluirPaciente(id) {
  console.log("Tentando excluir paciente com ID:", id, "Tipo:", typeof id);

  if (!id || id === "undefined" || id === "null") {
    mostrarMensagem("Erro: ID do paciente inválido", "erro");
    return;
  }

  if (!confirm("Tem certeza que deseja excluir este paciente?")) return;

  try {
    const pacienteId = typeof id === "string" ? parseInt(id) : id;

    await fazerRequisicao(`pacientes/${pacienteId}`, {
      method: "DELETE",
    });

    mostrarMensagem("Paciente excluído com sucesso!");
    await listarPacientes();
  } catch (error) {
    console.error("Erro ao excluir paciente:", error);
    mostrarMensagem("Erro ao excluir paciente: " + error.message, "erro");
  }
}

// Consultas
async function carregarDadosConsulta() {
  try {
    console.log("Carregando dados para consultas...");

    // Carregar pacientes ativos
    const pacientesResponse = await fazerRequisicao("pacientes?size=100");
    const selectPaciente = document.getElementById("consultaPaciente");
    let pacientesAtivos = [];

    if (pacientesResponse && pacientesResponse.content) {
      pacientesAtivos = pacientesResponse.content.filter(
        (p) => p.ativo !== false
      );
    } else if (Array.isArray(pacientesResponse)) {
      pacientesAtivos = pacientesResponse.filter((p) => p.ativo !== false);
    }

    selectPaciente.innerHTML =
      '<option value="">Selecione o paciente</option>' +
      pacientesAtivos
        .map((p) => `<option value="${p.id}">${p.nome} - ${p.cpf}</option>`)
        .join("");

    // Carregar médicos ativos
    const medicosResponse = await fazerRequisicao("medicos?size=100");
    const selectMedico = document.getElementById("consultaMedico");
    let medicosAtivos = [];

    if (medicosResponse && medicosResponse.content) {
      medicosAtivos = medicosResponse.content.filter((m) => m.ativo !== false);
    } else if (Array.isArray(medicosResponse)) {
      medicosAtivos = medicosResponse.filter((m) => m.ativo !== false);
    }

    selectMedico.innerHTML =
      '<option value="">Selecione o médico (opcional)</option>' +
      medicosAtivos
        .map(
          (m) =>
            `<option value="${m.id}">${m.nome} - ${m.especialidade}</option>`
        )
        .join("");

    await carregarConsultasParaCancelamento();

    console.log("Dados para consultas carregados com sucesso");
  } catch (error) {
    console.error("Erro ao carregar dados para consultas:", error);
    mostrarMensagem("Erro ao carregar dados para agendamento", "erro");
  }
}

async function carregarConsultasParaCancelamento() {
  try {
    const consultas = await fazerRequisicao("consultas");
    const selectCancelar = document.getElementById("cancelarConsulta");
    let consultasAtivas = [];

    if (Array.isArray(consultas)) {
      consultasAtivas = consultas.filter((c) => c.ativa !== false);
    }

    selectCancelar.innerHTML =
      '<option value="">Selecione a consulta</option>' +
      consultasAtivas
        .map(
          (c) =>
            `<option value="${c.id}">Consulta #${c.id} - ${
              c.nomePaciente
            } - ${new Date(c.dataHora).toLocaleString("pt-BR")}</option>`
        )
        .join("");
  } catch (error) {
    console.error("Erro ao carregar consultas para cancelamento:", error);
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

    console.log("Agendando consulta:", agendamento);

    try {
      const resultado = await fazerRequisicao("consultas", {
        method: "POST",
        body: JSON.stringify(agendamento),
      });

      mostrarMensagem("Consulta agendada com sucesso!");
      document.getElementById("formAgendarConsulta").reset();
      await carregarDadosConsulta();
      await listarConsultas();
    } catch (error) {
      console.error("Erro ao agendar consulta:", error);
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

    if (!confirm("Tem certeza que deseja cancelar esta consulta?")) return;

    console.log("Cancelando consulta:", cancelamento);

    try {
      await fazerRequisicao("consultas", {
        method: "DELETE",
        body: JSON.stringify(cancelamento),
      });

      mostrarMensagem("Consulta cancelada com sucesso!");
      document.getElementById("formCancelarConsulta").reset();
      await carregarDadosConsulta();
      await listarConsultas();
    } catch (error) {
      console.error("Erro ao cancelar consulta:", error);
    }
  });

async function listarConsultas() {
  try {
    console.log("Carregando lista de consultas...");
    const consultas = await fazerRequisicao("consultas");
    const lista = document.getElementById("listaConsultas");

    let consultasArray = [];
    if (Array.isArray(consultas)) {
      consultasArray = consultas;
    }

    if (!consultasArray || consultasArray.length === 0) {
      lista.innerHTML = '<div class="item">Nenhuma consulta agendada</div>';
      return;
    }

    lista.innerHTML = consultasArray
      .map((consulta) => {
        const ativa = consulta.ativa !== undefined ? consulta.ativa : true;
        return `
            <div class="item ${!ativa ? "inativo" : ""}">
                <strong>Consulta #${consulta.id}</strong><br>
                <strong>Paciente:</strong> ${consulta.nomePaciente}<br>
                <strong>Médico:</strong> ${
                  consulta.nomeMedico || "A ser definido"
                }<br>
                <strong>Data/Hora:</strong> ${new Date(
                  consulta.dataHora
                ).toLocaleString("pt-BR")}<br>
                <strong>Status:</strong> ${ativa ? "✅ Ativa" : "❌ Cancelada"}
                ${
                  consulta.motivoCancelamento
                    ? `<br><strong>Motivo:</strong> ${formatarMotivoCancelamento(
                        consulta.motivoCancelamento
                      )}`
                    : ""
                }
            </div>
          `;
      })
      .join("");

    console.log(`Listadas ${consultasArray.length} consultas`);
  } catch (error) {
    console.error("Erro ao carregar consultas:", error);
    document.getElementById("listaConsultas").innerHTML =
      '<div class="item erro">Erro ao carregar consultas</div>';
  }
}

function formatarMotivoCancelamento(motivo) {
  const motivos = {
    PACIENTE_DESISTIU: "Paciente desistiu",
    MEDICO_CANCELOU: "Médico cancelou",
    OUTROS: "Outros",
  };
  return motivos[motivo] || motivo;
}

// Teste rápido
async function testeRapido() {
  console.log("=== INICIANDO TESTE RÁPIDO ===");

  const pacienteTeste = {
    nome: "Maria Silva Teste",
    email: "maria.teste@email.com",
    telefone: "11987654321",
    cpf: "98765432100",
    endereco: {
      logradouro: "Rua Teste",
      bairro: "Centro",
      cep: "12345678",
      cidade: "São Paulo",
      uf: "SP",
      numero: "123",
      complemento: "",
    },
  };

  try {
    console.log("Testando cadastro de paciente...");
    const resultado = await fazerRequisicao("pacientes", {
      method: "POST",
      body: JSON.stringify(pacienteTeste),
    });
    console.log("✅ Teste de paciente: SUCESSO");
  } catch (error) {
    console.error("❌ Teste de paciente: FALHA", error);
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  console.log("=== MEDPRO INICIADO ===");

  // Carregar dados iniciais
  carregarDadosConsulta();
  listarMedicos();
  listarPacientes();
  listarConsultas();

  // Debug
  setTimeout(debugPacientes, 1000);

  // Testes
  window.testeRapido = testeRapido;
  console.log("Para testar rapidamente, execute no console: testeRapido()");
});
