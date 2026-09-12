const input = require("prompt-sync")();

interface Jogador {
  avatar: string;
  pontos: number;
}

const jogador: Jogador = { avatar: "", pontos: 0 };
const computador: Jogador = { avatar: "Computador", pontos: 0 };

jogador.avatar = input("Digite o nome do seu avatar: ");

// ---------- Tabuleiros e Inicializações ----------
const tabuleiroHumano: string[][] = Array.from({ length: 10 }, () =>
  Array(10).fill(" ")
);
const tabuleiroComputador: string[][] = Array.from({ length: 10 }, () =>
  Array(10).fill(" ")
);

interface Navio {
  nome: string;
  tamanho: number;
  posicoes: { linha: number; coluna: number }[];
  afundado: boolean;
}

const jogadorNavios: Navio[] = [
  { nome: "Porta-Aviões", tamanho: 5, posicoes: [], afundado: false },
  { nome: "Encouraçado", tamanho: 4, posicoes: [], afundado: false },
];
const computadorNavios: Navio[] = [
  { nome: "Porta-Aviões", tamanho: 5, posicoes: [], afundado: false },
  { nome: "Encouraçado", tamanho: 4, posicoes: [], afundado: false },
];

// ================= FUNÇÕES =================

function exibirTabuleiro(tabuleiro: string[][]): void {
  console.log("   0 1 2 3 4 5 6 7 8 9");
  for (let i = 0; i < 10; i++) {
    console.log(`${i} | ${tabuleiro[i].join(" | ")} |`);
  }
}

function posicaoValida(
  tabuleiro: string[][],
  linha: number,
  coluna: number,
  tamanho: number,
  direcao: "H" | "V"
): boolean {
  if (direcao === "H") {
    if (coluna + tamanho > 10) return false;
    for (let i = 0; i < tamanho; i++) {
      if (tabuleiro[linha][coluna + i] !== " ") return false;
    }
  } else {
    if (linha + tamanho > 10) return false;
    for (let i = 0; i < tamanho; i++) {
      if (tabuleiro[linha + i][coluna] !== " ") return false;
    }
  }
  return true;
}

function posicionarNavio(
  tabuleiro: string[][],
  navio: Navio,
  linha: number,
  coluna: number,
  direcao: "H" | "V"
): void {
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

function posicaoAleatoria(tamanho: number): {
  linha: number;
  coluna: number;
  direcao: "H" | "V";
} {
  const linha = Math.floor(Math.random() * 10);
  const coluna = Math.floor(Math.random() * 10);
  const direcao: "H" | "V" = Math.random() < 0.5 ? "H" : "V";
  return { linha, coluna, direcao };
}

function posicionarNavioAleatorio(tabuleiro: string[][], navio: Navio): void {
  let posicao: { linha: number; coluna: number; direcao: "H" | "V" };

  do {
    posicao = posicaoAleatoria(navio.tamanho);
  } while (
    !posicaoValida(
      tabuleiro,
      posicao.linha,
      posicao.coluna,
      navio.tamanho,
      posicao.direcao
    )
  );

  posicionarNavio(
    tabuleiro,
    navio,
    posicao.linha,
    posicao.coluna,
    posicao.direcao
  );
}

function posicionarNavioJogador(tabuleiro: string[][], navio: Navio): void {
  let linha: number;
  let coluna: number;
  let direcao: "H" | "V";

  do {
    linha = parseInt(
      input(`Digite a linha para posicionar o ${navio.nome} (0-9): `)
    );
    coluna = parseInt(
      input(`Digite a coluna para posicionar o ${navio.nome} (0-9): `)
    );
    direcao = input(
      `Digite a direção para posicionar o ${navio.nome} (H/V): `
    ).toUpperCase() as "H" | "V";

    if (!posicaoValida(tabuleiro, linha, coluna, navio.tamanho, direcao)) {
      console.log("Posição inválida! Tente novamente.\n");
    }
  } while (!posicaoValida(tabuleiro, linha, coluna, navio.tamanho, direcao));

  posicionarNavio(tabuleiro, navio, linha, coluna, direcao);
}

function atacar(
  tabuleiro: string[][],
  navios: Navio[],
  linha: number,
  coluna: number
): boolean {
  if (tabuleiro[linha][coluna] === "N") {
    tabuleiro[linha][coluna] = "X"; // acerto
    return true;
  }
  tabuleiro[linha][coluna] = "O"; // água
  return false;
}

function checarVitoriaFrota(tabuleiro: string[][]): boolean {
  return !tabuleiro.some((linha) => linha.includes("N"));
}

// ================= EXECUÇÃO =================

console.log("=== POSICIONANDO OS NAVIOS ===\n");

for (const navio of computadorNavios) {
  posicionarNavioAleatorio(tabuleiroComputador, navio);
}

console.log("Posicione seus navios no tabuleiro:\n");
for (const navio of jogadorNavios) {
  posicionarNavioJogador(tabuleiroHumano, navio);
}

console.log("\n=== SEU TABULEIRO INICIAL ===");
exibirTabuleiro(tabuleiroHumano);

let vezJogador: boolean = true;
let jogoAtivo: boolean = true;

while (jogoAtivo) {
  if (vezJogador) {
    console.log(`\n--- SEU TABULEIRO ---`);
    exibirTabuleiro(tabuleiroHumano);

    console.log(`\nÉ a vez de ${jogador.avatar}`);
    let linha: number = parseInt(input("Escolha a linha para atacar (0-9): "));
    let coluna: number = parseInt(input("Escolha a coluna para atacar (0-9): "));

    if (
      isNaN(linha) ||
      isNaN(coluna) ||
      linha < 0 ||
      linha > 9 ||
      coluna < 0 ||
      coluna > 9 ||
      tabuleiroComputador[linha][coluna] === "X" ||
      tabuleiroComputador[linha][coluna] === "O"
    ) {
      console.log("Coordenada inválida ou você já atirou aí! Tente novamente.");
      continue;
    }

    let acertouJogador: boolean = atacar(
      tabuleiroComputador,
      computadorNavios,
      linha,
      coluna
    );

    if (acertouJogador) {
      console.log("🎯 BUM! Você acertou um navio inimigo!");
    } else {
      console.log("🌊 ÁGUA! Seu tiro caiu no mar.");
    }

    // Checa se o Jogador Venceu
    if (checarVitoriaFrota(tabuleiroComputador)) {
      console.log(`\n🎉 PARABÉNS! ${jogador.avatar} afundou toda a frota inimiga e venceu!`);
      jogoAtivo = false;
    } else {
      vezJogador = false;
    }
  } else {
    console.log(`\nÉ a vez do ${computador.avatar}`);
    let linhaComp: number;
    let colunaComp: number;

    do {
      linhaComp = Math.floor(Math.random() * 10);
      colunaComp = Math.floor(Math.random() * 10);
    } while (
      tabuleiroHumano[linhaComp][colunaComp] === "X" ||
      tabuleiroHumano[linhaComp][colunaComp] === "O"
    );

    let acertouComputador: boolean = atacar(
      tabuleiroHumano,
      jogadorNavios,
      linhaComp,
      colunaComp
    );

    if (acertouComputador) {
      console.log(
        `💥 O Computador atirou em (${linhaComp}, ${colunaComp}) e acertou seu navio!`
      );
    } else {
      console.log(
        `🌊 O Computador atirou em (${linhaComp}, ${colunaComp}) e deu na água.`
      );
    }

    // Checa se o Computador Venceu
    if (checarVitoriaFrota(tabuleiroHumano)) {
      console.log(`\n☠️ FIM DE JOGO! O Computador destruiu toda a sua frota!`);
      jogoAtivo = false;
    } else {
      vezJogador = true;
    }
  }
}
