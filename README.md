<p align="center">
  <img src="assets/logo-visionmove.png" alt="Logo do VisionMove" width="280">
</p>

<h1 align="center">VisionMove — Site Oficial</h1>

<p align="center">
  Tecnologia assistiva, acessibilidade e mais autonomia na mobilidade urbana.
</p>

<p align="center">
  <a href="https://visionmove.vercel.app/">Acessar o site</a> ·
  <a href="https://visionmove.vercel.app/equipe">Conhecer a equipe</a> ·
  <a href="https://www.figma.com/proto/ZhrhRjyIqRE3wgoHcn9NU9/VisionMove-%E2%80%94-Prototipa%C3%A7%C3%A3o-e-Fluxograma?node-id=204-159&page-id=2%3A4&starting-point-node-id=204%3A106">Explorar o protótipo</a>
</p>

---

## Sobre o VisionMove

O **VisionMove** é um projeto de tecnologia assistiva voltado a pessoas cegas ou com baixa visão. A proposta é desenvolver um aplicativo mobile conectado a uma câmera portátil, presa à roupa ou mochila, para analisar o ambiente com inteligência artificial e comunicar possíveis obstáculos por meio de alertas sonoros.

O objetivo é oferecer **apoio complementar à mobilidade**, sem substituir a bengala, a orientação e mobilidade ou outros recursos de segurança.

> **Status do projeto:** o aplicativo está em desenvolvimento. O protótipo e os exemplos apresentados no site demonstram a experiência planejada; não representam uma solução de detecção em tempo real já validada.

## O que você encontra no site

- **O desafio:** contexto sobre barreiras à mobilidade urbana e acessibilidade.
- **Nossa solução:** apresentação do funcionamento proposto para o VisionMove.
- **Protótipo navegável:** acesso à experiência interativa criada no Figma.
- **Feedback e novidades:** formulários para sugestões privadas e registro de interesse em acompanhar o projeto.
- **Nossa equipe:** apresentação dos integrantes que participam da iniciativa.

O site foi desenvolvido com atenção à **responsividade**, à **navegação por teclado**, à **legibilidade** e à **acessibilidade dos formulários**.

## Tecnologias

| Tecnologia | Utilização |
| --- | --- |
| **HTML5** | Estrutura semântica das páginas |
| **CSS3** | Estilo, identidade visual e responsividade |
| **JavaScript** | Navegação, interações e formulários |
| **Vercel** | Hospedagem e função de API |
| **Supabase** | Edge Function e armazenamento privado de feedbacks e inscrições |
| **Figma** | Protótipo navegável da proposta |

## Estrutura do repositório

```text
visionmove-site/
├── index.html                # Página inicial
├── equipe.html               # Página da equipe
├── style.css                 # Estilos e layout responsivo
├── site.js                   # Navegação e interações da interface
├── participacao.js           # Modais e envio dos formulários
├── api/
│   └── participar.js         # Encaminhamento dos formulários ao Supabase
├── supabase/
│   └── functions/
│       └── visionmove-participar/
│           └── index.ts      # Processamento dos envios
├── assets/                   # Logo, favicon, imagens e fotos da equipe
└── vercel.json               # Configuração da publicação
```

## Votação pública do Demoday

O convite de votação do VisionMove já está **visível automaticamente**, inclusive enquanto o endereço oficial ainda não foi divulgado. O botão **VOTAR NO VISIONMOVE** aparece desativado, com uma explicação. Quando houver link, o botão passará a abrir o formulário oficial em outra aba.

Quando receber o link, abra `votacao-config.js` e preencha a propriedade `url`:

```js
window.VISIONMOVE_VOTACAO = Object.freeze({
  enabled: true,
  url: "https://LINK-OFICIAL-DA-VOTACAO",
  qrImage: "" // opcional: "assets/qr-votacao.png" ou URL HTTPS da imagem
});
```

Substitua o exemplo pela URL real do evento. Não é necessário alterar `enabled`, pois já está `true`. Se receber um QR Code como imagem, faça upload em `assets/` e preencha `qrImage`. Se não tiver QR Code, deixe vazio — o botão com link funciona no celular.

- **Abertura automática:** uma vez por sessão de navegação, com ou sem URL, e pode ser reaberto pelo botão fixo "Votação pública".
- **Ao receber o link:** visitantes que já viram a versão "em breve" podem receber o modal novamente para a votação ativa.
- **Pré-visualização:** `https://visionmove.vercel.app/?preview-votacao=1` abre o modal mesmo se já foi visto na sessão.
- **Depois do evento:** alterar `enabled` para `false` para desativar o convite.
- **Acessibilidade:** diálogo nativo com foco, botão de fechar, tecla Esc, opção de continuar no site e descrição do link externo.
- **Resultado:** a votação ocorre no serviço externo oficial, e o VisionMove não coleta votos neste site.

Arquivos responsáveis: `index.html`, `equipe.html`, `style.css`, `votacao.js`, `votacao-config.js`.

## Privacidade e participação

As mensagens de feedback **não são publicadas no site**. Os formulários enviam os dados por uma API no Vercel para uma função no Supabase; as credenciais privadas de acesso ao banco de dados não fazem parte do código do navegador.

O cadastro para receber novidades é opcional e solicita o consentimento do interessado. **Este site não realiza disparos automáticos de e-mails.**

## Créditos

**Desenvolvimento do site:** [Davyson William](https://www.linkedin.com/in/davysonwss/).

**Projeto VisionMove:** desenvolvido em equipe. Conheça os integrantes na [página oficial da equipe](https://visionmove.vercel.app/equipe).

---

<p align="center">
  <strong>VisionMove</strong> · Desenvolvido com propósito, tecnologia e inclusão.
</p>
