install:
	pip install -r requirements.txt

test:
	python -m pytest tests/ -v --tb=short

test-unit:
	python -m pytest tests/unit/ -v

test-integration:
	python -m pytest tests/integration/ -v

dev:
	docker-compose up --build

lint:
	cd backend && ruff check . && black --check .

format:
	cd backend && black . && isort .
