# pr0postbot 🤖

pr0postbot sendet automatisch alle neuen Posts von [pr0gramm.com](https://pr0gramm.com) an die Telegram-Chats in denen er Mitglied ist.

Built with [grammy ❤️](https://grammy.dev).

---

# Demo 🦥

Um den Bot zu benutzen, musst du nur [@pr0postbot](https://t.me/pr0postbot) direkt anschreiben, oder ihn einer Gruppe hinzufügen.

# Funktionen ⚙️
## Posts 🗒️

Mit Hilfe des .env Files kann gewählt werden, ob nur "promotete" (beliebt), oder alle (neu) Posts erfasst werden sollen.

## Filter 👀

Es kann je Chat gewählt werden, welche Content-Filter aktiv sein sollen. Dazu kann einfach der /filter command verwendet werden. In Gruppenchats ist die nur Admins erlaubt.

## SQLite 📅

Die Gruppen in denen der Bot Mitglied ist wird in einer SQLite Datenbank erfasst, um das Setup so einfach wie möglich zu halten.

Der Bot erfasst in dieser Datenbank zusätzlich jeden Post, den er auf pr0gramm gefunden hat, um keine doppelten Posts zu versenden. Die erste Suche nach dem Start des Bots löst keine Nachrichten aus, um Spam nach einer längeren Downtime zu vermeiden.

# How to start 🚀

### Installieren der Abhängigkeiten

```sh
$ yarn
```

### Konfiguration

Kopieren der Beispiel-Environmentsdatei
```sh
$ cp .env.example .env
```

Der folgende Prozess ist leider noch etwas unschön, allerdings ist ein automatischer Login wegen der Captchas nicht mehr so leicht möglich. Contributions sind aber gerne gesehen!

1. Eintragen des BOT_TOKEN, welches du vom [@botfather](https://t.me/botfather) bekommen hast.
2. Öffne [pr0gramm.com](https://pr0gramm.com) im Browser, melde dich an und wähle nach einem Rechsklick `Untersuchen`
3. Klicke auf den Reiter `Netzwerkanalyse`
4. Lade die Seite mit `F5` neu
5. Klicke auf den Eintrag, in welchem in der Spalte `Datei` der Text `get?flags=...` steht.
6. Nun siehst du einen neuen Reiter mit dem Titel `Kopfzeilen`, kopiere unter dem Punkt `Anfragekopfzeilen` den Text hinter `Cookie:`.
7. Füge diesen Text (deine Pr0gramm-Cookies) in der .env Datei in die Anführungszeichen hinter `PR0GRAMM_COOKIES` ein.

### Starten

Starte den Bot
```sh
$ yarn start
```

Stoppe den Bot mit
```
$ yarn stop
```

### Logs und monitor

Die Logs findest du per default unter `$HOME/.pm2/logs/pr0postbot-*.log`.

Nutze pm2 monit um die Aktivität deines Bots zu monitoren
```sh
$ yarn pm2 monit
```