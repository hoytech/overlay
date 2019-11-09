#include <iostream>

#include <docopt/docopt.h>

#include "overlay.h"



namespace overlay {

void cmd_ws();

}


static const char USAGE[] =
R"(
    Usage: overlay <command> [<args>...]

    Options:
      -h --help             Show this screen.
      --version             Show version.

    Commands:
      ws         Run websocket server
)";



int parse_command_line(int argc, char **argv) {
    std::map<std::string, docopt::value> args = docopt::docopt(USAGE, { argv + 1, argv + argc }, true, "overlay 0.0.1", true);

    std::string command = args["<command>"].asString();

    if (command == "ws") {
        overlay::cmd_ws();
    } else {
        throw overlay::error("unrecognized command");
    }

    return 0;
}


int main(int argc, char **argv) {
    try {
        parse_command_line(argc, argv);
    } catch (std::exception &e) {
        std::cerr << "CAUGHT EXCEPTION, ABORTING: " << e.what() << std::endl;
        ::exit(1);
    }

    return 0;
}
