# Usar uma imagem base oficial do Python para a construção
FROM python:3.12-slim

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copiar os arquivos de requisitos do backend e instalá-los
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante do código da aplicação para o diretório de trabalho
COPY . .

# Expor a porta em que o Gunicorn será executado
EXPOSE 5000

# Comando para iniciar o servidor Gunicorn quando o contêiner for executado
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
