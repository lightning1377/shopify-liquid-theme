# KAVRA Shopify Theme Makefile

# Load environment variables from .env if present
ifneq (,$(wildcard ./.env))
  include .env
  export
endif

STORE ?= $(if $(SHOPIFY_STORE),$(SHOPIFY_STORE),your-store.myshopify.com)
THEME_NAME ?= KAVRA

.PHONY: help auth import push check check-links format dev

help:
	@echo "Available commands:"
	@echo "  make auth        Authenticate Shopify CLI with store permissions (one-time)"
	@echo "  make import      Import products from kavra_sample_products.csv into Shopify"
	@echo "  make push        Push the KAVRA theme to Shopify"
	@echo "  make check       Run Shopify theme check and format verification"
	@echo "  make check-links Crawl site to detect broken links and 404 errors"
	@echo "  make format      Auto-format all theme files with Prettier"
	@echo "  make dev         Start Shopify theme dev server with live preview"

# One-time interactive browser authentication for store commands
auth:
	shopify store auth --store $(STORE) --scopes read_products,write_products

# Run the Node.js CSV product importer
import:
	SHOPIFY_STORE=$(STORE) node scripts/import-products.js

# Push theme to remote Shopify store
push:
	shopify theme push --store $(STORE) --theme "$(THEME_NAME)" --allow-live

# Validate theme syntax
check:
	pnpm run format:check
	shopify theme check

# Crawl site to detect broken links and 404 errors
check-links:
	node scripts/check-links.js

# Auto-format all code
format:
	pnpm run format

# Run theme dev preview server
dev:
	shopify theme dev --store $(STORE)
