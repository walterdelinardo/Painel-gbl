# Stage 1: Build da aplicação
FROM node:18-alpine AS build-stage

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de configuração do Node (package.json e afins)
COPY package*.json ./

# Instala as dependências da aplicação
RUN npm install

# Copia todo o código da aplicação para o contêiner
COPY . .

# Constrói a aplicação, gerando os arquivos estáticos na pasta 'dist'
RUN npm run build

# Stage 2: Servindo a aplicação com Nginx
FROM nginx:1.24-alpine as production-stage

# Copia o arquivo de configuração do Nginx da sua aplicação (se você tiver)
# Se você não tiver um arquivo 'nginx.conf', pode remover esta linha.
# O arquivo nginx.conf que você mostrou na imagem pode ser usado aqui.
COPY nginx.conf /etc/nginx/nginx.conf

# Remove o arquivo de configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a configuração do Nginx para servir a aplicação
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos construídos na etapa anterior para o Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# A porta que o Nginx está exposto
EXPOSE 80

# Comando para iniciar o servidor Nginx
