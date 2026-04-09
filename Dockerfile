# 1. Estágio de Build: Usa o Node para compilar o React
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
# Usamos o legacy-peer-deps por causa das versões que ajustamos antes
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# 2. Estágio de Produção: Usa o Nginx para servir os arquivos
FROM nginx:stable-alpine
# Copia a pasta 'dist' gerada no build para a pasta do Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copia nossa configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]