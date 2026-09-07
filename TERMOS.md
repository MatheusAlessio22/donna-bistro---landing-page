# 🎨 Guia de Termos de Design & Visual para Prompts de Landing Pages

> Use este guia como referência para criar prompts precisos e profissionais
> para geração de landing pages com IA (v0, Cursor, Bolt, Lovable, Framer, etc.)

---

## 1. Estilos Visuais & Estéticas

| Termo | Descrição | Melhor para |
| --- | --- | --- |
| **Swiss / International** | Grids sistemáticos, tipografia ultra limpa, máximo whitespace | SaaS, consultorias, B2B |
| **Minimalista** | Restrição de elementos, foco no essencial, paleta limitada | Startups, portfólios, premium |
| **Neobrutalista** | Raw, bold, confrontacional, bordas duras, cores vibrantes | Criativos, agências, D2C |
| **Glassmorphism** | Camadas translúcidas, blur de fundo, profundidade | Fintech, apps, tech |
| **Dark Mode First** | Fundo escuro, alto contraste, elegância noturna | Gaming, crypto, dev tools |
| **Corporate Professional** | Confiança, estabilidade, refinamento, tons sóbrios | Jurídico, saúde, finanças |
| **Luxury Minimal** | Restrição premium, tipografia serif, dourado/pretos | Moda, joias, imobiliário |
| **Tech Forward** | Inovador, limpo, futurista, gradientes sutis | IA, blockchain, SaaS |
| **Editorial** | Inspirado em revistas, tipografia sofisticada, editorial | Mídia, cursos, newsletters |
| **Organic / Fluid** | Formas orgânicas, curvas naturais, blobs suaves | Saúde, bem-estar, food |
| **Retro-futurista** | Visão dos anos 80 do futuro, nostalgia refinada | Criativos, gaming, música |
| **Bauhaus** | Geometria simples, formas primárias, função > forma | Design, arquitetura, educação |
| **Japandi** | Fusão japonesa-nórdica, zen, minimalismo quente | Spa, lifestyle, arquitetura |
| **Kinetic** | Movimentação como elemento central, dinâmico mas controlado | Eventos, apps, entretenimento |
| **Gradient Modern** | Transições de cor sofisticadas, profundidade via gradientes | SaaS, fintech, startups |
| **Typography First** | Tipografia como herói, letterforms como design | Criativos, editoras, agências |
| **Metropolitan** | Sofisticação urbana, profundidade cultural | Imobiliário, turismo, lifestyle |
| **Neo-Geo** | Padrões geométricos refinados, beleza matemática | Tech, design, arquitetura |

---

## 2. Animações & Motion Design

### 2.1 Termos de Animação para Prompts

| Termo | O que descrever no prompt | Exemplo de uso |
| --- | --- | --- |
| **Fade in on scroll** | Elementos aparecem com opacidade 0→1 ao entrar no viewport | Seções de features |
| **Staggered entrance** | Múltiplos elementos animam em sequência (delay escalonado) | Grids de cards, listas |
| **Parallax scrolling** | Camadas se movem em velocidades diferentes ao scroll | Hero sections, storytelling |
| **Scroll-triggered reveal** | Animação disparada por posição do scroll | Transições entre seções |
| **Scrollytelling** | Narrativa guiada pelo scroll, cinematográfica | Storytelling, produto |
| **Microinteractions** | Animações pequenas de feedback (hover, click, tap) | Botões, inputs, ícones |
| **Marquee loop** | Rolagem infinita de logos, depoimentos ou texto | Social proof, CTA |
| **Hover transform** | Scale, lift, ou highlight ao passar o mouse | Cards, botões, links |
| **Border beam effect** | Borda animada sutil em cards ou CTAs | Cards de pricing |
| **Floating / levitation** | Elemento flutua suavemente (translateY oscilação) | Mockups, dispositivos |
| **Text reveal / kinetic typography** | Texto aparece com animação (clip, slide, mask) | Headlines, hero |
| **Cursor-follow** | Elemento segue ou reage ao cursor | Hero, backgrounds |
| **Magnetic button** | Botão "puxa" o cursor na direção dele | CTAs premium |
| **Pulse / glow** | Efeito de brilho pulsante no CTA | Botões de conversão |
| **Scale on scroll** | Elemento cresce/diminui conforme o scroll | Imagens, produtos |
| **Page transition** | Transição suave entre "páginas" ou seções | Single-page apps |
| **Particle background** | Partículas animadas no fundo | Tech, gaming, crypto |
| **Gradient shift** | Gradiente que muda de cor lentamente | Hero backgrounds |
| **Typewriter effect** | Texto aparece como se estivesse sendo digitado | Dev tools, terminal |
| **3D tilt / perspective** | Elemento inclina em 3D ao hover | Cards, mockups |
| **Lottie animation** | Animação vetorial leve (JSON) | Onboarding, empty states |

### 2.2 Parâmetros Técnicos para Prompts de Animação

```text
- Duration: 150ms (micro) / 300ms (padrão) / 500ms (destaque) / 800ms+ (cinematográfico)
- Easing: easeOut (entrada), easeIn (saída), easeInOut (transição), spring (orgânico)
- Trigger: on-mount, on-scroll, on-hover, on-click, on-view
- Property: opacity, translateY, scale, rotate, clip-path, transform
- Delay: 100ms por item em stagger
```
