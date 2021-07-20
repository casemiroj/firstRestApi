// Importação de módulos
const http = require('http'); // Criar servidor HTTP
const { URL } = require('url') // Separar Query params do endpoint

const bodyParser = require('./helpers/bodyParser')
const routes = require('./routes') // Rotas da aplicação

// Criação do servidor
const server = http.createServer((request, response) => {
  const parsedUrl = new URL(`http://localhost:3000${request.url}`)

  console.log(`Request method: ${request.method} | Endpoint: ${parsedUrl.pathname}`)
  
  let { pathname } = parsedUrl

  let id = null

  const splitEndpoint = pathname.split('/').filter(Boolean)
  
  if (splitEndpoint.length > 1) {
    pathname = `/${splitEndpoint[0]}/:id`
    id = splitEndpoint[1]
  }

  // Verifica se existe a rota
  const route = routes.find((routeObj) => (
    routeObj.endpoint === pathname && routeObj.method === request.method
  ));

  // Se existir rota, chama-la, senão ir para tela 404
  if(route) {
    request.query = Object.fromEntries(parsedUrl.searchParams); // Para acessar os query params
    request.params = { id }

    response.send = (statusCode, body) => {
      response.writeHead(statusCode, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify(body))
    }

    if(['POST', 'PUT', 'PATCH'].includes(request.method)){
      bodyParser(request, () => route.handler(request, response))
    } else {
      route.handler(request, response);
    }
  } else {
    response.writeHead(404, { 'Content-Type': 'text/html' });
    response.end(`Cannot ${request.method} ${parsedUrl.pathname}`);
  }
});

// Subir servidor
server.listen(3000, () => console.log('Server started at http://localhost:3000'));