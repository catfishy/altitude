.PHONY : start check test clean

SRC::=$(shell find src -type f \( -iname "*.js" -or -iname "*.ts" -or -iname "*.jsx" -or -iname "*.tsx" \) ! -name " *.test.ts")

build: node_modules $(SRC)
	CI=false NEXT_PUBLIC_APP_ENV=production yarn run build

build-dev: node_modules $(SRC)
	CI=false NEXT_PUBLIC_APP_ENV=development yarn run build

node_modules: package.json
	yarn install
	touch node_modules

# Phony Targets
start: node_modules
	BROWSER=none yarn run dev

check: node_modules
	yarn run eslint -f unix src/

deploy: build
	firebase login:use andyhorng1@gmail.com
	firebase deploy --only hosting
	firebase login:use andy@getjia.co

test:
	yarn jest --runInBand --detectOpenHandles

clean:
	@rm -rf build
