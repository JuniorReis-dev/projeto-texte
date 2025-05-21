// Elementos do DOM
const cardsContainer = document.getElementById("cardsContainer");
const loadingIndicator = document.getElementById("loadingIndicator");
const titleFilter = document.getElementById("titleFilter");
const searchButton = document.getElementById("searchButton");
const loadMoreButton = document.getElementById("loadMoreContainer");
const totalVagas = document.getElementById("totalVagas");

// Variáveis globais
let allJobs = []; // Todas as vagas
let displayedJobs = []; // Vagas filtradas
let currentPage = 1; // Página atual
const jobsPerPage = 9; // Número de vagas por página
let loadingData = false; // Controle de carregamento

// Fallback de vagas para evitar erro
const fallbackJobs = [
  {
    "Data de Inclusão": "18/05/2024",
    Area: "Front",
    Empresa: "Tech Corp",
    Cidade: "Remoto",
    "Titulo da Vaga": "Estagiário(a) Front-end",
    Link: "#",
    "Tipo de Vaga": "Estágio",
    Plataforma: "Gupy",
  },
  {
    "Data de Inclusão": "18/05/2024",
    Area: "Back-end",
    Empresa: "Dev Solutions",
    Cidade: "São Paulo",
    "Titulo da Vaga": "Estágio Back-end",
    Link: "#",
    "Tipo de Vaga": "Estágio",
    Plataforma: "Gupy",
  },
];

// Função de carregamento dinâmico
function showLoading(isLoading) {
  loadingIndicator.style.display = isLoading ? "flex" : "none";
  cardsContainer.style.display = isLoading ? "none" : "grid";
}

// Buscar vagas com ajuste de nomes de colunas
async function fetchJobs() {
  if (loadingData) return;
  loadingData = true;
  showLoading(true);

  try {
    const response = await fetch(
      "https://opensheet.elk.sh/1IlqfE5Xtyuq3yyjZ87pbb0df2v_aSmCGrYB9aJ1l5yI/vagas"
    );
    if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);

    const data = await response.json();
    console.log("Dados recebidos:", data); // Debugging

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Nenhuma vaga encontrada na API");
    }

    allJobs = data.map((job) => ({
      data: job["Data de Inclusão"],
      titulo: job["Titulo da Vaga"],
      empresa: job["Empresa"],
      local: job["Cidade"],
      area: job["Area"],
      link: job["Link"],
      tipo: job["Tipo de Vaga"],
      plataforma: job["Plataforma"],
    }));

    localStorage.setItem("jobs", JSON.stringify(allJobs)); // Cache dos dados
  } catch (error) {
    console.error("Erro ao carregar vagas:", error.message);
    allJobs = fallbackJobs; // Exibir vagas fictícias em caso de erro
  }

  displayedJobs = allJobs;
  showJobs();
  showLoading(false);
  loadingData = false;
}

// Exibe vagas paginadas
function showJobs() {
  const start = (currentPage - 1) * jobsPerPage;
  const end = start + jobsPerPage;
  const jobsToShow = displayedJobs.slice(0, end);

  cardsContainer.innerHTML =
    jobsToShow.length === 0
      ? '<div class="no-results"><p>Nenhuma vaga encontrada.</p></div>'
      : jobsToShow.map(createJobCard).join("");

  totalVagas.textContent = `Mostrando ${jobsToShow.length} de ${displayedJobs.length} vagas`;
  loadMoreButton.style.display =
    jobsToShow.length < displayedJobs.length ? "flex" : "none";
}

// Criação dinâmica do cartão de vaga
function createJobCard(job) {
  return `
    <div class="card">
      <div class="card-header">
        <span class="card-empresa">${job.empresa || "N/A"}</span>
        <div class="card-data-container">
          <span class="card-data-label">Publicado em</span>
          <span class="card-data">${job.data || "N/A"}</span>
        </div>
      </div>
      <div class="card-titulo">${job.titulo || "Sem título"}</div>
      <div class="card-footer">
        <div class="card-tags">
          <span class="tag">${job.area || "N/A"}</span>
          <span class="tag">${job.local || "Remoto"}</span>
        </div>
        <a href="${job.link}" target="_blank" class="card-link">
          <i class="fas fa-external-link-alt"></i> Ver Vaga
        </a>
      </div>
    </div>
  `;
}

// **Filtra vagas por título**
function filterByTitle() {
  const searchTerm = titleFilter.value.trim().toLowerCase();
  displayedJobs = searchTerm
    ? allJobs.filter((job) => job.titulo.toLowerCase().includes(searchTerm))
    : allJobs;
  currentPage = 1;
  showJobs();
}

// Carregar mais vagas
function loadMore() {
  currentPage++;
  showJobs();
}

// Eventos dos botões
searchButton.addEventListener("click", filterByTitle);
titleFilter.addEventListener("keypress", (event) => {
  if (event.key === "Enter") filterByTitle();
});
loadMoreButton.addEventListener("click", loadMore);

// Carrega vagas inicialmente
fetchJobs();
