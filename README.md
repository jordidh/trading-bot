# Instal·lació

Instal·la en un servidor amb IP estàtica per permetre que el tradingview.com faci posts
o, si no és possible, activa el ngrok del app.js

## Desplegament
Desplega la solució:
```
$ sudo su
# /var/lib/trading
# git pull https://github.com/jordidh/trading-bot.git
# cd trading-bot
# npm install
# cp config/config-example.json config/config.json 
# cd certs
/var/lib/trading/trading-bot/certs # sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./certs/telegram-bot.key -out ./certs/telegram-bot.crt
/var/lib/trading/trading-bot/certs # sudo openssl dhparam -out ./certs/telegram-bot.pem 4096
```

## Configura l'aplicació

Crea el nou bot a telegram: 
1. Obre el telegram
2. Busca el BotFather
3. /newbot
4. Posar-li un nom: xxxxxxxxx
5. Posar-li un usrername: xxxxxxxxxbot
6. Copia el token del bot i guarda'l en un lloc segur

Esbrina l'id de l'usuari de telegram (el que rebrà els missatges del bot)
1. Busca el bot que s'ha creat
2. Entra el text /start
3. Consulta el log de l'aplicació, cerca el text "Telegram user id ="
4. Apunta l'id en el fitxer de configuració

Crea a Kraken API i guarda les claus
1. Ves a "My Account", Jordi > Security > API
2. Add key
3. Marcar: "Order & Trades", "Other" i de "Funds" "Query funds"
4. Apunta la API al fitxer de configuració
5. Guarda-la en un lloc segur

# vim config/config.json 
{
    "APP_PORT_HTTPS": "XXXX",
    "APP_CERT_KEY": "/certs/certs/trading-bot.key",
    "APP_CERT_CERT": "/certs/certs/trading-bot.crt",
    "TELEGRAM": {
        "TELEGRAM_USER_ID": "XXXXXXXXX",
        "BOT": "xxxxxxxxxxxxx",
        "TOKEN": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    "EXCHANGE_KRAKEN": {
        "API_KEY": "xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "API_SECRET": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    }
}

## Crea el servie de l'aplicació amb PM2
```
# pm2 list
# NODE_ENV=production pm2 start ./bin/www --name TRADING-BOT-JORDI
# pm2 save
```