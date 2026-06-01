# Monitoramento TDAH — App (GitHub Pages + Supabase)

App web para acompanhar a resposta ao tratamento com lisdexanfetamina.
Cada pessoa (Carol, chefe, familiares, parceiro) tem **seu próprio login**, marca as
observações na tela, tudo fica salvo numa **nuvem central** e dá pra gerar um
**relatório para o médico** com médias e gráficos.

> Você **não precisa saber programar**. É só seguir os passos na ordem.
> Tempo estimado: ~20 minutos.

---

## Visão geral (como as peças se encaixam)

- **Supabase** = a "nuvem": cuida dos logins e guarda os dados. (plano grátis)
- **GitHub Pages** = onde o app fica publicado, num link que todos acessam. (grátis)
- **Os arquivos deste projeto** = o app em si.

---

## PASSO 1 — Criar o projeto no Supabase

1. Entre em **https://supabase.com** e crie uma conta (pode usar o login do GitHub).
2. Clique em **New project**.
   - **Name:** monitoramento-tdah (ou o que quiser)
   - **Database Password:** crie uma senha forte e **guarde** (não precisa decorar).
   - **Region:** escolha *East US* (mais perto da Flórida).
3. Clique em **Create new project** e espere ~2 minutos enquanto ele prepara.

## PASSO 2 — Criar a tabela do banco de dados

1. No menu lateral do Supabase, abra **SQL Editor**.
2. Clique em **+ New query**.
3. Abra o arquivo **`schema.sql`** deste projeto, **copie tudo** e cole na caixa.
4. Clique em **Run** (ou Ctrl+Enter). Deve aparecer "Success".

## PASSO 3 — Pegar as suas chaves e desligar confirmação de e-mail

1. No menu lateral, vá em **Project Settings** (engrenagem) → **API**.
2. Copie dois valores:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** (uma chave bem longa)
3. Abra o arquivo **`config.js`** e cole os dois valores nos lugares indicados. Salve.

   ```js
   window.SUPABASE_CONFIG = {
     url: "https://xxxxx.supabase.co",
     anonKey: "a-chave-longa-aqui"
   };
   ```

4. (Importante, pra facilitar) No menu **Authentication** → **Sign In / Providers** →
   **Email**, **desligue** a opção **"Confirm email"** e salve.
   Assim cada pessoa entra na hora ao criar o acesso, sem precisar confirmar e-mail.

## PASSO 4 — Publicar no GitHub Pages

1. No GitHub, crie um **repositório novo** (botão **New**).
   - Nome: por exemplo `monitoramento`
   - Deixe **Public** e clique **Create repository**.
2. Na página do repositório, clique em **Add file → Upload files**.
3. Arraste **todos os arquivos desta pasta** (index.html, app.js, styles.css,
   config.js, schema.sql, README.md) e clique em **Commit changes**.
4. Vá em **Settings → Pages**.
   - Em **Source**, escolha **Deploy from a branch**.
   - Em **Branch**, escolha **main** e a pasta **/ (root)**. Clique **Save**.
5. Espere ~1 minuto e recarregue. Vai aparecer o link, tipo:
   **`https://SEU-USUARIO.github.io/monitoramento/`**

Pronto — esse é o link do app. 🎉

## PASSO 5 — Cada pessoa cria o próprio acesso

1. Abra o link no celular ou computador.
2. Clique em **Criar acesso**, preencha nome, "quem é você" (Carol, familiar,
   chefe, parceiro), e-mail e senha.
3. A partir daí, é só **Entrar**, marcar o dia e tocar em **Salvar registro**.

- **Carol** vê a autoavaliação completa.
- **Familiar / chefe / parceiro** veem só a ficha de observação deles.
- Cada um só edita os próprios registros, mas o **relatório** junta os de todos.

## PASSO 6 — Gerar o relatório para o médico

1. Em qualquer login, abra a aba **Relatório**.
2. Escolha o período (ex.: a última semana) e clique **Gerar**.
3. Clique em **Imprimir / PDF** → no celular/computador, escolha "Salvar como PDF".
4. É só levar/enviar pro médico.

---

## Dúvidas comuns

- **Mudei o config.js, e agora?** Suba o arquivo novo no GitHub (Add file → Upload,
  por cima do antigo) e espere ~1 min.
- **Esqueci a senha de um acesso.** No Supabase → Authentication → Users dá pra
  resetar; ou a pessoa cria um acesso novo.
- **Quero trocar/adicionar indicadores.** Eles ficam no arquivo `app.js`, na parte
  `const FORMS = {...}`. Posso te ajudar a ajustar.
- **É seguro?** Os dados ficam no seu Supabase, protegidos por login. A chave "anon"
  é pública por natureza (pode ficar no GitHub) — a proteção real vem das regras de
  segurança que o `schema.sql` ativa (cada um só mexe no que é seu).

## Aviso
Esta é uma ferramenta de acompanhamento observacional. **Não substitui** avaliação
médica, psiquiátrica ou psicológica. Combine com a equipe da Carol quais indicadores
fazem mais sentido monitorar.
