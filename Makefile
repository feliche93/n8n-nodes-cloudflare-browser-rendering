.PHONY: clean build init-custom-dir link unlink restart all dev format lint lintfix watch

# Variables
PROJECT_PATH=$(shell pwd) # Assumes you run make from the project root
N8N_CUSTOM_PATH=~/.n8n/custom
PACKAGE_NAME=$(shell node -p "require('./package.json').name")

clean:
	@echo "🧹 Cleaning up..."
	rm -rf dist
	rm -rf node_modules
	rm -rf .turbo # Keep if using turborepo, otherwise remove
	rm -rf .build # Keep if your build process creates this, otherwise remove
	# pnpm store prune # Usually not needed unless you suspect store corruption

build:
	@echo "🏗️  Building project..."
	pnpm install # Ensure dependencies are installed
	pnpm run build

init-custom-dir:
	@echo "🔧 Ensuring n8n custom directory exists and has a package.json..."
	mkdir -p $(N8N_CUSTOM_PATH)
	@# Check if package.json exists, if not, create a minimal one
	@[ -f $(N8N_CUSTOM_PATH)/package.json ] || echo "{}" > $(N8N_CUSTOM_PATH)/package.json

unlink: init-custom-dir
	@echo "🔓 Unlinking $(PACKAGE_NAME) from n8n custom directory..."
	cd $(N8N_CUSTOM_PATH) && pnpm unlink --global $(PACKAGE_NAME) || true

link: build init-custom-dir
	@echo "🔗 Linking $(PACKAGE_NAME) to n8n custom directory..."
	@echo "   Creating global link for $(PACKAGE_NAME)..."
	pnpm link --global
	@echo "   Linking $(PACKAGE_NAME) into $(N8N_CUSTOM_PATH)..."
	cd $(N8N_CUSTOM_PATH) && pnpm link --global $(PACKAGE_NAME)

restart:
	@echo "🔄 Starting n8n (Debug Level)..."
	export N8N_LOG_LEVEL=debug && n8n start --tunnel # Added --tunnel for easier testing if needed

format:
	@echo "💅 Formatting code..."
	pnpm format

lint:
	@echo "🔍 Linting code..."
	pnpm lint

lintfix:
	@echo "🔧 Fixing lint issues..."
	pnpm lintfix

watch:
	@echo "👀 Watching for changes and rebuilding (tsc --watch)..."
	pnpm dev

# Main command to run everything (clean build, link, restart)
all: clean build unlink link restart

# Helper command for quick development cycle (build, relink, restart)
dev: build unlink link restart 