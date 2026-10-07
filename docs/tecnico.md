# Planejamento técnico (fase 3)

Status: **decidido** (aprovado pelo Angelo em out/2026).

## Princípios

1. **O motor é separado da interface.** Toda a lógica da carreira (OVR, splits, transferências, eventos) fica em TypeScript puro, sem nada de interface. A interface só mostra o estado e envia as decisões. Assim o motor pode ser testado sozinho e rodado milhares de vezes para calibrar.
2. **Determinismo.** O sorteio usa uma semente fixa, como no Copero: a mesma semente e as mesmas decisões produzem a mesma carreira. Isso facilita reproduzir bugs e escrever testes.
3. **Estado imutável.** `estado + decisão → novo estado`. Cada decisão também gera um registro de eventos, que alimenta a trajetória e o resumo.
4. **Copiamos o design do Copero, não o código.** O código dele foi lido para entender as regras do jogo. O nosso é escrito do zero.
5. **Idioma:** nomes no código (variáveis, funções, tipos) em inglês, que é o padrão de mercado. Comentários, textos da interface e documentação em português.

## Tecnologias

| Peça | Escolha | Por quê |
|---|---|---|
| Linguagem | **TypeScript** | Os tipos pegam erros cedo, o que ajuda muito num motor cheio de regras |
| Interface | **React** | É o que o Copero usa, tem o maior ecossistema e muito material para aprender |
| Build | **Vite** | Rápido, simples e padrão de mercado |
| Estilo | **Tailwind CSS** | O Copero também usa; dá agilidade para montar telas |
| Testes | **Vitest** | Integrado ao Vite; testa o motor sem navegador |
| Runtime local | **Node 24** (nvm), fixado em `.nvmrc` | Já está instalado no WSL |
| Lint | **oxlint** | Já vem no template atual do Vite e é muito rápido |
| Salvamento | `localStorage` | Guarda a carreira em andamento e a última identidade, no próprio navegador |

## Estrutura de pastas

```
src/
  engine/   motor do jogo (TypeScript puro, sem React)
  data/     ligas, times, troféus (JSON)
  ui/       telas e componentes React
public/
  assets/   logos, fotos e troféus (todos trocáveis, ver a decisão de IP)
scripts/
  simulate.ts  simulação em massa para calibrar a distribuição de sucesso
```

## Hospedagem e CI

- **GitHub Pages:** grátis, porque o repositório é público. Fica tudo no GitHub, sem conta nova.
  - Endereço: `https://anscarpetta.github.io/carreira-esports-web/`
- **GitHub Actions:**
  - **Em todo PR:** testes e build. Se algo quebrar, o PR acusa.
  - **No merge para a `main`:** publicação automática no Pages. Cada fatia vai para o ar sozinha.
- **Alternativa considerada:** Vercel ou Cloudflare Pages, que geram um link de prévia para cada PR (ótimo para playtest antes do merge). Exige uma conta nova. Dá para migrar depois, se fizer falta.

## Esqueleto (entrega da fase 3)

Um PR com:
1. Projeto Vite + React + TypeScript + Tailwind + Vitest.
2. A tela de **Intro** (título, os 3 modos, botão "Começar"), ainda sem levar a lugar nenhum, e o aviso de não afiliação.
3. O primeiro pedaço do motor: o **gerador de números aleatórios com semente**, com testes.
4. O CI rodando testes e build, e o deploy automático no Pages.

**Critério de pronto:** o link público abre a Intro, e o CI fica verde.
