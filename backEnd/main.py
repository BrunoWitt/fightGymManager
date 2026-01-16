from fastapi import FastAPI
from routes.login_route import router as login_router
from routes.turma_route import router as turma_router
from routes.alunos_route import router as aluno_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(login_router)
app.include_router(turma_router)
app.include_router(aluno_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
