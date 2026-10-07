# carreira-esports-web

Jogo rápido de navegador: simule sua carreira como jogador profissional no cenário competitivo de MOBA (inspirado em LoL).

Projeto de aprendizado de desenvolvimento pareado com IA (Claude Code).

## Roteiro

0. Preparação (repo, git, arquivo de decisões) ✅
1. Conceito ✅
2. Jogo e jogabilidade → MVP definido ✅
3. Planejamento técnico + esqueleto publicado (em andamento)
4. Desenvolvimento em fatias (implementa → testa → publica)
5. Playtest final
6. Lançamento

Decisões ficam em [docs/conceito.md](docs/conceito.md). Elas podem ser refinadas ao longo do processo.

## Jogar

https://anscarpetta.github.io/carreira-esports-web/

## Rodar localmente

Requer Node 24 (`nvm use` lê o `.nvmrc`).

```bash
npm install
npm run dev        # servidor de desenvolvimento
npm test           # testes do motor
npm run lint       # verificação de código
npm run build      # build de produção em dist/
```

Organização do código e decisões técnicas: [docs/tecnico.md](docs/tecnico.md).
