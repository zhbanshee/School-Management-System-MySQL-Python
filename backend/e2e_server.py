"""An isolated database for browser tests; never touches demo.db or MySQL."""

import os
import signal
import sys
import tempfile
from pathlib import Path
from backend.app import create_app

if __name__ == "__main__":
    signal.signal(signal.SIGTERM, lambda *_: sys.exit(0))
    with tempfile.TemporaryDirectory(prefix="schoolhouse-e2e-") as directory:
        app = create_app(str(Path(directory) / "test.db"))
        app.config["AUTH_REGISTER_LIMIT"] = 200
        app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5002")))
