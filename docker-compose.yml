version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: ./backend/.env
    healthcheck:
      test: ["CMD","curl","-f","http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: nginx:alpine
    ports: ["3000:80"]
    volumes:
      - ./frontend:/usr/share/nginx/html:ro
    depends_on: [backend]
