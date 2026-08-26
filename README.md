# For Loreni ❤️ — setup guide

This is a step-by-step guide written for someone who has never deployed a
website before. Follow it in order. It should take about 15–20 minutes.

## What you have

```
loreni-love/
│
├── index.html        (the page structure)
├── style.css          (all the visual design)
├── script.js           (all the interactivity — scenes, cat animations, age calculator, etc.)
├── package.json
│
└── api/
    └── submit.js       (the secret backend that sends her answers to your Telegram)
```

`api/submit.js` runs on the server, not in her browser — that's the only
place your Telegram bot token ever lives.

---

## Step 1 — Create your Telegram bot

1. Open Telegram and search for **@BotFather** (the blue verified checkmark, official Telegram account).
2. Send it `/newbot`.
3. Give your bot a name (anything, e.g. "Loreni Love Letter").
4. Give it a username ending in `bot` (e.g. `loreni_love_bot`).
5. BotFather will reply with a **token** — a long string like `123456789:AAExampleTokenDoNotShare`.

⚠️ **Do not send this token to anyone, and never paste it into the website's HTML/CSS/JS files.** You'll only put it into Vercel's environment variables in Step 5.

## Step 2 — Get your Telegram chat ID

1. In Telegram, search for **@userinfobot** and open a chat with it.
2. Send it any message (e.g. "hi").
3. It will reply with your account info, including a field called **Id** — that's your `TELEGRAM_CHAT_ID`. It's a number, e.g. `987654321`.
4. Separately, open a chat with **your own new bot** (search its username) and send it `/start` once. This lets the bot message you — Telegram bots can't message someone who hasn't started a conversation with them first.

## Step 3 — The project files

You already have everything you need in this folder. No changes are required to make it work — but if you want to personalize it further, open `script.js` and edit the constants at the very top:

```js
const GIRLFRIEND_NAME = "Loreni";
const MAX_NO_ATTEMPTS = 7;
const FINAL_MESSAGE = [ ...edit these lines... ];
const COLOR_OPTIONS = [ ...edit these colors... ];
```

## Step 4 — Deploy with Vercel (easiest option)

1. Go to **vercel.com** and sign up (you can sign up with GitHub, GitLab, or just an email).
2. Once logged in, click **Add New → Project**.
3. Choose **"Deploy without Git"** / **"Upload"** if offered — or, if you're comfortable with GitHub, create a new repo, push these files to it, and import that repo into Vercel instead (either works fine).
   - If uploading directly: drag the whole `loreni-love` folder in.
4. Vercel will detect the `api/` folder automatically and treat `submit.js` as a serverless function. You don't need to configure anything else.
5. **Before clicking Deploy**, go to the **Environment Variables** section of the project setup (Step 5 below covers exactly what to enter).
6. Click **Deploy**. Wait ~30–60 seconds.
7. Vercel will give you a live URL like `https://loreni-love.vercel.app`. That's the link you send her.

## Step 5 — Add your environment variables

In the Vercel project: **Settings → Environment Variables**, add two entries:

| Name | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | the token from BotFather (Step 1) |
| `TELEGRAM_CHAT_ID` | your chat ID (Step 2) |

Save both, then **redeploy** the project (Vercel → Deployments → ⋯ → Redeploy) so the function picks up the new variables. These values stay private on Vercel's servers — they are never sent to her browser.

## Step 6 — Test before sending it to her

Open your live URL yourself and:

- [ ] Confirm the envelope opens and the letter appears
- [ ] Fill in fake answers (nickname, color, food, song, likes/dislikes)
- [ ] Pick a birthday on the age calculator and confirm the age looks right
- [ ] Try the "Do you love me?" NO button a few times, then tap YES
- [ ] Try tapping the moving NO button on the "Will you stay with me?" question — confirm it runs away smoothly and eventually gets "captured"
- [ ] Pet the cat a few times
- [ ] Fill in the memory question
- [ ] Finish the experience (tap YES on the final question)
- [ ] Check your Telegram — you should receive a message titled **"LORENI FINISHED THE LOVE LETTER"** with everything you entered
- [ ] Open the site on your phone and check that everything is readable and tappable (it's built mobile-first, but always worth a real check)
- [ ] Clear your test data: open your browser's dev tools → Application/Storage → clear `localStorage` for the site (or just open it in a private/incognito window) so her run starts fresh

Once all of that checks out, send her the link. 🐈❤️

---

## How her answers reach your phone

When she finishes the last question, the page sends her answers (in JSON)
to `/api/submit` on your deployed site. That serverless function reads
your `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` from Vercel's environment
variables (never from the browser), formats a message, and calls
Telegram's `sendMessage` API. You get a message in your bot's chat with
everything she entered. If anything goes wrong on the backend (bad
connection, Telegram hiccup), she never sees a scary error — she just sees
"the cat got distracted... but you're done ❤️" while the real error is
logged on Vercel's side for you to check later (Vercel → your project →
Logs).

## Changing things later

- **Questions/copy:** open `script.js`, find the relevant `scene...`
  function (they're named clearly, e.g. `sceneNickname`, `sceneAgeCalc`,
  `sceneDoYouLoveMe`), and edit the text inside.
- **Final message:** edit the `FINAL_MESSAGE` array near the top of
  `script.js` — each string in the array becomes its own paragraph.
- **Colors offered to her:** edit `COLOR_OPTIONS`.
- **Visual style (fonts, colors, spacing):** everything lives in
  `style.css`, driven by the `:root` variables at the top of the file.
- After any edit, redeploy on Vercel (it auto-redeploys if connected to
  GitHub, or you re-upload if you deployed manually).
