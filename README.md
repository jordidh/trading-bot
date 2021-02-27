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

```
# vim config/config.json 
{
    "APP_PORT_HTTPS": "XXXX",
    "APP_CERT_KEY": "/certs/certs/trading-bot.key",
    "APP_CERT_CERT": "/certs/certs/trading-bot.crt",
    "TELEGRAM": {
        "USER_ID": "XXXXXXXXX",
        "BOT": "xxxxxxxxxxxxx",
        "TOKEN": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    "EXCHANGE_KRAKEN": {
        "API_KEY": "xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "API_SECRET": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    }
}
```

Ves a tradingview.com i configura un missatge i que faci un post al bot

## Crea el servie de l'aplicació amb PM2
```
# pm2 list
# NODE_ENV=production pm2 start ./bin/www --name TRADING-BOT-JORDI
# pm2 save
```


## Redirecciona l'nginx
trading bot: escoltant https://localhost:4401

per poder cridar-lo amb https, s'ha de crear una redirecció a nginx
de https://IP/trading/jordi a https://localhost:4401


configuració nginx (/etc/nginx/sites-available/default)
```
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    include snippets/letsencrypt.conf;
    include snippets/ssl-params.conf;

    server_name name.domain.com www.name.domain.com;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;

    # Redireccionem a onion-maintenance-web que escolta per http://localhost:8080
    location / {
        auth_basic         "Secure Area";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass         http://localhost:8080/;
        proxy_redirect     off;
        proxy_set_header   Host             $host;
        proxy_set_header   X-Real-IP        $remote_addr;
        proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
    }


    # bots de trading
    location /trading/jordi {
        proxy_pass         http://localhost:4401/;
        proxy_redirect     off;
        proxy_set_header   Host             $host;
        proxy_set_header   X-Real-IP        $remote_addr;
        proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
    }

}

# redireccionem a HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name name.domain.com www.name.domain.com;
    #location /.well-known/acme-challenge/9001 {
    #    root /var/www/html;
    #}
    location /.well-known/ {
        root /var/www/html;
        auth_basic "off";
    }
    location / {
        return 302 https://$server_name$request_uri;
    }
}
```