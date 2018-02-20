# certification-app

Con este proyecto queremos mostrarte una forma de registrar certificados en la blockchain de Ethereum. En la carpeta 'truffle' tienes el Smart Contract que hemos desarrollado contemplado un caso de uso mas complejo para darte una pequeña muestra de hasta donde puedes llegar escribiendo contratos con Solidity.

Además tienes la libertad de modificar el código y desplegarlo para lanzar tus pruebas.

## Empezando

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Para poder ejecutar este proyecto vas a necesitar instalar la última versión estable de [NodeJS](https://nodejs.org/), tener un navegador [Chrome](https://www.google.com/chrome/browser/desktop/index.html) e instalar en él la extensión [Metamask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn).

Además si vas a querer compilar el Smart Contract de prueba te recomendamos que uses la librería [truffle](https://github.com/trufflesuite/truffle) 

```
$ npm install -g truffle
```

[Aquí](https://www.youtube.com/watch?v=Wc8pV3C8DGs) te dejamos un video introductorio sobre como usar truffle

Además si vas a ejecutar el proyecto en un Windows va a ser necesario que te instales el siguiente paquete:
```
$ npm install -g truffle windows-build-tools
```


### Instalación

Para arrancar el proyecto solo ejecuta en la carpeta raíz de este:

```
npm install
npm start
```

La ventana de login es solo una muestra, puedes acceder poniendo cualquier correo y cualquier contraseña. :wink:

**Importante:** Asegurate de estar conectado a la red Ropsten en tu extensión MetaMask.