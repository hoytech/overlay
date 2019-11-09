W        = -Wall
OPT      = -O2 -g
STD      = -std=c++17
CXXFLAGS = $(STD) $(OPT) $(W) -fPIC $(XCXXFLAGS)
INCS     = -Iinclude -Iexternal -Iexternal/json/include -Iexternal/hoytech-cpp -Ibuild/include

LDLIBS   = -luWS -ldocopt -llmdb -lz -lssl -lcrypto -pthread -Wl,--whole-archive -lpthread -ldl  -Wl,--no-whole-archive
LDFLAGS  = -flto $(XLDFLAGS)

SRCS     = main.cpp keccak.cpp \
           external/hoytech-cpp/hex.cpp
CMDSRCS  = cmd_ws.cpp cmd_ls.cpp

BIN      = overlay



OBJS    := $(SRCS:.cpp=.o)
CMDOBJS := $(CMDSRCS:.cpp=.o)
DEPS    := $(SRCS:.cpp=.d) $(CMDSRCS:.cpp=.d)

$(BIN): $(OBJS) $(CMDOBJS) $(DEPS)
	$(CXX) $(OBJS) $(CMDOBJS) $(LDFLAGS) $(LDLIBS) -o $(BIN)

%.o : %.cpp %.d
	$(CXX) $(CXXFLAGS) $(INCS) -MMD -MP -MT $@ -MF $*.d -c $< -o $@

$(OBJS): $(GEN_HEAD)

$(CMDOBJS): $(GEN_HEAD)

-include *.d

%.d : ;

.PHONY: clean asan
clean:
	rm -f $(BIN) *.o *.d
	rm -rf build/ package/

asan: XCXXFLAGS = -fsanitize=address
asan: XLDFLAGS = -fsanitize=address
asan: $(BIN)
