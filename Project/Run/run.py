from Project.Loadconfig.loadconfig import load_config
from Project.Service.service_fetch import service_realtime, service_history

import sys

def main():
    config = load_config()

    mode = sys.argv[1] if len(sys.argv) >1 else "realtime"
    if mode == "history":
        service_history(
            config["history"],
            "2026-03-01",
            "2026-04-01"
            )
    elif mode == "realtime":
        service_realtime(
            config["realtime"]
            )

if __name__ == "__main__":
    main()