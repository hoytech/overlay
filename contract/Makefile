SOLC ?= solc


## Build and test

.PHONY: all clean

all: build/Overlay.json

clean:
	rm -rf build/

build/Overlay.json: *.sol
	mkdir -p build/
	$(SOLC) --optimize --combined-json abi,bin Overlay.sol > build/Overlay.json.tmp
	mv build/Overlay.json.tmp build/Overlay.json
