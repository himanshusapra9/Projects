install:
	pip install -r requirements.txt

test:
	python -m pytest tests/ -v --tb=short

test-unit:
	python -m pytest tests/unit/ -v

test-integration:
	python -m pytest tests/integration/ -v -m "not slow"

dev:
	docker-compose up --build

run:
	python -m core.orchestrator .

dashboard:
	uvicorn dashboard.api.main:app --reload --port 8000

lint:
	ruff check . && black --check .

format:
	black . && isort .
