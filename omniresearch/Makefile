.PHONY: install test test-unit test-integration dev lint format

install:
	pip install -r requirements.txt
	cd frontend && npm install

test:
	cd backend && python -m pytest ../tests/ -v --tb=short

test-unit:
	cd backend && python -m pytest ../tests/unit/ -v

test-integration:
	cd backend && python -m pytest ../tests/integration/ -v -m "not slow"

dev:
	docker-compose up --build

lint:
	cd backend && ruff check . && black --check .

format:
	cd backend && black . && isort .
