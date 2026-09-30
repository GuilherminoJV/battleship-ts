// ================================================================
//                🛥️  BATALHA NAVAL - TypeScript
// ================================================================

const input = require("prompt-sync")();

const TAMANHO_TABULEIRO = 10;

// ================================================================
//                       👤 JOGADORES
// ================================================================

interface Jogador { avatar: string; pontos: number; }

const jogador: Jogador    = { avatar: "", pontos: 0 };
const computador: Jogador = { avatar: "Computador", pontos: 0 };

jogador.avatar = input("Digite o nome do seu avatar: ");

// ================================================================
//                        🗺️  TABULEIROS
// ================================================================

const criarTabuleiroVazio = (): string[][] =>
Array.from({ length: TAMANHO_TABULEIRO }, () => Array(TAMANHO_TABULEIRO).fill(" "));

const tabuleiroHumano: string[][]     = criarTabuleiroVazio(); // tabuleiro do jogador
const tabuleiroComputador: string[][] = criarTabuleiroVazio(); // tabuleiro do computador
const tabuleiroNeblina: string[][]    = criarTabuleiroVazio(); // o que o jogador já descobriu

// ================================================================
//                           ⚓ NAVIOS
// ================================================================

interface Navio {
  nome: string;
  tamanho: number;
  posicoes: Coordenada[];
  posicoesAtingidas: number;
  afundado: boolean;
}

const criarNavio = (nome: string, tamanho: number): Navio =>
  ({ nome, tamanho, posicoes: [], posicoesAtingidas: 0, afundado: false });

const jogadorNavios: Navio[] = [
  criarNavio("Porta-Aviões", 5),
  criarNavio("Encouraçado", 4),
];

const computadorNavios: Navio[] = [
  criarNavio("Porta-Aviões", 5),
  criarNavio("Encouraçado", 4),
];

// ================================================================
//                        🤖 IA DO COMPUTADOR
// ================================================================

interface Coordenada { linha: number; coluna: number; }
type Direcao = "H" | "V";
interface PosicaoNavio { linha: number; coluna: number; direcao: Direcao; }

let filaDeAlvos: Coordenada[] = [];

function pegarVizinhos(linha: number, coluna: number): Coordenada[] {
  return [
    { linha: linha - 1, coluna },     // cima
    { linha: linha + 1, coluna },     // baixo
    { linha, coluna: coluna - 1 },    // esquerda
    { linha, coluna: coluna + 1 },    // direita
  ];
}

function dentroDoTabuleiro(linha: number, coluna: number): boolean {
  return linha >= 0 && linha < TAMANHO_TABULEIRO && coluna >= 0 && coluna < TAMANHO_TABULEIRO;
}

function adicionarAlvoSeNaoExistir(alvo: Coordenada): void {
  const jaExiste = filaDeAlvos.some((p) => p.linha === alvo.linha && p.coluna === alvo.coluna);
  if (!jaExiste) filaDeAlvos.push(alvo);
}

function adicionarVizinhos(tabuleiro: string[][], linha: number, coluna: number): void {
  for (const vizinho of pegarVizinhos(linha, coluna)) {
    if (!dentroDoTabuleiro(vizinho.linha, vizinho.coluna)) continue;

    const casa = tabuleiro[vizinho.linha][vizinho.coluna];
    if (casa !== "X" && casa !== "O") adicionarAlvoSeNaoExistir(vizinho);
  }
}

function posicaoAleatoria(): PosicaoNavio {
  const linha    = Math.floor(Math.random() * TAMANHO_TABULEIRO);
  const coluna   = Math.floor(Math.random() * TAMANHO_TABULEIRO);
  const direcao: Direcao = Math.random() < 0.5 ? "H" : "V";
  return { linha, coluna, direcao };
}

// ================================================================
//                         🖥️  EXIBIÇÃO
// ================================================================

// Gera o cabeçalho de colunas (1 a 10) e devolve também sua largura,
function gerarCabecalho(): string {
  return Array.from({ length: TAMANHO_TABULEIRO }, (_, i) => i + 1).join(" | ");
}

function calcularLarguraTabuleiro(): number {
  return `    ${gerarCabecalho()}`.length;
}

// impressão de título centralizado
function exibirTitulo(titulo: string): void {
  const largura = calcularLarguraTabuleiro();
  const textoComEspacos = ` ${titulo} `;
  const totalIguais = Math.max(largura - textoComEspacos.length, 0);
  const esquerda = Math.floor(totalIguais / 2);
  const direita = totalIguais - esquerda;

  console.log(`\n${"=".repeat(esquerda)}${textoComEspacos}${"=".repeat(direita)}`);
}

function exibirTabuleiro(tabuleiro: string[][]): void {
  console.log(`    ${gerarCabecalho()}`);
  for (let i = 0; i < TAMANHO_TABULEIRO; i++) {
    const numeroLinha = i + 1;
    const prefixo = numeroLinha < 10 ? ` ${numeroLinha}` : `${numeroLinha}`;
    console.log(`${prefixo} | ${tabuleiro[i].join(" | ")} |`);
  }
}

// ================================================================
//                  📍 VALIDAÇÃO E POSICIONAMENTO
// ================================================================

function posicaoValida(tabuleiro: string[][], linha: number, coluna: number, tamanho: number, direcao: Direcao): boolean {
  if (isNaN(linha) || isNaN(coluna) || !dentroDoTabuleiro(linha, coluna)) return false;
  if (direcao !== "H" && direcao !== "V") return false;

  if (direcao === "H") {
    if (coluna + tamanho > TAMANHO_TABULEIRO) return false;
    for (let i = 0; i < tamanho; i++) if (tabuleiro[linha][coluna + i] !== " ") return false;
  } else {
    if (linha + tamanho > TAMANHO_TABULEIRO) return false;
    for (let i = 0; i < tamanho; i++) if (tabuleiro[linha + i][coluna] !== " ") return false;
  }

  return true;
}

function posicionarNavio(tabuleiro: string[][], navio: Navio, linha: number, coluna: number, direcao: Direcao): void {
  for (let i = 0; i < navio.tamanho; i++) {
    if (direcao === "H") {
      tabuleiro[linha][coluna + i] = "N";
      navio.posicoes.push({ linha, coluna: coluna + i });
    } else {
      tabuleiro[linha + i][coluna] = "N";
      navio.posicoes.push({ linha: linha + i, coluna });
    }
  }
}

function posicionarNavioAleatorio(tabuleiro: string[][], navio: Navio): void {
  let posicao: PosicaoNavio;

  do {
    posicao = posicaoAleatoria();
  } while (!posicaoValida(tabuleiro, posicao.linha, posicao.coluna, navio.tamanho, posicao.direcao));

  posicionarNavio(tabuleiro, navio, posicao.linha, posicao.coluna, posicao.direcao);
}

// Pede linha/coluna ao jogador no formato (1-10)
function posicionarNavioJogador(tabuleiro: string[][], navio: Navio): void {
  let linha: number, coluna: number, direcao: Direcao;

  do {
    const linhaDigitada  = parseInt(input(`Digite a linha para posicionar o ${navio.nome} (1-10): `));
    const colunaDigitada = parseInt(input(`Digite a coluna para posicionar o ${navio.nome} (1-10): `));
    direcao = input(`Digite a direção para posicionar o ${navio.nome} (H/V): `).toUpperCase() as Direcao;

    linha  = linhaDigitada - 1;
    coluna = colunaDigitada - 1;

    if (!posicaoValida(tabuleiro, linha, coluna, navio.tamanho, direcao)) {
      console.log("Posição inválida! Tente novamente.\n");
    }
  } while (!posicaoValida(tabuleiro, linha, coluna, navio.tamanho, direcao));

  posicionarNavio(tabuleiro, navio, linha, coluna, direcao);
}

// ================================================================
//                       🎯 ATAQUE E VITÓRIA
// ================================================================

function atacar(tabuleiro: string[][], navios: Navio[], linha: number, coluna: number, tabuleiroVisao?: string[][]): boolean {
  const acertou = tabuleiro[linha][coluna] === "N";
  const marca = acertou ? "X" : "O";

  tabuleiro[linha][coluna] = marca;
  if (tabuleiroVisao) tabuleiroVisao[linha][coluna] = marca;

  if (!acertou) return false;

  const navio = navios.find((n) => n.posicoes.some((p) => p.linha === linha && p.coluna === coluna));
  if (navio) {
    navio.posicoesAtingidas++;
    if (navio.posicoesAtingidas === navio.tamanho) {
      navio.afundado = true;
      console.log(`💥 ${navio.nome} foi afundado!`);
    }
  }

  return true;
}

function checarVitoriaFrota(navios: Navio[]): boolean {
  return navios.every((navio) => navio.afundado);
}

// ================================================================
//                     🚀 EXECUÇÃO DO JOGO
// ================================================================

exibirTitulo("POSICIONANDO OS NAVIOS");

for (const navio of computadorNavios) posicionarNavioAleatorio(tabuleiroComputador, navio);

console.log("\nPosicione seus navios no tabuleiro:\n");
for (const navio of jogadorNavios) posicionarNavioJogador(tabuleiroHumano, navio);

exibirTitulo("SEU TABULEIRO INICIAL");
exibirTabuleiro(tabuleiroHumano);

let vezJogador = true;
let jogoAtivo  = true;

while (jogoAtivo) {

  // -------------------- TURNO DO JOGADOR --------------------
  if (vezJogador) {
    exibirTitulo("SEU TABULEIRO");
    exibirTabuleiro(tabuleiroHumano);

    exibirTitulo("TABULEIRO DE ATAQUE");
    exibirTabuleiro(tabuleiroNeblina);

    console.log(`\nÉ a vez de ${jogador.avatar}`);

    const linhaDigitada  = parseInt(input("Escolha a linha para atacar (1-10): "));
    const colunaDigitada = parseInt(input("Escolha a coluna para atacar (1-10): "));

    const linha  = linhaDigitada - 1;
    const coluna = colunaDigitada - 1;

    const jaAtacado = dentroDoTabuleiro(linha, coluna) &&
      (tabuleiroComputador[linha][coluna] === "X" || tabuleiroComputador[linha][coluna] === "O");

    if (isNaN(linha) || isNaN(coluna) || !dentroDoTabuleiro(linha, coluna) || jaAtacado) {
      console.log("Coordenada inválida ou você já atirou aí! Tente novamente.");
      continue;
    }

    const acertou = atacar(tabuleiroComputador, computadorNavios, linha, coluna, tabuleiroNeblina);
    console.log(acertou ? "🎯 BUM! Você acertou um navio inimigo!" : "🌊 ÁGUA! Seu tiro caiu no mar.");

    if (checarVitoriaFrota(computadorNavios)) {
      console.log(`\n🎉 PARABÉNS! ${jogador.avatar} afundou toda a frota inimiga e venceu!`);
      jogoAtivo = false;
    } else {
      vezJogador = false;
    }

  // -------------------- TURNO DO COMPUTADOR --------------------
  } else {
    console.log(`\nÉ a vez do ${computador.avatar}`);

    let alvo: Coordenada;

    if (filaDeAlvos.length > 0) {
      alvo = filaDeAlvos.shift()!;
    } else {
      do {
        alvo = {
          linha:  Math.floor(Math.random() * TAMANHO_TABULEIRO),
          coluna: Math.floor(Math.random() * TAMANHO_TABULEIRO),
        };
      } while (tabuleiroHumano[alvo.linha][alvo.coluna] === "X" || tabuleiroHumano[alvo.linha][alvo.coluna] === "O");
    }

    const acertou = atacar(tabuleiroHumano, jogadorNavios, alvo.linha, alvo.coluna);

    // Exibição (linha/coluna + 1) só para o jogador ver 1-10
    const linhaExibida  = alvo.linha + 1;
    const colunaExibida = alvo.coluna + 1;

    if (acertou) {
      adicionarVizinhos(tabuleiroHumano, alvo.linha, alvo.coluna);
      console.log(`💥 O Computador atirou em (${linhaExibida}, ${colunaExibida}) e acertou seu navio!`);
    } else {
      console.log(`🌊 O Computador atirou em (${linhaExibida}, ${colunaExibida}) e deu na água.`);
    }

    if (checarVitoriaFrota(jogadorNavios)) {
      console.log(`\n☠️ FIM DE JOGO! O Computador destruiu toda a sua frota!`);
      jogoAtivo = false;
    } else {
      vezJogador = true;
    }
  }
}
