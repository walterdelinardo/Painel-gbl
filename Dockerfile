# -- Etapa de Construção (Build Stage) --
FROM node:22-alpine AS builder

# Definir o diretório de trabalho
WORKDIR /app

# Copiar os arquivos de manifesto do pacote
COPY package.json pnpm-lock.yaml ./

# Instalar as dependências do pnpm
RUN npm install -g pnpm && pnpm install

# Copiar o restante do código-fonte
COPY . .

# Construir a aplicação para produção
RUN pnpm run build

# -- Etapa de Servir (Serve Stage) --
# Usar uma imagem base Nginx leve para servir os arquivos estáticos
FROM nginx:alpine

# Remover a configuração padrão do Nginx
RUN rm -rf /etc/nginx/conf.d

# Copiar a configuração personalizada do Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copiar os arquivos de construção da etapa 'builder' para o Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expor a porta 80 do Nginx
EXPOSE 80

# Comando padrão para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
