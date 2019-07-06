# ObserverBot

Uses a headless chrome instance to monitor entries on a website of your choice.


## Instructions 
Install dependencies.
```shell
npm install
```

Fill the [config.json file](config.json). See instructions on how to setup the email notifications below. 

Run server in the background using [pm2](http://pm2.keymetrics.io/).
```shell
npm run server
```


Stop server
```shell
npm run stop
```


## Email setup
To setup email notifications got to  [google api quickstart manual](https://developers.google.com/gmail/api/quickstart/nodejs) and click on "enable gmail api". Copy contents of the credentials.json file into the gmail section of the provided [config.json file](config.json). 

On the first run you will then be asked to authorize the app via a link. Go throught the setup process and paste the code you get into the console. After that, the token will stay valid forever. Unless you revoke access over your google account. 


